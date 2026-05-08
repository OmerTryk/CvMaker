/**
 * ai-client.ts — Multi-provider AI streaming client.
 *
 * Gemini → uses native streamGenerateContent API (most reliable)
 * Groq   → uses OpenAI-compatible chat completions API
 *
 * Both produce the same onChunk/onDone/onError interface so the
 * rest of the app doesn't need to know which provider is active.
 */

import type { AIProvider } from '@/store/ai-store'

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface AIError {
  type: 'auth' | 'rate_limit' | 'network' | 'unknown'
  message: string
}

export interface StreamOptions {
  provider: AIProvider
  /** For Groq: full base URL. For Gemini: ignored (native URL built internally). */
  baseUrl: string
  apiKey: string
  model: string
  system: string
  prompt: string
  maxTokens?: number
  onChunk: (text: string) => void
  onDone: (fullText: string) => void
  onError: (err: AIError) => void
  signal?: AbortSignal
}

// ─────────────────────────────────────────────────────────────
// Dispatcher
// ─────────────────────────────────────────────────────────────

export async function streamAI(opts: StreamOptions): Promise<void> {
  if (opts.provider === 'gemini') {
    return streamGemini(opts)
  }
  return streamOpenAI(opts)
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
  onChunk,
  onDone,
  onError,
  signal,
}: StreamOptions): Promise<void> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse`

  const body = JSON.stringify({
    system_instruction: {
      parts: [{ text: system }],
    },
    contents: [
      { role: 'user', parts: [{ text: prompt }] },
    ],
    generationConfig: {
      maxOutputTokens: maxTokens,
    },
  })

  // Try up to 2 times — intermittent 400s can be transient server errors
  for (let attempt = 1; attempt <= 2; attempt++) {
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
      })
    }

    const bodyData = await response.json().catch(() => ({}))
    const msg = extractErrorMessage(bodyData)

    if (response.status === 401 || response.status === 403) {
      onError({ type: 'auth', message: 'API anahtarı geçersiz. aistudio.google.com adresinden kontrol et.' })
      return
    }

    if (response.status === 429) {
      const bodyText = JSON.stringify(bodyData)
      if (bodyText.includes('limit: 0') || bodyText.includes('free_tier')) {
        onError({
          type: 'rate_limit',
          message: 'Bu model ücretsiz katmanda çalışmıyor. "Gemini 2.5 Flash-Lite" seç.',
        })
      } else {
        onError({ type: 'rate_limit', message: 'Hız limiti aşıldı. 30 saniye bekleyip tekrar dene.' })
      }
      return
    }

    if (response.status === 400 && attempt < 2) {
      // Transient 400 — wait briefly and retry once
      await new Promise((r) => setTimeout(r, 1500))
      continue
    }

    onError({ type: 'unknown', message: msg || `HTTP ${response.status}` })
    return
  }
}

// ─────────────────────────────────────────────────────────────
// OpenAI-compatible — for Groq and others
// ─────────────────────────────────────────────────────────────

async function streamOpenAI({
  baseUrl,
  apiKey,
  model,
  system,
  prompt,
  maxTokens = 700,
  onChunk,
  onDone,
  onError,
  signal,
}: StreamOptions): Promise<void> {
  let response: Response
  try {
    response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        stream: true,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt },
        ],
      }),
    })
  } catch (err) {
    if ((err as Error).name === 'AbortError') return
    onError({ type: 'network', message: 'Ağ bağlantısı kurulamadı.' })
    return
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    const msg = extractErrorMessage(body)
    if (response.status === 401 || response.status === 403) {
      onError({ type: 'auth', message: 'API anahtarı geçersiz.' })
    } else if (response.status === 429) {
      onError({ type: 'rate_limit', message: 'Hız limiti aşıldı. Biraz bekle.' })
    } else {
      onError({ type: 'unknown', message: msg })
    }
    return
  }

  // Parse OpenAI SSE — delta format
  // Each event: data: {"choices":[{"delta":{"content":"chunk"}}]}
  await parseSSE(response, onChunk, onDone, onError, (parsed) => {
    return (parsed as {
      choices?: { delta?: { content?: string } }[]
    })?.choices?.[0]?.delta?.content ?? null
  })
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

export function isValidKeyFormat(key: string, prefix: string): boolean {
  return key.trim().startsWith(prefix) && key.trim().length > 10
}
