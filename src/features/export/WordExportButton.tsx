import { FileText, Loader2 } from 'lucide-react'
import { useWordExport } from './useWordExport'
import { cn } from '@/lib/utils'

interface WordExportButtonProps {
  variant?: 'primary' | 'subtle'
  label?: string
}

export function WordExportButton({
  variant = 'primary',
  label = 'Word İndir',
}: WordExportButtonProps) {
  const { exportWord, isExporting } = useWordExport()

  const styles =
    variant === 'primary'
      ? 'bg-ink text-paper hover:bg-accent border border-ink hover:border-accent px-5 py-3 text-xs'
      : 'text-ink/70 hover:bg-ink hover:text-paper px-3 py-1.5 text-[10px]'

  return (
    <button
      type="button"
      onClick={exportWord}
      disabled={isExporting}
      className={cn(
        'inline-flex items-center gap-2 font-mono uppercase tracking-widest transition-all duration-200 disabled:opacity-60',
        styles,
      )}
    >
      {isExporting ? (
        <Loader2 size={variant === 'primary' ? 14 : 12} className="animate-spin" />
      ) : (
        <FileText size={variant === 'primary' ? 14 : 12} />
      )}
      {isExporting ? 'Hazırlanıyor...' : label}
    </button>
  )
}
