import { useCVStore } from '@/store'
import { Input, Select } from '@/components/ui'
import { SortableList } from '@/features/editor/SortableList'
import { AddButton } from '@/features/editor/AddButton'
import { X } from 'lucide-react'
import type { Language, LanguageProficiency } from '@/types/cv'

const PROFICIENCY_OPTIONS = [
  { value: 'A1', label: 'A1 — Başlangıç' },
  { value: 'A2', label: 'A2 — Temel' },
  { value: 'B1', label: 'B1 — Orta' },
  { value: 'B2', label: 'B2 — Orta-Üstü' },
  { value: 'C1', label: 'C1 — İleri' },
  { value: 'C2', label: 'C2 — Yetkin' },
  { value: 'Native', label: 'Anadil' },
]

export function LanguagesSection() {
  const languages = useCVStore((s) => s.cv.languages)
  const add = useCVStore((s) => s.addLanguage)
  const reorder = useCVStore((s) => s.reorderLanguages)

  return (
    <div className="flex flex-col gap-3">
      {languages.length > 0 && (
        <SortableList
          items={languages}
          onReorder={reorder}
          renderItem={(item) => <LanguageItem item={item} />}
        />
      )}
      <AddButton onClick={add} label="Dil ekle" />
    </div>
  )
}

function LanguageItem({ item }: { item: Language }) {
  const update = useCVStore((s) => s.updateLanguage)
  const remove = useCVStore((s) => s.removeLanguage)

  return (
    <div className="grid grid-cols-1 items-center gap-3 px-4 py-3 sm:grid-cols-[1fr_1fr_auto]">
      <Input
        value={item.name}
        onChange={(e) => update(item.id, { name: e.target.value })}
        placeholder="Türkçe, İngilizce..."
        className="border-b-0 py-1.5"
      />
      <Select
        value={item.proficiency}
        onChange={(e) =>
          update(item.id, { proficiency: e.target.value as LanguageProficiency })
        }
        options={PROFICIENCY_OPTIONS}
        className="border-b-0 py-1.5 text-sm"
      />
      <button
        type="button"
        onClick={() => remove(item.id)}
        aria-label="Sil"
        className="flex h-7 w-7 items-center justify-center text-ink/30 transition-colors hover:bg-accent/10 hover:text-accent"
      >
        <X size={14} />
      </button>
    </div>
  )
}
