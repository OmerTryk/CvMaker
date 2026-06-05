/**
 * ai-client.ts — Gemini AI streaming client.
 *
 * Uses native streamGenerateContent API with SSE streaming.
 * Supports Google Search grounding for job search features.
 */

import type { AIProvider } from '@/store/ai-store'

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface AIError {
  type: 'auth' | 'rate_limit' | 'network' | 'unknown'
  message: string
}

export interface GroundingSource {
  uri: string
  title: string
}

/** A response text segment and the grounding chunk indices that support it. */
export interface GroundingSupport {
  text: string
  chunkIndices: number[]
}

/** Full grounding snapshot: indexed sources + the supports that map text → source. */
export interface GroundingData {
  sources: GroundingSource[]
  supports: GroundingSupport[]
}

export interface ChatMessage {
  role: 'user' | 'model'
  text: string
}

export interface StreamOptions {
  provider: AIProvider
  /** Gemini base URL — reserved for future provider support. */
  baseUrl?: string
  apiKey: string
  model: string
  system: string
  prompt: string
  maxTokens?: number
  /** Multi-turn history (user/model turns before the current prompt). */
  history?: ChatMessage[]
  /** Gemini only: enable Google Search grounding. */
  useSearch?: boolean
  /** Gemini only: called when grounding metadata is received. */
  onGrounding?: (data: GroundingData) => void
  onChunk: (text: string) => void
  onDone: (fullText: string) => void
  onError: (err: AIError) => void
  signal?: AbortSignal
}

// ─────────────────────────────────────────────────────────────
// Dispatcher
// ─────────────────────────────────────────────────────────────

export async function streamAI(opts: StreamOptions): Promise<void> {
  return streamGemini(opts)
}

// ─────────────────────────────────────────────────────────────
// Gemini — Native API with SSE streaming
// ─────────────────────────────────────────────────────────────

async function streamGemini({
  apiKey,
  model,
  system,
  prompt,
  maxTokens = 700,
  history,
  useSearch,
  onGrounding,
  onChunk,
  onDone,
  onError,
  signal,
}: StreamOptions): Promise<void> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse`

  const contents = [
    ...(history?.map((m) => ({ role: m.role, parts: [{ text: m.text }] })) ?? []),
    { role: 'user', parts: [{ text: prompt }] },
  ]

  const body = JSON.stringify({
    system_instruction: { parts: [{ text: system }] },
    contents,
    generationConfig: { maxOutputTokens: maxTokens },
    ...(useSearch && { tools: [{ google_search: {} }] }),
  })

  const onEvent = onGrounding
    ? (parsed: unknown) => {
        type GeminiCandidate = {
          groundingMetadata?: {
            groundingChunks?: { web?: { uri: string; title?: string } }[]
            groundingSupports?: {
              segment?: { text?: string }
              groundingChunkIndices?: number[]
            }[]
          }
        }
        const meta = (parsed as { candidates?: GeminiCandidate[] })
          ?.candidates?.[0]?.groundingMetadata
        if (!meta) return

        // Keep ALL chunks in order (do not filter) so groundingSupports
        // chunk indices stay aligned with this sources array.
        const sources: GroundingSource[] = (meta.groundingChunks ?? [])
          .map((c) => ({ uri: c.web?.uri ?? '', title: c.web?.title ?? '' }))

        const supports: GroundingSupport[] = (meta.groundingSupports ?? [])
          .filter((s) => s.segment?.text)
          .map((s) => ({
            text: s.segment!.text!,
            chunkIndices: s.groundingChunkIndices ?? [],
          }))

        if (sources.length || supports.length) {
          onGrounding({ sources, supports })
        }
      }
    : undefined

  // Retry delays (ms) for transient errors: 2 s → 4 s
  const RETRY_DELAYS = [2000, 4000]
  // Max attempts: 3 (1 initial + 2 retries)
  const MAX_ATTEMPTS = 3

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let response: Response
    try {
      response = await fetch(url, {
        method: 'POST',
        signal,
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body,
      })
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      onError({ type: 'network', message: 'Ağ bağlantısı kurulamadı.' })
      return
    }

    if (response.ok) {
      return parseSSE(response, onChunk, onDone, onError, (parsed) => {
        return (parsed as {
          candidates?: { content?: { parts?: { text?: string }[] } }[]
        })?.candidates?.[0]?.content?.parts?.[0]?.text ?? null
      }, onEvent)
    }

    const bodyData = await response.json().catch(() => ({}))
    const msg = extractErrorMessage(bodyData)
    const bodyText = JSON.stringify(bodyData)

    // ── Auth ────────────────────────────────────────────────
    if (response.status === 401 || response.status === 403) {
      onError({ type: 'auth', message: 'API anahtarı geçersiz. aistudio.google.com adresinden kontrol et.' })
      return
    }

    // ── Rate limit ──────────────────────────────────────────
    if (response.status === 429) {
      const lower = bodyText.toLowerCase()
      if (lower.includes('per_day') || lower.includes('daily') || lower.includes('quota')) {
        onError({
          type: 'rate_limit',
          message: 'Günlük istek kotası doldu. Gece 00:00\'da sıfırlanır veya farklı bir model dene.',
        })
      } else if (lower.includes('limit: 0') || lower.includes('free_tier') || lower.includes('billing')) {
        onError({
          type: 'rate_limit',
          message: 'Bu model ücretsiz katmanda çalışmıyor. AI panelinden "Gemini 2.5 Flash-Lite" seç.',
        })
      } else {
        // Dakikalık limit (en yaygın ücretsiz kota hatası)
        onError({
          type: 'rate_limit',
          message: 'Dakikalık istek limiti aşıldı (ücretsiz kota). 1 dakika bekleyip tekrar dene veya "Gemini 2.5 Flash-Lite" modelini kullan.',
        })
      }
      return
    }

    // ── Transient server errors — retry with backoff ────────
    // 503: Service Unavailable / "high demand"
    // 500: Internal error (can be transient)
    // 400: Occasionally transient on Gemini
    const isTransient =
      response.status === 503 ||
      response.status === 500 ||
      response.status === 400 ||
      bodyText.toLowerCase().includes('high demand') ||
      bodyText.toLowerCase().includes('overloaded') ||
      bodyText.toLowerCase().includes('unavailable')

    if (isTransient && attempt < MAX_ATTEMPTS) {
      const delay = RETRY_DELAYS[attempt - 1] ?? 4000
      await new Promise((r) => setTimeout(r, delay))
      continue
    }

    // 503 after all retries exhausted
    if (response.status === 503 ||
        bodyText.toLowerCase().includes('high demand') ||
        bodyText.toLowerCase().includes('overloaded')) {
      onError({
        type: 'rate_limit',
        message: 'Gemini sunucuları şu an yoğun. 30 saniye bekleyip tekrar dene veya daha düşük trafikli "Gemini 2.5 Flash-Lite" modelini seç.',
      })
      return
    }

    onError({ type: 'unknown', message: msg || `HTTP ${response.status}` })
    return
  }
}

// ─────────────────────────────────────────────────────────────
// Gemini — Non-streaming generate (job search with grounding)
//
// Non-streaming because generateContent returns the COMPLETE
// groundingMetadata (chunks + supports), which we need to attach a
// real source URL to each listing.
// ─────────────────────────────────────────────────────────────

export interface GenerateResult {
  text: string
  grounding: GroundingData
}

export async function generateGemini({
  apiKey, model, system, prompt, maxTokens = 3000, useSearch, signal,
}: {
  apiKey: string
  model: string
  system: string
  prompt: string
  maxTokens?: number
  useSearch?: boolean
  signal?: AbortSignal
}): Promise<GenerateResult> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`
  const body = JSON.stringify({
    system_instruction: { parts: [{ text: system }] },
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { maxOutputTokens: maxTokens },
    ...(useSearch && { tools: [{ google_search: {} }] }),
  })

  const RETRY_DELAYS = [2000, 4000]
  const MAX_ATTEMPTS = 3

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let response: Response
    try {
      response = await fetch(url, {
        method: 'POST',
        signal,
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body,
      })
    } catch (err) {
      if ((err as Error).name === 'AbortError') throw err
      throw { type: 'network', message: 'Ağ bağlantısı kurulamadı.' } satisfies AIError
    }

    if (response.ok) {
      const data = await response.json().catch(() => ({}))
      return extractGroundedResult(data)
    }

    const bodyData = await response.json().catch(() => ({}))
    const msg = extractErrorMessage(bodyData)
    const bodyText = JSON.stringify(bodyData).toLowerCase()

    if (response.status === 401 || response.status === 403) {
      throw { type: 'auth', message: 'API anahtarı geçersiz. aistudio.google.com adresinden kontrol et.' } satisfies AIError
    }
    if (response.status === 429) {
      throw {
        type: 'rate_limit',
        message: 'İstek limiti aşıldı (ücretsiz kota). 1 dakika bekleyip tekrar dene veya "Gemini 2.5 Flash-Lite" modelini kullan.',
      } satisfies AIError
    }

    const isTransient =
      response.status === 503 || response.status === 500 || response.status === 400 ||
      bodyText.includes('high demand') || bodyText.includes('overloaded') || bodyText.includes('unavailable')
    if (isTransient && attempt < MAX_ATTEMPTS) {
      await new Promise((r) => setTimeout(r, RETRY_DELAYS[attempt - 1] ?? 4000))
      continue
    }
    if (response.status === 503 || bodyText.includes('high demand') || bodyText.includes('overloaded')) {
      throw { type: 'rate_limit', message: 'Gemini sunucuları şu an yoğun. 30 saniye bekleyip tekrar dene.' } satisfies AIError
    }
    throw { type: 'unknown', message: msg || `HTTP ${response.status}` } satisfies AIError
  }
  throw { type: 'unknown', message: 'Bilinmeyen hata' } satisfies AIError
}

function extractGroundedResult(data: unknown): GenerateResult {
  type Web = { uri?: string; title?: string }
  type Cand = {
    content?: { parts?: { text?: string }[] }
    groundingMetadata?: {
      groundingChunks?: { web?: Web }[]
      groundingSupports?: { segment?: { text?: string }; groundingChunkIndices?: number[] }[]
    }
  }
  const cand = (data as { candidates?: Cand[] })?.candidates?.[0]
  const text = (cand?.content?.parts ?? []).map((p) => p.text ?? '').join('')
  const meta = cand?.groundingMetadata

  const sources: GroundingSource[] = (meta?.groundingChunks ?? [])
    .map((c) => ({ uri: c.web?.uri ?? '', title: c.web?.title ?? '' }))
  const supports: GroundingSupport[] = (meta?.groundingSupports ?? [])
    .filter((s) => s.segment?.text)
    .map((s) => ({ text: s.segment!.text!, chunkIndices: s.groundingChunkIndices ?? [] }))

  return { text, grounding: { sources, supports } }
}

// ─────────────────────────────────────────────────────────────
// Shared SSE parser
// ─────────────────────────────────────────────────────────────

async function parseSSE(
  response: Response,
  onChunk: (text: string) => void,
  onDone: (fullText: string) => void,
  onError: (err: AIError) => void,
  extractChunk: (parsed: unknown) => string | null,
  onEvent?: (parsed: unknown) => void,
): Promise<void> {
  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let fullText = ''
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const data = line.slice(6).trim()
        if (data === '[DONE]') continue

        try {
          const parsed = JSON.parse(data)
          const chunk = extractChunk(parsed)
          if (chunk) {
            fullText += chunk
            onChunk(chunk)
          }
          onEvent?.(parsed)
        } catch {
          // Skip malformed lines
        }
      }
    }
  } catch (err) {
    if ((err as Error).name !== 'AbortError') {
      onError({ type: 'network', message: 'Akış sırasında bağlantı kesildi.' })
    }
    return
  } finally {
    reader.releaseLock()
  }

  onDone(fullText)
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function extractErrorMessage(body: unknown): string {
  if (typeof body !== 'object' || body === null) return 'Bilinmeyen hata'
  const b = body as Record<string, unknown>
  if (Array.isArray(b)) {
    // Gemini returns array of errors sometimes
    const first = (b[0] as Record<string, unknown>)?.error as Record<string, unknown>
    return String(first?.message ?? 'Bilinmeyen hata')
  }
  const err = b?.error as Record<string, unknown> | undefined
  return String(err?.message ?? b?.message ?? 'Bilinmeyen hata')
}

export function isValidKeyFormat(key: string): boolean {
  const trimmed = key.trim()
  return (trimmed.startsWith('AIza') || trimmed.startsWith('AQ.')) && trimmed.length > 10
}
