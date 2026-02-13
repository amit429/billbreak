// ============================================
// UserCard Component
// ============================================
// Sidebar card showing user details with live subtotal

import { motion, AnimatePresence } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import { useDroppable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'
import type { User, UserShare } from '@/types'
import { USER_COLOR_CLASSES } from '@/types'
import { UserAvatar } from './UserAvatar'

interface UserCardProps {
  user: User
  share: UserShare
  isActive?: boolean
  onSelect?: () => void
  onDelete?: () => void
}

export function UserCard({
  user,
  share,
  isActive = false,
  onSelect,
  onDelete,
}: UserCardProps) {
  const colors = USER_COLOR_CLASSES[user.color]
  
  // Make card a drop zone
  const { isOver, setNodeRef } = useDroppable({
    id: `user-drop-${user.id}`,
    data: { userId: user.id },
  })

  return (
    <motion.div
      ref={setNodeRef}
      onClick={onSelect}
      className={cn(
        'relative p-4 rounded-xl cursor-pointer',
        'border-2 transition-all duration-200',
        'group',
        colors.bgLight,
        colors.border,
        isActive && [colors.ring, 'ring-2', colors.glow],
        isOver && ['scale-[1.02]', colors.glow, 'border-opacity-100']
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      layout
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <UserAvatar user={user} size="lg" isActive={isActive} isDragOver={isOver} />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">{user.name}</p>
          <p className="text-xs text-muted-foreground">
            {share.itemCount} {share.itemCount === 1 ? 'item' : 'items'}
          </p>
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

      {/* Delete button - appears on hover */}
      {onDelete && (
        <motion.button
          initial={{ opacity: 0 }}
          whileHover={{ scale: 1.1 }}
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className={cn(
            'absolute top-2 right-2',
            'w-7 h-7 rounded-full',
            'flex items-center justify-center',
            'bg-background/50 text-muted-foreground',
            'opacity-0 group-hover:opacity-100',
            'hover:bg-destructive/20 hover:text-destructive',
            'transition-all duration-200'
          )}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </motion.button>
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
    </motion.div>
  )
}
