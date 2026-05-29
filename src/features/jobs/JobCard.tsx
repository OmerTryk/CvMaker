import { useState, useCallback, useRef, useEffect } from 'react'
import { ExternalLink, Search, Sparkles, Loader2, CheckCircle2, XCircle, MapPin, Building2, X } from 'lucide-react'
import { streamAI } from '@/lib/ai-client'
import { buildJobMatchPrompt } from '@/lib/prompts'
import { useAIStore, PROVIDERS } from '@/store/ai-store'
import { useCVStore } from '@/store'
import { cn } from '@/lib/utils'
import type { JobListing } from '@/lib/job-search'

interface JobCardProps {
  job: JobListing
}

// ── Platform badge ────────────────────────────────────────────

/**
 * Link badge. We DON'T show a platform name (kariyer.net / Indeed …) because
 * the link is either a grounding source page or a Google "open positions"
 * search — not necessarily that platform. So the label reflects the action.
 *  - isDirect = true  → real source page Gemini read (grounding); opens it.
 *  - isDirect = false → a Google search for the company's open positions.
 */
function PlatformBadge({ url, isDirect }: { url: string; isDirect: boolean }) {
  const Icon = isDirect ? ExternalLink : Search
  const label = isDirect ? 'Aç' : 'Pozisyonlar'
  const tooltip = isDirect ? 'Kaynağı aç' : 'Açık pozisyonları ara'
  const tone = isDirect
    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
    : 'bg-paper-warm text-ink/50'
  return (
    <a href={url} target="_blank" rel="noreferrer">
      <span
        title={tooltip}
        className={cn(
          'flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide cursor-pointer transition-opacity hover:opacity-75',
          tone,
        )}
      >
        <Icon size={9} />
        {label}
      </span>
    </a>
  )
}

function scoreStyle(score: number) {
  if (score >= 75) return { bar: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', label: 'Güçlü' }
  if (score >= 50) return { bar: 'bg-green-500',   text: 'text-green-600 dark:text-green-400',   label: 'İyi'   }
  if (score >= 30) return { bar: 'bg-amber-400',   text: 'text-amber-600 dark:text-amber-400',   label: 'Kısmi' }
  return              { bar: 'bg-red-400',          text: 'text-red-500 dark:text-red-400',        label: 'Düşük' }
}

export function JobCard({ job }: JobCardProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [aiResult, setAiResult] = useState<string>('')
  const [aiLoading, setAiLoading] = useState(false)
  const cv = useCVStore((s) => s.cv)
  const { apiKey, provider, model } = useAIStore()
  const baseUrl = PROVIDERS[provider].baseUrl
  const abortRef = useRef<AbortController | null>(null)

  // Close modal on Escape
  useEffect(() => {
    if (!modalOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setModalOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [modalOpen])

  const handleDeepAnalysis = useCallback(async () => {
    if (!apiKey || aiLoading) return
    setAiResult('')
    setAiLoading(true)
    const jobDesc = `${job.title} — ${job.company}\n${job.description}`
    const prompt = buildJobMatchPrompt(
      cv, jobDesc,
      job.matchResult.matched.map((k) => k.keyword),
      job.matchResult.missing.map((k) => k.keyword),
    )
    const ctrl = new AbortController()
    abortRef.current = ctrl
    let full = ''
    await streamAI({
      provider, baseUrl, apiKey, model,
      system: 'Sen bir kariyer danışmanısın. Sadece istenen JSON formatında yanıt verirsin.',
      prompt, maxTokens: 900, signal: ctrl.signal,
      onChunk: (c) => { full += c },
      onDone: () => { setAiResult(full); setAiLoading(false) },
      onError: () => setAiLoading(false),
    })
  }, [apiKey, aiLoading, cv, job, provider, baseUrl, model])

  const aiData = (() => {
    if (!aiResult) return null
    try {
      return JSON.parse(aiResult.replace(/```json|```/g, '').trim()) as {
        score: number; strengths: string[]; gaps: string[]
        suggestions: { action: string; why: string }[]; tailoredSummary: string
      }
    } catch { return null }
  })()

  const { bar, text, label } = scoreStyle(job.matchResult.score)

  // Keyword'leri temizle: çok kısa, rakam, şirket/pozisyon isimlerine benzeyen çöpleri at
  const cleanKeywords = (kws: { keyword: string }[]) =>
    kws.filter((k) => k.keyword.length >= 3)

  const matchedKws = cleanKeywords(job.matchResult.matched).slice(0, 5)
  const missingKws = cleanKeywords(job.matchResult.missing).slice(0, 3)

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-line bg-paper transition-shadow hover:shadow-md">
      {/* Score bar — thin colored stripe at top */}
      <div className={cn('h-1 w-full', bar)} />

      {/* Card body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Score pill + platform + link */}
        <div className="flex items-center justify-between gap-2">
          <span className={cn('font-mono text-xs font-semibold shrink-0', text)}>
            {job.matchResult.score}% · {label}
          </span>
          <div className="flex items-center gap-1 min-w-0">
            {job.url && (
              <PlatformBadge url={job.url} isDirect={!!job.urlIsDirect} />
            )}
          </div>
        </div>

        {/* Company name + sector + location */}
        <div>
          <h3 className="flex items-center gap-1.5 font-sans text-sm font-semibold leading-snug text-ink">
            <Building2 size={13} className="shrink-0 text-ink/40" />
            {job.company}
          </h3>
          <div className="mt-1.5 flex flex-col gap-0.5">
            {job.title && (
              <span className="text-xs text-ink/55">{job.title}</span>
            )}
            {job.location && (
              <span className="flex items-center gap-1.5 text-xs text-ink/40">
                <MapPin size={10} className="shrink-0" />
                <span className="truncate">{job.location}</span>
              </span>
            )}
          </div>
        </div>

        {/* Why this company fits */}
        {job.description && (
          <p className="text-xs leading-relaxed text-ink/55 line-clamp-3">
            {job.description}
          </p>
        )}

        {/* Keywords */}
        {(matchedKws.length > 0 || missingKws.length > 0) && (
          <div className="flex flex-wrap gap-1.5">
            {matchedKws.map((kw) => (
              <span
                key={kw.keyword}
                className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
              >
                {kw.keyword}
              </span>
            ))}
            {missingKws.map((kw) => (
              <span
                key={kw.keyword}
                className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] text-red-500 line-through opacity-60 dark:bg-red-950/30 dark:text-red-400"
              >
                {kw.keyword}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* AI Analiz — opens a modal (avoids stretching the grid row) */}
      {apiKey && (
        <div className="border-t border-line/60">
          <button
            type="button"
            onClick={() => { setModalOpen(true); if (!aiResult && !aiLoading) handleDeepAnalysis() }}
            className="flex w-full items-center justify-center gap-1.5 px-4 py-2.5 text-xs text-ink/40 transition-colors hover:bg-paper-warm/50 hover:text-ink"
          >
            <Sparkles size={11} />
            AI Analiz
          </button>
        </div>
      )}

      {/* AI Analiz modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-line bg-paper shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-accent">
                  <Sparkles size={11} /> AI Analiz
                </p>
                <h3 className="mt-1 truncate font-sans text-sm font-semibold text-ink">{job.company}</h3>
                {job.title && <p className="truncate text-xs text-ink/40">{job.title}</p>}
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Kapat"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-ink/40 transition-colors hover:bg-paper-warm hover:text-ink"
              >
                <X size={15} />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto">
              {aiLoading && (
                <div className="flex items-center gap-2 px-5 py-8">
                  <Loader2 size={14} className="animate-spin text-accent" />
                  <span className="animate-pulse font-mono text-[10px] uppercase tracking-widest text-ink/40">
                    Analiz ediliyor...
                  </span>
                </div>
              )}

              {!aiLoading && aiData && (
                <div className="divide-y divide-line/60">
                  {/* Score */}
                  <div className="flex items-baseline gap-2 px-5 py-3">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-ink/40">AI Uyum</span>
                    <span className="font-display text-3xl font-light text-accent">{aiData.score}</span>
                    <span className="font-mono text-[9px] text-ink/30">/100</span>
                  </div>

                  {/* Strengths & Gaps */}
                  <div className="grid gap-px bg-line/40 sm:grid-cols-2">
                    <div className="bg-paper px-5 py-4">
                      <p className="mb-2 font-mono text-[9px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Güçlü</p>
                      <ul className="flex flex-col gap-2">
                        {aiData.strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs text-ink/60">
                            <CheckCircle2 size={12} className="mt-0.5 shrink-0 text-emerald-500" />{s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-paper px-5 py-4">
                      <p className="mb-2 font-mono text-[9px] uppercase tracking-widest text-red-500 dark:text-red-400">Eksik</p>
                      <ul className="flex flex-col gap-2">
                        {aiData.gaps.map((g, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs text-ink/60">
                            <XCircle size={12} className="mt-0.5 shrink-0 text-red-400" />{g}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Summary */}
                  {aiData.tailoredSummary && (
                    <div className="bg-paper-warm/40 px-5 py-4">
                      <p className="mb-1 font-mono text-[9px] uppercase tracking-widest text-ink/40">Önerilen Özet</p>
                      <p className="text-xs italic leading-relaxed text-ink/60">"{aiData.tailoredSummary}"</p>
                    </div>
                  )}
                </div>
              )}

              {/* Parse failed / no data */}
              {!aiLoading && !aiData && aiResult && (
                <div className="px-5 py-8 text-center">
                  <p className="text-sm text-ink/50">Analiz sonucu okunamadı. Tekrar dene.</p>
                  <button
                    type="button"
                    onClick={handleDeepAnalysis}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs text-ink/60 hover:border-ink hover:text-ink"
                  >
                    <Sparkles size={11} /> Tekrar Analiz Et
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
