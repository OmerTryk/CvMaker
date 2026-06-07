import { useState, useCallback } from 'react'
import type { TourStep } from './tourSteps'

export function useTour(steps: TourStep[]) {
  const [active, setActive] = useState(false)
  const [index, setIndex] = useState(0)

  const start = useCallback(() => { setIndex(0); setActive(true) }, [])
  const stop  = useCallback(() => setActive(false), [])
  const next  = useCallback(() => setIndex((i) => Math.min(i + 1, steps.length - 1)), [steps.length])
  const prev  = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), [])

  return {
    active,
    stepIndex: index,
    totalSteps: steps.length,
    current: active ? steps[index] : null,
    isFirst: index === 0,
    isLast: index === steps.length - 1,
    start,
    stop,
    next,
    prev,
  }
}
