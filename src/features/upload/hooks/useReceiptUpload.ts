// ============================================
// useReceiptUpload Hook
// ============================================
// Handles the receipt upload and parsing logic

import { useState, useCallback } from 'react'
import { parseReceiptWithAI, type TaxBreakdown, emptyTaxBreakdown } from '@/lib/gemini'
import { useBill } from '@/context/bill'
import type { BillItem } from '@/types'

export type UploadStatus = 'idle' | 'uploading' | 'parsing' | 'success' | 'error'

export interface UseReceiptUploadReturn {
  // State
  status: UploadStatus
  error: string | null
  progress: number
  parsedItems: BillItem[]
  taxBreakdown: TaxBreakdown
  subtotal: number
  grandTotal: number

  // Actions
  uploadReceipt: (file: File) => Promise<void>
  reset: () => void
  confirmItems: () => void
}

export function useReceiptUpload(): UseReceiptUploadReturn {
  const { actions } = useBill()

  const [status, setStatus] = useState<UploadStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [parsedItems, setParsedItems] = useState<BillItem[]>([])
  const [taxBreakdown, setTaxBreakdown] = useState<TaxBreakdown>(emptyTaxBreakdown())
  const [subtotal, setSubtotal] = useState(0)
  const [grandTotal, setGrandTotal] = useState(0)

  /**
   * Upload and parse a receipt image
   */
  const uploadReceipt = useCallback(async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      setStatus('error')
      return
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      setError('Image size must be less than 10MB')
      setStatus('error')
      return
    }

    try {
      setStatus('uploading')
      setError(null)
      setProgress(20)

      // Simulate upload progress
      await new Promise((resolve) => setTimeout(resolve, 300))
      setProgress(40)

      setStatus('parsing')
      setProgress(60)

      // Parse with Gemini AI
      const result = await parseReceiptWithAI(file)
      setProgress(90)

      // Store parsed data
      setParsedItems(result.items)
      setTaxBreakdown(result.tax)
      setSubtotal(result.subtotal)
      setGrandTotal(result.grandTotal)
      
      setProgress(100)
      setStatus('success')

    } catch (err) {
      console.error('Receipt parsing failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to parse receipt')
      setStatus('error')
    }
  }, [])

  /**
   * Reset to initial state
   */
  const reset = useCallback(() => {
    setStatus('idle')
    setError(null)
    setProgress(0)
    setParsedItems([])
    setTaxBreakdown(emptyTaxBreakdown())
    setSubtotal(0)
    setGrandTotal(0)
  }, [])

  /**
   * Confirm parsed items and set tax amount
   */
  const confirmItems = useCallback(() => {
    if (parsedItems.length > 0) {
      // Set items
      actions.setItems(parsedItems)
      
      // Set total tax amount (sum of all tax components)
      if (taxBreakdown.total > 0) {
        actions.setTax(taxBreakdown.total)
      }
    }
  }, [parsedItems, taxBreakdown, actions])

  return {
    status,
    error,
    progress,
    parsedItems,
    taxBreakdown,
    subtotal,
    grandTotal,
    uploadReceipt,
    reset,
    confirmItems,
  }
}
