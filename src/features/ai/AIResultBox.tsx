/**
 * AIResultBox — shared result display for all AI features.
 * Shows streaming text, error state, and action buttons.
 */

import { Loader2, AlertCircle, Copy, CheckCheck } from 'lucide-react'
import { useState, useEffect } from 'react'
import type { AIError } from '@/lib/ai-client'
import { cn } from '@/lib/utils'

interface AIResultBoxProps {
  result: string
  loading: boolean
  error: AIError | null
  /** Primary apply action — receives the (possibly edited) text */
  onApply?: (text: string) => void
  applyLabel?: string
  /** Optional secondary action — receives the (possibly edited) text */
  onApply2?: (text: string) => void
  applyLabel2?: string
  placeholder?: string
}

export function AIResultBox({
  result,
  loading,
  error,
  onApply,
  applyLabel = 'Uygula',
  onApply2,
  applyLabel2,
  placeholder = 'Sonuç burada görünecek...',
}: AIResultBoxProps) {
  const [copied, setCopied] = useState(false)
  const [editedResult, setEditedResult] = useState(result)

  // Sync edited text when a new stream result arrives
  useEffect(() => {
    if (!loading) setEditedResult(result)
  }, [result, loading])

  const handleCopy = () => {
    if (!editedResult) return
    navigator.clipboard.writeText(editedResult).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (error) {
    return (
      <div className="flex items-start gap-3 border border-accent/30 bg-accent/5 p-4">
        <AlertCircle size={16} className="mt-0.5 shrink-0 text-accent" />
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-accent">
            Hata
          </p>
          <p className="mt-1 text-sm text-ink/80">{error.message}</p>
          {error.type === 'auth' && (
            <p className="mt-2 font-mono text-[10px] text-ink/50">
              API anahtarını kontrol et →{' '}
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-accent"
              >
                aistudio.google.com
              </a>
            </p>
          )}
        </div>
      </div>
    )
  }

  if (!result && !loading) {
    return (
      <div className="border border-dashed border-ink/15 p-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-ink/30">
          {placeholder}
        </p>
      </div>
    )
  }

  return (
    <div className="border border-line bg-paper-cool/50">
      {/* Result text — streaming: read-only p, done: editable textarea */}
      <div className="relative min-h-[80px]">
        {loading ? (
          <div className="p-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">
              {result}
              <span className="ml-1 inline-block h-4 w-0.5 animate-pulse bg-accent" />
            </p>
            {!result && (
              <div className="flex items-center gap-2 text-ink/40">
                <Loader2 size={14} className="animate-spin" />
                <span className="font-mono text-[10px] uppercase tracking-wider">
                  Yazıyor...
                </span>
              </div>
            )}
          </div>
        ) : (
          <textarea
            value={editedResult}
            onChange={(e) => setEditedResult(e.target.value)}
            rows={Math.max(4, editedResult.split('\n').length + 1)}
            className="w-full resize-none bg-transparent p-4 text-sm leading-relaxed text-ink outline-none placeholder:text-ink/30 focus:bg-ink/[0.02]"
            placeholder={placeholder}
            spellCheck={false}
          />
        )}
      </div>

      {/* Action bar */}
      {editedResult && !loading && (
        <div className="flex items-center gap-2 border-t border-line p-3">
          {onApply && (
            <button
              type="button"
              onClick={() => onApply(editedResult)}
              className="bg-ink px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-paper transition-colors hover:bg-accent"
            >
              {applyLabel}
            </button>
          )}
          {onApply2 && (
            <button
              type="button"
              onClick={() => onApply2(editedResult)}
              className="border border-line px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-ink/60 transition-colors hover:border-ink hover:text-ink"
            >
              {applyLabel2}
            </button>
          )}
          <button
            type="button"
            onClick={handleCopy}
            title="Kopyala"
            className={cn(
              'ml-auto flex items-center gap-1.5 px-3 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors',
              copied ? 'text-accent' : 'text-ink/40 hover:text-ink',
            )}
          >
            {copied ? <CheckCheck size={12} /> : <Copy size={12} />}
            {copied ? 'Kopyalandı' : 'Kopyala'}
          </button>
        </div>
      )}
    </div>
  )
}
