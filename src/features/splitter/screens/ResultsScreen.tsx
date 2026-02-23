// ============================================
// Results Screen
// ============================================
// Shows the final breakdown of who owes what
// Includes SplitSlip download feature (PDF/PNG)

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Download, RotateCcw, FileImage, FileText, Check, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBill } from '@/context/bill'
import { USER_COLOR_CLASSES } from '@/types'
import { cn } from '@/lib/utils'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { UserAvatar } from '@/features/splitter/components/UserAvatar'
import { SplitSlip } from '@/features/splitter/components/SplitSlip'
import { useDownloadSplitSlip } from '@/features/splitter/hooks/useDownloadSplitSlip'

export function ResultsScreen() {
  const navigate = useNavigate()
  const { state, actions, grandTotal, subtotal, userShares } = useBill()
  const splitSlipRef = useRef<HTMLDivElement>(null)
  const { status, downloadAsPng, downloadAsPdf } = useDownloadSplitSlip()
  const [showDownloadMenu, setShowDownloadMenu] = useState(false)

  // Redirect to home if no items or users (user navigated directly or refreshed)
  useEffect(() => {
    if (state.items.length === 0 || state.users.length === 0) {
      navigate('/', { replace: true })
    }
  }, [state.items.length, state.users.length, navigate])

  // Navigation handlers
  const handleBack = () => {
    navigate('/split')
  }

  const handleStartNew = () => {
    actions.reset()
    navigate('/')
  }

  // Download handlers
  const handleDownloadPng = async () => {
    if (splitSlipRef.current) {
      await downloadAsPng(splitSlipRef.current)
      setShowDownloadMenu(false)
    }
  }

  const handleDownloadPdf = async () => {
    if (splitSlipRef.current) {
      await downloadAsPdf(splitSlipRef.current)
      setShowDownloadMenu(false)
    }
  }

  // Don't render if no items (will redirect)
  if (state.items.length === 0 || state.users.length === 0) {
    return null
  }

  return (
    <div className="min-h-screen bg-background bg-grid flex flex-col">
      {/* Header */}
      <header className="glass-strong border-b border-border/50 px-4 py-3 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        <h1 className="font-semibold">Summary</h1>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setShowDownloadMenu(true)}
        >
          <Download className="w-4 h-4" />
        </Button>
      </header>

      {/* Grand total */}
      <div className="px-6 py-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-sm text-muted-foreground mb-2">Total Bill</p>
          <motion.p
            className="text-5xl md:text-6xl font-bold font-mono tabular-nums"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          >
            ₹{grandTotal.toFixed(0)}
          </motion.p>
          <p className="text-sm text-muted-foreground mt-3">
            Split between {state.users.length} {state.users.length === 1 ? 'person' : 'people'}
          </p>
        </motion.div>
      </div>

      {/* User shares */}
      <main className="flex-1 px-4 md:px-6 pb-32 max-w-2xl mx-auto w-full">
        <Accordion type="single" collapsible className="space-y-3">
          {userShares.map((share, index) => {
            const colors = USER_COLOR_CLASSES[share.user.color]
            
            return (
              <motion.div
                key={share.user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <AccordionItem
                  value={share.user.id}
                  className={cn(
                    'border-l-4 rounded-xl overflow-hidden',
                    'bg-card border border-border/50',
                    colors.border
                  )}
                >
                  <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between w-full pr-2">
                      <div className="flex items-center gap-4">
                        <UserAvatar user={share.user} size="lg" asSpan />
                        <div className="text-left">
                          <p className="font-semibold text-lg">{share.user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {share.itemCount} {share.itemCount === 1 ? 'item' : 'items'}
                          </p>
                        </div>
                      </div>
                      <motion.div
                        key={share.total.toFixed(0)}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={cn('text-right', colors.text)}
                      >
                        <p className="font-mono text-2xl md:text-3xl font-bold tabular-nums">
                          ₹{share.total.toFixed(0)}
                        </p>
                      </motion.div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    {/* Item breakdown */}
                    <div className="space-y-2 mb-4">
                      {share.items.map(({ item, quantity, shareAmount }) => {
                        // Format quantity display
                        const isRatioSplit = item.quantity === 1 && quantity < 1
                        const isDecimal = quantity % 1 !== 0
                        const qtyDisplay = isRatioSplit
                          ? `${Math.round(quantity * 100)}%`
                          : isDecimal
                            ? quantity.toFixed(1)
                            : quantity

                        return (
                          <div
                            key={item.id}
                            className="flex justify-between text-sm py-2 border-b border-border/30 last:border-0"
                          >
                            <div>
                              <span className="text-foreground">{item.name}</span>
                              {quantity !== item.quantity && (
                                <span className="text-xs text-muted-foreground ml-2">
                                  ({qtyDisplay}{isRatioSplit ? '' : ` of ${item.quantity}`})
                                </span>
                              )}
                              {quantity === item.quantity && item.quantity > 1 && (
                                <span className="text-xs text-muted-foreground ml-2">
                                  (×{qtyDisplay})
                                </span>
                              )}
                            </div>
                            <span className="font-mono tabular-nums text-muted-foreground">
                              ₹{shareAmount.toFixed(0)}
                            </span>
                          </div>
                        )
                      })}
                    </div>

                    {/* Summary */}
                    <div className="pt-3 border-t border-border/50 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Items Subtotal</span>
                        <span className="font-mono tabular-nums">
                          ₹{share.subtotal.toFixed(0)}
                        </span>
                      </div>
                      {share.taxShare > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Tax Share</span>
                          <span className="font-mono tabular-nums">
                            ₹{share.taxShare.toFixed(0)}
                          </span>
                        </div>
                      )}
                      {share.tipShare > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Tip Share</span>
                          <span className="font-mono tabular-nums">
                            ₹{share.tipShare.toFixed(0)}
                          </span>
                        </div>
                      )}
                      <div className={cn('flex justify-between text-base font-semibold pt-2', colors.text)}>
                        <span>Total</span>
                        <span className="font-mono tabular-nums">
                          ₹{share.total.toFixed(0)}
                        </span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            )
          })}
        </Accordion>
      </main>

      {/* Hidden SplitSlip for rendering */}
      <div className="fixed -left-[9999px] top-0">
        <SplitSlip
          ref={splitSlipRef}
          userShares={userShares}
          subtotal={subtotal}
          taxAmount={state.taxAmount}
          tipAmount={state.tipAmount}
          grandTotal={grandTotal}
        />
      </div>

      {/* Bottom actions */}
      <div className="fixed bottom-0 left-0 right-0 z-20 glass-strong border-t border-border/50 p-4 space-y-2">
        <div className="max-w-2xl mx-auto space-y-2">
          {/* Download SplitSlip Button */}
          <div className="relative">
            <Button
              className="w-full h-12 text-base font-medium"
              variant="default"
              onClick={() => setShowDownloadMenu(!showDownloadMenu)}
              disabled={status === 'generating'}
            >
              {status === 'generating' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : status === 'success' ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Downloaded!
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download SplitSlip
                </>
              )}
            </Button>

            {/* Download format dropdown */}
            <AnimatePresence>
              {showDownloadMenu && status === 'idle' && (
                <>
                  {/* Backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-10"
                    onClick={() => setShowDownloadMenu(false)}
                  />
                  
                  {/* Menu */}
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="absolute bottom-full left-0 right-0 mb-2 z-20"
                  >
                    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xl">
                      <div className="p-2 border-b border-border/50 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground px-2">Choose format</span>
                        <button
                          onClick={() => setShowDownloadMenu(false)}
                          className="p-1 hover:bg-muted rounded-md transition-colors"
                        >
                          <X className="w-3 h-3 text-muted-foreground" />
                        </button>
                      </div>
                      <div className="p-2 space-y-1">
                        <button
                          onClick={handleDownloadPng}
                          className={cn(
                            'w-full flex items-center gap-3 px-4 py-3 rounded-lg',
                            'hover:bg-muted/50 transition-colors text-left'
                          )}
                        >
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                            <FileImage className="w-5 h-5 text-purple-400" />
                          </div>
                          <div>
                            <p className="font-medium">PNG Image</p>
                            <p className="text-xs text-muted-foreground">Perfect for sharing</p>
                          </div>
                        </button>
                        <button
                          onClick={handleDownloadPdf}
                          className={cn(
                            'w-full flex items-center gap-3 px-4 py-3 rounded-lg',
                            'hover:bg-muted/50 transition-colors text-left'
                          )}
                        >
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-red-400" />
                          </div>
                          <div>
                            <p className="font-medium">PDF Document</p>
                            <p className="text-xs text-muted-foreground">Great for records</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <Button
            className="w-full"
            variant="outline"
            onClick={handleStartNew}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Start New Bill
          </Button>
        </div>
      </div>
    </div>
  )
}
