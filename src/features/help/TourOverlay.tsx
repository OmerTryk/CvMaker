import { useEffect, useLayoutEffect, useState, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { TourStep } from './tourSteps'

interface Props {
  step: TourStep
  stepIndex: number
  totalSteps: number
  isFirst: boolean
  isLast: boolean
  onNext: () => void
  onPrev: () => void
  onClose: () => void
}

const PAD = 8   // padding around the highlighted element
const GAP = 14  // gap between highlight edge and tooltip

export function TourOverlay(props: Props) {
  const { step, stepIndex, totalSteps, isFirst, isLast, onNext, onPrev, onClose } = props

  const [rect, setRect] = useState<DOMRect | null>(null)
  const [win, setWin]   = useState({ w: window.innerWidth, h: window.innerHeight })

  // Tooltip yüksekliğini gerçek DOM'dan ölç
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [tooltipH, setTooltipH] = useState(180)

  useLayoutEffect(() => {
    if (tooltipRef.current) {
      setTooltipH(tooltipRef.current.offsetHeight)
    }
  })

  // Önceki adımın scroll dinleyicisini temizlemek için ref
  const scrollCleanupRef = useRef<(() => void) | null>(null)

  const measure = useCallback(() => {
    // Önceki adımın bekleyen scroll/timer'larını iptal et
    scrollCleanupRef.current?.()
    scrollCleanupRef.current = null

    const el = document.querySelector(step.selector)
    if (!el) {
      setTimeout(() => { if (isLast) onClose(); else onNext() }, 50)
      return
    }

    const r0 = el.getBoundingClientRect()
    if (r0.width === 0 && r0.height === 0) {
      setTimeout(() => { if (isLast) onClose(); else onNext() }, 50)
      return
    }

    // Adım değişiminde önce overlay gizle — önce scroll, sonra vurgula
    setRect(null)

    const HEADER_H = 80
    const targetY = r0.height > window.innerHeight * 0.6
      ? Math.max(0, window.scrollY + r0.top - HEADER_H)
      : Math.max(0, window.scrollY + r0.top + r0.height / 2 - window.innerHeight / 2)

    const show = () => {
      setRect(el.getBoundingClientRect())
      setWin({ w: window.innerWidth, h: window.innerHeight })
    }

    const needsScroll = !step.noScroll && Math.abs(targetY - window.scrollY) > 4

    if (!needsScroll) {
      // Scroll gerekmiyorsa hemen göster (RAF bazı ortamlarda tetiklenmeyebilir)
      show()
      return
    }

    // Scroll gerekiyorsa: scroll dur → 80ms sonra ölç
    // Fallback: en fazla 700ms bekle (çok uzun sayfalar için)
    window.scrollTo({ top: targetY, behavior: 'smooth' })

    let debounce: ReturnType<typeof setTimeout>
    let fallback: ReturnType<typeof setTimeout>
    let done = false

    const cleanup = () => {
      if (done) return
      done = true
      window.removeEventListener('scroll', onScrollEvent)
      clearTimeout(debounce)
      clearTimeout(fallback)
    }

    const onScrollEvent = () => {
      clearTimeout(debounce)
      debounce = setTimeout(() => { cleanup(); show() }, 80)
    }

    fallback = setTimeout(() => { cleanup(); show() }, 700)
    scrollCleanupRef.current = cleanup
    window.addEventListener('scroll', onScrollEvent)
  }, [step.selector, step.noScroll, isLast, onNext, onClose])

  useEffect(() => {
    measure()
    window.addEventListener('resize', measure)
    return () => {
      window.removeEventListener('resize', measure)
      scrollCleanupRef.current?.()
    }
  }, [measure])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight' && !isLast) onNext()
      if (e.key === 'ArrowLeft' && !isFirst) onPrev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, onNext, onPrev, isFirst, isLast])

  // Scroll lock — kullanıcı scroll'unu engeller ama window.scrollTo() çalışır.
  // body.overflow:hidden programatik scroll'u da kırdığı için event-listener kullanıyoruz.
  useEffect(() => {
    const stop = (e: Event) => e.preventDefault()
    window.addEventListener('wheel',     stop, { passive: false })
    window.addEventListener('touchmove', stop, { passive: false })
    return () => {
      window.removeEventListener('wheel',     stop)
      window.removeEventListener('touchmove', stop)
    }
  }, [])

  if (!rect) return null

  // Viewport-responsive tooltip width: max 280px, min 16px margin each side
  const TOOLTIP_W = Math.min(280, win.w - 32)

  // Eleman rect'ini viewport ile keserek tüm 4 kenarın görünmesini garantile
  const cLeft   = Math.max(0, rect.left)
  const cTop    = Math.max(0, rect.top)
  const cRight  = Math.min(win.w, rect.right)
  const cBottom = Math.min(win.h, rect.bottom)
  const hx = Math.max(0, cLeft  - PAD)
  const hy = Math.max(0, cTop   - PAD)
  const hw = Math.min(win.w - hx, cRight  - cLeft + PAD * 2)
  const hh = Math.min(win.h - hy, cBottom - cTop  + PAD * 2)

  // Compute tooltip position using real measured height
  let tx: number
  let ty: number

  switch (step.position) {
    case 'top':
      tx = hx + hw / 2 - TOOLTIP_W / 2
      ty = hy - GAP - tooltipH
      // Flip down if goes off top edge
      if (ty < 16) ty = hy + hh + GAP
      break
    case 'right':
      tx = hx + hw + GAP
      ty = hy + hh / 2 - tooltipH / 2
      break
    case 'left':
      tx = hx - GAP - TOOLTIP_W
      ty = hy + hh / 2 - tooltipH / 2
      break
    default: // bottom
      tx = hx + hw / 2 - TOOLTIP_W / 2
      ty = hy + hh + GAP
      // Flip up if goes off bottom edge
      if (ty + tooltipH > win.h - 16) ty = hy - GAP - tooltipH
  }

  tx = Math.max(16, Math.min(tx, win.w - TOOLTIP_W - 16))
  ty = Math.max(16, Math.min(ty, win.h - tooltipH - 16))

  return createPortal(
    <div className="fixed inset-0 z-[60]" style={{ touchAction: 'none' }} onClick={onClose}>
      {/* Darkening overlay with hole */}
      <svg
        className="pointer-events-none absolute inset-0"
        width={win.w}
        height={win.h}
        aria-hidden
      >
        <defs>
          <mask id="tour-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect x={hx} y={hy} width={hw} height={hh} rx="4" fill="black" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.70)" mask="url(#tour-mask)" />
      </svg>

      {/* Accent border around target */}
      <div
        className="pointer-events-none absolute border-2 border-accent"
        style={{ left: hx, top: hy, width: hw, height: hh, borderRadius: 4 }}
      />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="absolute flex flex-col gap-3 border border-line bg-paper p-4 shadow-lg"
        style={{ left: tx, top: ty, width: TOOLTIP_W }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="font-mono text-[9px] uppercase tracking-widest text-ink/40">
            {stepIndex + 1} / {totalSteps}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-ink/30 transition-colors hover:text-ink"
            aria-label="Turu kapat"
          >
            <X size={12} />
          </button>
        </div>

        {/* Step dots */}
        <div className="flex gap-1">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <span
              key={i}
              className={`h-1 flex-1 ${i === stepIndex ? 'bg-accent' : 'bg-line'}`}
            />
          ))}
        </div>

        {/* Content */}
        <div>
          <p className="font-display text-base font-light text-ink">{step.title}</p>
          <p className="mt-1.5 font-mono text-[10px] leading-relaxed text-ink/60">{step.body}</p>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-2 border-t border-line pt-3">
          {!isFirst && (
            <button
              type="button"
              onClick={onPrev}
              className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest text-ink/40 transition-colors hover:text-ink"
            >
              <ChevronLeft size={10} /> Geri
            </button>
          )}
          <div className="flex-1" />
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-[9px] uppercase tracking-widest text-ink/30 transition-colors hover:text-ink"
          >
            Atla
          </button>
          {isLast ? (
            <button
              type="button"
              onClick={onClose}
              className="bg-accent px-3 py-1.5 font-mono text-[9px] uppercase tracking-widest text-paper transition-colors hover:bg-ink"
            >
              Tamamla
            </button>
          ) : (
            <button
              type="button"
              onClick={onNext}
              className="flex items-center gap-1 bg-ink px-3 py-1.5 font-mono text-[9px] uppercase tracking-widest text-paper transition-colors hover:bg-accent"
            >
              İleri <ChevronRight size={10} />
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
