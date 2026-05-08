/**
 * PreviewCanvas — renders an A4-sized template at full resolution,
 * scaled to fit its parent container's width.
 *
 * The inner element keeps its real 794×1123 dimensions (so PDF export
 * in Sprint 4 can capture it 1:1), while CSS transform scales it down
 * for display.
 */

import { type ReactNode } from 'react'
import { A4 } from '@/templates/shared/tokens'
import { useElementWidth } from '@/hooks/useElementWidth'

interface PreviewCanvasProps {
  children: ReactNode
  /** Maximum scale (e.g. 1 = 100%). Default 1. */
  maxScale?: number
  /** Show the page shadow. Default true. */
  showShadow?: boolean
}

export function PreviewCanvas({
  children,
  maxScale = 1,
  showShadow = true,
}: PreviewCanvasProps) {
  const [containerRef, containerWidth] = useElementWidth<HTMLDivElement>()

  // Scale so the page fits within the container width
  const rawScale = containerWidth > 0 ? containerWidth / A4.widthPX : 0
  const scale = Math.min(rawScale, maxScale)

  // Outer wrapper height needs to match scaled height to avoid empty space
  const scaledHeight = A4.heightPX * scale

  return (
    <div ref={containerRef} className="w-full">
      <div
        style={{
          width: '100%',
          height: scale > 0 ? `${scaledHeight}px` : 'auto',
          position: 'relative',
        }}
      >
        {scale > 0 && (
          <div
            id="cv-page"
            style={{
              width: `${A4.widthPX}px`,
              height: `${A4.heightPX}px`,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              background: 'white',
              boxShadow: showShadow
                ? '0 1px 2px rgba(0,0,0,0.05), 0 8px 30px rgba(0,0,0,0.08)'
                : 'none',
              overflow: 'hidden',
            }}
          >
            {children}
          </div>
        )}
      </div>
    </div>
  )
}
