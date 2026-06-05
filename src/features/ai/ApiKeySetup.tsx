import { useState } from 'react'
import {
  Eye, EyeOff, ExternalLink, CheckCircle,
  Loader2, XCircle, FlaskConical,
} from 'lucide-react'
import { useAIStore, GEMINI_CONFIG } from '@/store/ai-store'
import { isValidKeyFormat } from '@/lib/ai-client'

type TestState = 'idle' | 'loading' | 'ok' | 'error'

async function testGeminiKey(key: string): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`,
      { signal: AbortSignal.timeout(8000) },
    )
    if (res.ok) return { ok: true }
    const data = await res.json().catch(() => ({}))
    const msg: string = data?.error?.message ?? 'Anahtar geçersiz veya yetkisiz.'
    return { ok: false, message: msg }
  } catch {
    return { ok: false, message: 'Bağlantı kurulamadı. İnternet bağlantını kontrol et.' }
  }
}

export function ApiKeySetup() {
  const { apiKey, model, setApiKey, setModel } = useAIStore()
  const [draft, setDraft] = useState(apiKey)
  const [visible, setVisible] = useState(false)
  const [editing, setEditing] = useState(!apiKey)
  const [testState, setTestState] = useState<TestState>('idle')
  const [testError, setTestError] = useState('')

  const config = GEMINI_CONFIG
  const isValid = isValidKeyFormat(draft)
  const saved = draft === apiKey && !!apiKey

  const handleSave = () => {
    if (!isValid) return
    setApiKey(draft.trim())
    setEditing(false)
    setTestState('idle')
  }

  const handleClear = () => {
    setApiKey('')
    setDraft('')
    setEditing(true)
    setTestState('idle')
  }

  const handleTest = async () => {
    if (!isValid) return
    setTestState('loading')
    setTestError('')
    const result = await testGeminiKey(draft.trim())
    if (result.ok) {
      setTestState('ok')
    } else {
      setTestState('error')
      setTestError(result.message)
    }
  }

  return (
    <div className="flex flex-col gap-5 border border-line bg-paper-cool/50 p-4">

      {/* ── Başlık ──────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-widest text-ink/50">
          Google Gemini · AI Kurulumu
        </p>
        <span className="rounded-full border border-accent/30 bg-accent/5 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-accent">
          Ücretsiz
        </span>
      </div>

      {/* ── Anahtar Kayıtlı ─────────────────────────────── */}
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
        <>
          {/* ── 3 Adım Rehberi ────────────────────────────── */}
          <ol className="flex flex-col gap-2.5">
            {[
              {
                step: '01',
                text: 'Aşağıdaki bağlantıya tıkla → Google hesabınla giriş yap',
                link: { href: config.consoleUrl, label: 'Google AI Studio\'yu Aç' },
              },
              {
                step: '02',
                text: '"Create API key" butonuna tıkla → anahtarı kopyala',
              },
              {
                step: '03',
                text: 'Kopyaladığın anahtarı aşağıya yapıştır → Kaydet',
              },
            ].map(({ step, text, link }) => (
              <li key={step} className="flex gap-3">
                <span className="mt-0.5 shrink-0 font-mono text-[10px] font-medium text-ink/30">
                  {step}
                </span>
                <div className="flex flex-col gap-1">
                  <p className="font-mono text-[10px] leading-relaxed text-ink/60">{text}</p>
                  {link && (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-accent transition-colors hover:text-ink"
                    >
                      {link.label} <ExternalLink size={9} />
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ol>

          <div className="border-t border-line" />

          {/* ── Input ────────────────────────────────────── */}
          <div className="flex flex-col gap-3">
            <div className="relative">
              <input
                type={visible ? 'text' : 'password'}
                value={draft}
                onChange={(e) => { setDraft(e.target.value); setTestState('idle') }}
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
                Anahtar "AIza..." veya "AQ...." ile başlamalı
              </p>
            )}

            {/* ── Test sonucu ──────────────────────────── */}
            {testState === 'ok' && (
              <div className="flex items-center gap-2">
                <CheckCircle size={12} className="text-accent" />
                <p className="font-mono text-[10px] uppercase tracking-wider text-accent">
                  Anahtar geçerli — kaydedebilirsin
                </p>
              </div>
            )}
            {testState === 'error' && (
              <div className="flex items-start gap-2">
                <XCircle size={12} className="mt-0.5 shrink-0 text-red-400" />
                <p className="font-mono text-[10px] leading-relaxed text-red-400">
                  {testError}
                </p>
              </div>
            )}

            {/* ── Butonlar ─────────────────────────────── */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={!isValid || saved}
                className="bg-ink px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-paper transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
              >
                Kaydet
              </button>
              <button
                type="button"
                onClick={handleTest}
                disabled={!isValid || testState === 'loading'}
                className="flex items-center gap-1.5 border border-line px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-ink/50 transition-colors hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
              >
                {testState === 'loading'
                  ? <><Loader2 size={10} className="animate-spin" /> Test ediliyor…</>
                  : <><FlaskConical size={10} /> Test Et</>
                }
              </button>
            </div>

            <p className="font-mono text-[10px] uppercase tracking-widest text-ink/30">
              Tarayıcında saklanır · Hiçbir sunucuya gönderilmez
            </p>
          </div>
        </>
      )}

      {/* ── Model Seçici (anahtar varsa) ─────────────────── */}
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
