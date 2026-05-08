import { useState, useCallback } from 'react'
import { Outlet, ScrollRestoration } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { HelpOverlay } from '@/features/help'
import { AIPanel } from '@/features/ai'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useAIStore } from '@/store'

export function Layout() {
  const [helpOpen, setHelpOpen] = useState(false)
  const closeHelp = useCallback(() => setHelpOpen(false), [])
  const openAIPanel = useAIStore((s) => s.openPanel)

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
      <Header onHelpOpen={() => setHelpOpen(true)} onAIOpen={openAIPanel} />

      <main className="relative z-10 flex-1">
        <Outlet />
      </main>

      <Footer />

      <HelpOverlay open={helpOpen} onClose={closeHelp} />
      <AIPanel />
      <ScrollRestoration />
    </div>
  )
}
