/**
 * AI store — manages the AI provider config and panel state.
 *
 * Only provider: Google Gemini (free tier via AI Studio).
 *
 * Model status as of May 2026:
 *   ✗ gemini-1.5-* → Shut down, returns 404
 *   ✗ gemini-2.0-flash → Deprecated, free limit: 0
 *   ✓ gemini-2.5-flash-lite → Free, 15 RPM, 1000 RPD  ← USE THIS
 *   ✓ gemini-2.5-flash → Free, more capable
 *   ✓ gemini-2.5-pro → Free but limited (5 RPM, 100 RPD)
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { safeStorage } from '@/utils/storage'

export type AIProvider = 'gemini'

export interface ProviderConfig {
  label: string
  baseUrl: string
  keyPlaceholder: string

  consoleUrl: string
  consoleName: string
  freeNote: string
  models: { value: string; label: string; paid?: boolean }[]
}

export const GEMINI_CONFIG: ProviderConfig = {
  label: 'Google Gemini',
  baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
  keyPlaceholder: 'AIza... veya AQ....',
  consoleUrl: 'https://aistudio.google.com/apikey',
  consoleName: 'Google AI Studio',
  freeNote: 'Ücretsiz · Kredi kartı gerekmez · 1000 istek/gün',
  models: [
    { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash-Lite — Ücretsiz (En hızlı)' },
    { value: 'gemini-2.5-flash',      label: 'Gemini 2.5 Flash — Ücretsiz (Güçlü)' },
    { value: 'gemini-2.5-pro',        label: 'Gemini 2.5 Pro — Ücretsiz (100/gün limit)' },
  ],
}

/** @deprecated Groq kaldırıldı. Geriye dönük uyumluluk için bırakıldı. */
export const PROVIDERS = { gemini: GEMINI_CONFIG } as const

export interface AIStore {
  apiKey: string
  provider: AIProvider
  model: string
  panelOpen: boolean

  setApiKey: (key: string) => void
  setModel: (model: string) => void
  openPanel: () => void
  closePanel: () => void
}

export const useAIStore = create<AIStore>()(
  persist(
    (set) => ({
      apiKey: '',
      provider: 'gemini',
      model: 'gemini-2.5-flash-lite',
      panelOpen: false,

      setApiKey: (apiKey) => set({ apiKey }),
      setModel: (model) => set({ model }),
      openPanel: () => set({ panelOpen: true }),
      closePanel: () => set({ panelOpen: false }),
    }),
    {
      name: 'cvmaker.ai.v4', // v4: Groq kaldırıldı, eski 'groq' store'ları sıfırlanır
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({ apiKey: s.apiKey, provider: s.provider, model: s.model }),
    },
  ),
)
