// ============================================
// Results Screen
// ============================================
// Shows the final breakdown of who owes what

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Share2, RotateCcw } from 'lucide-react'
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
import { UserAvatar } from '../components/UserAvatar'

export function ResultsScreen() {
  const navigate = useNavigate()
  const { state, actions, grandTotal, userShares } = useBill()

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
        <Button variant="ghost" size="sm">
          <Share2 className="w-4 h-4" />
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
                        <UserAvatar user={share.user} size="lg" />
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
                      {share.items.map(({ item, quantity, shareAmount }) => (
                        <div
                          key={item.id}
                          className="flex justify-between text-sm py-2 border-b border-border/30 last:border-0"
                        >
                          <div>
                            <span className="text-foreground">{item.name}</span>
                            {quantity !== item.quantity && (
                              <span className="text-xs text-muted-foreground ml-2">
                                ({quantity} of {item.quantity})
                              </span>
                            )}
                            {quantity === item.quantity && item.quantity > 1 && (
                              <span className="text-xs text-muted-foreground ml-2">
                                (×{quantity})
                              </span>
                            )}
                          </div>
                          <span className="font-mono tabular-nums text-muted-foreground">
                            ₹{shareAmount.toFixed(0)}
                          </span>
                        </div>
                      ))}
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

      {/* Bottom actions */}
      <div className="fixed bottom-0 left-0 right-0 z-20 glass-strong border-t border-border/50 p-4 space-y-2">
        <div className="max-w-2xl mx-auto space-y-2">
          <Button className="w-full h-12 text-base font-medium" variant="default">
            <Share2 className="w-4 h-4 mr-2" />
            Share Summary
          </Button>
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
