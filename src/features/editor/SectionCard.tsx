import { type ReactNode, useState } from 'react'
import { ChevronDown, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { IconButton } from '@/components/ui'

interface SectionCardProps {
  title: string
  count?: number
  description?: string
  hidden?: boolean
  onToggleHidden?: () => void
  defaultOpen?: boolean
  children: ReactNode
  /**
   * If true, no toggle button — section is always shown.
   * Used for required sections like "Personal Info".
   */
  required?: boolean
}

export function SectionCard({
  title,
  count,
  description,
  hidden,
  onToggleHidden,
  defaultOpen = true,
  children,
  required,
}: SectionCardProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section
      className={cn(
        'border border-line bg-paper-cool/40 transition-opacity duration-200',
        hidden && 'opacity-50',
      )}
    >
      <header className="flex items-center justify-between border-b border-line/60 px-6 py-4">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="group flex flex-1 items-baseline gap-4 text-left"
        >
          <span className="font-display text-2xl font-light text-ink">{title}</span>
          {typeof count === 'number' && count > 0 && (
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink/40">
              {count} kayıt
            </span>
          )}
          {description && !count && (
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink/40">
              {description}
            </span>
          )}
        </button>

        <div className="flex items-center gap-1">
          {!required && onToggleHidden && (
            <IconButton
              label={hidden ? 'Bölümü göster' : 'Bölümü gizle'}
              onClick={(e) => {
                e.stopPropagation()
                onToggleHidden()
              }}
              tone={hidden ? 'accent' : 'default'}
            >
              {hidden ? <EyeOff size={16} /> : <Eye size={16} />}
            </IconButton>
          )}
          <IconButton
            label={open ? 'Daralt' : 'Genişlet'}
            onClick={() => setOpen((v) => !v)}
          >
            <ChevronDown
              size={16}
              className={cn('transition-transform duration-300', open && 'rotate-180')}
            />
          </IconButton>
        </div>
      </header>

      {open && <div className="p-6">{children}</div>}
    </section>
  )
}
