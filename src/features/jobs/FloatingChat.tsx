import { useState, useRef, useEffect, useCallback } from 'react'
import {
  MessageSquare, X, Send, Loader2, Bot, User,
  Globe, Sparkles, Minimize2, Trash2,
} from 'lucide-react'
import { useJobSearch } from './useJobSearch'
import { useJobSearchStore } from '@/store/job-search-store'
import { useAIStore } from '@/store/ai-store'
import { cn } from '@/lib/utils'

const SUGGESTIONS = [
  'CV\'me uygun iş ilanları bul',
  'CV\'mi nasıl geliştirebilirim?',
  'Teknik mülakata nasıl hazırlanmalıyım?',
]

export function FloatingChat() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const { sendChatMessage } = useJobSearch()
  const { messages, chatLoading, chatError, clearChat } = useJobSearchStore()
  const apiKey = useAIStore((s) => s.apiKey)
  const provider = useAIStore((s) => s.provider)
  const openAIPanel = useAIStore((s) => s.openPanel)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll on new messages
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  // Focus input when panel opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150)
  }, [open])

  const unread = messages.length > 0

  const handleSend = useCallback(() => {
    const text = input.trim()
    if (!text || chatLoading) return
    setInput('')
    sendChatMessage(text)
  }, [input, chatLoading, sendChatMessage])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend],
  )

  return (
    <>
      {/* ── Chat panel ──────────────────────────────────────────── */}
      <div className={cn(
        'fixed bottom-20 right-4 z-50 flex w-[calc(100vw-2rem)] max-w-[360px] flex-col overflow-hidden rounded-2xl border border-line bg-paper shadow-2xl sm:bottom-24 sm:right-6',
        'transition-all duration-300 ease-out',
        open
          ? 'translate-y-0 scale-100 opacity-100'
          : 'pointer-events-none translate-y-4 scale-95 opacity-0',
      )} style={{ maxHeight: 'min(520px, calc(100vh - 120px))' }}>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-line bg-ink px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
            <Bot size={15} className="text-paper" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-paper">Kariyer Asistanı</p>
            <p className="font-mono text-[9px] uppercase tracking-widest text-paper/40">
              {provider === 'gemini' ? 'Google arama · aktif' : apiKey ? 'Groq · aktif' : 'API anahtarı gerekli'}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                type="button"
                onClick={clearChat}
                title="Sohbeti temizle"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-paper/40 transition-colors hover:bg-white/10 hover:text-paper"
              >
                <Trash2 size={13} />
              </button>
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-paper/40 transition-colors hover:bg-white/10 hover:text-paper"
            >
              <Minimize2 size={13} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
          {!apiKey ? (
            /* No API key state */
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-paper-warm">
                <Sparkles size={20} className="text-ink/25" />
              </div>
              <p className="text-sm text-ink/50">Sohbet için API anahtarı gerekli</p>
              <button
                type="button"
                onClick={() => { openAIPanel(); setOpen(false) }}
                className="rounded-lg bg-ink px-3 py-1.5 text-xs font-medium text-paper transition-colors hover:bg-accent"
              >
                AI Panelini Aç
              </button>
            </div>
          ) : messages.length === 0 ? (
            /* Empty state */
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-paper-warm">
                <Sparkles size={20} className="text-ink/25" />
              </div>
              <p className="text-sm text-ink/50">Kariyer soruların için buradayım</p>
              <div className="flex w-full flex-col gap-1.5 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setInput(s)}
                    className="rounded-lg border border-line px-3 py-2 text-left text-xs text-ink/50 transition-colors hover:border-accent/50 hover:bg-paper-warm hover:text-ink/70"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Message list */
            messages.map((msg) => (
              <div
                key={msg.id}
                className={cn('flex items-end gap-2', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
              >
                <div className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                  msg.role === 'user' ? 'bg-ink text-paper' : 'border border-line bg-paper-warm text-ink/50',
                )}>
                  {msg.role === 'user' ? <User size={10} /> : <Bot size={10} />}
                </div>
                <div className={cn(
                  'max-w-[82%] rounded-2xl px-3 py-2',
                  msg.role === 'user'
                    ? 'rounded-br-sm bg-ink text-paper'
                    : 'rounded-bl-sm border border-line bg-paper-warm/60',
                )}>
                  <p className={cn(
                    'whitespace-pre-wrap text-sm leading-relaxed',
                    msg.role === 'user' ? 'text-paper' : 'text-ink',
                  )}>
                    {msg.text || (
                      <span className="flex items-center gap-1.5 opacity-50">
                        <Loader2 size={10} className="animate-spin" />
                        <span className="font-mono text-[9px] uppercase tracking-widest">Yazıyor...</span>
                      </span>
                    )}
                  </p>
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1 border-t border-line/40 pt-1.5">
                      <Globe size={9} className="mt-0.5 shrink-0 text-ink/30" />
                      {msg.sources.slice(0, 3).map((s, i) => (
                        <a
                          key={i}
                          href={s.uri}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-ink/40 underline-offset-2 hover:text-accent hover:underline"
                        >
                          {s.title || new URL(s.uri).hostname}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {chatError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-950/20 dark:text-red-400">
              {chatError}
            </p>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        {apiKey && (
          <div className="flex items-end gap-2 border-t border-line bg-paper-warm/30 px-3 py-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Mesajını yaz..."
              rows={1}
              className="flex-1 resize-none rounded-xl border border-line bg-paper px-3 py-2 text-sm text-ink outline-none placeholder-ink/30 focus:border-accent"
              style={{ minHeight: '36px', maxHeight: '100px' }}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || chatLoading}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink text-paper transition-colors hover:bg-accent disabled:opacity-40"
            >
              {chatLoading ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
            </button>
          </div>
        )}
      </div>

      {/* ── Trigger button ───────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all duration-300 sm:bottom-6 sm:right-6 sm:h-14 sm:w-14',
          open
            ? 'bg-ink/80 text-paper hover:bg-ink'
            : 'bg-ink text-paper hover:bg-accent',
        )}
        title="Kariyer Asistanı"
        aria-label="Kariyer Asistanı sohbet panelini aç"
      >
        <div className={cn('transition-all duration-300', open ? 'rotate-0 scale-100' : 'rotate-0 scale-100')}>
          {open ? <X size={20} /> : <MessageSquare size={20} />}
        </div>

        {/* Unread dot */}
        {!open && unread && (
          <span className="absolute right-1 top-1 h-3 w-3 rounded-full bg-accent ring-2 ring-paper" />
        )}
      </button>
    </>
  )
}
