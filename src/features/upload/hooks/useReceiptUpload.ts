// ============================================
// useReceiptUpload Hook
// ============================================
// Handles the receipt upload and parsing logic

import { useState, useCallback } from 'react'
import { parseReceiptWithAI } from '@/lib/gemini'
import { useBill } from '@/context/bill'
import type { BillItem } from '@/types'

export type UploadStatus = 'idle' | 'uploading' | 'parsing' | 'success' | 'error'

export interface UseReceiptUploadReturn {
  // State
  status: UploadStatus
  error: string | null
  progress: number
  parsedItems: BillItem[]

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

      // Store parsed items
      setParsedItems(result.items)
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
  }, [])

  /**
   * Confirm parsed items and move to assignment screen
   */
  const confirmItems = useCallback(() => {
    if (parsedItems.length > 0) {
      actions.setItems(parsedItems)
      // setItems action automatically advances to ASSIGN status
    }
  }, [parsedItems, actions])

  return {
    status,
    error,
    progress,
    parsedItems,
    uploadReceipt,
    reset,
    confirmItems,
  }
}
