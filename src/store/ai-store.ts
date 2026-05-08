/**
 * AI store — manages the AI provider config and panel state.
 *
 * Defaults to Google Gemini 2.5 Flash-Lite (free tier via AI Studio).
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

export type AIProvider = 'gemini' | 'groq'

export interface ProviderConfig {
  label: string
  baseUrl: string
  keyPlaceholder: string
  keyPrefix: string
  consoleUrl: string
  consoleName: string
  freeNote: string
  models: { value: string; label: string; paid?: boolean }[]
}

export const PROVIDERS: Record<AIProvider, ProviderConfig> = {
  gemini: {
    label: 'Google Gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    keyPlaceholder: 'AIzaSy...',
    keyPrefix: 'AIzaSy',
    consoleUrl: 'https://aistudio.google.com/apikey',
    consoleName: 'Google AI Studio',
    freeNote: 'Ücretsiz · Kredi kartı gerekmez · 1000 istek/gün',
    models: [
      { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash-Lite — Ücretsiz ✓ (En hızlı)' },
      { value: 'gemini-2.5-flash',      label: 'Gemini 2.5 Flash — Ücretsiz ✓ (Güçlü)' },
      { value: 'gemini-2.5-pro',        label: 'Gemini 2.5 Pro — Ücretsiz ✓ (100/gün limit)' },
    ],
  },
  groq: {
    label: 'Groq (Llama)',
    baseUrl: 'https://api.groq.com/openai/v1',
    keyPlaceholder: 'gsk_...',
    keyPrefix: 'gsk_',
    consoleUrl: 'https://console.groq.com/keys',
    consoleName: 'Groq Console',
    freeNote: 'Ücretsiz · Llama 3 · Çok hızlı',
    models: [
      { value: 'llama-3.1-70b-versatile', label: 'Llama 3.1 70B — Güçlü' },
      { value: 'llama-3.1-8b-instant',    label: 'Llama 3.1 8B — Hızlı' },
      { value: 'mixtral-8x7b-32768',      label: 'Mixtral 8x7B' },
    ],
  },
}

export interface AIStore {
  apiKey: string
  provider: AIProvider
  model: string
  panelOpen: boolean

  setApiKey: (key: string) => void
  setProvider: (provider: AIProvider) => void
  setModel: (model: string) => void
  openPanel: () => void
  closePanel: () => void
}

export const useAIStore = create<AIStore>()(
  persist(
    (set) => ({
      apiKey: '',
      provider: 'gemini',
      model: 'gemini-2.5-flash-lite', // Free tier default
      panelOpen: false,

      setApiKey: (apiKey) => set({ apiKey }),
      setProvider: (provider) =>
        set({ provider, model: PROVIDERS[provider].models[0].value }),
      setModel: (model) => set({ model }),
      openPanel: () => set({ panelOpen: true }),
      closePanel: () => set({ panelOpen: false }),
    }),
    {
      name: 'cvmaker.ai.v3', // bumped version to reset stale model selection
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ apiKey: s.apiKey, provider: s.provider, model: s.model }),
    },
  ),
)
