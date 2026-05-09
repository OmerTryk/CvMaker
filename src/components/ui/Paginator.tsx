import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginatorProps {
  current: number
  total: number
  onPrev: () => void
  onNext: () => void
  size?: 'sm' | 'md'
}

export function Paginator({ current, total, onPrev, onNext, size = 'sm' }: PaginatorProps) {
  if (total <= 1) return null

  const iconSize = size === 'sm' ? 14 : 18
  const btnClass = cn(
    'flex items-center justify-center border border-line transition-all duration-200',
    'disabled:opacity-30 disabled:cursor-not-allowed',
    'hover:bg-ink hover:text-paper hover:border-ink',
    size === 'sm' ? 'h-7 w-7' : 'h-9 w-9',
  )

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onPrev}
        disabled={current === 0}
        aria-label="Önceki sayfa"
        className={btnClass}
      >
        <ChevronLeft size={iconSize} />
      </button>

      <span
        className={cn(
          'font-mono text-ink/60',
          size === 'sm' ? 'text-[10px]' : 'text-xs',
          'uppercase tracking-widest',
        )}
      >
        {current + 1} / {total}
      </span>

      <button
        type="button"
        onClick={onNext}
        disabled={current === total - 1}
        aria-label="Sonraki sayfa"
        className={btnClass}
      >
        <ChevronRight size={iconSize} />
      </button>
    </div>
  )
}
