import { ScanSearch } from 'lucide-react'
import { useCVStore } from '@/store'
import { useAIStream } from './useAIStream'
import { AIResultBox } from './AIResultBox'
import { buildAnalysisPrompt } from '@/lib/prompts'

export function AnalysisAI() {
  const cv = useCVStore((s) => s.cv)
  const { result, loading, error, run } = useAIStream()

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-relaxed text-ink/60">
        CV'nini bir işe alım uzmanı gözüyle inceler. Güçlü yönler, iyileştirme
        önerileri ve genel etki skoru verir.
      </p>

      <button
        type="button"
        onClick={() => run(buildAnalysisPrompt(cv))}
        disabled={loading}
        className="inline-flex items-center gap-2 self-start bg-ink px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-paper transition-colors hover:bg-accent disabled:opacity-50"
      >
        <ScanSearch size={12} className={loading ? 'animate-pulse' : ''} />
        {loading ? 'Analiz ediliyor...' : 'CV\'mi Analiz Et'}
      </button>

      <AIResultBox
        result={result}
        loading={loading}
        error={error}
        placeholder="Analiz raporu burada akacak..."
      />

      {result && !loading && (
        <p className="font-mono text-[10px] uppercase tracking-widest text-ink/40">
          Not: Bu analiz genel bir değerlendirmedir. Sektöre göre yorumla.
        </p>
      )}
    </div>
  )
}
