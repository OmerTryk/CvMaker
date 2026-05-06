import { useState, type KeyboardEvent } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TagInputProps {
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  maxTagLength?: number
  className?: string
}

/**
 * Tag input — type + Enter or comma to add. Backspace on empty input removes last.
 */
export function TagInput({
  value,
  onChange,
  placeholder = 'Yaz, Enter ile ekle...',
  maxTagLength = 40,
  className,
}: TagInputProps) {
  const [draft, setDraft] = useState('')

  const commit = () => {
    const trimmed = draft.trim()
    if (!trimmed) return
    if (value.includes(trimmed)) {
      setDraft('')
      return
    }
    onChange([...value, trimmed.slice(0, maxTagLength)])
    setDraft('')
  }

  const remove = (idx: number) => onChange(value.filter((_, i) => i !== idx))

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commit()
    } else if (e.key === 'Backspace' && !draft && value.length > 0) {
      remove(value.length - 1)
    }
  }

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2 border-b border-line py-2 transition-colors duration-200 hover:border-ink/40 focus-within:border-accent',
        className,
      )}
    >
      {value.map((tag, idx) => (
        <span
          key={`${tag}-${idx}`}
          className="group inline-flex items-center gap-1 border border-ink/20 bg-paper-warm px-2 py-1 font-mono text-[11px] uppercase tracking-wider text-ink"
        >
          {tag}
          <button
            type="button"
            aria-label={`${tag} sil`}
            onClick={() => remove(idx)}
            className="text-ink/40 transition-colors hover:text-accent"
          >
            <X size={10} strokeWidth={2.5} />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKey}
        onBlur={commit}
        placeholder={value.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[120px] bg-transparent font-sans text-sm text-ink placeholder-ink/30 outline-none"
      />
    </div>
  )
}
