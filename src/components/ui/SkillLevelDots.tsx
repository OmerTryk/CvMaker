interface SkillLevelDotsProps {
  level: number | undefined
  onChange: (level: 1 | 2 | 3 | 4 | 5) => void
  max?: number
}

/**
 * 5 clickable dots representing skill mastery (1-5).
 */
export function SkillLevelDots({ level = 0, onChange, max = 5 }: SkillLevelDotsProps) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: max }, (_, i) => {
        const value = (i + 1) as 1 | 2 | 3 | 4 | 5
        const filled = value <= level
        return (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            aria-label={`Seviye ${value}`}
            className={`h-2.5 w-2.5 rounded-full transition-all duration-200 ${
              filled ? 'bg-accent' : 'border border-ink/20 bg-transparent hover:border-accent'
            }`}
          />
        )
      })}
    </div>
  )
}
