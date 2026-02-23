// ============================================
// ReceiptItem Component
// ============================================
// Draggable receipt item with quantity-based user assignment

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Users, Pencil, Minus, Plus, Check, Percent } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BillItem, User, RatioPreset } from '@/types'
import { USER_COLOR_CLASSES, getAssignedQuantity, getUserAssignedQuantity, getRemainingQuantity, RATIO_PRESETS } from '@/types'
import { UserAvatar, UserAvatarMini } from '@/features/splitter/components/UserAvatar'

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
  const [showRatioPicker, setShowRatioPicker] = useState(false)
  const [selectedRatio, setSelectedRatio] = useState<RatioPreset | null>(null)

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
  // For single items with ratio selected, show quantity picker for ratio parts
  const handleUserClick = (userId: string) => {
    if ((item.quantity > 1 || selectedRatio) && onAssignQuantity) {
      // Toggle quantity picker for this user
      if (showQuantityPicker === userId) {
        setShowQuantityPicker(null)
      } else {
        setShowQuantityPicker(userId)
        setShowRatioPicker(false)
      }
    } else {
      // Simple toggle for single quantity items (no ratio selected)
      onToggleUser?.(userId)
    }
  }

  // Handle quantity change with 0.5 step support
  const handleQuantityChange = (userId: string, newQty: number) => {
    const currentQty = getUserAssignedQuantity(item, userId)
    const available = remaining + currentQty // What this user could take

    // Clamp between 0 and available, round to nearest 0.5
    const clampedQty = Math.max(0, Math.min(newQty, available))
    const roundedQty = Math.round(clampedQty * 2) / 2 // Round to nearest 0.5
    onAssignQuantity?.(userId, roundedQty)
  }

  const confirmQuantity = () => {
    setShowQuantityPicker(null)
  }

  // Handle ratio selection
  const handleSelectRatio = (ratio: RatioPreset) => {
    setSelectedRatio(ratio)
    setShowRatioPicker(false)
    // Clear existing assignments when switching ratios
    assignedUsers.forEach(({ user }) => {
      onAssignQuantity?.(user.id, 0)
    })
  }

  // Clear ratio selection
  const handleClearRatio = () => {
    setSelectedRatio(null)
    // Clear all assignments
    assignedUsers.forEach(({ user }) => {
      onAssignQuantity?.(user.id, 0)
    })
  }

  // Assign user to a ratio part (percentage becomes quantity fraction)
  const handleAssignToRatioPart = (userId: string, percentPart: number) => {
    // Convert percentage to quantity (e.g., 75% of 1 item = 0.75)
    const quantityFraction = percentPart / 100
    onAssignQuantity?.(userId, quantityFraction)
  }

  // Get step size for quantity picker (0.5 for multi-qty, 0.01 for ratio-based)
  const quantityStep = selectedRatio ? 0.05 : 0.5

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      onDoubleClick={handleDoubleClick}
      className={cn(
        'relative p-4 rounded-xl cursor-pointer',
        'bg-card border-l-4 border border-border',
        'transition-colors duration-150',
        'group',
        borderColor,
        isFullyAssigned ? 'opacity-100' : isPartiallyAssigned ? 'opacity-80' : 'opacity-60',
        isSelected && 'ring-2 ring-ring ring-offset-2 ring-offset-background',
        isDragging && 'opacity-50 shadow-2xl'
      )}
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
                      {/* Badge showing quantity for multi-qty items or ratio splits */}
                      {(item.quantity > 1 || selectedRatio) && userQty > 0 && (
                        <span className={cn(
                          'absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full',
                          'flex items-center justify-center',
                          'text-[10px] font-mono font-bold',
                          'bg-primary text-primary-foreground'
                        )}>
                          {selectedRatio 
                            ? `${Math.round(userQty * 100)}%`
                            : (userQty % 1 === 0 ? userQty : userQty.toFixed(1))
                          }
                        </span>
                      )}
                    </div>
                  )
                })}

                {/* Split all button */}
                {users.length > 1 && !selectedRatio && (
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

                {/* Ratio split button - for single items */}
                {item.quantity === 1 && users.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowRatioPicker(!showRatioPicker)
                      setShowQuantityPicker(null)
                    }}
                    className={cn(
                      'h-8 px-3 rounded-full',
                      'flex items-center gap-1.5',
                      'text-xs font-medium',
                      'border-2 border-dashed transition-all',
                      selectedRatio
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-muted-foreground/30 text-muted-foreground hover:border-primary/50'
                    )}
                  >
                    <Percent className="w-3.5 h-3.5" />
                    {selectedRatio ? selectedRatio.label : 'Ratio'}
                  </button>
                )}
              </>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                Add people to assign this item
              </p>
            )}
          </div>

          {/* Ratio picker for single items */}
          <AnimatePresence>
            {showRatioPicker && item.quantity === 1 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xs text-muted-foreground mb-2">Select a ratio to split this item:</p>
                  <div className="flex flex-wrap gap-2">
                    {RATIO_PRESETS.map((ratio) => (
                      <button
                        key={ratio.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSelectRatio(ratio)
                        }}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-xs font-medium',
                          'border transition-all',
                          selectedRatio?.id === ratio.id
                            ? 'border-primary bg-primary/20 text-primary'
                            : 'border-border bg-background hover:border-primary/50'
                        )}
                      >
                        {ratio.label}
                      </button>
                    ))}
                  </div>
                  {selectedRatio && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          Now click on avatars to assign each part
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleClearRatio()
                          }}
                          className="text-xs text-destructive hover:underline"
                        >
                          Clear
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedRatio.parts.map((part, index) => {
                          const partQuantity = part / 100
                          const assignedUser = assignedUsers.find(a => Math.abs(a.quantity - partQuantity) < 0.001)
                          return (
                            <div 
                              key={index}
                              className={cn(
                                'flex items-center gap-2 px-3 py-1.5 rounded-lg border',
                                assignedUser 
                                  ? 'border-primary bg-primary/10'
                                  : 'border-dashed border-muted-foreground/50'
                              )}
                            >
                              <span className="text-xs font-mono font-bold">{part}%</span>
                              <span className="text-xs text-muted-foreground">
                                ₹{((item.price * part) / 100).toFixed(0)}
                              </span>
                              {assignedUser && (
                                <span className={cn(
                                  'text-xs font-medium',
                                  USER_COLOR_CLASSES[assignedUser.user.color].text
                                )}>
                                  {assignedUser.user.name}
                                </span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quantity picker for multi-quantity items or ratio-based single items */}
          <AnimatePresence>
            {showQuantityPicker && (item.quantity > 1 || selectedRatio) && (
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
                    const step = quantityStep

                    return (
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <UserAvatar user={user} size="sm" />
                            <span className="text-sm font-medium">{user.name}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleQuantityChange(user.id, currentQty - step)
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
                              {currentQty % 1 === 0 ? currentQty : currentQty.toFixed(1)}
                            </span>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleQuantityChange(user.id, currentQty + step)
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

                        {/* Quick ratio buttons when ratio is selected */}
                        {selectedRatio && (
                          <div className="flex flex-wrap gap-2">
                            {selectedRatio.parts.map((part, index) => {
                              const partQty = part / 100
                              return (
                                <button
                                  key={index}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleAssignToRatioPart(user.id, part)
                                    confirmQuantity()
                                  }}
                                  className={cn(
                                    'px-3 py-1 rounded-md text-xs font-medium',
                                    'border transition-all',
                                    Math.abs(currentQty - partQty) < 0.001
                                      ? 'border-primary bg-primary/20 text-primary'
                                      : 'border-border bg-background hover:border-primary/50'
                                  )}
                                >
                                  {part}% = ₹{((item.price * part) / 100).toFixed(0)}
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })()}
                  
                  {/* Helper text */}
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    {selectedRatio 
                      ? `Assigning by ${selectedRatio.label} ratio`
                      : `${remaining % 1 === 0 ? remaining : remaining.toFixed(1)} of ${item.quantity} available (±0.5)`
                    }
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cost breakdown per person - shown when item has assignments */}
          {assignedUsers.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="pt-2 border-t border-border/50"
            >
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                Cost Breakdown
              </p>
              <div className="space-y-1.5">
                {assignedUsers.map(({ user, quantity: userQty }) => {
                  const colors = USER_COLOR_CLASSES[user.color]
                  // Calculate this user's share: (totalPrice * userQty) / totalAssigned
                  const userShare = totalAssigned > 0 
                    ? (totalPrice * userQty) / totalAssigned 
                    : 0
                  
                  // Determine display format for quantity
                  const isRatioSplit = selectedRatio || (item.quantity === 1 && userQty < 1)
                  const qtyDisplay = isRatioSplit
                    ? `${Math.round(userQty * 100)}%`
                    : userQty % 1 === 0 
                      ? `${userQty} ${userQty === 1 ? 'item' : 'items'}`
                      : `${userQty.toFixed(1)} items`
                  
                  return (
                    <div 
                      key={user.id}
                      className="flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          'w-2 h-2 rounded-full',
                          colors.bg
                        )} />
                        <span className="text-muted-foreground">{user.name}</span>
                        {(item.quantity > 1 || isRatioSplit) && (
                          <span className="text-muted-foreground/60">
                            ({qtyDisplay})
                          </span>
                        )}
                      </div>
                      <span className={cn('font-mono font-medium', colors.text)}>
                        ₹{userShare.toFixed(0)}
                      </span>
                    </div>
                  )
                })}
                {/* Total row */}
                {assignedUsers.length > 1 && (
                  <div className="flex items-center justify-between text-xs pt-1.5 border-t border-border/30">
                    <span className="text-muted-foreground font-medium">Total</span>
                    <span className="font-mono font-semibold">
                      ₹{totalPrice.toFixed(0)}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
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
