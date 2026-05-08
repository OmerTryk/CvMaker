/**
 * ExportButton — visible "PDF İndir" button + invisible PrintableCV.
 *
 * Self-contained: drop it anywhere and PDF export works.
 * Two visual variants: 'primary' (CTA) and 'subtle' (toolbar).
 */

import { FileDown, Loader2 } from 'lucide-react'
import { useCVStore } from '@/store'
import { PrintableCV } from './PrintableCV'
import { usePDFExport } from './usePDFExport'
import { cn } from '@/lib/utils'

interface ExportButtonProps {
  variant?: 'primary' | 'subtle'
  label?: string
}

export function ExportButton({
  variant = 'primary',
  label = 'PDF İndir',
}: ExportButtonProps) {
  const cv = useCVStore((s) => s.cv)
  const { ref, print, isPrinting } = usePDFExport()

  const styles =
    variant === 'primary'
      ? 'bg-ink text-paper hover:bg-accent border border-ink hover:border-accent px-5 py-3 text-xs'
      : 'text-ink/70 hover:bg-ink hover:text-paper px-3 py-1.5 text-[10px]'

  return (
    <>
      <button
        type="button"
        onClick={print}
        disabled={isPrinting}
        className={cn(
          'inline-flex items-center gap-2 font-mono uppercase tracking-widest transition-all duration-200 disabled:opacity-60',
          styles,
        )}
      >
        {isPrinting ? (
          <Loader2 size={variant === 'primary' ? 14 : 12} className="animate-spin" />
        ) : (
          <FileDown size={variant === 'primary' ? 14 : 12} />
        )}
        {isPrinting ? 'Hazırlanıyor...' : label}
      </button>

      {/* Off-screen source for react-to-print */}
      <div className="print-source" aria-hidden="true">
        <PrintableCV ref={ref} cv={cv} />
      </div>
    </>
  )
}
