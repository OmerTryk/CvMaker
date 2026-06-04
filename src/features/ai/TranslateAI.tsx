import { useNavigate } from 'react-router-dom'
import { Languages, Loader2, AlertCircle } from 'lucide-react'
import { useCVStore, useCVListStore, useAIStore } from '@/store'
import { useCVTranslate } from './useCVTranslate'

export function TranslateAI() {
  const navigate = useNavigate()
  const cv = useCVStore((s) => s.cv)
  const loadCV = useCVStore((s) => s.loadCV)
  const saveSnapshot = useCVListStore((s) => s.saveSnapshot)
  const registerNew = useCVListStore((s) => s.registerNew)
  const closePanel = useAIStore((s) => s.closePanel)
  const { phase, error, progress, translate } = useCVTranslate()

  const loading = phase === 'translating'

  const handleTranslate = async () => {
    const translated = await translate(cv)
    if (!translated) return
    // Same flow as DashboardPage "new CV": snapshot current, register & load new.
    saveSnapshot(cv)
    registerNew(translated)
    loadCV(translated)
    closePanel()
    navigate('/editor')
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-relaxed text-ink/60">
        CV'ni profesyonel İngilizceye çevirir ve <strong>yeni bir CV</strong> olarak
        ekler. Türkçe orijinalin olduğu gibi kalır. Çeviri sonrası editörde gözden
        geçirebilirsin.
      </p>

      <button
        type="button"
        onClick={handleTranslate}
        disabled={loading}
        className="inline-flex items-center gap-2 self-start bg-ink px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-paper transition-colors hover:bg-accent disabled:opacity-50"
      >
        {loading ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          <Languages size={12} />
        )}
        {loading ? 'Çevriliyor...' : 'İngilizceye Çevir'}
      </button>

      {loading && progress && (
        <p className="font-mono text-[10px] uppercase tracking-widest text-ink/40">
          {progress}
        </p>
      )}

      {error && (
        <div className="flex items-start gap-3 border border-accent/30 bg-accent/5 p-4">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-accent" />
          <p className="text-sm text-ink/80">{error}</p>
        </div>
      )}

      <p className="font-mono text-[10px] uppercase tracking-widest text-ink/40">
        Özel adlar, şirketler, tarihler ve teknoloji adları korunur · Her zaman gözden geçir
      </p>
    </div>
  )
}
