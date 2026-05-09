import { useState, useEffect } from 'react'

const STORAGE_KEY = 'ctrlcv.dark'

function getInitial(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== null) return stored === 'true'
  } catch {}
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

export function useDarkMode() {
  const [dark, setDark] = useState<boolean>(getInitial)

  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    try {
      localStorage.setItem(STORAGE_KEY, String(dark))
    } catch {}
  }, [dark])

  const toggle = () => setDark((d) => !d)

  return { dark, toggle }
}
