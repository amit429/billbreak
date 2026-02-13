// ============================================
// EditItemModal Component
// ============================================
// Modal for editing or deleting bill items

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, Check, Receipt } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { BillItem } from '@/types'

interface EditItemModalProps {
  item: BillItem | null
  isOpen: boolean
  onClose: () => void
  onSave: (itemId: string, updates: Partial<BillItem>) => void
  onDelete: (itemId: string) => void
}

export function EditItemModal({
  item,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: EditItemModalProps) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Sync form with item when opened
  useEffect(() => {
    if (item && isOpen) {
      setName(item.name)
      setPrice(item.price.toString())
      setQuantity(item.quantity.toString())
      setShowDeleteConfirm(false)
    }
  }, [item, isOpen])

  const handleSave = () => {
    if (!item) return

    const trimmedName = name.trim()
    const parsedPrice = parseFloat(price) || 0
    const parsedQty = parseInt(quantity) || 1

    if (trimmedName && parsedPrice >= 0) {
      onSave(item.id, {
        name: trimmedName,
        price: parsedPrice,
        quantity: parsedQty,
      })
      onClose()
    }
  }

  const handleDelete = () => {
    if (!item) return
    onDelete(item.id)
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  const isValid = name.trim() && parseFloat(price) >= 0
  const totalPrice = (parseFloat(price) || 0) * (parseInt(quantity) || 1)

  return (
    <AnimatePresence>
      {isOpen && item && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={cn(
              'fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
              'w-[calc(100%-2rem)] max-w-md',
              'bg-card border border-border rounded-2xl',
              'shadow-2xl overflow-hidden'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold">Edit Item</h2>
                  <p className="text-xs text-muted-foreground">Modify or delete</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Name Input */}
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium">
                  Item Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Item name"
                  className={cn(
                    'w-full h-12 px-4 rounded-lg',
                    'bg-background border border-input',
                    'text-foreground text-base',
                    'placeholder:text-muted-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-ring',
                    'transition-all'
                  )}
                  maxLength={50}
                  autoFocus
                />
              </div>

              {/* Price & Quantity */}
              <div className="flex gap-3">
                <div className="flex-1 space-y-1.5">
                  <label className="text-xs text-muted-foreground font-medium">
                    Price (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      className={cn(
                        'w-full h-12 pl-8 pr-4 rounded-lg',
                        'bg-background border border-input',
                        'text-foreground font-mono text-lg',
                        'placeholder:text-muted-foreground',
                        'focus:outline-none focus:ring-2 focus:ring-ring',
                        'transition-all',
                        '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                      )}
                    />
                  </div>
                </div>

                <div className="w-24 space-y-1.5">
                  <label className="text-xs text-muted-foreground font-medium">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    onKeyDown={handleKeyDown}
                    min="1"
                    max="99"
                    className={cn(
                      'w-full h-12 px-3 rounded-lg text-center',
                      'bg-background border border-input',
                      'text-foreground font-mono text-lg',
                      'focus:outline-none focus:ring-2 focus:ring-ring',
                      'transition-all',
                      '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                    )}
                  />
                </div>
              </div>

              {/* Total Preview */}
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="font-mono text-2xl font-bold text-primary">
                    ₹{totalPrice.toFixed(0)}
                  </span>
                </div>
              </div>

              {/* Delete Section */}
              <AnimatePresence mode="wait">
                {!showDeleteConfirm ? (
                  <motion.button
                    key="delete-btn"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowDeleteConfirm(true)}
                    className={cn(
                      'w-full p-3 rounded-lg',
                      'flex items-center justify-center gap-2',
                      'text-sm text-muted-foreground',
                      'hover:bg-destructive/10 hover:text-destructive',
                      'transition-colors'
                    )}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete this item
                  </motion.button>
                ) : (
                  <motion.div
                    key="delete-confirm"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 space-y-3"
                  >
                    <p className="text-sm text-center">
                      Delete "<span className="font-medium">{item.name}</span>"?
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        onClick={handleDelete}
                        className="flex-1 h-10"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 h-10"
                      >
                        Cancel
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  disabled={!isValid}
                  className="flex-1 h-12 text-base"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="h-12 px-6"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
