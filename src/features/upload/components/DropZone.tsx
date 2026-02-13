// ============================================
// DropZone Component
// ============================================
// Drag & drop or click to upload receipt image

import { useCallback, useState, useRef } from 'react'
import { Upload, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DropZoneProps {
  onFileSelect: (file: File) => void
  disabled?: boolean
  className?: string
}

export function DropZone({ onFileSelect, disabled, className }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) setIsDragging(true)
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (disabled) return

    const files = e.dataTransfer.files
    if (files.length > 0) {
      onFileSelect(files[0])
    }
  }, [disabled, onFileSelect])

  const handleClick = useCallback(() => {
    if (!disabled) {
      inputRef.current?.click()
    }
  }, [disabled])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      onFileSelect(files[0])
    }
    // Reset input so same file can be selected again
    e.target.value = ''
  }, [onFileSelect])

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        'relative flex flex-col items-center justify-center',
        'w-full min-h-[280px] p-8',
        'border-2 border-dashed rounded-2xl',
        'transition-all duration-200 cursor-pointer',
        'group',
        isDragging
          ? 'border-primary bg-primary/10 scale-[1.02]'
          : 'border-border hover:border-primary/50 hover:bg-primary/5',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Icon */}
      <div
        className={cn(
          'w-16 h-16 rounded-full flex items-center justify-center mb-4',
          'bg-primary/10 text-primary',
          'transition-transform duration-200',
          'group-hover:scale-110',
          isDragging && 'scale-110'
        )}
      >
        {isDragging ? (
          <ImageIcon className="w-8 h-8" />
        ) : (
          <Upload className="w-8 h-8" />
        )}
      </div>

      {/* Text */}
      <p className="text-lg font-medium text-foreground mb-1">
        {isDragging ? 'Drop your receipt here' : 'Upload Receipt'}
      </p>
      <p className="text-sm text-muted-foreground text-center">
        Drag & drop or click to select
        <br />
        <span className="text-xs">PNG, JPG, HEIC up to 10MB</span>
      </p>

      {/* Decorative corners */}
      <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-primary/30 rounded-tl-lg" />
      <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-primary/30 rounded-tr-lg" />
      <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-primary/30 rounded-bl-lg" />
      <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-primary/30 rounded-br-lg" />
    </div>
  )
}
