/**
 * JobMatchWidget — paste a job description, get an instant match score.
 * Layer 1: local keyword matching (instant, no API)
 * Layer 2: AI deep analysis (optional, requires API key)
 */

import { useState, useCallback, useRef, useMemo } from 'react'
import {
  Briefcase, X, Sparkles, ChevronDown, CheckCircle2,
  XCircle, Loader2, RefreshCw, ClipboardPaste,
} from 'lucide-react'
import { useCVStore } from '@/store'
import { useAIStore, PROVIDERS } from '@/store/ai-store'
import { useJobMatchStore } from '@/store/job-match-store'
import { matchCVToJob } from '@/lib/job-match'
import { buildJobMatchPrompt } from '@/lib/prompts'
import { streamAI } from '@/lib/ai-client'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────

const SCORE_COLOR = (s: number) =>
  s >= 75 ? 'emerald' : s >= 50 ? 'green' : s >= 30 ? 'amber' : 'red'

const BAR_BG: Record<string, string> = {
  red: 'bg-red-500', amber: 'bg-amber-500',
  green: 'bg-green-600', emerald: 'bg-emerald-500',
}
const TEXT_C: Record<string, string> = {
  red: 'text-red-600 dark:text-red-400',
  amber: 'text-amber-600 dark:text-amber-400',
  green: 'text-green-700 dark:text-green-400',
  emerald: 'text-emerald-600 dark:text-emerald-400',
}
const LABEL_BG: Record<string, string> = {
  red: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  green: 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400',
  emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
}
const SCORE_LABEL = (s: number) =>
  s >= 75 ? 'Güçlü Uyum' : s >= 50 ? 'İyi Uyum' : s >= 30 ? 'Kısmi Uyum' : 'Düşük Uyum'

// ─────────────────────────────────────────────────────────────

export function JobMatchWidget() {
  const cv = useCVStore((s) => s.cv)
  const { apiKey, provider, model } = useAIStore()
  const baseUrl = PROVIDERS[provider].baseUrl

  const {
    jobDescription, result, aiAnalysis, aiLoading,
    setJobDescription, setResult, setAIAnalysis,
    appendAIChunk, setAILoading, clear,
  } = useJobMatchStore()

  const [inputMode, setInputMode] = useState(!result)     // show textarea
  const [showAll, setShowAll] = useState(false)           // show all missing
  const [showAI, setShowAI] = useState(!!aiAnalysis)      // show AI panel
  const abortRef = useRef<AbortController | null>(null)

  const color = result ? SCORE_COLOR(result.score) : 'amber'

  // ── Run local match ───────────────────────────────────────
  const handleAnalyze = useCallback(() => {
    if (!jobDescription.trim()) return
    const res = matchCVToJob(cv, jobDescription)
    setResult(res)
    setInputMode(false)
    setAIAnalysis('')
    setShowAI(false)
  }, [cv, jobDescription, setResult, setAIAnalysis])

  // ── Run AI deep analysis ──────────────────────────────────
  const handleAIAnalyze = useCallback(async () => {
    if (!result || aiLoading) return
    setAIAnalysis('')
    setAILoading(true)
    setShowAI(true)

    const matched = result.matched.map((k) => k.keyword)
    const missing = result.missing.map((k) => k.keyword)
    const prompt = buildJobMatchPrompt(cv, jobDescription, matched, missing)

    const ctrl = new AbortController()
    abortRef.current = ctrl

    await streamAI({
      provider,
      baseUrl,
      apiKey,
      model,
      system: 'Sen bir kariyer danışmanısın. Sadece istenen JSON formatında yanıt verirsin.',
      prompt,
      maxTokens: 1000,
      signal: ctrl.signal,
      onChunk: appendAIChunk,
      onDone: () => setAILoading(false),
      onError: () => setAILoading(false),
    })
  }, [result, aiLoading, cv, jobDescription, provider, baseUrl, apiKey, model, setAIAnalysis, setAILoading, setShowAI, appendAIChunk])

  // ── Parse AI JSON safely ───────────────────────────────────
  const aiData = useMemo(() => {
    if (!aiAnalysis) return null
    try {
      const clean = aiAnalysis.replace(/```json|```/g, '').trim()
      return JSON.parse(clean) as {
        score: number
        strengths: string[]
        gaps: string[]
        suggestions: { action: string; why: string }[]
        tailoredSummary: string
      }
    } catch { return null }
  }, [aiAnalysis])

  // ─────────────────────────────────────────────────────────────
  // EMPTY STATE (no result yet)
  // ─────────────────────────────────────────────────────────────
  if (!result || inputMode) {
    return (
      <div className="mb-6 border border-line bg-paper">
        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          <Briefcase size={14} className="text-ink/50" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-ink/60">
            İlana Göre Uyum
          </span>
          <span className="font-mono text-[9px] text-ink/30">
            — iş ilanını yapıştır, CV uyumunu gör
          </span>
          {result && (
            <button onClick={() => setInputMode(false)} className="ml-auto text-ink/40 hover:text-ink">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="p-4">
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="İş ilanını buraya yapıştırın…"
            rows={5}
            className="w-full resize-y bg-paper-cool border border-line p-3 font-sans text-sm text-ink placeholder-ink/30 outline-none transition-colors focus:border-accent"
          />
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={!jobDescription.trim()}
              className="inline-flex items-center gap-2 bg-ink px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-paper transition-colors hover:bg-accent disabled:opacity-40"
            >
              <ClipboardPaste size={11} />
              Analiz Et
            </button>
            {(result || jobDescription) && (
              <button
                type="button"
                onClick={clear}
                className="font-mono text-[9px] uppercase tracking-widest text-ink/40 hover:text-ink"
              >
                Temizle
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────
  // RESULT STATE
  // ─────────────────────────────────────────────────────────────
  const visibleMissing = showAll ? result.missing : result.missing.slice(0, 6)

  return (
    <div className="mb-6 border border-line bg-paper">
      {/* Header — score bar */}
      <button
        type="button"
        onClick={() => setInputMode(true)}
        className="flex w-full items-center gap-3 border-b border-line px-4 py-3 transition-colors hover:bg-paper-warm"
      >
        <Briefcase size={14} className="text-ink/50" />

        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink/60">
              İlana Göre Uyum
            </span>
            <span className={cn('rounded-sm px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide', LABEL_BG[color])}>
              {SCORE_LABEL(result.score)}
            </span>
          </div>
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-line">
            <div
              className={cn('h-full rounded-full transition-all duration-700', BAR_BG[color])}
              style={{ width: `${result.score}%` }}
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <span className={cn('font-display text-xl font-light tabular-nums', TEXT_C[color])}>
            {result.score}
          </span>
          <span className="font-mono text-[10px] text-ink/30">/100</span>
          <span className="ml-2 font-mono text-[9px] uppercase tracking-wide text-ink/30">düzenle</span>
        </div>
      </button>

      {/* Matched + Missing */}
      <div className="grid gap-px bg-line sm:grid-cols-2">
        {/* Matched */}
        <div className="bg-paper p-4">
          <p className="mb-2 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={11} />
            Eşleşen ({result.matched.length})
          </p>
          <div className="flex flex-wrap gap-1">
            {result.matched.map((kw) => (
              <span
                key={kw.keyword}
                className="rounded-sm bg-emerald-50 px-1.5 py-0.5 font-mono text-[9px] text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
              >
                {kw.keyword}
              </span>
            ))}
            {result.matched.length === 0 && (
              <span className="font-mono text-[10px] text-ink/30">Eşleşen bulunamadı</span>
            )}
          </div>
        </div>

        {/* Missing */}
        <div className="bg-paper p-4">
          <p className="mb-2 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-red-600 dark:text-red-400">
            <XCircle size={11} />
            Eksik ({result.missing.length})
          </p>
          <div className="flex flex-wrap gap-1">
            {visibleMissing.map((kw) => (
              <span
                key={kw.keyword}
                className="rounded-sm bg-red-50 px-1.5 py-0.5 font-mono text-[9px] text-red-700 dark:bg-red-950/30 dark:text-red-400"
              >
                {kw.keyword}
              </span>
            ))}
            {result.missing.length > 6 && (
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                className="font-mono text-[9px] uppercase tracking-wide text-ink/40 hover:text-ink"
              >
                {showAll ? 'Daha az' : `+${result.missing.length - 6} daha`}
              </button>
            )}
            {result.missing.length === 0 && (
              <span className="font-mono text-[10px] text-ink/30">Tüm anahtar kelimeler mevcut 🎉</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Local insights (no AI) ─────────────────────────── */}

      {/* Category coverage */}
      {result.categories && result.categories.length > 0 && (
        <div className="border-t border-line px-4 py-3">
          <p className="mb-2 font-mono text-[9px] uppercase tracking-widest text-ink/50">
            Alan Bazlı Uyum
          </p>
          <div className="flex flex-col gap-1.5">
            {result.categories.map((c) => (
              <div key={c.category} className="flex items-center gap-2">
                <span className="w-24 shrink-0 truncate font-mono text-[10px] text-ink/55">{c.label}</span>
                <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                  <div
                    className={cn('h-full rounded-full transition-all duration-500', BAR_BG[SCORE_COLOR(c.score)])}
                    style={{ width: `${c.score}%` }}
                  />
                </div>
                <span className="w-10 shrink-0 text-right font-mono text-[9px] text-ink/40">{c.matched}/{c.total}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Experience comparison */}
      {result.requiredYears != null && (
        <div className="border-t border-line px-4 py-3">
          <p className="mb-1 font-mono text-[9px] uppercase tracking-widest text-ink/50">Deneyim</p>
          <p className="text-xs text-ink/70">
            İlan ~<strong className="font-semibold">{result.requiredYears} yıl</strong> istiyor · CV'nde ~
            <strong className="font-semibold">{result.cvYears ?? 0} yıl</strong>
            {(result.cvYears ?? 0) >= result.requiredYears
              ? <span className="ml-1.5 text-emerald-600 dark:text-emerald-400">✓ yeterli</span>
              : <span className="ml-1.5 text-amber-600 dark:text-amber-400">eksik görünüyor</span>}
          </p>
        </div>
      )}

      {/* Local recommendations */}
      {result.recommendations && result.recommendations.length > 0 && (
        <div className="border-t border-line px-4 py-3">
          <p className="mb-2 font-mono text-[9px] uppercase tracking-widest text-accent">Öneriler</p>
          <ul className="flex flex-col gap-1.5">
            {result.recommendations.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-xs leading-relaxed text-ink/70">
                <span className="mt-0.5 shrink-0 text-accent">→</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 border-t border-line px-4 py-3">
        {apiKey ? (
          <button
            type="button"
            onClick={handleAIAnalyze}
            disabled={aiLoading}
            className="inline-flex items-center gap-2 bg-accent px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-paper transition-colors hover:bg-ink disabled:opacity-50"
          >
            {aiLoading
              ? <Loader2 size={11} className="animate-spin" />
              : <Sparkles size={11} />
            }
            {aiLoading ? 'Analiz ediliyor...' : 'AI Derin Analiz'}
          </button>
        ) : (
          <p className="font-mono text-[9px] uppercase tracking-wide text-ink/40">
            AI analizi için API anahtarı gerekli →{' '}
            <span className="text-accent">AI panelinden ekle</span>
          </p>
        )}

        <button
          type="button"
          onClick={() => { clear(); setInputMode(true) }}
          className="ml-auto flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-ink/30 hover:text-ink"
        >
          <RefreshCw size={11} />
          Sıfırla
        </button>
      </div>

      {/* AI Analysis Panel */}
      {showAI && (aiLoading || aiAnalysis) && (
        <div className="border-t border-line">
          <button
            type="button"
            onClick={() => setShowAI((v) => !v)}
            className="flex w-full items-center gap-2 px-4 py-2.5 transition-colors hover:bg-paper-warm"
          >
            <Sparkles size={12} className="text-accent" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink/60">
              AI Analizi
            </span>
            {aiLoading && <Loader2 size={11} className="animate-spin text-accent" />}
            <ChevronDown size={12} className="ml-auto text-ink/30" />
          </button>

          {aiData ? (
            <div className="divide-y divide-line border-t border-line">
              {/* AI Score */}
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="font-mono text-[10px] uppercase tracking-widest text-ink/50">AI Skoru</span>
                <span className="font-display text-2xl font-light text-accent">{aiData.score}</span>
                <span className="font-mono text-[10px] text-ink/30">/100</span>
              </div>

              {/* Strengths */}
              <div className="px-4 py-3">
                <p className="mb-2 font-mono text-[9px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                  Güçlü Yönler
                </p>
                <ul className="flex flex-col gap-1">
                  {aiData.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-ink/70">
                      <CheckCircle2 size={11} className="mt-0.5 shrink-0 text-emerald-500" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Gaps */}
              <div className="px-4 py-3">
                <p className="mb-2 font-mono text-[9px] uppercase tracking-widest text-red-600 dark:text-red-400">
                  Eksikler
                </p>
                <ul className="flex flex-col gap-1">
                  {aiData.gaps.map((g, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-ink/70">
                      <XCircle size={11} className="mt-0.5 shrink-0 text-red-400" />
                      {g}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Suggestions */}
              <div className="px-4 py-3">
                <p className="mb-2 font-mono text-[9px] uppercase tracking-widest text-accent">
                  Öneriler
                </p>
                <ul className="flex flex-col gap-2">
                  {aiData.suggestions.map((s, i) => (
                    <li key={i} className="text-xs">
                      <span className="font-medium text-ink">→ {s.action}</span>
                      <span className="ml-1 text-ink/50">— {s.why}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tailored Summary */}
              {aiData.tailoredSummary && (
                <div className="bg-paper-warm px-4 py-3">
                  <p className="mb-1.5 font-mono text-[9px] uppercase tracking-widest text-ink/50">
                    Önerilen CV Özeti
                  </p>
                  <p className="text-xs leading-relaxed text-ink/70 italic">
                    "{aiData.tailoredSummary}"
                  </p>
                </div>
              )}
            </div>
          ) : aiLoading ? (
            <div className="border-t border-line px-4 py-4">
              <p className="animate-pulse font-mono text-[10px] uppercase tracking-widest text-ink/40">
                AI yanıt oluşturuyor...
              </p>
            </div>
          ) : (
            <div className="border-t border-line px-4 py-3">
              <p className="font-mono text-[9px] text-ink/40">
                Yanıt ayrıştırılamadı. Tekrar deneyin.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
