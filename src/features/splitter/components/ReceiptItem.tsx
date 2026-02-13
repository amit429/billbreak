// ============================================
// ReceiptItem Component
// ============================================
// Draggable receipt item with quantity-based user assignment

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Users, Pencil, Minus, Plus, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BillItem, User } from '@/types'
import { USER_COLOR_CLASSES, getAssignedQuantity, getUserAssignedQuantity, getRemainingQuantity } from '@/types'
import { UserAvatar, UserAvatarMini } from './UserAvatar'

interface ReceiptItemProps {
  item: BillItem
  users: User[]
  isSelected?: boolean
  onSelect?: () => void
  onToggleUser?: (userId: string) => void
  onAssignQuantity?: (userId: string, quantity: number) => void
  onAssignAll?: () => void
  onEdit?: () => void
}

export function ReceiptItem({
  item,
  users,
  isSelected = false,
  onSelect,
  onToggleUser,
  onAssignQuantity,
  onAssignAll,
  onEdit,
}: ReceiptItemProps) {
  const [showQuantityPicker, setShowQuantityPicker] = useState<string | null>(null)

  // Get assigned users with their quantities
  const assignedUsers = users
    .map((user) => {
      const qty = getUserAssignedQuantity(item, user.id)
      return { user, quantity: qty }
    })
    .filter((a) => a.quantity > 0)

  const totalAssigned = getAssignedQuantity(item)
  const remaining = getRemainingQuantity(item)
  const isFullyAssigned = totalAssigned >= item.quantity
  const isPartiallyAssigned = totalAssigned > 0 && totalAssigned < item.quantity

  const firstAssignedUser = assignedUsers[0]?.user
  const borderColor = firstAssignedUser
    ? USER_COLOR_CLASSES[firstAssignedUser.color].border
    : 'border-muted'

  // Draggable setup
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `item-${item.id}`,
    data: { itemId: item.id },
  })

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 50 : undefined,
      }
    : undefined

  const totalPrice = item.price * item.quantity

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit?.()
  }

  // For multi-quantity items, show quantity picker
  const handleUserClick = (userId: string) => {
    if (item.quantity > 1 && onAssignQuantity) {
      // Toggle quantity picker for this user
      if (showQuantityPicker === userId) {
        setShowQuantityPicker(null)
      } else {
        setShowQuantityPicker(userId)
      }
    } else {
      // Simple toggle for single quantity items
      onToggleUser?.(userId)
    }
  }

  const handleQuantityChange = (userId: string, newQty: number) => {
    const currentQty = getUserAssignedQuantity(item, userId)
    const available = remaining + currentQty // What this user could take

    // Clamp between 0 and available
    const clampedQty = Math.max(0, Math.min(newQty, available))
    onAssignQuantity?.(userId, clampedQty)
  }

  const confirmQuantity = () => {
    setShowQuantityPicker(null)
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      onDoubleClick={handleDoubleClick}
      className={cn(
        'relative p-4 rounded-xl cursor-pointer',
        'bg-card border-l-4 border border-border',
        'transition-all duration-200',
        'group',
        borderColor,
        isFullyAssigned ? 'opacity-100' : isPartiallyAssigned ? 'opacity-80' : 'opacity-60',
        isSelected && 'ring-2 ring-ring ring-offset-2 ring-offset-background',
        isDragging && 'opacity-50 scale-95 shadow-2xl'
      )}
      layout
      whileHover={{ scale: isSelected ? 1 : 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-start gap-3">
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className={cn(
            'mt-1 p-1 rounded cursor-grab active:cursor-grabbing',
            'text-muted-foreground hover:text-foreground',
            'opacity-0 group-hover:opacity-100 transition-opacity',
            isDragging && 'opacity-100'
          )}
        >
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Item details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-foreground truncate">{item.name}</p>
            {item.quantity > 1 && (
              <span className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">
                ×{item.quantity}
              </span>
            )}
          </div>
          
          {item.quantity > 1 && (
            <p className="text-xs text-muted-foreground mt-0.5">
              ₹{item.price.toFixed(0)} each
            </p>
          )}

          {/* Assignment info */}
          {totalAssigned > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {item.quantity === 1 ? (
                assignedUsers.length === 1
                  ? assignedUsers[0].user.name
                  : `Split ${assignedUsers.length} ways · ₹${(totalPrice / assignedUsers.length).toFixed(0)} each`
              ) : (
                <>
                  {assignedUsers.map((a, i) => (
                    <span key={a.user.id}>
                      {a.user.name}: {a.quantity}
                      {i < assignedUsers.length - 1 && ' · '}
                    </span>
                  ))}
                  {remaining > 0 && (
                    <span className="text-yellow-500"> · {remaining} left</span>
                  )}
                </>
              )}
            </p>
          )}

          {/* Remaining indicator for partially assigned */}
          {isPartiallyAssigned && (
            <div className="mt-2 h-1 rounded-full bg-muted overflow-hidden">
              <div 
                className="h-full bg-primary transition-all"
                style={{ width: `${(totalAssigned / item.quantity) * 100}%` }}
              />
            </div>
          )}
        </div>

        {/* Right side: edit + avatars + price */}
        <div className="flex items-center gap-3">
          {/* Edit button */}
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center',
                'text-muted-foreground hover:text-foreground hover:bg-muted',
                'opacity-0 group-hover:opacity-100 transition-all',
                'focus:opacity-100'
              )}
              title="Edit item"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Avatar stack with quantities */}
          {assignedUsers.length > 0 && (
            <div className="flex -space-x-2">
              {assignedUsers.slice(0, 3).map(({ user, quantity }) => (
                <div key={user.id} className="relative">
                  <UserAvatarMini user={user} />
                  {item.quantity > 1 && (
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-background border border-border text-[9px] font-mono font-bold flex items-center justify-center">
                      {quantity}
                    </span>
                  )}
                </div>
              ))}
              {assignedUsers.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium border-2 border-background">
                  +{assignedUsers.length - 3}
                </div>
              )}
            </div>
          )}

          {/* Price */}
          <p className="font-mono font-semibold tabular-nums text-foreground min-w-[60px] text-right">
            ₹{totalPrice.toFixed(0)}
          </p>
        </div>
      </div>

      {/* User assignment row - shown when selected or unassigned */}
      <motion.div
        initial={false}
        animate={{ 
          height: isSelected || !isFullyAssigned ? 'auto' : 0,
          opacity: isSelected || !isFullyAssigned ? 1 : 0,
          marginTop: isSelected || !isFullyAssigned ? 12 : 0 
        }}
        className="overflow-hidden"
      >
        <div className="flex flex-col gap-3">
          {/* User avatars for simple toggle (qty=1) or tap to open picker */}
          <div className="flex items-center gap-2 flex-wrap">
            {users.length > 0 ? (
              <>
                {users.map((user) => {
                  const userQty = getUserAssignedQuantity(item, user.id)
                  const isUserAssigned = userQty > 0
                  return (
                    <div key={user.id} className="relative">
                      <UserAvatar
                        user={user}
                        size="sm"
                        isActive={isUserAssigned}
                        onClick={() => handleUserClick(user.id)}
                      />
                      {/* Badge showing quantity for multi-qty items */}
                      {item.quantity > 1 && userQty > 0 && (
                        <span className={cn(
                          'absolute -top-1 -right-1 w-5 h-5 rounded-full',
                          'flex items-center justify-center',
                          'text-[10px] font-mono font-bold',
                          'bg-primary text-primary-foreground'
                        )}>
                          {userQty}
                        </span>
                      )}
                    </div>
                  )
                })}

                {/* Split all button */}
                {users.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onAssignAll?.()
                    }}
                    className={cn(
                      'h-8 px-3 rounded-full',
                      'flex items-center gap-1.5',
                      'text-xs font-medium',
                      'border-2 border-dashed transition-all',
                      isFullyAssigned && assignedUsers.length === users.length
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-muted-foreground/30 text-muted-foreground hover:border-primary/50'
                    )}
                  >
                    <Users className="w-3.5 h-3.5" />
                    {isFullyAssigned && assignedUsers.length === users.length ? 'All' : 'Split All'}
                  </button>
                )}
              </>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                Add people to assign this item
              </p>
            )}
          </div>

          {/* Quantity picker for multi-quantity items */}
          <AnimatePresence>
            {showQuantityPicker && item.quantity > 1 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  {(() => {
                    const user = users.find((u) => u.id === showQuantityPicker)
                    if (!user) return null
                    const currentQty = getUserAssignedQuantity(item, user.id)
                    const maxQty = remaining + currentQty

                    return (
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <UserAvatar user={user} size="sm" />
                          <span className="text-sm font-medium">{user.name}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleQuantityChange(user.id, currentQty - 1)
                            }}
                            disabled={currentQty === 0}
                            className={cn(
                              'w-8 h-8 rounded-lg flex items-center justify-center',
                              'bg-background border border-border',
                              'hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed',
                              'transition-colors'
                            )}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          
                          <span className="w-12 text-center font-mono font-bold text-lg">
                            {currentQty}
                          </span>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleQuantityChange(user.id, currentQty + 1)
                            }}
                            disabled={currentQty >= maxQty}
                            className={cn(
                              'w-8 h-8 rounded-lg flex items-center justify-center',
                              'bg-background border border-border',
                              'hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed',
                              'transition-colors'
                            )}
                          >
                            <Plus className="w-4 h-4" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              confirmQuantity()
                            }}
                            className={cn(
                              'w-8 h-8 rounded-lg flex items-center justify-center',
                              'bg-primary text-primary-foreground',
                              'hover:bg-primary/90',
                              'transition-colors ml-2'
                            )}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })()}
                  
                  {/* Helper text */}
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    {remaining} of {item.quantity} available
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Ghost preview shown while dragging
export function ReceiptItemDragOverlay({ item }: { item: BillItem }) {
  return (
    <div
      className={cn(
        'p-4 rounded-xl',
        'bg-card/90 backdrop-blur-sm',
        'border border-primary shadow-2xl',
        'pointer-events-none'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="font-medium">{item.name}</p>
          {item.quantity > 1 && (
            <span className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">
              ×{item.quantity}
            </span>
          )}
        </div>
        <p className="font-mono font-semibold">
          ₹{(item.price * item.quantity).toFixed(0)}
        </p>
      </div>
    </div>
  )
}
