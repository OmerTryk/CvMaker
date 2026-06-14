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
import { useStorageErrorStore } from '@/utils/storage'

export function Layout() {
  const [helpOpen, setHelpOpen] = useState(false)
  const closeHelp = useCallback(() => setHelpOpen(false), [])
  const { quotaExceeded, dismiss } = useStorageErrorStore()
  const openAIPanel = useAIStore((s) => s.openPanel)
  const { dark, toggle: toggleDark } = useDarkMode()

  // ── CV List: keep the list store in sync with the active CV ──
  // The active CV lives in cv-store; mirroring it on every change registers
  // new CVs, refreshes snapshots, and keeps activeId correct — so the two
  // stores never drift apart (which previously caused lost/un-editable CVs).
  const cv           = useCVStore((s) => s.cv)
  const mirrorActive = useCVListStore((s) => s.mirrorActive)
  const pruneOrphans = useCVListStore((s) => s.pruneOrphans)

  useEffect(() => { mirrorActive(cv) }, [cv, mirrorActive])
  useEffect(() => { pruneOrphans() }, [pruneOrphans])  // clean up legacy orphans once

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
      {quotaExceeded && (
        <div className="sticky top-0 z-[100] flex items-center justify-between gap-4 bg-accent px-5 py-2.5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-paper">
            Tarayıcı depolama alanı dolu — son değişiklikler kaydedilemedi. Eski CV'leri silerek yer aç.
          </p>
          <button
            type="button"
            onClick={dismiss}
            className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-paper/70 hover:text-paper"
          >
            Kapat
          </button>
        </div>
      )}
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
