// ============================================
// Upload Screen
// ============================================
// The first screen - upload a receipt image

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Receipt, Sparkles, ArrowRight, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useBill } from '@/context/bill'
import type { BillItem, User } from '@/types'
import { ReceiptUploader } from '../components/ReceiptUploader'

// Complex demo data showcasing various splitting scenarios
// Now using the new assignments model with tax
const DEMO_USERS: User[] = [
  { id: 'u1', name: 'Alice', color: 'emerald' },
  { id: 'u2', name: 'Bob', color: 'blue' },
  { id: 'u3', name: 'Carol', color: 'purple' },
  { id: 'u4', name: 'Dave', color: 'rose' },
]

const DEMO_ITEMS: BillItem[] = [
  // Shared appetizers (everyone shares)
  { id: 'd1', name: 'Garlic Bread', price: 180, quantity: 1, assignments: [] },
  { id: 'd2', name: 'Nachos Grande', price: 350, quantity: 1, assignments: [] },
  
  // Individual mains (single person)
  { id: 'd3', name: 'Margherita Pizza (12")', price: 450, quantity: 1, assignments: [] },
  { id: 'd4', name: 'Pepperoni Pizza (12")', price: 550, quantity: 1, assignments: [] },
  { id: 'd5', name: 'Chicken Alfredo Pasta', price: 380, quantity: 1, assignments: [] },
  { id: 'd6', name: 'Grilled Salmon', price: 650, quantity: 1, assignments: [] },
  
  // Drinks with quantity - showcases uneven splitting
  { id: 'd7', name: 'Coca-Cola', price: 60, quantity: 5, assignments: [] },
  { id: 'd8', name: 'Fresh Lime Soda', price: 80, quantity: 3, assignments: [] },
  { id: 'd9', name: 'Craft Beer Pitcher', price: 450, quantity: 2, assignments: [] },
  
  // Desserts (shared)
  { id: 'd10', name: 'Chocolate Brownie', price: 220, quantity: 2, assignments: [] },
  { id: 'd11', name: 'Ice Cream Sundae', price: 180, quantity: 1, assignments: [] },
]

const DEMO_TAX = 285 // 5% GST on total

export function UploadScreen() {
  const navigate = useNavigate()
  const { state, actions } = useBill()
  const [showManualEntry, setShowManualEntry] = useState(false)
  const [manualItems, setManualItems] = useState<Array<{ name: string; price: string }>>([
    { name: '', price: '' },
  ])

  // Reset state when landing on upload screen (handles browser back)
  useEffect(() => {
    // Only reset if there are items (meaning user navigated back)
    if (state.items.length > 0) {
      actions.reset()
    }
    // Reset local state
    setShowManualEntry(false)
    setManualItems([{ name: '', price: '' }])
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Load demo bill and navigate to split screen
  const handleLoadDemo = () => {
    actions.loadDemo(DEMO_ITEMS, DEMO_USERS, DEMO_TAX)
    navigate('/split')
  }

  // Manual entry handlers
  const addManualRow = () => {
    setManualItems([...manualItems, { name: '', price: '' }])
  }

  const updateManualRow = (index: number, field: 'name' | 'price', value: string) => {
    const updated = [...manualItems]
    updated[index][field] = value
    setManualItems(updated)
  }

  const removeManualRow = (index: number) => {
    if (manualItems.length > 1) {
      setManualItems(manualItems.filter((_, i) => i !== index))
    }
  }

  const handleManualSubmit = () => {
    const validItems: BillItem[] = manualItems
      .filter((item) => item.name.trim() && parseFloat(item.price) > 0)
      .map((item, index) => ({
        id: `manual-${Date.now()}-${index}`,
        name: item.name.trim(),
        price: parseFloat(item.price),
        quantity: 1,
        assignments: [],
      }))

    if (validItems.length > 0) {
      actions.setItems(validItems)
      navigate('/split')
    }
  }

  const validManualItems = manualItems.filter(
    (item) => item.name.trim() && parseFloat(item.price) > 0
  )

  return (
    <div className="min-h-screen bg-background bg-grid flex flex-col">
      {/* Header */}
      <header className="p-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-2">BillBreak</h1>
          <p className="text-muted-foreground">Split bills, not friendships</p>
        </motion.div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 md:px-6 pb-6 flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full">
          <AnimatePresence mode="wait">
            {!showManualEntry ? (
              <motion.div
                key="upload-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full space-y-6"
              >
                {/* Uploader */}
                <ReceiptUploader className="mb-4" />

                {/* Divider */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-sm text-muted-foreground">or start with</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* Quick start options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Demo Bill */}
                  <motion.button
                    onClick={handleLoadDemo}
                    className={cn(
                      'p-4 rounded-xl text-left',
                      'bg-card border border-border',
                      'hover:border-primary/50 hover:bg-primary/5',
                      'transition-all duration-200',
                      'group'
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/30 transition-colors">
                        <Sparkles className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium mb-1">Demo Bill</p>
                        <p className="text-xs text-muted-foreground">
                          Restaurant bill with tax (4 people, 11 items, ₹285 GST)
                        </p>
                      </div>
                    </div>
                  </motion.button>

                  {/* Manual Entry */}
                  <motion.button
                    onClick={() => setShowManualEntry(true)}
                    className={cn(
                      'p-4 rounded-xl text-left',
                      'bg-card border border-border',
                      'hover:border-primary/50 hover:bg-primary/5',
                      'transition-all duration-200',
                      'group'
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/30 transition-colors">
                        <Receipt className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium mb-1">Enter Manually</p>
                        <p className="text-xs text-muted-foreground">
                          Type in items and prices yourself
                        </p>
                      </div>
                    </div>
                  </motion.button>
                </div>

                {/* Features */}
                <div className="pt-4 space-y-2">
                  <p className="text-xs text-muted-foreground text-center mb-3">
                    What you can do:
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {['Scan receipts with AI', 'Split items by quantity', 'Handle shared dishes', 'Include tax & tip'].map((feature) => (
                      <span
                        key={feature}
                        className="px-3 py-1 rounded-full bg-muted/50 text-xs text-muted-foreground"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="manual-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="w-full space-y-4"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">Enter Items</h2>
                    <p className="text-sm text-muted-foreground">
                      Add your bill items manually
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowManualEntry(false)}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </div>

                {/* Items list */}
                <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
                  {manualItems.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-2"
                    >
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateManualRow(index, 'name', e.target.value)}
                        placeholder="Item name"
                        className={cn(
                          'flex-1 h-11 px-3 rounded-lg',
                          'bg-card border border-input',
                          'text-foreground',
                          'placeholder:text-muted-foreground',
                          'focus:outline-none focus:ring-2 focus:ring-ring'
                        )}
                      />
                      <div className="relative w-28">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                          ₹
                        </span>
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => updateManualRow(index, 'price', e.target.value)}
                          placeholder="0"
                          className={cn(
                            'w-full h-11 pl-7 pr-3 rounded-lg',
                            'bg-card border border-input',
                            'text-foreground font-mono',
                            'placeholder:text-muted-foreground',
                            'focus:outline-none focus:ring-2 focus:ring-ring',
                            '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                          )}
                        />
                      </div>
                      <button
                        onClick={() => removeManualRow(index)}
                        disabled={manualItems.length === 1}
                        className={cn(
                          'w-11 h-11 rounded-lg flex items-center justify-center',
                          'text-muted-foreground hover:text-destructive hover:bg-destructive/10',
                          'disabled:opacity-30 disabled:cursor-not-allowed',
                          'transition-colors'
                        )}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>

                {/* Add row button */}
                <button
                  onClick={addManualRow}
                  className={cn(
                    'w-full p-3 rounded-lg',
                    'border-2 border-dashed border-muted-foreground/30',
                    'flex items-center justify-center gap-2',
                    'text-muted-foreground text-sm',
                    'hover:border-primary/50 hover:text-primary',
                    'transition-colors'
                  )}
                >
                  <Plus className="w-4 h-4" />
                  Add another item
                </button>

                {/* Summary & Submit */}
                <div className="pt-4 border-t border-border space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {validManualItems.length} valid {validManualItems.length === 1 ? 'item' : 'items'}
                    </span>
                    <span className="font-mono font-medium">
                      ₹{validManualItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0).toFixed(0)}
                    </span>
                  </div>
                  <Button
                    onClick={handleManualSubmit}
                    disabled={validManualItems.length === 0}
                    className="w-full h-12 text-base"
                  >
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Continue to Split
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center">
        <p className="text-xs text-muted-foreground">
          Your receipts are processed securely and never stored
        </p>
      </footer>
    </div>
  )
}
