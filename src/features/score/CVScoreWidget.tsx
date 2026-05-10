/**
 * CVScoreWidget — shows completion + ATS scores in the editor.
 * Compact by default, expandable to see item-by-item breakdown.
 */

import { useState, useMemo } from 'react'
import { ChevronDown, CheckCircle2, Circle, Target, BarChart3 } from 'lucide-react'
import { useCVStore } from '@/store'
import { calcCVScores, type CVScoreResult } from '@/lib/cv-score'
import { cn } from '@/lib/utils'

const BAR_BG: Record<CVScoreResult['color'], string> = {
  red:     'bg-red-500',
  amber:   'bg-amber-500',
  green:   'bg-green-600',
  emerald: 'bg-emerald-500',
}
const TEXT_COLOR: Record<CVScoreResult['color'], string> = {
  red:     'text-red-600 dark:text-red-400',
  amber:   'text-amber-600 dark:text-amber-400',
  green:   'text-green-700 dark:text-green-400',
  emerald: 'text-emerald-600 dark:text-emerald-400',
}
const LABEL_BG: Record<CVScoreResult['color'], string> = {
  red:     'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400',
  amber:   'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  green:   'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400',
  emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
}

export function CVScoreWidget() {
  const cv = useCVStore((s) => s.cv)
  const scores = useMemo(() => calcCVScores(cv), [cv])
  const [open, setOpen] = useState<'completion' | 'ats' | null>(null)

  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-2">
      <ScoreCard
        icon={<BarChart3 size={14} />}
        title="Tamamlanma"
        result={scores.completion}
        expanded={open === 'completion'}
        onToggle={() => setOpen((v) => (v === 'completion' ? null : 'completion'))}
      />
      <ScoreCard
        icon={<Target size={14} />}
        title="ATS Uyumu"
        result={scores.ats}
        expanded={open === 'ats'}
        onToggle={() => setOpen((v) => (v === 'ats' ? null : 'ats'))}
        atsNote
      />
    </div>
  )
}

function ScoreCard({
  icon,
  title,
  result,
  expanded,
  onToggle,
  atsNote,
}: {
  icon: React.ReactNode
  title: string
  result: CVScoreResult
  expanded: boolean
  onToggle: () => void
  atsNote?: boolean
}) {
  const missing = result.items.filter((i) => !i.done)
  const topMissing = missing.slice(0, 3)

  return (
    <div className="border border-line bg-paper">
      {/* Header row */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3 transition-colors hover:bg-paper-warm"
      >
        <span className="text-ink/50">{icon}</span>

        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink/60">
              {title}
            </span>
            <span className={cn(
              'rounded-sm px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide',
              LABEL_BG[result.color],
            )}>
              {result.label}
            </span>
          </div>
          {/* Progress bar */}
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-line">
            <div
              className={cn('h-full rounded-full transition-all duration-700', BAR_BG[result.color])}
              style={{ width: `${result.score}%` }}
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <span className={cn('font-display text-xl font-light tabular-nums', TEXT_COLOR[result.color])}>
            {result.score}
          </span>
          <span className="font-mono text-[10px] text-ink/30">/100</span>
          <ChevronDown
            size={14}
            className={cn('ml-1 text-ink/30 transition-transform duration-200', expanded && 'rotate-180')}
          />
        </div>
      </button>

      {/* Collapsed: top 3 actionable hints */}
      {!expanded && topMissing.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-line px-4 py-2.5">
          {topMissing.map((item) => (
            <span
              key={item.label}
              className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-wide text-ink/40"
            >
              <span className="h-1 w-1 rounded-full bg-ink/25" />
              {item.tip ?? item.label}
            </span>
          ))}
        </div>
      )}

      {/* Expanded: full item breakdown */}
      {expanded && (
        <div className="divide-y divide-line border-t border-line">
          {result.items.map((item) => (
            <div key={item.label} className="flex items-start gap-3 px-4 py-2.5">
              {item.done
                ? <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-green-600 dark:text-green-400" />
                : <Circle      size={13} className="mt-0.5 shrink-0 text-ink/25" />
              }
              <div className="min-w-0 flex-1">
                <p className={cn(
                  'font-mono text-[10px] uppercase leading-tight tracking-wide',
                  item.done ? 'text-ink/70' : 'text-ink/50',
                )}>
                  {item.label}
                </p>
                {!item.done && item.tip && (
                  <p className="mt-0.5 text-[10px] leading-snug text-ink/35">{item.tip}</p>
                )}
              </div>
              <span className={cn(
                'shrink-0 font-mono text-[10px] tabular-nums',
                item.done ? 'text-ink/50' : 'text-ink/25',
              )}>
                {item.earned}/{item.points}
              </span>
            </div>
          ))}

          {atsNote && (
            <div className="bg-paper-warm px-4 py-2.5">
              <p className="font-mono text-[9px] uppercase leading-relaxed tracking-wide text-ink/30">
                ATS skoru şablon, tarih bilgileri ve ölçülebilir başarılara göre hesaplanır.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
