import { useState, useCallback, useRef } from 'react'
import { extractTextFromPDF } from './pdf-extract'
import { buildCVExtractPrompt, CV_EXTRACTOR_SYSTEM } from '@/lib/prompts'
import { parseAndMapExtracted } from '@/lib/cv-extract'
import { streamAI } from '@/lib/ai-client'
import { useAIStore, PROVIDERS } from '@/store/ai-store'
import type { CVDocument } from '@/types/cv'

export type ImportPhase = 'idle' | 'extracting' | 'parsing' | 'preview' | 'error'

export interface CVImportResult {
  cv: CVDocument
  fileName: string
}

export interface UseCVImportReturn {
  phase: ImportPhase
  error: string | null
  progress: string
  result: CVImportResult | null
  importFromPDF: (file: File) => Promise<void>
  cancel: () => void
  reset: () => void
}

export function useCVImport(): UseCVImportReturn {
  const { apiKey, provider, model } = useAIStore()
  const baseUrl = PROVIDERS[provider].baseUrl

  const [phase, setPhase] = useState<ImportPhase>('idle')
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState('')
  const [result, setResult] = useState<CVImportResult | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const cancel = useCallback(() => {
    abortRef.current?.abort()
    setPhase('idle')
    setError(null)
    setResult(null)
    setProgress('')
  }, [])

  const reset = useCallback(() => {
    cancel()
  }, [cancel])

  const importFromPDF = useCallback(
    async (file: File) => {
      if (!apiKey) {
        setError('AI özelliği için API anahtarı gerekli.')
        setPhase('error')
        return
      }

      setPhase('extracting')
      setError(null)
      setResult(null)
      setProgress('')

      let rawText: string
      try {
        rawText = await extractTextFromPDF(file)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'PDF okunamadı.')
        setPhase('error')
        return
      }

      setPhase('parsing')

      const controller = new AbortController()
      abortRef.current = controller

      let fullResponse = ''

      await streamAI({
        provider,
        baseUrl,
        apiKey,
        model,
        system: CV_EXTRACTOR_SYSTEM,
        prompt: buildCVExtractPrompt(rawText),
        maxTokens: 4000,
        signal: controller.signal,
        onChunk: (chunk) => {
          fullResponse += chunk
          setProgress(`${Math.round(fullResponse.length / 4)} token`)
        },
        onDone: () => {
          const cv = parseAndMapExtracted(fullResponse)
          if (!cv) {
            setError('AI yanıtı ayrıştırılamadı. Lütfen tekrar deneyin.')
            setPhase('error')
            return
          }
          setResult({ cv, fileName: file.name })
          setPhase('preview')
          setProgress('')
        },
        onError: (err) => {
          const msg =
            err.type === 'auth'       ? 'API anahtarı geçersiz.' :
            err.type === 'rate_limit' ? 'Hız limiti aşıldı. 30 saniye bekleyip tekrar dene.' :
            err.message
          setError(msg)
          setPhase('error')
        },
      })
    },
    [apiKey, provider, baseUrl, model],
  )

  return { phase, error, progress, result, importFromPDF, cancel, reset }
}
