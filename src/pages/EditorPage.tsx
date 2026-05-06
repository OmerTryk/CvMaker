import { useEffect, useState, useRef } from 'react'
import {
  Sparkles,
  RotateCcw,
  Download,
  Upload,
  Check,
  Save,
  AlertCircle,
} from 'lucide-react'
import { useCVStore } from '@/store'
import { EditorShell } from '@/features/editor'
import { formatRelative } from '@/utils/date'
import { cn } from '@/lib/utils'

export function EditorPage() {
  const title = useCVStore((s) => s.cv.title)
  const lastSavedAt = useCVStore((s) => s.lastSavedAt)
  const updateTitle = useCVStore((s) => s.updateTitle)
  const loadSample = useCVStore((s) => s.loadSample)
  const resetCV = useCVStore((s) => s.resetCV)
  const exportJSON = useCVStore((s) => s.exportJSON)
  const importJSON = useCVStore((s) => s.importJSON)

  const [toast, setToast] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)
  const [, force] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  // Tick every 30s so "x saniye önce" stays fresh
  useEffect(() => {
    const t = setInterval(() => force((n) => n + 1), 30_000)
    return () => clearInterval(t)
  }, [])

  // Auto-dismiss toast
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
    <div className="container-prose py-10 md:py-14">
      {/* Top bar */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex-1">
          <p className="font-mono text-xs uppercase tracking-widest text-ink/50">
            Sprint 02 · Form Editor
          </p>
          <input
            value={title}
            onChange={(e) => updateTitle(e.target.value)}
            className="mt-3 w-full max-w-xl border-b border-transparent bg-transparent font-display text-3xl font-light tracking-tight text-ink outline-none transition-colors duration-200 hover:border-line focus:border-accent md:text-4xl"
            placeholder="CV başlığı..."
          />
        </div>

        <div className="flex shrink-0 items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-ink/50">
          <Save size={12} className="text-accent" />
          <span>{formatRelative(lastSavedAt)}</span>
        </div>
      </div>

      {/* Sticky action bar */}
      <div className="sticky top-0 z-30 -mx-6 mb-8 flex flex-wrap items-center gap-1 border-b border-line bg-paper/95 px-6 py-3 backdrop-blur-sm md:-mx-10 md:px-10">
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
        <div className="ml-auto">
          <ToolbarButton
            onClick={handleReset}
            icon={<RotateCcw size={12} />}
            danger
          >
            Sıfırla
          </ToolbarButton>
        </div>
      </div>

      {/* The editor itself */}
      <EditorShell />

      {/* Footnote about preview */}
      <div className="mt-16 border-l-2 border-accent pl-6">
        <p className="font-mono text-[10px] uppercase tracking-widest text-ink/40">
          Note · Sprint 03
        </p>
        <p className="mt-2 font-display text-base italic leading-relaxed text-ink/70">
          Canlı önizleme ve şablon seçici Sprint 3'te geliyor — şu an form girişi
          ve verilerin localStorage'a kaydı tamamen çalışıyor.
        </p>
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
// Toolbar button — internal helper
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
        'inline-flex items-center gap-2 px-3 py-2 font-mono text-[10px] uppercase tracking-widest transition-all duration-200',
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
