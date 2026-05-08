import { Sparkles } from 'lucide-react'
import { useCVStore } from '@/store'
import { useAIStream } from './useAIStream'
import { AIResultBox } from './AIResultBox'
import { buildSummaryPrompt } from '@/lib/prompts'

export function SummaryAI() {
  const cv = useCVStore((s) => s.cv)
  const updateSummary = useCVStore((s) => s.updateSummary)
  const { result, loading, error, run, reset } = useAIStream()

  const handleApply = () => {
    if (result) {
      updateSummary(result.trim())
      reset()
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-relaxed text-ink/60">
        Deneyim, yetenek ve eğitim bilgilerini okuyarak CV'ne özel bir profil özeti
        üretir. Uygula butonuyla tek tıkla özet alanına yazar.
      </p>

      <button
        type="button"
        onClick={() => run(buildSummaryPrompt(cv))}
        disabled={loading}
        className="inline-flex items-center gap-2 self-start bg-ink px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-paper transition-colors hover:bg-accent disabled:opacity-50"
      >
        <Sparkles size={12} className={loading ? 'animate-pulse' : ''} />
        {loading ? 'Yazıyor...' : 'Özet Oluştur'}
      </button>

      <AIResultBox
        result={result}
        loading={loading}
        error={error}
        onApply={handleApply}
        applyLabel="Özete Uygula"
        placeholder="Oluşturulan özet burada akacak..."
      />
    </div>
  )
}
