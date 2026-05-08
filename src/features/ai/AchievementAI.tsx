import { useState } from 'react'
import { Lightbulb } from 'lucide-react'
import { useCVStore } from '@/store'
import { useAIStream } from './useAIStream'
import { AIResultBox } from './AIResultBox'
import { buildAchievementPrompt } from '@/lib/prompts'
import { Select } from '@/components/ui'

export function AchievementAI() {
  const experience = useCVStore((s) => s.cv.experience)
  const updateExperience = useCVStore((s) => s.updateExperience)
  const { result, loading, error, run, reset } = useAIStream()
  const [selectedId, setSelectedId] = useState(experience[0]?.id ?? '')

  const selected = experience.find((e) => e.id === selectedId)

  /** Parse streamed result into bullet lines */
  const parseBullets = (text: string) =>
    text
      .split('\n')
      .map((l) => l.replace(/^[-–—]\s*/, '').trim())
      .filter(Boolean)

  const handleAppend = () => {
    if (result && selectedId) {
      const bullets = parseBullets(result)
      const current = selected?.achievements ?? []
      updateExperience(selectedId, { achievements: [...current, ...bullets] })
      reset()
    }
  }

  const handleReplace = () => {
    if (result && selectedId) {
      const bullets = parseBullets(result)
      updateExperience(selectedId, { achievements: bullets })
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
        Seçili pozisyon için ölçülebilir başarı maddeleri önerir. "Ekle" mevcut
        listeye ekler, "Değiştir" tamamen yeniler.
      </p>

      <Select
        value={selectedId}
        onChange={(e) => {
          setSelectedId(e.target.value)
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
          onClick={() => run(buildAchievementPrompt(selected))}
          disabled={loading}
          className="inline-flex items-center gap-2 self-start bg-ink px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-paper transition-colors hover:bg-accent disabled:opacity-50"
        >
          <Lightbulb size={12} className={loading ? 'animate-pulse' : ''} />
          {loading ? 'Düşünüyor...' : 'Madde Öner'}
        </button>
      )}

      <AIResultBox
        result={result}
        loading={loading}
        error={error}
        onApply={handleAppend}
        applyLabel="Listeye Ekle"
        onApply2={handleReplace}
        applyLabel2="Listeyi Değiştir"
        placeholder="Önerilen başarı maddeleri burada akacak..."
      />
    </div>
  )
}
