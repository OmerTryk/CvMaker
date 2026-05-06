import { type ReactNode, useState } from 'react'
import { ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ItemRowProps {
  /** Compact summary shown when collapsed (e.g. "Senior Engineer · Acme · 2023 — Now") */
  summary: ReactNode
  /** Optional sub-summary line (e.g. dates, location) */
  meta?: ReactNode
  onRemove: () => void
  defaultOpen?: boolean
  children: ReactNode
}

/**
 * A collapsible row inside a sortable list. Click header to expand
 * full edit form; collapsed view shows a one-line summary.
 */
export function ItemRow({
  summary,
  meta,
  onRemove,
  defaultOpen = false,
  children,
}: ItemRowProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="flex flex-col">
      <header className="flex items-center justify-between border-b border-line/60 px-4 py-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex flex-1 items-baseline gap-3 text-left"
        >
          <span className="font-display text-base text-ink">{summary}</span>
          {meta && (
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink/40">
              {meta}
            </span>
          )}
        </button>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onRemove}
            aria-label="Sil"
            className="flex h-7 w-7 items-center justify-center text-ink/30 transition-colors hover:bg-accent/10 hover:text-accent"
          >
            <X size={14} />
          </button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Daralt' : 'Genişlet'}
            className="flex h-7 w-7 items-center justify-center text-ink/40 transition-colors hover:text-ink"
          >
            <ChevronDown
              size={14}
              className={cn('transition-transform duration-300', open && 'rotate-180')}
            />
          </button>
        </div>
      </header>

      {open && <div className="p-5">{children}</div>}
    </div>
  )
}
