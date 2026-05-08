import { useState } from 'react'
import { Eye, EyeOff, ExternalLink, CheckCircle, Gift } from 'lucide-react'
import { useAIStore, PROVIDERS, type AIProvider } from '@/store/ai-store'
import { isValidKeyFormat } from '@/lib/ai-client'

export function ApiKeySetup() {
  const { apiKey, provider, model, setApiKey, setProvider, setModel } = useAIStore()
  const [draft, setDraft] = useState(apiKey)
  const [visible, setVisible] = useState(false)
  const [editing, setEditing] = useState(!apiKey)

  const config = PROVIDERS[provider]
  const isValid = isValidKeyFormat(draft, config.keyPrefix)
  const saved = draft === apiKey && !!apiKey

  const handleProviderChange = (p: AIProvider) => {
    setProvider(p)
    setDraft('')
    setEditing(true)
  }

  const handleSave = () => {
    if (!isValid) return
    setApiKey(draft.trim())
    setEditing(false)
  }

  const handleClear = () => {
    setApiKey('')
    setDraft('')
    setEditing(true)
  }

  return (
    <div className="flex flex-col gap-4 border border-line bg-paper-cool/50 p-4">
      {/* Provider selector */}
      <div>
        <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-ink/50">
          Sağlayıcı
        </p>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(PROVIDERS) as AIProvider[]).map((p) => {
            const cfg = PROVIDERS[p]
            const active = provider === p
            return (
              <button
                key={p}
                type="button"
                onClick={() => handleProviderChange(p)}
                className={`flex flex-col items-start gap-1 border px-3 py-2.5 text-left transition-all duration-200 ${
                  active
                    ? 'border-ink bg-ink text-paper'
                    : 'border-line hover:border-ink/40'
                }`}
              >
                <span className={`font-mono text-[10px] font-medium uppercase tracking-wide ${active ? 'text-paper' : 'text-ink'}`}>
                  {cfg.label}
                </span>
                <span className={`flex items-center gap-1 font-mono text-[9px] uppercase tracking-wide ${active ? 'text-paper/60' : 'text-accent'}`}>
                  <Gift size={9} /> Ücretsiz
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Free tier note */}
      <div className="flex items-start gap-2 border border-accent/20 bg-accent/5 px-3 py-2.5">
        <Gift size={12} className="mt-0.5 shrink-0 text-accent" />
        <p className="font-mono text-[10px] uppercase tracking-wider text-accent">
          {config.freeNote}
        </p>
      </div>

      {/* API Key input */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink/50">
            API Anahtarı
          </p>
          <a
            href={config.consoleUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-accent transition-colors hover:text-ink"
          >
            {config.consoleName} <ExternalLink size={9} />
          </a>
        </div>

        {!editing && apiKey ? (
          <div className="flex items-center gap-3">
            <CheckCircle size={14} className="shrink-0 text-accent" />
            <span className="flex-1 font-mono text-xs text-ink/60">
              {apiKey.slice(0, 8)}••••{apiKey.slice(-4)}
            </span>
            <button
              type="button"
              onClick={() => { setDraft(apiKey); setEditing(true) }}
              className="font-mono text-[10px] uppercase tracking-widest text-ink/40 transition-colors hover:text-ink"
            >
              Değiştir
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="font-mono text-[10px] uppercase tracking-widest text-accent/70 hover:text-accent"
            >
              Sil
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="relative">
              <input
                type={visible ? 'text' : 'password'}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                placeholder={config.keyPlaceholder}
                className="w-full border-b border-line bg-transparent py-2 pr-8 font-mono text-sm text-ink placeholder-ink/30 outline-none transition-colors focus:border-accent"
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                className="absolute right-0 top-2.5 text-ink/30 hover:text-ink"
                tabIndex={-1}
              >
                {visible ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            {draft && !isValid && (
              <p className="font-mono text-[10px] uppercase tracking-wider text-accent">
                {config.label} anahtarı "{config.keyPrefix}" ile başlar
              </p>
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={!isValid || saved}
              className="self-start bg-ink px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-paper transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
            >
              Kaydet
            </button>

            <p className="font-mono text-[10px] uppercase tracking-widest text-ink/30">
              Tarayıcında saklanır · Hiçbir sunucuya gönderilmez
            </p>
          </div>
        )}
      </div>

      {/* Model selector */}
      {apiKey && (
        <div className="flex flex-col gap-2 border-t border-line pt-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink/50">
            Model
          </p>
          <div className="flex flex-col gap-1.5">
            {config.models.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setModel(m.value)}
                className={`border px-3 py-2 text-left font-mono text-[10px] uppercase tracking-wider transition-colors ${
                  model === m.value
                    ? 'border-ink bg-ink text-paper'
                    : m.paid
                      ? 'border-line text-ink/30 hover:border-ink/40 hover:text-ink/50'
                      : 'border-line text-ink/50 hover:border-ink hover:text-ink'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
