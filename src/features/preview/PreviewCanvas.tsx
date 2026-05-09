/**
 * PreviewCanvas — A4 preview with horizontal page-slide animation.
 *
 * Next page: current slides LEFT → new page slides in from RIGHT
 * Prev page: current slides RIGHT → new page slides in from LEFT
 * Top breathing room: content starts slightly below viewport top edge.
 */

import { type ReactNode, useState, useEffect, useRef } from 'react'
import { A4 } from '@/templates/shared/tokens'
import { useElementWidth } from '@/hooks/useElementWidth'
import { useSmartPageBreaks } from '@/hooks/useSmartPageBreaks'
import { Paginator } from '@/components/ui'

interface PreviewCanvasProps {
  children: ReactNode
  maxScale?: number
}

export function PreviewCanvas({ children, maxScale = 1 }: PreviewCanvasProps) {
  const [containerRef, containerWidth] = useElementWidth<HTMLDivElement>()
  const [currentPage, setCurrentPage] = useState(0)
  const [exitPage,    setExitPage]    = useState<number | null>(null)
  const [dir,         setDir]         = useState<'fwd' | 'bwd'>('fwd')
  const [animating,   setAnimating]   = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scale = containerWidth > 0 ? Math.min(containerWidth / A4.widthPX, maxScale) : 0
  const { contentRef, pageOffsets, pageCount } = useSmartPageBreaks(scale)

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

  const contentTop = (page: number) => {
    const offset = pageOffsets[page] ?? 0
    return -offset * scale
  }

  const viewH = A4.heightPX * scale

  return (
    <div ref={containerRef} className="w-full">
      <style>{`
        @keyframes pcSlideInR  { from{transform:translateX(100%)} to{transform:translateX(0)} }
        @keyframes pcSlideOutL { from{transform:translateX(0)} to{transform:translateX(-100%)} }
        @keyframes pcSlideInL  { from{transform:translateX(-100%)} to{transform:translateX(0)} }
        @keyframes pcSlideOutR { from{transform:translateX(0)} to{transform:translateX(100%)} }
      `}</style>

      {scale > 0 && (
        <div className="flex flex-col gap-2">
          {/* A4 clip viewport */}
          <div
            style={{
              width: '100%',
              height: `${viewH}px`,
              overflow: 'hidden',
              position: 'relative',
              background: 'white',
              boxShadow: '0 1px 3px rgba(0,0,0,.07), 0 4px 20px rgba(0,0,0,.07)',
            }}
          >
            {/* Hidden measurement div (always at top, never animated) */}
            <div
              ref={contentRef}
              style={{
                position: 'absolute', top: 0, left: 0,
                width: `${A4.widthPX}px`, minHeight: `${A4.heightPX}px`,
                transform: `scale(${scale})`, transformOrigin: 'top left',
                visibility: 'hidden', pointerEvents: 'none', zIndex: 0,
              }}
            >
              {children}
            </div>

            {/* Exiting page */}
            {exitPage !== null && (
              <div
                key={`exit-${exitPage}`}
                style={{
                  position: 'absolute', inset: 0, zIndex: 1,
                  animation: `${dir === 'fwd' ? 'pcSlideOutL' : 'pcSlideOutR'} .32s cubic-bezier(.4,0,1,1) forwards`,
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: `${contentTop(exitPage)}px`, left: 0,
                  width: `${A4.widthPX}px`, minHeight: `${A4.heightPX}px`,
                  transform: `scale(${scale})`, transformOrigin: 'top left',
                }}>
                  {children}
                </div>
              </div>
            )}

            {/* Current / entering page */}
            <div
              key={`cur-${currentPage}`}
              style={{
                position: 'absolute', inset: 0, zIndex: 2,
                animation: animating
                  ? `${dir === 'fwd' ? 'pcSlideInR' : 'pcSlideInL'} .32s cubic-bezier(0,0,.2,1) forwards`
                  : 'none',
              }}
            >
              <div style={{
                position: 'absolute',
                top: `${contentTop(currentPage)}px`, left: 0,
                width: `${A4.widthPX}px`, minHeight: `${A4.heightPX}px`,
                transform: `scale(${scale})`, transformOrigin: 'top left',
              }}>
                {children}
              </div>
            </div>

            {/* Bottom gradient only — no top gradient (white bg creates top space) */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              height: `${20 * scale}px`,
              background: 'linear-gradient(to top, rgba(255,255,255,.9) 20%, transparent 100%)',
              zIndex: 10, pointerEvents: 'none',
            }} />
          </div>

          {pageCount > 1 && (
            <div className="flex items-center justify-center">
              <Paginator
                current={currentPage} total={pageCount}
                onPrev={() => navigate(-1)} onNext={() => navigate(1)}
                size="sm"
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
