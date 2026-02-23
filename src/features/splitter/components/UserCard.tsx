// ============================================
// UserCard Component
// ============================================
// Sidebar card showing user details with live subtotal

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Pencil } from 'lucide-react'
import { useDroppable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'
import type { User, UserShare } from '@/types'
import { USER_COLOR_CLASSES } from '@/types'
import { UserAvatar } from '@/features/splitter/components/UserAvatar'

interface UserCardProps {
  user: User
  share: UserShare
  isActive?: boolean
  onSelect?: () => void
  onDelete?: () => void
  onUpdateName?: (newName: string) => void
}

export function UserCard({
  user,
  share,
  isActive = false,
  onSelect,
  onDelete,
  onUpdateName,
}: UserCardProps) {
  const colors = USER_COLOR_CLASSES[user.color]
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(user.name)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Make card a drop zone
  const { isOver, setNodeRef } = useDroppable({
    id: `user-drop-${user.id}`,
    data: { userId: user.id },
  })

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setEditName(user.name)
    setIsEditing(true)
  }

  const handleSave = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    const trimmed = editName.trim()
    if (trimmed && trimmed !== user.name) {
      onUpdateName?.(trimmed)
    }
    setIsEditing(false)
  }

  const handleCancel = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setEditName(user.name)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  return (
    <div
      ref={setNodeRef}
      onClick={isEditing ? undefined : onSelect}
      className={cn(
        'relative p-4 rounded-xl',
        !isEditing && 'cursor-pointer',
        'border-2 transition-all duration-200',
        'group',
        colors.bgLight,
        colors.border,
        isActive && [colors.ring, 'ring-2', colors.glow],
        isOver && ['scale-[1.02]', colors.glow, 'border-opacity-100'],
        !isEditing && 'hover:brightness-105'
      )}
    >
      {/* Edit mode - full width input */}
      {isEditing ? (
        <div onClick={(e) => e.stopPropagation()} className="space-y-3">
          <div className="flex items-center gap-3">
            <UserAvatar user={user} size="lg" />
            <input
              ref={inputRef}
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={handleKeyDown}
              className={cn(
                'flex-1 px-3 py-2 rounded-lg',
                'bg-background border border-border',
                'text-base font-medium',
                'focus:outline-none focus:ring-2 focus:ring-primary'
              )}
              placeholder="Enter name"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={handleCancel}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm',
                'bg-muted text-muted-foreground',
                'hover:bg-muted/80 transition-colors'
              )}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm',
                'bg-primary text-primary-foreground',
                'hover:bg-primary/90 transition-colors'
              )}
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        /* Display mode */
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <UserAvatar user={user} size="lg" isActive={isActive} isDragOver={isOver} />

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">{user.name}</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {share.itemCount} {share.itemCount === 1 ? 'item' : 'items'}
              </span>
              {/* Inline edit & delete icons */}
              {(onUpdateName || onDelete) && (
                <div className="flex items-center gap-1">
                  {onUpdateName && (
                    <button
                      onClick={handleStartEdit}
                      className={cn(
                        'p-1 rounded',
                        'text-muted-foreground/60',
                        'hover:text-primary hover:bg-primary/10',
                        'transition-colors'
                      )}
                      title="Edit name"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete()
                      }}
                      className={cn(
                        'p-1 rounded',
                        'text-muted-foreground/60',
                        'hover:text-destructive hover:bg-destructive/10',
                        'transition-colors'
                      )}
                      title="Remove person"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Subtotal */}
          <AnimatePresence mode="wait">
            <motion.div
              key={share.total.toFixed(2)}
              initial={{ opacity: 0, scale: 0.8, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 5 }}
              className={cn('text-right', colors.text)}
            >
              <p className="font-mono text-xl font-bold tabular-nums">
                ₹{share.total.toFixed(0)}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Drop indicator */}
      <AnimatePresence>
        {isOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              'absolute inset-0 rounded-xl',
              'border-2 border-dashed',
              colors.border,
              'pointer-events-none'
            )}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
