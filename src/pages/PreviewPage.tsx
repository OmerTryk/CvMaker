import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Edit3, HelpCircle } from 'lucide-react'
import { useCVStore } from '@/store'
import { TemplateRenderer } from '@/templates'
import { TEMPLATE_LIST, A4 } from '@/templates/shared/tokens'
import { ExportButton, WordExportButton } from '@/features/export'
import { Paginator } from '@/components/ui'
import { useSmartPageBreaks } from '@/hooks/useSmartPageBreaks'
import { cn } from '@/lib/utils'
import { useTour } from '@/features/help/useTour'
import { TourOverlay } from '@/features/help/TourOverlay'
import { PREVIEW_TOUR } from '@/features/help/tourSteps'


const GRAD_BOT = 40

export function PreviewPage() {
  const cv            = useCVStore((s) => s.cv)
  const template      = useCVStore((s) => s.cv.settings.template)
  const updateSettings = useCVStore((s) => s.updateSettings)

  const [currentPage, setCurrentPage] = useState(0)
  const [exitPage,    setExitPage]    = useState<number | null>(null)
  const [dir,         setDir]         = useState<'fwd' | 'bwd'>('fwd')
  const [animating,   setAnimating]   = useState(false)
  const [a4Scale,     setA4Scale]     = useState(1)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Compute scale so A4 fits the available viewport width on small screens
  const computeScale = useCallback(() => {
    const avail = document.documentElement.clientWidth - 48 // 24px side padding × 2
    setA4Scale(Math.min(1, avail / A4.widthPX))
  }, [])

  useEffect(() => {
    computeScale()
    window.addEventListener('resize', computeScale)
    return () => window.removeEventListener('resize', computeScale)
  }, [computeScale])

  const { contentRef, pageOffsets, pageCount } = useSmartPageBreaks(a4Scale)

  useEffect(() => {
    setCurrentPage((p) => Math.min(p, Math.max(0, pageCount - 1)))
  }, [pageCount])

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  const navigate = (d: 1 | -1) => {
    if (animating) return
    const next = Math.max(0, Math.min(pageCount - 1, currentPage + d))
    if (next === currentPage) return
    setExitPage(currentPage)
    setDir(d === 1 ? 'fwd' : 'bwd')
    setCurrentPage(next)
    setAnimating(true)
    timer.current = setTimeout(() => { setExitPage(null); setAnimating(false) }, 380)
  }

  const adjustedOffset = (page: number) => pageOffsets[page] ?? 0

  const activeTpl = TEMPLATE_LIST.find((t) => t.key === template)

  const tour = useTour(PREVIEW_TOUR)


  return (
    <div className="container-prose py-10 md:py-14">
      <style>{`
        @keyframes ppSlideInR  { from{transform:translateX(102%)} to{transform:translateX(0)} }
        @keyframes ppSlideOutL { from{transform:translateX(0)} to{transform:translateX(-102%)} }
        @keyframes ppSlideInL  { from{transform:translateX(-102%)} to{transform:translateX(0)} }
        @keyframes ppSlideOutR { from{transform:translateX(0)} to{transform:translateX(102%)} }
      `}</style>

      {/* ── Header row ── */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-ink/50">
            Önizleme {pageCount > 1 ? `· ${pageCount} sayfa` : ''}
          </p>
          <h1 className="mt-2 font-display text-2xl font-light tracking-tight text-ink sm:text-3xl md:text-5xl">
            {cv.title || 'CV Önizleme'}
          </h1>
        </div>
        <div data-tour="preview-actions" className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={tour.start}
            className="inline-flex items-center gap-1.5 border border-line px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-ink/60 transition-colors hover:border-accent hover:text-accent"
          >
            <HelpCircle size={12} strokeWidth={1.5} />
            Nasıl çalışır?
          </button>
          <Link
            to="/editor"
            className="inline-flex items-center gap-2 border border-line px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-ink/60 transition-colors hover:border-ink hover:bg-ink hover:text-paper"
          >
            <Edit3 size={12} /> Düzenle
          </Link>
          <WordExportButton variant="primary" label="Word İndir" />
          <ExportButton variant="primary" label="PDF İndir" />
        </div>
      </div>

      {/* Template picker — always open */}
      <div data-tour="preview-templates" className="mb-8 border border-line">
        <div className="border-b border-line px-5 py-3">
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink/50">
              Şablon
            </span>
            <span className="font-display text-lg font-light text-ink">
              {activeTpl?.name ?? template}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink/40">
              {activeTpl?.description}
            </span>
          </div>
        </div>

        {/* Top 7 */}
        <div className="grid grid-cols-2 gap-px bg-line sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
          {TEMPLATE_LIST.slice(0, 7).map((tpl) => {
            const active = template === tpl.key
            return (
              <button
                key={tpl.key}
                type="button"
                onClick={() => updateSettings({ template: tpl.key })}
                className={cn(
                  'flex flex-col items-start gap-0.5 bg-paper px-4 py-3 text-left transition-colors hover:bg-paper-warm',
                  active && 'bg-ink hover:bg-ink',
                )}
              >
                <span className={cn('font-display text-sm font-medium', active ? 'text-paper' : 'text-ink')}>
                  {tpl.name}
                </span>
                <span className={cn('font-mono text-[9px] uppercase tracking-wide leading-tight', active ? 'text-paper/60' : 'text-ink/35')}>
                  {tpl.description}
                </span>
              </button>
            )
          })}
        </div>

        {/* Bottom 2 */}
        <div className="grid grid-cols-2 gap-px bg-line">
          {TEMPLATE_LIST.slice(7).map((tpl) => {
            const active = template === tpl.key
            return (
              <button
                key={tpl.key}
                type="button"
                onClick={() => updateSettings({ template: tpl.key })}
                className={cn(
                  'flex items-center gap-4 bg-paper px-5 py-3 text-left transition-colors hover:bg-paper-warm',
                  active && 'bg-ink hover:bg-ink',
                )}
              >
                <span className={cn('font-display text-base font-medium', active ? 'text-paper' : 'text-ink')}>
                  {tpl.name}
                </span>
                <span className={cn('font-mono text-[9px] uppercase tracking-wide', active ? 'text-paper/60' : 'text-ink/40')}>
                  {tpl.description}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Paginator + A4 viewport ── */}
      <div data-tour="preview-canvas" className="flex flex-col items-center gap-5">
        {pageCount > 1 && (
          <Paginator
            current={currentPage} total={pageCount}
            onPrev={() => navigate(-1)} onNext={() => navigate(1)}
            size="md"
          />
        )}

        {/* A4 clip viewport — scales down on small screens */}
        <div
          style={{
            width: `${Math.round(A4.widthPX * a4Scale)}px`,
            height: `${Math.round(A4.heightPX * a4Scale)}px`,
            overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 4px 24px rgba(0,0,0,.10), 0 1px 4px rgba(0,0,0,.06)',
          }}
        >
          {/* Inner: full A4 size, scaled via CSS transform */}
          <div
            style={{
              width: `${A4.widthPX}px`,
              height: `${A4.heightPX}px`,
              transform: `scale(${a4Scale})`,
              transformOrigin: 'top left',
              position: 'absolute',
              top: 0,
              left: 0,
              background: 'white',
            }}
          >
            {/* Hidden measurement div */}
            <div
              ref={contentRef}
              style={{
                position: 'absolute', top: 0, left: 0,
                width: `${A4.widthPX}px`, minHeight: `${A4.heightPX}px`,
                visibility: 'hidden', pointerEvents: 'none', zIndex: 0,
              }}
            >
              <TemplateRenderer cv={cv} />
            </div>

            {/* Exiting page */}
            {exitPage !== null && (
              <div
                key={`exit-${exitPage}`}
                style={{
                  position: 'absolute', inset: 0, zIndex: 1,
                  animation: `${dir === 'fwd' ? 'ppSlideOutL' : 'ppSlideOutR'} .32s cubic-bezier(.4,0,1,1) forwards`,
                }}
              >
                <div style={{ position: 'absolute', top: `-${adjustedOffset(exitPage)}px`, left: 0, width: A4.widthPX }}>
                  <TemplateRenderer cv={cv} />
                </div>
              </div>
            )}

            {/* Current / entering page */}
            <div
              key={`cur-${currentPage}`}
              style={{
                position: 'absolute', inset: 0, zIndex: 2,
                animation: animating
                  ? `${dir === 'fwd' ? 'ppSlideInR' : 'ppSlideInL'} .32s cubic-bezier(0,0,.2,1) forwards`
                  : 'none',
              }}
            >
              <div style={{ position: 'absolute', top: `-${adjustedOffset(currentPage)}px`, left: 0, width: A4.widthPX }}>
                <TemplateRenderer cv={cv} />
              </div>
            </div>

            {/* Bottom gradient only */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              height: `${GRAD_BOT}px`,
              background: 'linear-gradient(to top, rgba(255,255,255,.95) 20%, transparent 100%)',
              zIndex: 10, pointerEvents: 'none',
            }} />
          </div>
        </div>

        {pageCount > 1 && (
          <Paginator
            current={currentPage} total={pageCount}
            onPrev={() => navigate(-1)} onNext={() => navigate(1)}
            size="md"
          />
        )}
      </div>

      <div className="mt-12 flex justify-center">
        <Link to="/editor" className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-ink/50 transition-colors hover:text-accent">
          <ArrowLeft size={14} /> Editöre dön
        </Link>
      </div>

      {tour.active && tour.current && (
        <TourOverlay
          step={tour.current}
          stepIndex={tour.stepIndex}
          totalSteps={tour.totalSteps}
          isFirst={tour.isFirst}
          isLast={tour.isLast}
          onNext={tour.next}
          onPrev={tour.prev}
          onClose={tour.stop}
        />
      )}
    </div>
  )
}
