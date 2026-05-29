import { useState, useCallback, useEffect } from 'react'
import { Outlet, ScrollRestoration } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { HelpOverlay } from '@/features/help'
import { AIPanel } from '@/features/ai'
import { FloatingChat } from '@/features/jobs/FloatingChat'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useAIStore } from '@/store'
import { useDarkMode } from '@/hooks/useDarkMode'
import { useCVListStore } from '@/store/cv-list-store'
import { useCVStore } from '@/store'

export function Layout() {
  const [helpOpen, setHelpOpen] = useState(false)
  const closeHelp = useCallback(() => setHelpOpen(false), [])
  const openAIPanel = useAIStore((s) => s.openPanel)
  const { dark, toggle: toggleDark } = useDarkMode()

  // ── CV List: migrate existing single CV on first launch ──
  const cv         = useCVStore((s) => s.cv)
  const initFromCV = useCVListStore((s) => s.initFromCV)
  const syncMeta   = useCVListStore((s) => s.syncMeta)

  useEffect(() => { initFromCV(cv) }, [])          // migration: once on mount
  useEffect(() => { syncMeta(cv) }, [cv.updatedAt, cv.title, cv.settings.template, cv.settings.colorTheme])

  useKeyboardShortcuts([
    {
      key: '/',
      meta: true,
      global: false,
      handler: (e) => {
        e.preventDefault()
        setHelpOpen((v) => !v)
      },
    },
  ])

  return (
    <div className="relative flex min-h-screen flex-col">
      <Header
        onHelpOpen={() => setHelpOpen(true)}
        onAIOpen={openAIPanel}
        dark={dark}
        onToggleDark={toggleDark}
      />

      <main className="relative z-10 flex-1">
        <Outlet />
      </main>

      <Footer />

      <HelpOverlay open={helpOpen} onClose={closeHelp} />
      <AIPanel />
      <FloatingChat />
      <ScrollRestoration />
    </div>
  )
}
