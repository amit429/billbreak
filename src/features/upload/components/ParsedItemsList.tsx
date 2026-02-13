// ============================================
// ParsedItemsList Component
// ============================================
// Shows the AI-parsed items for review before confirming

import { motion } from 'framer-motion'
import { Check, X, Edit2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { BillItem } from '@/types'

interface ParsedItemsListProps {
  items: BillItem[]
  onConfirm: () => void
  onReset: () => void
  onEditItem?: (itemId: string, updates: Partial<BillItem>) => void
  onDeleteItem?: (itemId: string) => void
}

export function ParsedItemsList({
  items,
  onConfirm,
  onReset,
}: ParsedItemsListProps) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Items Found</h3>
          <p className="text-sm text-muted-foreground">
            {items.length} items • ₹{total.toFixed(2)} total
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onReset}>
          <X className="w-4 h-4 mr-1" />
          Start Over
        </Button>
      </div>

      {/* Items list */}
      <div className="space-y-2 max-h-[320px] overflow-y-auto pr-2">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            className={cn(
              'flex items-center justify-between p-3 rounded-lg',
              'bg-card border border-border',
              'hover:border-primary/30 transition-colors',
              'group'
            )}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            {/* Item details */}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{item.name}</p>
              {item.quantity > 1 && (
                <p className="text-xs text-muted-foreground">
                  Qty: {item.quantity}
                </p>
              )}
            </div>

            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="font-mono font-medium">
                ₹{(item.price * item.quantity).toFixed(2)}
              </span>

              {/* Edit/Delete buttons (show on hover) */}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1 rounded hover:bg-muted">
                  <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
                <button className="p-1 rounded hover:bg-destructive/10">
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Confirm button */}
      <motion.div
        className="mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Button
          onClick={onConfirm}
          className="w-full h-12 text-lg font-medium"
          size="lg"
        >
          <Check className="w-5 h-5 mr-2" />
          Looks Good — Start Splitting
        </Button>
        <p className="text-xs text-center text-muted-foreground mt-2">
          You can edit items on the next screen
        </p>
      </motion.div>
    </motion.div>
  )
}
