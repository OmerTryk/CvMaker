import { useState, useCallback, useRef } from 'react'
import { streamAI, type AIError } from '@/lib/ai-client'
import { useAIStore, PROVIDERS } from '@/store/ai-store'
import { CV_WRITER_SYSTEM } from '@/lib/prompts'

interface UseAIStreamReturn {
  result: string
  loading: boolean
  error: AIError | null
  run: (prompt: string) => Promise<void>
  cancel: () => void
  reset: () => void
}

export function useAIStream(): UseAIStreamReturn {
  const { apiKey, provider, model } = useAIStore()
  const baseUrl = PROVIDERS[provider].baseUrl

  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<AIError | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const cancel = useCallback(() => {
    abortRef.current?.abort()
    setLoading(false)
  }, [])

  const reset = useCallback(() => {
    cancel()
    setResult('')
    setError(null)
  }, [cancel])

  const run = useCallback(
    async (prompt: string) => {
      reset()
      setLoading(true)

      const controller = new AbortController()
      abortRef.current = controller

      await streamAI({
        provider,   // ← Gemini native vs. OpenAI-compat seçimi buradan
        baseUrl,
        apiKey,
        model,
        system: CV_WRITER_SYSTEM,
        prompt,
        maxTokens: 700,
        signal: controller.signal,
        onChunk: (chunk) => setResult((prev) => prev + chunk),
        onDone: () => setLoading(false),
        onError: (err) => {
          setError(err)
          setLoading(false)
        },
      })
    },
    [provider, baseUrl, apiKey, model, reset],
  )

  return { result, loading, error, run, cancel, reset }
}
