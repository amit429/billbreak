// ============================================
// UserAvatar Component
// ============================================
// Displays user initial with color-coded background

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { User } from '@/types'
import { USER_COLOR_CLASSES } from '@/types'

interface UserAvatarProps {
  user: User
  size?: 'sm' | 'md' | 'lg'
  isActive?: boolean
  isDragOver?: boolean
  showDelete?: boolean
  onDelete?: () => void
  onClick?: () => void
  className?: string
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
}

export function UserAvatar({
  user,
  size = 'md',
  isActive = false,
  isDragOver = false,
  showDelete = false,
  onDelete,
  onClick,
  className,
}: UserAvatarProps) {
  const colors = USER_COLOR_CLASSES[user.color]
  const initial = user.name.charAt(0).toUpperCase()

  return (
    <motion.div
      className="relative group"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.button
        onClick={onClick}
        className={cn(
          'relative rounded-full flex items-center justify-center',
          'font-semibold transition-all duration-200',
          colors.bg,
          'text-white',
          sizeClasses[size],
          isActive && [colors.ring, 'ring-4 ring-offset-2 ring-offset-background', colors.glow],
          isDragOver && ['scale-110', colors.ring, 'ring-4', colors.glow],
          onClick && 'cursor-pointer hover:brightness-110',
          className
        )}
        animate={isDragOver ? { scale: 1.15 } : { scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        {initial}
      </motion.button>

      {/* Delete button */}
      {showDelete && onDelete && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className={cn(
            'absolute -top-1 -right-1',
            'w-5 h-5 rounded-full',
            'bg-destructive text-white',
            'flex items-center justify-center',
            'text-xs font-bold',
            'opacity-0 group-hover:opacity-100 transition-opacity',
            'hover:bg-destructive/80'
          )}
        >
          ×
        </motion.button>
      )}
    </motion.div>
  )
}

// Mini avatar for stacking in receipt items
export function UserAvatarMini({ user, className }: { user: User; className?: string }) {
  const colors = USER_COLOR_CLASSES[user.color]
  const initial = user.name.charAt(0).toUpperCase()

  return (
    <div
      className={cn(
        'w-6 h-6 rounded-full flex items-center justify-center',
        'text-[10px] font-semibold text-white',
        'border-2 border-background',
        colors.bg,
        className
      )}
    >
      {initial}
    </div>
  )
}
