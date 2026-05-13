/**
 * ExportButton — "PDF İndir" ve "Word İndir" butonları + invisible PrintableCV.
 *
 * Kullanıcı PDF veya Word formatında CV export edebilir.
 * İki görsel varyant: 'primary' (CTA) ve 'subtle' (toolbar).
 */

import { FileDown, FileText, Loader2 } from 'lucide-react'
import { useCVStore } from '@/store'
import { PrintableCV } from './PrintableCV'
import { usePDFExport } from './usePDFExport'
import { useWordExport } from './useWordExport'
import { cn } from '@/lib/utils'

interface ExportButtonProps {
  variant?: 'primary' | 'subtle'
  format?: 'pdf' | 'word' | 'both'
  label?: string
}

export function ExportButton({
  variant = 'primary',
  format = 'both',
  label,
}: ExportButtonProps) {
  const cv = useCVStore((s) => s.cv)
  const { ref, print, isPrinting } = usePDFExport()
  const { exportToWord, isExporting } = useWordExport()

  const isLoading = isPrinting || isExporting

  const baseStyles =
    variant === 'primary'
      ? 'bg-ink text-paper hover:bg-accent border border-ink hover:border-accent px-5 py-3 text-xs'
      : 'text-ink/70 hover:bg-ink hover:text-paper px-3 py-1.5 text-[10px]'

  // If only one format, show single button
  if (format === 'pdf') {
    return (
      <>
        <button
          type="button"
          onClick={print}
          disabled={isLoading}
          className={cn(
            'inline-flex items-center gap-2 font-mono uppercase tracking-widest transition-all duration-200 disabled:opacity-60',
            baseStyles,
          )}
        >
          {isPrinting ? (
            <Loader2 size={variant === 'primary' ? 14 : 12} className="animate-spin" />
          ) : (
            <FileDown size={variant === 'primary' ? 14 : 12} />
          )}
          {isPrinting ? 'Hazırlanıyor...' : label || 'PDF İndir'}
        </button>

        <div className="print-source" aria-hidden="true">
          <PrintableCV ref={ref} cv={cv} />
        </div>
      </>
    )
  }

  if (format === 'word') {
    return (
      <button
        type="button"
        onClick={() => exportToWord(cv)}
        disabled={isLoading}
        className={cn(
          'inline-flex items-center gap-2 font-mono uppercase tracking-widest transition-all duration-200 disabled:opacity-60',
          baseStyles,
        )}
      >
        {isExporting ? (
          <Loader2 size={variant === 'primary' ? 14 : 12} className="animate-spin" />
        ) : (
          <FileText size={variant === 'primary' ? 14 : 12} />
        )}
        {isExporting ? 'Hazırlanıyor...' : label || 'Word İndir'}
      </button>
    )
  }

  // Both formats: show two buttons
  return (
    <>
      <div className="inline-flex gap-2">
        <button
          type="button"
          onClick={print}
          disabled={isLoading}
          className={cn(
            'inline-flex items-center gap-2 font-mono uppercase tracking-widest transition-all duration-200 disabled:opacity-60',
            baseStyles,
          )}
        >
          {isPrinting ? (
            <Loader2 size={variant === 'primary' ? 14 : 12} className="animate-spin" />
          ) : (
            <FileDown size={variant === 'primary' ? 14 : 12} />
          )}
          {isPrinting ? 'Hazırlanıyor...' : 'PDF'}
        </button>

        <button
          type="button"
          onClick={() => exportToWord(cv)}
          disabled={isLoading}
          className={cn(
            'inline-flex items-center gap-2 font-mono uppercase tracking-widest transition-all duration-200 disabled:opacity-60',
            baseStyles,
          )}
        >
          {isExporting ? (
            <Loader2 size={variant === 'primary' ? 14 : 12} className="animate-spin" />
          ) : (
            <FileText size={variant === 'primary' ? 14 : 12} />
          )}
          {isExporting ? 'Hazırlanıyor...' : 'Word'}
        </button>
      </div>

      <div className="print-source" aria-hidden="true">
        <PrintableCV ref={ref} cv={cv} />
      </div>
    </>
  )
}
