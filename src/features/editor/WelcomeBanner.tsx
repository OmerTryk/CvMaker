/**
 * WelcomeBanner — shown in the editor when the CV is empty.
 * Gives the user two clear paths: load a sample or start blank.
 * Disappears automatically once they add any content.
 */

import { Sparkles, ArrowRight, FileText } from 'lucide-react'
import { useCVStore } from '@/store'
import { META_LABEL } from '@/hooks/useKeyboardShortcuts'

export function WelcomeBanner() {
  const loadSample = useCVStore((s) => s.loadSample)

  return (
    <div className="mb-8 border border-dashed border-ink/20 bg-paper-warm/50 p-8 md:p-10">
      <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        {/* Copy */}
        <div className="max-w-lg">
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink/40">
            Hoş geldin
          </p>
          <h2 className="mt-3 font-display text-3xl font-light leading-tight tracking-tight text-ink">
            CV'ne nereden başlayalım?
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink/60">
            Form alanlarını doldurarak ya da hazır bir örnekle başlayabilirsin.
            Her şey otomatik kaydedilir — hiçbir şeyi kaybetmezsin.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3 sm:flex-row md:flex-col md:items-stretch">
          <button
            onClick={loadSample}
            className="group inline-flex items-center justify-between gap-4 bg-ink px-6 py-4 text-paper transition-all duration-300 hover:bg-accent"
          >
            <span className="flex items-center gap-2.5 font-mono text-xs uppercase tracking-widest">
              <Sparkles size={14} />
              Örnek CV ile başla
            </span>
            <ArrowRight
              size={14}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </button>

          <div className="flex items-center gap-3 px-2 py-1">
            <FileText size={14} className="shrink-0 text-ink/30" />
            <p className="font-mono text-[10px] uppercase tracking-widest text-ink/50">
              Ya da formu doldur. Kısayol:{' '}
              <kbd className="border border-ink/20 bg-paper px-1.5 py-0.5 text-ink shadow-[0_1px_0_rgba(0,0,0,0.1)]">
                {META_LABEL}+E
              </kbd>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
