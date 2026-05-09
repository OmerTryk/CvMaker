/**
 * useSmartPageBreaks — measures rendered .cv-item elements to find
 * natural page break positions that avoid splitting items mid-content.
 *
 * Returns an array of offsets (in natural/unscaled pixels) where each
 * new page starts. Page 0 always starts at 0.
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { A4 } from '@/templates/shared/tokens'

/**
 * Finds the best page break positions for a rendered template.
 *
 * @param container  The element containing the rendered CV template
 * @param scale      CSS transform scale applied to the container (1 = no scale)
 */
function computeSmartBreaks(container: HTMLElement, scale: number): number[] {
  const totalH = container.scrollHeight // natural height (unaffected by CSS transform)
  if (totalH <= A4.heightPX) return [0]

  const containerRect = container.getBoundingClientRect()
  const breaks: number[] = [0]
  let boundary = A4.heightPX

  while (boundary < totalH) {
    // Query elements we don't want split across pages
    const noSplitEls = Array.from(
      container.querySelectorAll('.cv-item, h2, h3, header'),
    )

    let breakAt = boundary // default: mechanical break

    for (const el of noSplitEls) {
      const rect = el.getBoundingClientRect()
      // Convert from screen coords to natural coords
      const elTop = (rect.top - containerRect.top) / scale
      const elBottom = (rect.bottom - containerRect.top) / scale

      // Skip tiny elements or ones way off-screen (measurement artefacts)
      if (elBottom - elTop < 4) continue

      // If this element straddles our boundary, break just before it
      if (
        elTop < boundary &&
        elBottom > boundary &&
        elTop > breaks[breaks.length - 1] + 24 // don't break so close to prev break
      ) {
        breakAt = elTop - 6 // small gap above the element
        break
      }
    }

    breaks.push(breakAt)
    boundary = breakAt + A4.heightPX
  }

  return breaks
}

interface UseSmartPageBreaksReturn {
  /** Ref to attach to the template content element */
  contentRef: React.RefObject<HTMLDivElement>
  /** Natural-pixel offset for the start of each page */
  pageOffsets: number[]
  /** Total number of pages */
  pageCount: number
  /** Total content height in natural pixels */
  contentHeight: number
}

export function useSmartPageBreaks(scale: number): UseSmartPageBreaksReturn {
  const contentRef = useRef<HTMLDivElement>(null)
  const [pageOffsets, setPageOffsets] = useState<number[]>([0])
  const [contentHeight, setContentHeight] = useState<number>(A4.heightPX)

  const measure = useCallback(() => {
    const el = contentRef.current
    if (!el || scale <= 0) return
    const h = el.scrollHeight
    setContentHeight(h)
    setPageOffsets(computeSmartBreaks(el, scale))
  }, [scale])

  useEffect(() => {
    const el = contentRef.current
    if (!el) return
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    measure()
    return () => observer.disconnect()
  }, [measure])

  return {
    contentRef,
    pageOffsets,
    pageCount: pageOffsets.length,
    contentHeight,
  }
}
