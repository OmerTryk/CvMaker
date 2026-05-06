import { Plus, X } from 'lucide-react'

interface AchievementListProps {
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
}

/**
 * Bullet-point editor for achievements / responsibilities.
 * Each line is a small input + remove button. "Add bullet" at bottom.
 */
export function AchievementList({
  value,
  onChange,
  placeholder = 'Bir başarı veya sorumluluk yaz...',
}: AchievementListProps) {
  const update = (idx: number, text: string) =>
    onChange(value.map((v, i) => (i === idx ? text : v)))

  const remove = (idx: number) => onChange(value.filter((_, i) => i !== idx))

  const add = () => onChange([...value, ''])

  return (
    <div className="flex flex-col gap-2">
      {value.map((item, idx) => (
        <div
          key={idx}
          className="group flex items-start gap-3 border-b border-line/60 pb-2"
        >
          <span className="mt-3 text-accent">—</span>
          <input
            value={item}
            onChange={(e) => update(idx, e.target.value)}
            placeholder={placeholder}
            maxLength={300}
            className="flex-1 bg-transparent py-2 font-sans text-sm text-ink placeholder-ink/30 outline-none"
          />
          <button
            type="button"
            aria-label="Maddeyi sil"
            onClick={() => remove(idx)}
            className="mt-2 text-ink/30 opacity-0 transition-all duration-200 hover:text-accent group-hover:opacity-100"
          >
            <X size={14} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="mt-1 inline-flex items-center gap-2 self-start font-mono text-[10px] uppercase tracking-widest text-ink/50 transition-colors hover:text-accent"
      >
        <Plus size={12} /> Madde ekle
      </button>
    </div>
  )
}
