// ============================================
// AddItemInput Component
// ============================================
// Input for adding new bill items with name and price

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Receipt, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface AddItemInputProps {
  onAddItem: (item: { name: string; price: number; quantity: number }) => void
  className?: string
}

export function AddItemInput({ onAddItem, className }: AddItemInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('1')
  const nameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && nameInputRef.current) {
      nameInputRef.current.focus()
    }
  }, [isOpen])

  const handleSubmit = () => {
    const trimmedName = name.trim()
    const parsedPrice = parseFloat(price) || 0
    const parsedQty = parseInt(quantity) || 1

    if (trimmedName && parsedPrice > 0) {
      onAddItem({ name: trimmedName, price: parsedPrice, quantity: parsedQty })
      resetForm()
    }
  }

  const resetForm = () => {
    setName('')
    setPrice('')
    setQuantity('1')
    setIsOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    } else if (e.key === 'Escape') {
      resetForm()
    }
  }

  const isValid = name.trim() && parseFloat(price) > 0

  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.button
            key="add-button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className={cn(
              'w-full p-4 rounded-xl',
              'border-2 border-dashed border-muted-foreground/30',
              'flex items-center justify-center gap-2',
              'text-muted-foreground',
              'hover:border-primary/50 hover:text-primary hover:bg-primary/5',
              'transition-all duration-200'
            )}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Add Item</span>
          </motion.button>
        ) : (
          <motion.div
            key="input-form"
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className={cn(
              'p-4 rounded-xl',
              'bg-card border border-primary/30',
              'space-y-4'
            )}
          >
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Receipt className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Add New Item</p>
                <p className="text-xs text-muted-foreground">Enter item details</p>
              </div>
            </div>

            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">
                Item Name
              </label>
              <input
                ref={nameInputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g., Margherita Pizza"
                className={cn(
                  'w-full h-11 px-3 rounded-lg',
                  'bg-background border border-input',
                  'text-foreground',
                  'placeholder:text-muted-foreground',
                  'focus:outline-none focus:ring-2 focus:ring-ring',
                  'transition-all'
                )}
                maxLength={50}
              />
            </div>

            {/* Price & Quantity Row */}
            <div className="flex gap-3">
              <div className="flex-1 space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium">
                  Price (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
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
                      'w-full h-11 pl-7 pr-3 rounded-lg',
                      'bg-background border border-input',
                      'text-foreground font-mono',
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
                  Qty
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  onKeyDown={handleKeyDown}
                  min="1"
                  max="99"
                  className={cn(
                    'w-full h-11 px-3 rounded-lg text-center',
                    'bg-background border border-input',
                    'text-foreground font-mono',
                    'focus:outline-none focus:ring-2 focus:ring-ring',
                    'transition-all',
                    '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                  )}
                />
              </div>
            </div>

            {/* Preview */}
            {name.trim() && parseFloat(price) > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 rounded-lg bg-muted/50 border border-border"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm">{name}</p>
                    {parseInt(quantity) > 1 && (
                      <p className="text-xs text-muted-foreground">
                        {quantity} × ₹{parseFloat(price).toFixed(0)}
                      </p>
                    )}
                  </div>
                  <p className="font-mono font-semibold text-primary">
                    ₹{(parseFloat(price) * (parseInt(quantity) || 1)).toFixed(0)}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <Button
                onClick={handleSubmit}
                disabled={!isValid}
                className="flex-1 h-11"
              >
                <Check className="w-4 h-4 mr-2" />
                Add Item
              </Button>
              <Button
                variant="outline"
                onClick={resetForm}
                className="h-11 px-4"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
