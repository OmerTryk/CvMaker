import { useRef, useCallback, useEffect } from 'react'
import { X, Upload, Loader2, CheckCircle2, AlertCircle, FileText, Sparkles } from 'lucide-react'
import { useCVImport } from './useCVImport'
import { useCVStore } from '@/store'
import { useAIStore } from '@/store/ai-store'
import { cn } from '@/lib/utils'

interface ImportPDFModalProps {
  onClose: () => void
  onSuccess: (msg: string) => void
}

export function ImportPDFModal({ onClose, onSuccess }: ImportPDFModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { phase, error, progress, result, importFromPDF, cancel, reset } = useCVImport()
  const loadCV = useCVStore((s) => s.loadCV)
  const currentId = useCVStore((s) => s.cv.id)
  const apiKey = useAIStore((s) => s.apiKey)
  const openAIPanel = useAIStore((s) => s.openPanel)

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (phase === 'idle' || phase === 'error' || phase === 'preview') {
          handleClose()
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  const handleClose = useCallback(() => {
    cancel()
    onClose()
  }, [cancel, onClose])

  const handleFile = useCallback(
    (file: File) => {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        return
      }
      importFromPDF(file)
    },
    [importFromPDF],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile],
  )

  const handleConfirm = useCallback(() => {
    if (!result) return
    // Replace the current CV in place (keep its id) so it updates the
    // existing cv-list entry instead of orphaning it.
    loadCV({ ...result.cv, id: currentId })
    onSuccess('CV başarıyla yüklendi')
    onClose()
  }, [result, loadCV, currentId, onSuccess, onClose])

  const cv = result?.cv

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="relative w-full max-w-lg border border-line bg-paper shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-2">
            <FileText size={14} className="text-ink/50" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink">
              PDF'ten İçe Aktar
            </span>
          </div>
          {(phase === 'idle' || phase === 'error' || phase === 'preview') && (
            <button
              type="button"
              onClick={handleClose}
              className="text-ink/40 transition-colors hover:text-ink"
              aria-label="Kapat"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="px-5 py-5">
          {/* No API key */}
          {!apiKey && (
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3 border border-accent/30 bg-accent/5 px-4 py-3">
                <AlertCircle size={14} className="mt-0.5 shrink-0 text-accent" />
                <p className="font-mono text-[10px] uppercase leading-relaxed tracking-wider text-accent">
                  Bu özellik AI gerektirir. Lütfen önce bir API anahtarı gir.
                </p>
              </div>
              <button
                type="button"
                onClick={() => { handleClose(); openAIPanel() }}
                className="flex items-center gap-2 self-start bg-ink px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-paper transition-colors hover:bg-accent"
              >
                <Sparkles size={11} />
                AI Panelini Aç
              </button>
            </div>
          )}

          {/* Idle — drop zone */}
          {apiKey && phase === 'idle' && (
            <div className="flex flex-col gap-4">
              <div
                className="flex cursor-pointer flex-col items-center justify-center gap-3 border border-dashed border-line py-10 transition-colors hover:border-ink"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                <Upload size={24} className="text-ink/30" />
                <div className="text-center">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-ink/60">
                    PDF dosyasını buraya sürükle
                  </p>
                  <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-ink/30">
                    veya tıkla
                  </p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) handleFile(f)
                  e.target.value = ''
                }}
              />
              <p className="font-mono text-[9px] uppercase tracking-wider text-ink/30">
                PDF içeriği seçtiğin AI sağlayıcısına gönderilir.
              </p>
            </div>
          )}

          {/* Extracting */}
          {apiKey && phase === 'extracting' && (
            <div className="flex flex-col items-center gap-4 py-10">
              <Loader2 size={24} className="animate-spin text-ink/40" />
              <p className="font-mono text-[10px] uppercase tracking-widest text-ink/60">
                PDF okunuyor...
              </p>
            </div>
          )}

          {/* Parsing */}
          {apiKey && phase === 'parsing' && (
            <div className="flex flex-col items-center gap-4 py-10">
              <Loader2 size={24} className="animate-spin text-accent" />
              <div className="text-center">
                <p className="font-mono text-[10px] uppercase tracking-widest text-ink/60">
                  AI işliyor...
                </p>
                {progress && (
                  <p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-ink/30">
                    {progress}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={cancel}
                className="font-mono text-[9px] uppercase tracking-widest text-ink/40 transition-colors hover:text-accent"
              >
                İptal
              </button>
            </div>
          )}

          {/* Preview */}
          {apiKey && phase === 'preview' && cv && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 border border-line/50 bg-paper-cool/30 px-4 py-3">
                <CheckCircle2 size={13} className="shrink-0 text-accent" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-ink/70">
                  Çıkarım tamamlandı — {result?.fileName}
                </span>
              </div>

              {/* Extracted summary */}
              <div className="flex flex-col gap-2.5">
                {cv.personal.fullName && (
                  <Row label="Ad" value={cv.personal.fullName} />
                )}
                {cv.personal.jobTitle && (
                  <Row label="Pozisyon" value={cv.personal.jobTitle} />
                )}
                {cv.contact.email && (
                  <Row label="E-posta" value={cv.contact.email} />
                )}
                {cv.contact.location && (
                  <Row label="Konum" value={cv.contact.location} />
                )}
                <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1.5">
                  <Counter n={cv.experience.length}   label="deneyim" />
                  <Counter n={cv.education.length}    label="eğitim" />
                  <Counter n={cv.skills.length}       label="yetenek" />
                  <Counter n={cv.languages.length}    label="dil" />
                  {cv.projects.length > 0 && (
                    <Counter n={cv.projects.length}   label="proje" />
                  )}
                  {cv.certificates.length > 0 && (
                    <Counter n={cv.certificates.length} label="sertifika" />
                  )}
                </div>
              </div>

              <p className="font-mono text-[9px] uppercase tracking-wider text-ink/30">
                Mevcut CV'nin üzerine yazılacak. Onaylamadan önce önizlemeyi kontrol edebilirsin.
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="bg-ink px-5 py-2 font-mono text-[10px] uppercase tracking-widest text-paper transition-colors hover:bg-accent"
                >
                  Editöre Yükle
                </button>
                <button
                  type="button"
                  onClick={reset}
                  className="border border-line px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-ink/60 transition-colors hover:border-ink hover:text-ink"
                >
                  Başka PDF Seç
                </button>
              </div>
            </div>
          )}

          {/* Error */}
          {phase === 'error' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3 border border-accent/30 bg-accent/5 px-4 py-3">
                <AlertCircle size={14} className="mt-0.5 shrink-0 text-accent" />
                <p className="font-mono text-[10px] uppercase leading-relaxed tracking-wider text-accent">
                  {error}
                </p>
              </div>
              <div className="flex gap-2">
                {apiKey && (
                  <button
                    type="button"
                    onClick={reset}
                    className="bg-ink px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-paper transition-colors hover:bg-accent"
                  >
                    Tekrar Dene
                  </button>
                )}
                {!apiKey && (
                  <button
                    type="button"
                    onClick={() => { handleClose(); openAIPanel() }}
                    className="flex items-center gap-2 bg-ink px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-paper transition-colors hover:bg-accent"
                  >
                    <Sparkles size={11} />
                    AI Panelini Aç
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleClose}
                  className={cn(
                    'border border-line px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-ink/60',
                    'transition-colors hover:border-ink hover:text-ink',
                  )}
                >
                  Kapat
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="w-20 shrink-0 font-mono text-[9px] uppercase tracking-widest text-ink/40">
        {label}
      </span>
      <span className="font-mono text-[11px] text-ink/80">{value}</span>
    </div>
  )
}

function Counter({ n, label }: { n: number; label: string }) {
  return (
    <span className="font-mono text-[10px] uppercase tracking-widest text-ink/60">
      <span className="text-ink">{n}</span> {label}
    </span>
  )
}
