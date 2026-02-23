// ============================================
// useDownloadSplitSlip Hook
// ============================================
// Custom hook to handle PDF and PNG generation
// Uses html2canvas for rendering and jsPDF for PDF creation
//
// Note: Renders in an isolated iframe to avoid oklch color issues
// with html2canvas (which doesn't support modern CSS color functions)

import { useCallback, useState } from 'react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

export type DownloadFormat = 'pdf' | 'png'
export type DownloadStatus = 'idle' | 'generating' | 'success' | 'error'

interface UseDownloadSplitSlipReturn {
  status: DownloadStatus
  error: string | null
  downloadAsPng: (element: HTMLElement) => Promise<void>
  downloadAsPdf: (element: HTMLElement) => Promise<void>
  download: (element: HTMLElement, format: DownloadFormat) => Promise<void>
}

export function useDownloadSplitSlip(): UseDownloadSplitSlipReturn {
  const [status, setStatus] = useState<DownloadStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const generateCanvas = async (element: HTMLElement): Promise<HTMLCanvasElement> => {
    // Create an isolated iframe to render without app's CSS (which uses oklch)
    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.left = '-9999px'
    iframe.style.top = '0'
    iframe.style.width = '500px'
    iframe.style.height = '2000px'
    iframe.style.border = 'none'
    document.body.appendChild(iframe)

    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
      if (!iframeDoc) throw new Error('Could not access iframe document')

      // Write minimal HTML with no external styles
      iframeDoc.open()
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { background: white; }
            </style>
          </head>
          <body></body>
        </html>
      `)
      iframeDoc.close()

      // Clone and append the element
      const clone = element.cloneNode(true) as HTMLElement
      iframeDoc.body.appendChild(clone)

      // Wait for fonts and rendering
      await new Promise(resolve => setTimeout(resolve, 100))

      // Render with html2canvas
      const canvas = await html2canvas(clone, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
      })

      return canvas
    } finally {
      // Clean up iframe
      document.body.removeChild(iframe)
    }
  }

  const getFileName = (format: DownloadFormat): string => {
    const date = new Date()
    const dateStr = date.toISOString().split('T')[0]
    const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-')
    return `SplitSlip-${dateStr}-${timeStr}.${format}`
  }

  const downloadAsPng = useCallback(async (element: HTMLElement): Promise<void> => {
    setStatus('generating')
    setError(null)

    try {
      const canvas = await generateCanvas(element)
      
      const link = document.createElement('a')
      link.download = getFileName('png')
      link.href = canvas.toDataURL('image/png', 1.0)
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setStatus('success')
      
      setTimeout(() => setStatus('idle'), 2000)
    } catch (err) {
      console.error('PNG generation failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate PNG')
      setStatus('error')
    }
  }, [])

  const downloadAsPdf = useCallback(async (element: HTMLElement): Promise<void> => {
    setStatus('generating')
    setError(null)

    try {
      const canvas = await generateCanvas(element)
      
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      
      // Convert pixels to mm (assuming 96 DPI, scaled by 2)
      const pdfWidth = (imgWidth / 2) * 0.264583
      const pdfHeight = (imgHeight / 2) * 0.264583
      
      const pdf = new jsPDF({
        orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [pdfWidth, pdfHeight],
      })

      const imgData = canvas.toDataURL('image/png', 1.0)
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      
      pdf.save(getFileName('pdf'))

      setStatus('success')
      
      setTimeout(() => setStatus('idle'), 2000)
    } catch (err) {
      console.error('PDF generation failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate PDF')
      setStatus('error')
    }
  }, [])

  const download = useCallback(
    async (element: HTMLElement, format: DownloadFormat): Promise<void> => {
      if (format === 'pdf') {
        await downloadAsPdf(element)
      } else {
        await downloadAsPng(element)
      }
    },
    [downloadAsPdf, downloadAsPng]
  )

  return {
    status,
    error,
    downloadAsPng,
    downloadAsPdf,
    download,
  }
}
