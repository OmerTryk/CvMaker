import { useEffect, useState, useRef } from 'react'
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
} from 'lucide-react'
import { useCVStore } from '@/store'
import { EditorShell } from '@/features/editor'
import { PreviewPane } from '@/features/preview'
import { ExportButton } from '@/features/export'
import { formatRelative } from '@/utils/date'
import { cn } from '@/lib/utils'

type MobileView = 'editor' | 'preview'

export function EditorPage() {
  const title = useCVStore((s) => s.cv.title)
  const lastSavedAt = useCVStore((s) => s.lastSavedAt)
  const updateTitle = useCVStore((s) => s.updateTitle)
  const loadSample = useCVStore((s) => s.loadSample)
  const resetCV = useCVStore((s) => s.resetCV)
  const exportJSON = useCVStore((s) => s.exportJSON)
  const importJSON = useCVStore((s) => s.importJSON)

  const [mobileView, setMobileView] = useState<MobileView>('editor')
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)
  const [, force] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const t = setInterval(() => force((n) => n + 1), 30_000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2800)
    return () => clearTimeout(t)
  }, [toast])

  const handleExport = () => {
    const json = exportJSON()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.replace(/\s+/g, '-').toLowerCase() || 'cv'}.json`
    a.click()
    URL.revokeObjectURL(url)
    setToast({ type: 'ok', msg: 'JSON dosyası indirildi' })
  }

  const handleImport = async (file: File) => {
    const text = await file.text()
    const result = importJSON(text)
    setToast(
      result.success
        ? { type: 'ok', msg: 'CV başarıyla yüklendi' }
        : { type: 'err', msg: `Hata: ${result.error}` },
    )
  }

  const handleReset = () => {
    if (confirm('Tüm veriler silinecek. Emin misin?')) {
      resetCV()
      setToast({ type: 'ok', msg: 'CV sıfırlandı' })
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1500px] px-6 py-8 md:px-10 md:py-10">
      {/* TOP BAR */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex-1">
          <p className="font-mono text-xs uppercase tracking-widest text-ink/50">
            Sprint 03 · Live Preview
          </p>
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
        <ToolbarButton onClick={loadSample} icon={<Sparkles size={12} />}>
          Örnek yükle
        </ToolbarButton>
        <ToolbarButton onClick={handleExport} icon={<Download size={12} />}>
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

        {/* PDF export — prominent */}
        <div className="mx-2 hidden h-5 w-px bg-line lg:block" />
        <div className="hidden lg:block">
          <ExportButton variant="subtle" label="PDF indir" />
        </div>

        {/* Mobile-only view toggle */}
        <div className="ml-auto flex items-center gap-1 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileView('editor')}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors',
              mobileView === 'editor'
                ? 'bg-ink text-paper'
                : 'text-ink/50 hover:text-ink',
            )}
          >
            <Edit3 size={11} /> Editör
          </button>
          <button
            type="button"
            onClick={() => setMobileView('preview')}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors',
              mobileView === 'preview'
                ? 'bg-ink text-paper'
                : 'text-ink/50 hover:text-ink',
            )}
          >
            <Eye size={11} /> Önizle
          </button>
        </div>

        <div className="hidden lg:ml-auto lg:block">
          <ToolbarButton
            onClick={handleReset}
            icon={<RotateCcw size={12} />}
            danger
          >
            Sıfırla
          </ToolbarButton>
        </div>
      </div>

      {/* SPLIT VIEW */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10">
        {/* EDITOR */}
        <div
          className={cn(
            'min-w-0',
            mobileView === 'preview' && 'hidden lg:block',
          )}
        >
          <EditorShell />
        </div>

        {/* PREVIEW */}
        <div
          className={cn(
            'min-w-0',
            mobileView === 'editor' && 'hidden lg:block',
          )}
        >
          <div className="lg:sticky lg:top-20">
            <PreviewPane />
          </div>
        </div>
      </div>

      {/* Mobile-only Reset & Export at bottom */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3 lg:hidden">
        <ExportButton variant="primary" />
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

function ToolbarButton({
  onClick,
  icon,
  children,
  danger,
}: {
  onClick: () => void
  icon: React.ReactNode
  children: React.ReactNode
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
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
