/**
 * InlineKeySetup — compact API key input that embeds anywhere.
 * Shows when apiKey is missing, lets the user save it without
 * leaving the current page.
 */

import { useState } from 'react'
import { Eye, EyeOff, ExternalLink, Gift, Sparkles, CheckCircle } from 'lucide-react'
import { useAIStore, PROVIDERS, type AIProvider } from '@/store/ai-store'
import { isValidKeyFormat } from '@/lib/ai-client'
import { cn } from '@/lib/utils'

interface InlineKeySetupProps {
  /** Called after a valid key is saved */
  onSaved?: () => void
  /** Title shown above the input */
  title?: string
}

export function InlineKeySetup({
  onSaved,
  title = 'AI ile analiz için API anahtarı gerekli',
}: InlineKeySetupProps) {
  const { provider, setProvider, setApiKey, setModel } = useAIStore()
  const [draft, setDraft] = useState('')
  const [visible, setVisible] = useState(false)
  const [saved, setSaved] = useState(false)

  const cfg = PROVIDERS[provider]
  const isValid = isValidKeyFormat(draft, cfg.keyPrefix)

  const handleProviderChange = (p: AIProvider) => {
    setProvider(p)
    setModel(PROVIDERS[p].models[0].value)
    setDraft('')
  }

  const handleSave = () => {
    if (!isValid) return
    setApiKey(draft.trim())
    setSaved(true)
    onSaved?.()
  }

  if (saved) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
        <CheckCircle size={14} className="text-emerald-600 dark:text-emerald-400" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
          Anahtar kaydedildi — tekrar deneyin
        </span>
      </div>
    )
  }

  return (
    <div className="border border-line bg-paper-warm p-4 flex flex-col gap-3">
      {/* Title */}
      <div className="flex items-center gap-2">
        <Sparkles size={13} className="text-accent shrink-0" />
        <p className="font-mono text-[10px] uppercase tracking-widest text-ink/70">
          {title}
        </p>
      </div>

      {/* Provider tabs */}
      <div className="flex gap-1">
        {(Object.keys(PROVIDERS) as AIProvider[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => handleProviderChange(p)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 font-mono text-[9px] uppercase tracking-widest transition-colors border',
              provider === p
                ? 'bg-ink text-paper border-ink'
                : 'border-line text-ink/50 hover:border-ink/40 hover:text-ink',
            )}
          >
            {PROVIDERS[p].label.split(' ')[0]}
            <span className="text-accent">
              <Gift size={9} />
            </span>
          </button>
        ))}
      </div>

      {/* Free note */}
      <p className="font-mono text-[9px] uppercase tracking-wide text-accent/80">
        {cfg.freeNote}
      </p>

      {/* Key input row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type={visible ? 'text' : 'password'}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder={cfg.keyPlaceholder}
            autoComplete="off"
            spellCheck={false}
            className="w-full border-b border-line bg-transparent py-1.5 pr-7 font-mono text-xs text-ink placeholder-ink/30 outline-none transition-colors focus:border-accent"
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setVisible((v) => !v)}
            className="absolute right-0 top-1.5 text-ink/30 hover:text-ink"
          >
            {visible ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={!isValid}
          className="shrink-0 bg-ink px-3 py-1.5 font-mono text-[9px] uppercase tracking-widest text-paper transition-colors hover:bg-accent disabled:opacity-40"
        >
          Kaydet
        </button>
      </div>

      {/* Validation hint */}
      {draft && !isValid && (
        <p className="font-mono text-[9px] uppercase tracking-wide text-accent">
          {cfg.label} anahtarı "{cfg.keyPrefix}" ile başlar
        </p>
      )}

      {/* Get key link */}
      <a
        href={cfg.consoleUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest text-ink/40 transition-colors hover:text-accent w-fit"
      >
        Ücretsiz anahtar al ({cfg.consoleName})
        <ExternalLink size={9} />
      </a>
    </div>
  )
}
