import { useState, useCallback, useRef } from 'react'
import { streamAI } from '@/lib/ai-client'
import { useAIStore, PROVIDERS } from '@/store/ai-store'
import { CV_TRANSLATOR_SYSTEM, buildTranslatePrompt } from '@/lib/prompts'
import { buildTranslationPayload, applyTranslation } from '@/lib/cv-translate'
import type { CVDocument } from '@/types/cv'

export type TranslatePhase = 'idle' | 'translating' | 'done' | 'error'

export interface UseCVTranslateReturn {
  phase: TranslatePhase
  error: string | null
  progress: string
  translate: (cv: CVDocument) => Promise<CVDocument | null>
  reset: () => void
}

export function useCVTranslate(): UseCVTranslateReturn {
  const { apiKey, provider, model } = useAIStore()
  const baseUrl = PROVIDERS[provider].baseUrl

  const [phase, setPhase] = useState<TranslatePhase>('idle')
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState('')
  const abortRef = useRef<AbortController | null>(null)

  const reset = useCallback(() => {
    abortRef.current?.abort()
    setPhase('idle')
    setError(null)
    setProgress('')
  }, [])

  const translate = useCallback(
    async (cv: CVDocument): Promise<CVDocument | null> => {
      if (!apiKey) {
        setError('AI özelliği için API anahtarı gerekli.')
        setPhase('error')
        return null
      }

      setPhase('translating')
      setError(null)
      setProgress('')

      const controller = new AbortController()
      abortRef.current = controller

      const payload = JSON.stringify(buildTranslationPayload(cv))
      let fullResponse = ''

      return new Promise<CVDocument | null>((resolve) => {
        streamAI({
          provider,
          baseUrl,
          apiKey,
          model,
          system: CV_TRANSLATOR_SYSTEM,
          prompt: buildTranslatePrompt(payload),
          maxTokens: 5000,
          signal: controller.signal,
          onChunk: (chunk) => {
            fullResponse += chunk
            setProgress(`${Math.round(fullResponse.length / 4)} token`)
          },
          onDone: () => {
            const translated = applyTranslation(cv, fullResponse)
            if (!translated) {
              setError('Çeviri yanıtı ayrıştırılamadı. Lütfen tekrar deneyin.')
              setPhase('error')
              resolve(null)
              return
            }
            setPhase('done')
            setProgress('')
            resolve(translated)
          },
          onError: (err) => {
            const msg =
              err.type === 'auth'       ? 'API anahtarı geçersiz.' :
              err.type === 'rate_limit' ? 'Hız limiti aşıldı. 30 saniye bekleyip tekrar dene.' :
              err.message
            setError(msg)
            setPhase('error')
            resolve(null)
          },
        })
      })
    },
    [apiKey, provider, baseUrl, model],
  )

  return { phase, error, progress, translate, reset }
}
