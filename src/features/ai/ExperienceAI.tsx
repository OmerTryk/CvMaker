import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { useCVStore } from '@/store'
import { useAIStream } from './useAIStream'
import { AIResultBox } from './AIResultBox'
import { buildExperienceRewritePrompt } from '@/lib/prompts'
import { Select } from '@/components/ui'

export function ExperienceAI() {
  const experience = useCVStore((s) => s.cv.experience)
  const updateExperience = useCVStore((s) => s.updateExperience)
  const { result, loading, error, run, reset } = useAIStream()
  const [selectedId, setSelectedId] = useState(experience[0]?.id ?? '')

  const selected = experience.find((e) => e.id === selectedId)

  const handleApply = (text: string) => {
    if (text && selectedId) {
      updateExperience(selectedId, { description: text.trim() })
      reset()
    }
  }

  if (experience.length === 0) {
    return (
      <p className="text-sm text-ink/50">
        Önce editörde en az bir deneyim ekle, sonra buraya gel.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-relaxed text-ink/60">
        Seçili deneyimin açıklamasını etki odaklı, profesyonel bir dille yeniden yazar.
      </p>

      <Select
        value={selectedId}
        onChange={(value) => {
          setSelectedId(value)
          reset()
        }}
        options={experience.map((e) => ({
          value: e.id,
          label: `${e.position || 'Pozisyon'} @ ${e.company || 'Şirket'}`,
        }))}
      />

      {selected && (
        <button
          type="button"
          onClick={() => run(buildExperienceRewritePrompt(selected))}
          disabled={loading}
          className="inline-flex items-center gap-2 self-start bg-ink px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-paper transition-colors hover:bg-accent disabled:opacity-50"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Yazıyor...' : 'Yeniden Yaz'}
        </button>
      )}

      <AIResultBox
        result={result}
        loading={loading}
        error={error}
        onApply={handleApply}
        applyLabel="Açıklamaya Uygula"
        placeholder="Yeniden yazılan açıklama burada akacak..."
      />
    </div>
  )
}
