/**
 * HelpOverlay — fullscreen modal showing keyboard shortcuts.
 * Opened by Ctrl+/ or the ? button in the header.
 */

import { useEffect } from 'react'
import { X, Keyboard } from 'lucide-react'
import { META_LABEL } from '@/hooks/useKeyboardShortcuts'
import { cn } from '@/lib/utils'

interface ShortcutEntry {
  keys: string[]
  description: string
  category: string
}

const SHORTCUTS: ShortcutEntry[] = [
  // Navigation
  { keys: [META_LABEL, 'E'], description: 'Örnek CV yükle', category: 'Genel' },
  { keys: [META_LABEL, 'P'], description: 'PDF olarak indir', category: 'Genel' },
  { keys: [META_LABEL, 'J'], description: 'JSON olarak indir', category: 'Genel' },
  { keys: [META_LABEL, '/'], description: 'Yardım & kısayollar', category: 'Genel' },
  // Editor
  { keys: ['Esc'], description: 'Açık paneli / modali kapat', category: 'Editör' },
  { keys: [META_LABEL, 'Shift', 'R'], description: 'CV\'yi sıfırla (onaylı)', category: 'Editör' },
]

interface HelpOverlayProps {
  open: boolean
  onClose: () => void
}

export function HelpOverlay({ open, onClose }: HelpOverlayProps) {
  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  const categories = [...new Set(SHORTCUTS.map((s) => s.category))]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-label="Klavye kısayolları"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative z-10 w-full max-w-lg border border-line bg-paper p-8 shadow-2xl animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Keyboard size={20} className="text-accent" strokeWidth={1.5} />
            <div>
              <h2 className="font-display text-2xl font-light text-ink">
                Klavye Kısayolları
              </h2>
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-ink/40">
                {META_LABEL === '⌘' ? 'macOS' : 'Windows / Linux'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Kapat"
            className="flex h-8 w-8 items-center justify-center text-ink/40 transition-colors hover:bg-paper-warm hover:text-ink"
          >
            <X size={16} />
          </button>
        </div>

        {/* Shortcuts grouped by category */}
        <div className="flex flex-col gap-8">
          {categories.map((cat) => (
            <div key={cat}>
              <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-ink/40">
                {cat}
              </p>
              <ul className="flex flex-col gap-3">
                {SHORTCUTS.filter((s) => s.category === cat).map((sc, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-6"
                  >
                    <span className="font-sans text-sm text-ink/80">
                      {sc.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {sc.keys.map((key, ki) => (
                        <span key={ki} className="flex items-center gap-1">
                          <kbd
                            className={cn(
                              'inline-flex min-w-[28px] items-center justify-center border border-ink/20 bg-paper-warm px-2 py-1',
                              'font-mono text-[11px] text-ink shadow-[0_1px_0_rgba(0,0,0,0.15)]',
                            )}
                          >
                            {key}
                          </kbd>
                          {ki < sc.keys.length - 1 && (
                            <span className="text-ink/30 text-xs">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer tip */}
        <div className="mt-8 border-t border-line pt-6">
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink/40">
            İpucu — CV otomatik kaydediliyor. Manuel kaydetme gerekmez.
          </p>
        </div>
      </div>
    </div>
  )
}
