import { useState, useCallback, useRef } from 'react'
import { extractTextFromPDF } from './pdf-extract'
import { extractTextFromDOCX } from './docx-extract'
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
  importFile: (file: File) => Promise<void>
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

  const importFile = useCallback(
    async (file: File) => {
      if (!apiKey) {
        setError('AI özelliği için API anahtarı gerekli.')
        setPhase('error')
        return
      }

      const name = file.name.toLowerCase()
      const isPDF = name.endsWith('.pdf')
      const isDOCX = name.endsWith('.docx')
      if (!isPDF && !isDOCX) {
        setError('Desteklenmeyen dosya türü. PDF veya Word (.docx) dosyası seç.')
        setPhase('error')
        return
      }

      setPhase('extracting')
      setError(null)
      setResult(null)
      setProgress('')

      let rawText: string
      try {
        rawText = isPDF
          ? await extractTextFromPDF(file)
          : await extractTextFromDOCX(file)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Dosya okunamadı.')
        setPhase('error')
        return
      }

      setPhase('parsing')
      setProgress('Yapı analiz ediliyor...')

      const controller = new AbortController()
      abortRef.current = controller

      let fullResponse = ''

      try {
        await streamAI({
          provider,
          baseUrl,
          apiKey,
          model,
          system: CV_EXTRACTOR_SYSTEM,
          prompt: buildCVExtractPrompt(rawText),
          maxTokens: 8000,
          signal: controller.signal,
          onChunk: (chunk) => {
            fullResponse += chunk
            if (fullResponse.length > 600) setProgress('Alanlar eşleştiriliyor...')
          },
          onDone: () => {
            const cleaned = fullResponse.replace(/```json|```/g, '').trim()

            if (cleaned.length < 10) {
              setError('AI boş yanıt döndürdü. Modeli değiştirip tekrar dene.')
              setPhase('error')
              return
            }

            if (!cleaned.includes('{')) {
              setError('AI beklenen JSON formatında yanıt vermedi. Tekrar dene.')
              setPhase('error')
              return
            }

            // '{' var ama '}' yok → yanıt token limitinde kesilmiş
            if (!cleaned.includes('}')) {
              setError(
                'AI yanıtı yarıda kesildi — büyük ihtimalle token limitine ulaşıldı. ' +
                'Daha az sayfalı bir PDF dene veya AI panelinden "Gemini 2.5 Flash" modeline geç.',
              )
              setPhase('error')
              return
            }

            const cv = parseAndMapExtracted(fullResponse)
            if (!cv) {
              setError(
                'CV bilgileri çıkarılamadı. PDF\'in net metin içerip içermediğini kontrol et, sonra tekrar dene.',
              )
              setPhase('error')
              return
            }

            setResult({ cv, fileName: file.name })
            setPhase('preview')
            setProgress('')
          },
          onError: (err) => {
            const msg = err.type === 'auth'
              ? 'API anahtarı geçersiz veya yetkisiz. AI panelinden anahtarını kontrol et.'
              : err.message
            setError(msg)
            setPhase('error')
          },
        })
      } catch (err) {
        if (!controller.signal.aborted) {
          setError('Beklenmedik bir hata oluştu. Sayfayı yenileyip tekrar dene.')
          setPhase('error')
        }
      }
    },
    [apiKey, provider, baseUrl, model],
  )

  return { phase, error, progress, result, importFile, cancel, reset }
}
