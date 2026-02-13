// ============================================
// ScanningAnimation Component
// ============================================
// Shows a scanning/processing animation while AI parses receipt

import { motion } from 'framer-motion'
import { Scan } from 'lucide-react'

interface ScanningAnimationProps {
  progress: number
  status: 'uploading' | 'parsing'
}

export function ScanningAnimation({ progress, status }: ScanningAnimationProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[280px] p-8">
      {/* Animated scanner icon */}
      <motion.div
        className="relative w-24 h-24 mb-6"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Outer ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-primary/30"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />

        {/* Inner circle with icon */}
        <div className="absolute inset-2 rounded-full bg-primary/10 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Scan className="w-10 h-10 text-primary" />
          </motion.div>
        </div>

        {/* Scanning line */}
        <motion.div
          className="absolute left-0 right-0 h-0.5 bg-primary"
          initial={{ top: '20%' }}
          animate={{ top: ['20%', '80%', '20%'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* Status text */}
      <motion.p
        className="text-lg font-medium text-foreground mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {status === 'uploading' ? 'Uploading...' : 'Scanning Receipt...'}
      </motion.p>

      <motion.p
        className="text-sm text-muted-foreground mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {status === 'uploading'
          ? 'Preparing your image'
          : 'AI is extracting items from your receipt'}
      </motion.p>

      {/* Progress bar */}
      <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Shimmer skeleton for items preview */}
      <div className="mt-8 w-full max-w-xs space-y-2">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="h-12 rounded-lg bg-muted/50 overflow-hidden"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
          >
            <motion.div
              className="h-full w-full bg-gradient-to-r from-transparent via-white/5 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
