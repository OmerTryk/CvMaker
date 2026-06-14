import { useState } from 'react'
import { Mail } from 'lucide-react'
import { useCVStore } from '@/store'
import { useAIStream } from './useAIStream'
import { AIResultBox } from './AIResultBox'
import { buildCoverLetterPrompt, type CoverLetterTone } from '@/lib/prompts'
import { Input, Textarea, Select } from '@/components/ui'

const TONE_OPTIONS: { value: CoverLetterTone; label: string }[] = [
  { value: 'balanced', label: 'Dengeli — profesyonel ama içten' },
  { value: 'formal',   label: 'Resmî — kurumsal' },
  { value: 'warm',     label: 'Samimi — enerjik' },
]

export function CoverLetterAI() {
  const cv = useCVStore((s) => s.cv)
  const { result, loading, error, run } = useAIStream()

  const [company, setCompany] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [tone, setTone] = useState<CoverLetterTone>('balanced')

  const handleGenerate = () => {
    run(
      buildCoverLetterPrompt(cv, { jobDescription, company, tone }),
      { maxTokens: 1500 },
    )
  }

  const handleDownload = (text: string) => {
    if (!text) return
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const safeCompany = company.trim().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '')
    a.href = url
    a.download = `on-yazi${safeCompany ? `-${safeCompany}` : ''}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-relaxed text-ink/60">
        CV'ne ve yapıştırdığın iş ilanına bakarak hedef şirkete özel bir ön yazı
        yazar. İlanı boş bırakırsan profiline göre genel bir ön yazı üretir.
      </p>

      <div className="flex flex-col gap-1">
        <label className="font-mono text-[10px] uppercase tracking-widest text-ink/50">
          Hedef Şirket (opsiyonel)
        </label>
        <Input
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Örn. Trendyol"
          maxLength={120}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-mono text-[10px] uppercase tracking-widest text-ink/50">
          İş İlanı (opsiyonel)
        </label>
        <Textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="İş ilanının metnini buraya yapıştır…"
          maxLength={5000}
          showCount
          className="min-h-[120px] text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-mono text-[10px] uppercase tracking-widest text-ink/50">
          Ton
        </label>
        <Select
          value={tone}
          onChange={(value) => setTone(value as CoverLetterTone)}
          options={TONE_OPTIONS}
        />
      </div>

      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        className="inline-flex items-center gap-2 self-start bg-ink px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-paper transition-colors hover:bg-accent disabled:opacity-50"
      >
        <Mail size={12} className={loading ? 'animate-pulse' : ''} />
        {loading ? 'Yazıyor...' : 'Ön Yazı Oluştur'}
      </button>

      <AIResultBox
        result={result}
        loading={loading}
        error={error}
        onApply={handleDownload}
        applyLabel="İndir (.txt)"
        placeholder="Oluşturulan ön yazı burada akacak..."
      />
    </div>
  )
}
