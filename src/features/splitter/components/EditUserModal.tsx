// ============================================
// EditUserModal Component
// ============================================
// Modal for editing or deleting a user

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { User } from '@/types'
import { USER_COLOR_CLASSES } from '@/types'
import { Button } from '@/components/ui/button'

interface EditUserModalProps {
  user: User | null
  isOpen: boolean
  onClose: () => void
  onSave: (newName: string) => void
  onDelete: () => void
}

export function EditUserModal({
  user,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: EditUserModalProps) {
  const [name, setName] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user && isOpen) {
      setName(user.name)
      setShowDeleteConfirm(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [user, isOpen])

  if (!user) return null

  const colors = USER_COLOR_CLASSES[user.color]
  const initial = user.name.charAt(0).toUpperCase()

  const handleSave = () => {
    const trimmed = name.trim()
    if (trimmed) {
      onSave(trimmed)
      onClose()
    }
  }

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete()
      onClose()
    } else {
      setShowDeleteConfirm(true)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={cn(
              'fixed left-4 right-4 bottom-20 z-50',
              'md:left-1/2 md:-translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2',
              'md:w-full md:max-w-sm',
              'bg-card border border-border rounded-2xl',
              'p-6 shadow-xl'
            )}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className={cn(
                'absolute top-4 right-4',
                'w-8 h-8 rounded-full',
                'flex items-center justify-center',
                'text-muted-foreground hover:text-foreground',
                'hover:bg-muted transition-colors'
              )}
            >
              <X className="w-4 h-4" />
            </button>

            {/* Avatar */}
            <div className="flex justify-center mb-4">
              <div
                className={cn(
                  'w-16 h-16 rounded-full flex items-center justify-center',
                  'text-2xl font-bold text-white',
                  colors.bg
                )}
              >
                {initial}
              </div>
            </div>

            {/* Name input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Name
              </label>
              <input
                ref={inputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                className={cn(
                  'w-full px-4 py-3 rounded-xl',
                  'bg-background border border-border',
                  'text-lg font-medium text-center',
                  'focus:outline-none focus:ring-2 focus:ring-primary'
                )}
                placeholder="Enter name"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {showDeleteConfirm ? 'Confirm Delete' : 'Delete'}
              </Button>
              <Button
                className="flex-1"
                onClick={handleSave}
                disabled={!name.trim()}
              >
                <Check className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>

            {showDeleteConfirm && (
              <p className="text-xs text-destructive text-center mt-2">
                Click again to confirm deletion
              </p>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
