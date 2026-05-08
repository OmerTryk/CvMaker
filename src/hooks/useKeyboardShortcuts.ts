/**
 * useKeyboardShortcuts — global keyboard shortcut handler.
 *
 * Skips events when the user is typing in an input/textarea or
 * a contenteditable element so shortcuts don't interfere with form fields.
 *
 * Use modifier `meta: true` to match Cmd (Mac) OR Ctrl (Win/Linux).
 */

import { useEffect } from 'react'

export interface Shortcut {
  key: string
  /** Cmd on Mac, Ctrl elsewhere */
  meta?: boolean
  shift?: boolean
  alt?: boolean
  /** If true, intercepts even when typing in inputs */
  global?: boolean
  handler: (event: KeyboardEvent) => void
}

const isEditable = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false
  return (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.tagName === 'SELECT' ||
    target.isContentEditable
  )
}

export function useKeyboardShortcuts(shortcuts: Shortcut[], enabled = true) {
  useEffect(() => {
    if (!enabled) return

    const onKeyDown = (e: KeyboardEvent) => {
      const editing = isEditable(e.target)

      for (const sc of shortcuts) {
        if (editing && !sc.global) continue

        const keyMatch = e.key.toLowerCase() === sc.key.toLowerCase()
        if (!keyMatch) continue

        const metaMatch = !!sc.meta === (e.metaKey || e.ctrlKey)
        const shiftMatch = !!sc.shift === e.shiftKey
        const altMatch = !!sc.alt === e.altKey

        if (metaMatch && shiftMatch && altMatch) {
          sc.handler(e)
          return
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [shortcuts, enabled])
}

/**
 * Returns "⌘" on Mac, "Ctrl" elsewhere (for display).
 */
export const META_LABEL =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
    ? '⌘'
    : 'Ctrl'
