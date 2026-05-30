import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Loader2, Globe, Sparkles, MessageSquare, Trash2, Bot, User, Lightbulb } from 'lucide-react'
import { useJobSearch } from './useJobSearch'
import { useJobSearchStore } from '@/store/job-search-store'
import { useAIStore } from '@/store/ai-store'
import { useCVStore } from '@/store'
import { cn } from '@/lib/utils'

const SUGGESTIONS = [
  'Bana uygun frontend iş ilanları bul',
  "CV'mi geliştirmek için ne önerirsin?",
  "İstanbul'da uzaktan React pozisyonları",
  'Maaş beklentimi nasıl belirlemeliyim?',
  'Teknik mülakat için nasıl hazırlanmalıyım?',
]

export function JobChat() {
  const { sendChatMessage } = useJobSearch()
  const { messages, chatLoading, chatError, clearChat } = useJobSearchStore()
  const apiKey = useAIStore((s) => s.apiKey)
  const openAIPanel = useAIStore((s) => s.openPanel)
  const cv = useCVStore((s) => s.cv)
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = useCallback(() => {
    const text = input.trim()
    if (!text || chatLoading) return
    setInput('')
    sendChatMessage(text)
  }, [input, chatLoading, sendChatMessage])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
    },
    [handleSend],
  )

  /* ── No API key ─────────────────────────────────────────────── */
  if (!apiKey) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-line bg-paper py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-paper-warm">
          <MessageSquare size={20} className="text-ink/40" />
        </div>
        <div>
          <h3 className="font-sans text-base font-semibold text-ink">Kariyer Asistanı</h3>
          <p className="mt-1 text-sm text-ink/50">Sohbet başlatmak için API anahtarı gerekli.</p>
        </div>
        <button type="button" onClick={openAIPanel}
          className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-accent">
          <Sparkles size={14} /> AI Panelini Aç
        </button>
      </div>
    )
  }

  return (
    <div className="flex gap-6">

      {/* ── Left sidebar: context & suggestions ───────────────── */}
      <aside className="hidden w-56 shrink-0 lg:block">
        <div className="sticky top-6 flex flex-col gap-4 rounded-xl border border-line bg-paper p-4">
          {/* CV summary */}
          {(cv.personal.fullName || cv.personal.jobTitle) && (
            <div>
              <p className="mb-2 font-mono text-[9px] uppercase tracking-widest text-ink/40">Aday</p>
              {cv.personal.fullName && (
                <p className="text-sm font-semibold text-ink">{cv.personal.fullName}</p>
              )}
              {cv.personal.jobTitle && (
                <p className="text-xs text-ink/50">{cv.personal.jobTitle}</p>
              )}
              {cv.contact.location && (
                <p className="mt-0.5 text-xs text-ink/40">{cv.contact.location}</p>
              )}
            </div>
          )}

          {cv.skills.length > 0 && (
            <div>
              <p className="mb-2 font-mono text-[9px] uppercase tracking-widest text-ink/40">Yetenekler</p>
              <div className="flex flex-wrap gap-1">
                {cv.skills.slice(0, 8).map((s) => (
                  <span key={s.id} className="rounded-full bg-paper-warm px-2 py-0.5 text-[11px] text-ink/60">
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          <div className="border-t border-line/60 pt-3">
            <div className="mb-2 flex items-center gap-1.5">
              <Lightbulb size={11} className="text-ink/30" />
              <p className="font-mono text-[9px] uppercase tracking-widest text-ink/30">Öneriler</p>
            </div>
            <div className="flex flex-col gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setInput(s)}
                  className="rounded-lg px-2.5 py-1.5 text-left text-xs text-ink/50 transition-colors hover:bg-paper-warm hover:text-ink/80"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Clear chat */}
          {messages.length > 0 && (
            <button type="button" onClick={clearChat}
              className="flex items-center gap-1.5 text-xs text-ink/30 transition-colors hover:text-accent">
              <Trash2 size={11} /> Sohbeti temizle
            </button>
          )}
        </div>
      </aside>

      {/* ── Chat area ─────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-line bg-paper">

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-line bg-paper-warm/30 px-5 py-3.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ink/10">
            <Bot size={15} className="text-ink/60" />
          </div>
          <div className="flex-1">
            <p className="font-sans text-sm font-semibold text-ink">Kariyer Asistanı</p>
            <p className="font-mono text-[9px] uppercase tracking-widest text-ink/30">
              Google arama entegrasyonuyla
            </p>
          </div>
          {messages.length > 0 && (
            <button type="button" onClick={clearChat}
              className="flex h-7 w-7 items-center justify-center rounded-md text-ink/30 transition-colors hover:bg-paper hover:text-accent lg:hidden">
              <Trash2 size={14} />
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-5" style={{ minHeight: 400 }}>
          {messages.length === 0 && (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 py-12">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-paper-warm">
                <Sparkles size={22} className="text-ink/25" />
              </div>
              <div className="text-center">
                <p className="font-sans text-sm font-medium text-ink/50">Kariyer soruların için buradayım</p>
                <p className="mt-1 text-xs text-ink/30">Sol taraftaki önerilerden birini seç ya da kendin yaz</p>
              </div>
              {/* Mobile suggestions */}
              <div className="flex flex-wrap justify-center gap-2 pt-1 lg:hidden">
                {SUGGESTIONS.slice(0, 3).map((s) => (
                  <button key={s} type="button" onClick={() => setInput(s)}
                    className="rounded-full border border-line px-3.5 py-1.5 text-xs text-ink/50 transition-colors hover:border-accent/50 hover:text-ink/70">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id}
              className={cn('flex items-end gap-2.5', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
              <div className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                msg.role === 'user' ? 'bg-ink text-paper' : 'border border-line bg-paper-warm text-ink/50',
              )}>
                {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
              </div>
              <div className={cn(
                'max-w-[80%] rounded-2xl px-4 py-3',
                msg.role === 'user'
                  ? 'rounded-br-sm bg-ink text-paper'
                  : 'rounded-bl-sm border border-line bg-paper-warm/60',
              )}>
                <p className={cn('whitespace-pre-wrap text-sm leading-relaxed',
                  msg.role === 'user' ? 'text-paper' : 'text-ink')}>
                  {msg.text || (
                    <span className="flex items-center gap-1.5 opacity-50">
                      <Loader2 size={11} className="animate-spin" />
                      <span className="font-mono text-[10px] uppercase tracking-widest">Yazıyor...</span>
                    </span>
                  )}
                </p>
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 border-t border-line/40 pt-2">
                    <Globe size={10} className="mt-0.5 shrink-0 text-ink/30" />
                    {msg.sources.slice(0, 4).map((s, i) => (
                      <a key={i} href={s.uri} target="_blank" rel="noreferrer"
                        className="text-xs text-ink/40 underline-offset-2 hover:text-accent hover:underline">
                        {s.title || new URL(s.uri).hostname}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {chatError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400">
              {chatError}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex items-end gap-3 border-t border-line bg-paper-warm/30 px-4 py-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Mesajını yaz... (Enter ile gönder)"
            rows={1}
            className="flex-1 resize-none rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink outline-none placeholder-ink/30 focus:border-accent"
            style={{ minHeight: '38px', maxHeight: '120px' }}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || chatLoading}
            className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-lg bg-ink text-paper transition-colors hover:bg-accent disabled:opacity-40"
          >
            {chatLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>
      </div>
    </div>
  )
}
