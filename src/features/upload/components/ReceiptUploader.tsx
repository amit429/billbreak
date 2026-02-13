// ============================================
// ReceiptUploader Component
// ============================================
// Main component that orchestrates the upload flow

import { useNavigate } from 'react-router-dom'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useReceiptUpload } from '../hooks/useReceiptUpload'
import { DropZone } from './DropZone'
import { ScanningAnimation } from './ScanningAnimation'
import { ParsedItemsList } from './ParsedItemsList'

interface ReceiptUploaderProps {
  className?: string
}

export function ReceiptUploader({ className }: ReceiptUploaderProps) {
  const navigate = useNavigate()
  const {
    status,
    error,
    progress,
    parsedItems,
    uploadReceipt,
    reset,
    confirmItems,
  } = useReceiptUpload()

  // Handle confirm and navigate
  const handleConfirm = () => {
    confirmItems()
    navigate('/split')
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Idle state - Show dropzone */}
      {status === 'idle' && (
        <DropZone onFileSelect={uploadReceipt} />
      )}

      {/* Uploading/Parsing state - Show animation */}
      {(status === 'uploading' || status === 'parsing') && (
        <ScanningAnimation progress={progress} status={status} />
      )}

      {/* Success state - Show parsed items */}
      {status === 'success' && (
        <ParsedItemsList
          items={parsedItems}
          onConfirm={handleConfirm}
          onReset={reset}
        />
      )}

      {/* Error state */}
      {status === 'error' && (
        <div className="flex flex-col items-center justify-center min-h-[280px] p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs">
            {error || 'Failed to parse the receipt. Please try again.'}
          </p>
          <Button onClick={reset} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      )}
    </div>
  )
}
