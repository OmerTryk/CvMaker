import { useState, useEffect } from 'react'
import { X, Sparkles, FileText, RefreshCw, Lightbulb, ScanSearch } from 'lucide-react'
import { useAIStore } from '@/store'
import { ApiKeySetup } from './ApiKeySetup'
import { SummaryAI } from './SummaryAI'
import { ExperienceAI } from './ExperienceAI'
import { AchievementAI } from './AchievementAI'
import { AnalysisAI } from './AnalysisAI'
import { cn } from '@/lib/utils'

type FeatureKey = 'summary' | 'experience' | 'achievement' | 'analysis'

interface Feature {
  key: FeatureKey
  icon: React.ReactNode
  title: string
  description: string
  Component: React.ComponentType
}

const FEATURES: Feature[] = [
  {
    key: 'summary',
    icon: <FileText size={16} strokeWidth={1.5} />,
    title: 'Profil Özeti Yaz',
    description: 'Deneyimlere bakarak güçlü bir özet üretir',
    Component: SummaryAI,
  },
  {
    key: 'experience',
    icon: <RefreshCw size={16} strokeWidth={1.5} />,
    title: 'Deneyimi Yeniden Yaz',
    description: 'Açıklamayı etki odaklı dille güçlendirir',
    Component: ExperienceAI,
  },
  {
    key: 'achievement',
    icon: <Lightbulb size={16} strokeWidth={1.5} />,
    title: 'Achievement Öner',
    description: 'Pozisyona göre bullet madde önerir',
    Component: AchievementAI,
  },
  {
    key: 'analysis',
    icon: <ScanSearch size={16} strokeWidth={1.5} />,
    title: 'CV\'mi Analiz Et',
    description: 'Güçlü/zayıf yön ve etki skoru verir',
    Component: AnalysisAI,
  },
]

export function AIPanel() {
  const { panelOpen, apiKey, closePanel } = useAIStore()
  const [activeFeature, setActiveFeature] = useState<FeatureKey | null>(null)

  // Close on Escape
  useEffect(() => {
    if (!panelOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePanel()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [panelOpen, closePanel])

  // Reset active feature when panel closes
  useEffect(() => {
    if (!panelOpen) setActiveFeature(null)
  }, [panelOpen])

  const active = FEATURES.find((f) => f.key === activeFeature)

  return (
    <>
      {/* Backdrop */}
      {panelOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-[2px]"
          onClick={closePanel}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <aside
        className={cn(
          'fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-[500px] flex-col border-l border-line bg-paper shadow-2xl transition-transform duration-300 ease-out',
          panelOpen ? 'translate-x-0' : 'translate-x-full',
        )}
        aria-label="AI Asistan paneli"
      >
        {/* Header */}
        <header className="flex items-center justify-between border-b border-line px-6 py-5">
          <div className="flex items-center gap-3">
            <Sparkles size={18} className="text-accent" strokeWidth={1.5} />
            <div>
              <h2 className="font-display text-xl font-light text-ink">
                AI Asistan
              </h2>
              <p className="font-mono text-[10px] uppercase tracking-widest text-ink/40">
                Gemini & Llama ile ücretsiz
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closePanel}
            aria-label="Kapat"
            className="flex h-8 w-8 items-center justify-center text-ink/40 transition-colors hover:bg-paper-warm hover:text-ink"
          >
            <X size={16} />
          </button>
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="flex flex-col gap-0 divide-y divide-line">
            {/* API Key */}
            <div className="p-5">
              <ApiKeySetup />
            </div>

            {/* Feature list / active feature */}
            {!apiKey ? (
              <div className="p-5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-ink/40">
                  Özellikleri kullanmak için API anahtarı gerekli
                </p>
              </div>
            ) : activeFeature && active ? (
              <div className="p-5">
                {/* Back button */}
                <button
                  type="button"
                  onClick={() => setActiveFeature(null)}
                  className="mb-5 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-ink/50 transition-colors hover:text-accent"
                >
                  ← Özellikler
                </button>

                <div className="flex items-center gap-3 mb-4">
                  <span className="text-accent">{active.icon}</span>
                  <h3 className="font-display text-xl font-light text-ink">
                    {active.title}
                  </h3>
                </div>

                <active.Component />
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-line">
                {FEATURES.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setActiveFeature(f.key)}
                    className="group flex items-start gap-4 px-5 py-5 text-left transition-colors hover:bg-paper-warm"
                  >
                    <span className="mt-0.5 shrink-0 text-accent transition-transform duration-200 group-hover:-translate-y-0.5">
                      {f.icon}
                    </span>
                    <div>
                      <p className="font-display text-base text-ink">{f.title}</p>
                      <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-ink/50">
                        {f.description}
                      </p>
                    </div>
                    <span className="ml-auto mt-1 text-ink/20 group-hover:text-ink/50">
                      →
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-line px-5 py-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink/30">
            Yanıtlar Gemini & Llama ile üretilir · Her zaman gözden geçir
          </p>
        </footer>
      </aside>
    </>
  )
}
