// ============================================
// Assign Screen
// ============================================
// Split-screen layout: Receipt items (left) + User sidebar (right)

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { ArrowLeft, Check, Receipt } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { useBill } from '@/context/bill'
import { BillStatus, type BillItem, getRemainingQuantity, getUserAssignedQuantity } from '@/types'

// Components
import { ReceiptItem, ReceiptItemDragOverlay } from '../components/ReceiptItem'
import { UserCard } from '../components/UserCard'
import { UserAvatar } from '../components/UserAvatar'
import { AddUserInput } from '../components/AddUserInput'
import { AddItemInput } from '../components/AddItemInput'
import { EditItemModal } from '../components/EditItemModal'

export function AssignScreen() {
  const { state, actions, progress, subtotal, grandTotal, userShares } = useBill()
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [activeItemId, setActiveItemId] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<BillItem | null>(null)

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Find the active dragging item
  const activeItem = activeItemId
    ? state.items.find((i) => i.id === activeItemId)
    : null

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const itemId = String(event.active.id).replace('item-', '')
    setActiveItemId(itemId)
  }

  // Handle drag end - assign item to user
  const handleDragEnd = (event: DragEndEvent) => {
    setActiveItemId(null)

    const { active, over } = event
    if (!over) return

    const itemId = String(active.id).replace('item-', '')
    const dropId = String(over.id)

    // Check if dropped on a user
    if (dropId.startsWith('user-drop-')) {
      const userId = dropId.replace('user-drop-', '')
      const item = state.items.find((i) => i.id === itemId)
      
      if (item) {
        const currentQty = getUserAssignedQuantity(item, userId)
        if (currentQty === 0) {
          // Assign remaining quantity (or full quantity for single-qty items)
          const remaining = getRemainingQuantity(item)
          const qtyToAssign = item.quantity === 1 ? 1 : Math.max(1, remaining)
          actions.assignItem(itemId, userId, qtyToAssign)
        }
      }
    }
  }

  // Toggle user assignment for an item (for single-qty items)
  const handleToggleUser = (itemId: string, userId: string) => {
    actions.toggleItemAssignment(itemId, userId)
  }

  // Assign specific quantity to user
  const handleAssignQuantity = (itemId: string, userId: string, quantity: number) => {
    if (quantity === 0) {
      actions.unassignItem(itemId, userId)
    } else {
      actions.assignItem(itemId, userId, quantity)
    }
  }

  // Assign all users to item
  const handleAssignAll = (itemId: string) => {
    const item = state.items.find((i) => i.id === itemId)
    if (!item) return

    const allAssigned = item.assignments.length === state.users.length
    if (allAssigned) {
      actions.unassignAllFromItem(itemId)
    } else {
      actions.assignAllToItem(itemId)
    }
  }

  // Handle item edit
  const handleEditItem = (item: BillItem) => {
    setEditingItem(item)
  }

  const handleSaveItem = (itemId: string, updates: Partial<BillItem>) => {
    actions.updateItem(itemId, updates)
  }

  const handleDeleteItem = (itemId: string) => {
    actions.removeItem(itemId)
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-background bg-grid">
        {/* Mobile Layout */}
        <div className="lg:hidden flex flex-col min-h-screen">
          {/* Header */}
          <header className="sticky top-0 z-20 glass-strong">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between mb-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => actions.setStatus(BillStatus.UPLOAD)}
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="font-mono font-semibold">₹{grandTotal.toFixed(0)}</p>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Bill Covered</span>
                  <span className="font-mono font-medium text-primary">
                    {progress.toFixed(0)}%
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </div>
          </header>

          {/* Items list */}
          <main className="flex-1 overflow-y-auto p-4 pb-48 space-y-3">
            {state.items.map((item) => (
              <ReceiptItem
                key={item.id}
                item={item}
                users={state.users}
                isSelected={selectedItemId === item.id}
                onSelect={() => setSelectedItemId(
                  selectedItemId === item.id ? null : item.id
                )}
                onToggleUser={(userId) => handleToggleUser(item.id, userId)}
                onAssignQuantity={(userId, qty) => handleAssignQuantity(item.id, userId, qty)}
                onAssignAll={() => handleAssignAll(item.id)}
                onEdit={() => handleEditItem(item)}
              />
            ))}

            {/* Add item */}
            <AddItemInput onAddItem={actions.addItem} />

            {/* Tax & Tip Summary */}
            {(state.taxAmount > 0 || state.tipAmount > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 rounded-xl bg-muted/30 border border-border"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Receipt className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Additional Charges</span>
                </div>
                <div className="space-y-2 text-sm">
                  {state.taxAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax (GST)</span>
                      <span className="font-mono">₹{state.taxAmount.toFixed(0)}</span>
                    </div>
                  )}
                  {state.tipAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tip</span>
                      <span className="font-mono">₹{state.tipAmount.toFixed(0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-border font-medium">
                    <span>Grand Total</span>
                    <span className="font-mono">₹{grandTotal.toFixed(0)}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </main>

          {/* Mobile Bottom Dock */}
          <div className="fixed bottom-0 left-0 right-0 z-20">
            {/* User dock */}
            <div className="glass-strong border-t border-border/50 px-4 py-3">
              <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-1">
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  Split with:
                </span>
                {state.users.map((user) => {
                  const share = userShares.find((s) => s.user.id === user.id)
                  return (
                    <div key={user.id} className="flex flex-col items-center gap-1">
                      <UserAvatar
                        user={user}
                        size="lg"
                        showDelete
                        onDelete={() => actions.removeUser(user.id)}
                      />
                      <span className="text-[10px] text-muted-foreground font-mono">
                        ₹{share?.total.toFixed(0) || 0}
                      </span>
                    </div>
                  )
                })}
                <AddUserInput onAddUser={actions.addUser} variant="compact" />
              </div>
            </div>

            {/* Continue button */}
            <div className="glass-strong border-t border-border/50 p-4">
              <Button
                className="w-full h-12 text-base font-medium"
                disabled={progress < 100 || state.users.length === 0}
                onClick={() => actions.setStatus(BillStatus.RESULTS)}
              >
                {state.users.length === 0 ? (
                  'Add people to split with'
                ) : progress < 100 ? (
                  `Assign All Items (${progress.toFixed(0)}%)`
                ) : (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    See Who Owes What
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex min-h-screen">
          {/* Left: Receipt List (60%) */}
          <div className="w-[60%] flex flex-col border-r border-border/50">
            {/* Header */}
            <header className="sticky top-0 z-10 glass-strong border-b border-border/50">
              <div className="px-6 py-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => actions.setStatus(BillStatus.UPLOAD)}
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Back
                    </Button>
                    <div>
                      <h1 className="text-xl font-semibold">Splitter</h1>
                      <p className="text-sm text-muted-foreground">
                        Click users to assign, tap items with qty &gt;1 to set amounts
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Items Subtotal</p>
                    <p className="font-mono text-xl font-bold">₹{subtotal.toFixed(0)}</p>
                    {state.taxAmount > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        + ₹{state.taxAmount.toFixed(0)} tax
                      </p>
                    )}
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Bill Covered</span>
                    <span className="font-mono font-semibold text-primary">
                      {progress.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={progress} className="h-3" />
                </div>
              </div>
            </header>

            {/* Items */}
            <main className="flex-1 overflow-y-auto p-6 space-y-3">
              {state.items.map((item) => (
                <ReceiptItem
                  key={item.id}
                  item={item}
                  users={state.users}
                  isSelected={selectedItemId === item.id}
                  onSelect={() => setSelectedItemId(
                    selectedItemId === item.id ? null : item.id
                  )}
                  onToggleUser={(userId) => handleToggleUser(item.id, userId)}
                  onAssignQuantity={(userId, qty) => handleAssignQuantity(item.id, userId, qty)}
                  onAssignAll={() => handleAssignAll(item.id)}
                  onEdit={() => handleEditItem(item)}
                />
              ))}

              {/* Add item */}
              <AddItemInput onAddItem={actions.addItem} />

              {/* Tax display */}
              {(state.taxAmount > 0 || state.tipAmount > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 rounded-xl bg-muted/30 border border-border"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Receipt className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Additional Charges</span>
                    <span className="text-xs text-muted-foreground">(split proportionally)</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    {state.taxAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax (GST)</span>
                        <span className="font-mono">₹{state.taxAmount.toFixed(0)}</span>
                      </div>
                    )}
                    {state.tipAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tip</span>
                        <span className="font-mono">₹{state.tipAmount.toFixed(0)}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </main>
          </div>

          {/* Right: User Sidebar (40%) */}
          <div className="w-[40%] flex flex-col glass">
            {/* Sidebar header */}
            <div className="p-6 border-b border-border/50">
              <h2 className="text-lg font-semibold mb-4">People</h2>
              <AddUserInput onAddUser={actions.addUser} variant="full" />
            </div>

            {/* User cards */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {state.users.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-2">No people added yet</p>
                  <p className="text-sm text-muted-foreground">
                    Add people above to start splitting
                  </p>
                </div>
              ) : (
                userShares.map((share) => (
                  <UserCard
                    key={share.user.id}
                    user={share.user}
                    share={share}
                    onDelete={() => actions.removeUser(share.user.id)}
                  />
                ))
              )}
            </div>

            {/* Summary & Continue */}
            <div className="p-6 border-t border-border/50 space-y-4">
              {/* Grand total */}
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Grand Total</span>
                <span className="font-mono text-2xl font-bold">₹{grandTotal.toFixed(0)}</span>
              </div>

              <Button
                className="w-full h-12 text-base font-medium"
                disabled={progress < 100 || state.users.length === 0}
                onClick={() => actions.setStatus(BillStatus.RESULTS)}
              >
                {state.users.length === 0 ? (
                  'Add people to split with'
                ) : progress < 100 ? (
                  `Assign All Items (${progress.toFixed(0)}%)`
                ) : (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    See Who Owes What
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Drag overlay */}
        <DragOverlay>
          {activeItem && <ReceiptItemDragOverlay item={activeItem} />}
        </DragOverlay>

        {/* Edit modal */}
        <EditItemModal
          item={editingItem}
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          onSave={handleSaveItem}
          onDelete={handleDeleteItem}
        />
      </div>
    </DndContext>
  )
}
