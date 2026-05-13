import { useEffect, useRef, useState, useCallback } from 'react'
import {
  Sparkles,
  RotateCcw,
  Download,
  Upload,
  Check,
  Save,
  AlertCircle,
  Edit3,
  Eye,
  ExternalLink,
} from 'lucide-react'
import { useCVStore } from '@/store'
import { useAIStore, PROVIDERS } from '@/store/ai-store'
import { isValidKeyFormat } from '@/lib/ai-client'
import { EditorShell } from '@/features/editor'
import { WelcomeBanner } from '@/features/editor/WelcomeBanner'
import { PreviewPane } from '@/features/preview'
import { CVScoreWidget } from '@/features/score/CVScoreWidget'
import { JobMatchWidget } from '@/features/score/JobMatchWidget'
import { useKeyboardShortcuts, META_LABEL } from '@/hooks/useKeyboardShortcuts'
import { formatRelative } from '@/utils/date'
import { cn } from '@/lib/utils'

type MobileView = 'editor' | 'preview'

/** CV is considered "empty" when the user hasn't added any real content. */
function useIsCVEmpty() {
  const cv = useCVStore((s) => s.cv)
  return (
    !cv.personal.fullName &&
    cv.experience.length === 0 &&
    cv.education.length === 0 &&
    cv.skills.length === 0 &&
    !cv.summary.content
  )
}

export function EditorPage() {
  const title = useCVStore((s) => s.cv.title)
  const lastSavedAt = useCVStore((s) => s.lastSavedAt)
  const updateTitle = useCVStore((s) => s.updateTitle)
  const loadSample = useCVStore((s) => s.loadSample)
  const resetCV = useCVStore((s) => s.resetCV)
  const exportJSON = useCVStore((s) => s.exportJSON)
  const importJSON = useCVStore((s) => s.importJSON)

  const { apiKey, provider, setApiKey } = useAIStore()
  const [keyDraft, setKeyDraft] = useState('')
  const cfg = PROVIDERS[provider]
  const keyValid = isValidKeyFormat(keyDraft, cfg.keyPrefix)
  const handleSaveKey = useCallback(() => {
    if (!keyValid) return
    setApiKey(keyDraft.trim())
    setKeyDraft('')
  }, [keyDraft, keyValid, setApiKey])

  const isEmpty = useIsCVEmpty()
  const [mobileView, setMobileView] = useState<MobileView>('editor')
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)
  const [, force] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  // For triggering PDF export via keyboard shortcut
  const exportBtnRef = useRef<{ triggerPrint: () => void }>(null)

  // Refresh "X saniye önce" label every 30s
  useEffect(() => {
    const t = setInterval(() => force((n) => n + 1), 30_000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2800)
    return () => clearTimeout(t)
  }, [toast])

  const showToast = useCallback(
    (type: 'ok' | 'err', msg: string) => setToast({ type, msg }),
    [],
  )

  const handleExport = useCallback(() => {
    const json = exportJSON()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.replace(/\s+/g, '-').toLowerCase() || 'cv'}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('ok', 'JSON dosyası indirildi')
  }, [exportJSON, title, showToast])

  const handleImport = useCallback(
    async (file: File) => {
      const text = await file.text()
      const result = importJSON(text)
      showToast(
        result.success ? 'ok' : 'err',
        result.success ? 'CV başarıyla yüklendi' : `Hata: ${result.error}`,
      )
    },
    [importJSON, showToast],
  )

  const handleReset = useCallback(() => {
    if (confirm('Tüm veriler silinecek. Emin misin?')) {
      resetCV()
      showToast('ok', 'CV sıfırlandı')
    }
  }, [resetCV, showToast])

  const handleLoadSample = useCallback(() => {
    loadSample()
    showToast('ok', 'Örnek CV yüklendi')
  }, [loadSample, showToast])

  // ── Keyboard shortcuts ──────────────────────────────────────────
  useKeyboardShortcuts([
    {
      key: 'e',
      meta: true,
      handler: (e) => {
        e.preventDefault()
        handleLoadSample()
      },
    },
    {
      key: 'j',
      meta: true,
      handler: (e) => {
        e.preventDefault()
        handleExport()
      },
    },
    {
      key: 'r',
      meta: true,
      shift: true,
      handler: (e) => {
        e.preventDefault()
        handleReset()
      },
    },
    {
      key: 'p',
      meta: true,
      handler: (e) => {
        e.preventDefault()
        // Trigger print via the ExportButton's ref
        exportBtnRef.current?.triggerPrint()
      },
    },
  ])

  return (
    <div className="mx-auto w-full max-w-[1500px] px-6 py-8 md:px-10 md:py-10">
      {/* TOP BAR */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex-1">
          <input
            value={title}
            onChange={(e) => updateTitle(e.target.value)}
            className="mt-2 w-full max-w-xl border-b border-transparent bg-transparent font-display text-3xl font-light tracking-tight text-ink outline-none transition-colors duration-200 hover:border-line focus:border-accent md:text-4xl"
            placeholder="CV başlığı..."
          />
        </div>

        <div className="flex shrink-0 items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-ink/50">
          <Save size={12} className="text-accent" />
          <span>{formatRelative(lastSavedAt)}</span>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="sticky top-0 z-30 mb-6 flex flex-wrap items-center gap-1 border border-line bg-paper/95 px-3 py-2 backdrop-blur-sm">
        <ToolbarButton
          onClick={handleLoadSample}
          icon={<Sparkles size={12} />}
          shortcut={`${META_LABEL}+E`}
        >
          Örnek yükle
        </ToolbarButton>

        <ToolbarButton
          onClick={handleExport}
          icon={<Download size={12} />}
          shortcut={`${META_LABEL}+J`}
        >
          JSON indir
        </ToolbarButton>

        <ToolbarButton
          onClick={() => fileRef.current?.click()}
          icon={<Upload size={12} />}
        >
          JSON yükle
        </ToolbarButton>

        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) handleImport(f)
            e.target.value = ''
          }}
        />

        <div className="mx-2 hidden h-5 w-px bg-line lg:block" />

        <div className="hidden lg:block">
          <ExportButtonWithRef ref={exportBtnRef} />
        </div>

        {/* Mobile view toggle */}
        <div className="ml-auto flex items-center gap-1 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileView('editor')}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors',
              mobileView === 'editor' ? 'bg-ink text-paper' : 'text-ink/50 hover:text-ink',
            )}
          >
            <Edit3 size={11} /> Editör
          </button>
          <button
            type="button"
            onClick={() => setMobileView('preview')}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors',
              mobileView === 'preview' ? 'bg-ink text-paper' : 'text-ink/50 hover:text-ink',
            )}
          >
            <Eye size={11} /> Önizle
          </button>
        </div>

        <div className="hidden lg:ml-auto lg:block">
          <ToolbarButton
            onClick={handleReset}
            icon={<RotateCcw size={12} />}
            shortcut={`${META_LABEL}+⇧+R`}
            danger
          >
            Sıfırla
          </ToolbarButton>
        </div>
      </div>

      {/* AI KEY BANNER — only when no key */}
      {!apiKey && (
        <div className="mb-6 border border-line">
          <div className="flex items-center gap-2 border-b border-line bg-paper-warm px-4 py-2">
            <Sparkles size={12} className="shrink-0 text-accent" strokeWidth={1.5} />
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink/60">
              AI özelliklerini aktifleştir
            </span>
            <a
              href={cfg.consoleUrl}
              target="_blank"
              rel="noreferrer"
              className="ml-auto inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest text-ink/35 transition-colors hover:text-accent"
            >
              Ücretsiz anahtar al
              <ExternalLink size={9} />
            </a>
          </div>
          <div className="flex items-center gap-3 bg-paper px-4 py-3">
            <input
              type="password"
              value={keyDraft}
              onChange={(e) => setKeyDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveKey()}
              placeholder={cfg.keyPlaceholder}
              autoComplete="off"
              spellCheck={false}
              className="flex-1 border-b border-line bg-transparent py-1.5 font-mono text-xs text-ink placeholder-ink/25 outline-none transition-colors focus:border-accent"
            />
            <button
              type="button"
              onClick={handleSaveKey}
              disabled={!keyValid}
              className="shrink-0 bg-ink px-4 py-1.5 font-mono text-[9px] uppercase tracking-widest text-paper transition-colors hover:bg-accent disabled:opacity-40"
            >
              Kaydet
            </button>
          </div>
        </div>
      )}

      {/* SCORES */}
      <CVScoreWidget />

      {/* JOB MATCH */}
      <JobMatchWidget />

      {/* WELCOME BANNER — only when empty */}
      {isEmpty && <WelcomeBanner />}

      {/* SPLIT VIEW */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10">
        <div className={cn('min-w-0', mobileView === 'preview' && 'hidden lg:block')}>
          <EditorShell />
        </div>

        <div className={cn('min-w-0', mobileView === 'editor' && 'hidden lg:block')}>
          <div className="lg:sticky lg:top-20">
            <PreviewPane />
          </div>
        </div>
      </div>

      {/* Mobile bottom actions */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3 lg:hidden">
        <ExportButtonWithRef ref={exportBtnRef} />
        <ToolbarButton
          onClick={handleReset}
          icon={<RotateCcw size={12} />}
          danger
        >
          Sıfırla
        </ToolbarButton>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={cn(
            'fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 border px-5 py-3 font-mono text-xs uppercase tracking-widest shadow-lg animate-fade-up',
            toast.type === 'ok'
              ? 'border-ink bg-ink text-paper'
              : 'border-accent bg-accent text-paper',
          )}
        >
          {toast.type === 'ok' ? <Check size={14} /> : <AlertCircle size={14} />}
          {toast.msg}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// ExportButton wired to an imperative ref (for Ctrl+P)
// ─────────────────────────────────────────────────────────────

import { forwardRef, useImperativeHandle } from 'react'
import { usePDFExport } from '@/features/export'
import { PrintableCV } from '@/features/export/PrintableCV'
import { FileDown, Loader2 } from 'lucide-react'

const ExportButtonWithRef = forwardRef<{ triggerPrint: () => void }>((_, ref) => {
  const cv = useCVStore((s) => s.cv)
  const { ref: printRef, print, isPrinting } = usePDFExport()

  useImperativeHandle(ref, () => ({ triggerPrint: print }), [print])

  return (
    <>
      <button
        type="button"
        onClick={print}
        disabled={isPrinting}
        title={`PDF indir (${META_LABEL}+P)`}
        className="inline-flex items-center gap-2 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-ink/70 transition-all duration-200 hover:bg-ink hover:text-paper disabled:opacity-60"
      >
        {isPrinting ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          <FileDown size={12} />
        )}
        {isPrinting ? 'Hazırlanıyor...' : `PDF indir (${META_LABEL}+P)`}
      </button>

      <div className="print-source" aria-hidden="true">
        <PrintableCV ref={printRef} cv={cv} />
      </div>
    </>
  )
})

ExportButtonWithRef.displayName = 'ExportButtonWithRef'

// ─────────────────────────────────────────────────────────────

function ToolbarButton({
  onClick,
  icon,
  children,
  danger,
  shortcut,
}: {
  onClick: () => void
  icon: React.ReactNode
  children: React.ReactNode
  danger?: boolean
  shortcut?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={shortcut}
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-all duration-200',
        danger
          ? 'text-accent hover:bg-accent hover:text-paper'
          : 'text-ink/70 hover:bg-ink hover:text-paper',
      )}
    >
      {icon}
      {children}
    </button>
  )
}
