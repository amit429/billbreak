// ============================================
// ParsedItemsList Component
// ============================================
// Shows the AI-parsed items and tax breakdown for review before confirming

import { motion } from 'framer-motion'
import { Check, X, Edit2, Trash2, Receipt } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { BillItem } from '@/types'
import type { TaxBreakdown } from '@/lib/gemini'

interface ParsedItemsListProps {
  items: BillItem[]
  taxBreakdown?: TaxBreakdown
  onConfirm: () => void
  onReset: () => void
  onEditItem?: (itemId: string, updates: Partial<BillItem>) => void
  onDeleteItem?: (itemId: string) => void
}

export function ParsedItemsList({
  items,
  taxBreakdown,
  onConfirm,
  onReset,
}: ParsedItemsListProps) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalTax = taxBreakdown?.total || 0
  const grandTotal = subtotal + totalTax

  // Check which tax components are present
  const hasTax = totalTax > 0
  const taxComponents = taxBreakdown ? [
    { label: 'CGST', value: taxBreakdown.cgst },
    { label: 'SGST', value: taxBreakdown.sgst },
    { label: 'IGST', value: taxBreakdown.igst },
    { label: 'Service Charge', value: taxBreakdown.serviceCharge },
    { label: 'Service Tax', value: taxBreakdown.serviceTax },
    { label: 'VAT', value: taxBreakdown.vat },
    { label: 'Cess', value: taxBreakdown.cess },
    { label: 'Other', value: taxBreakdown.other },
  ].filter(t => t.value > 0) : []

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
          <h3 className="text-lg font-semibold">Receipt Scanned</h3>
          <p className="text-sm text-muted-foreground">
            {items.length} items found
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onReset}>
          <X className="w-4 h-4 mr-1" />
          Start Over
        </Button>
      </div>

      {/* Items list */}
      <div className="space-y-2 max-h-[240px] overflow-y-auto pr-2">
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
                  Qty: {item.quantity} × ₹{item.price.toFixed(0)}
                </p>
              )}
            </div>

            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="font-mono font-medium">
                ₹{(item.price * item.quantity).toFixed(0)}
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

      {/* Tax Breakdown */}
      {hasTax && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 p-3 rounded-lg bg-muted/30 border border-border"
        >
          <div className="flex items-center gap-2 mb-2">
            <Receipt className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Tax Components Detected</span>
          </div>
          <div className="space-y-1">
            {taxComponents.map((tax) => (
              <div key={tax.label} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{tax.label}</span>
                <span className="font-mono">₹{tax.value.toFixed(0)}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm font-medium pt-1 border-t border-border mt-1">
              <span>Total Tax</span>
              <span className="font-mono text-primary">₹{totalTax.toFixed(0)}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Summary */}
      <motion.div
        className="mt-4 p-3 rounded-lg bg-card border border-border"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Items Subtotal</span>
            <span className="font-mono">₹{subtotal.toFixed(0)}</span>
          </div>
          {hasTax && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax</span>
              <span className="font-mono">₹{totalTax.toFixed(0)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold pt-2 border-t border-border">
            <span>Grand Total</span>
            <span className="font-mono text-lg">₹{grandTotal.toFixed(0)}</span>
          </div>
        </div>
      </motion.div>

      {/* Confirm button */}
      <motion.div
        className="mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Button
          onClick={onConfirm}
          className="w-full h-12 text-base font-medium"
          size="lg"
        >
          <Check className="w-5 h-5 mr-2" />
          Looks Good — Start Splitting
        </Button>
        <p className="text-xs text-center text-muted-foreground mt-2">
          You can edit items and tax on the next screen
        </p>
      </motion.div>
    </motion.div>
  )
}
