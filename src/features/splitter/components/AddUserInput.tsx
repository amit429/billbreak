// ============================================
// AddUserInput Component
// ============================================
// Attractive input for adding new users

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, UserPlus, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface AddUserInputProps {
  onAddUser: (name: string) => void
  variant?: 'compact' | 'full'
  className?: string
}

export function AddUserInput({ onAddUser, variant = 'compact', className }: AddUserInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSubmit = () => {
    const trimmedName = name.trim()
    if (trimmedName) {
      onAddUser(trimmedName)
      setName('')
      setIsOpen(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    } else if (e.key === 'Escape') {
      setName('')
      setIsOpen(false)
    }
  }

  const handleCancel = () => {
    setName('')
    setIsOpen(false)
  }

  // Compact variant - for mobile dock
  if (variant === 'compact') {
    return (
      <div className={cn('relative', className)}>
        <AnimatePresence mode="wait">
          {!isOpen ? (
            <motion.button
              key="add-button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(true)}
              className={cn(
                'w-12 h-12 rounded-full',
                'border-2 border-dashed border-muted-foreground/50',
                'flex items-center justify-center',
                'text-muted-foreground',
                'hover:border-primary hover:text-primary hover:bg-primary/5',
                'transition-all duration-200'
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-5 h-5" />
            </motion.button>
          ) : (
            <motion.div
              key="input-form"
              initial={{ opacity: 0, width: 48 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 48 }}
              className={cn(
                'flex items-center gap-2',
                'bg-card border border-border rounded-full',
                'pl-4 pr-2 py-1.5'
              )}
            >
              <input
                ref={inputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Name..."
                className={cn(
                  'w-24 bg-transparent outline-none',
                  'text-sm text-foreground',
                  'placeholder:text-muted-foreground'
                )}
                maxLength={20}
              />
              <div className="flex gap-1">
                <button
                  onClick={handleSubmit}
                  disabled={!name.trim()}
                  className={cn(
                    'w-7 h-7 rounded-full',
                    'flex items-center justify-center',
                    'bg-primary text-primary-foreground',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'hover:brightness-110 transition-all'
                  )}
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCancel}
                  className={cn(
                    'w-7 h-7 rounded-full',
                    'flex items-center justify-center',
                    'bg-muted text-muted-foreground',
                    'hover:bg-destructive/20 hover:text-destructive',
                    'transition-all'
                  )}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // Full variant - for sidebar
  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.div
            key="add-button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Button
              variant="outline"
              onClick={() => setIsOpen(true)}
              className={cn(
                'w-full h-14 rounded-xl',
                'border-2 border-dashed border-muted-foreground/30',
                'hover:border-primary hover:bg-primary/5',
                'transition-all duration-200'
              )}
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Add Person
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="input-form"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              'p-4 rounded-xl',
              'bg-card border border-border',
              'space-y-3'
            )}
          >
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Add Person</p>
                <p className="text-xs text-muted-foreground">Enter their name</p>
              </div>
            </div>

            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter name..."
              className={cn(
                'w-full h-12 px-4 rounded-lg',
                'bg-background border border-input',
                'text-foreground text-base',
                'placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-ring',
                'transition-all'
              )}
              maxLength={20}
            />

            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                disabled={!name.trim()}
                className="flex-1 h-10"
              >
                <Check className="w-4 h-4 mr-2" />
                Add
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                className="h-10 px-4"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
