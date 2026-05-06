import { useCVStore } from '@/store'
import { Input, SkillLevelDots } from '@/components/ui'
import { SortableList } from '@/features/editor/SortableList'
import { AddButton } from '@/features/editor/AddButton'
import { X } from 'lucide-react'
import type { Skill } from '@/types/cv'

export function SkillsSection() {
  const skills = useCVStore((s) => s.cv.skills)
  const add = useCVStore((s) => s.addSkill)
  const reorder = useCVStore((s) => s.reorderSkills)

  return (
    <div className="flex flex-col gap-3">
      {skills.length > 0 && (
        <SortableList
          items={skills}
          onReorder={reorder}
          renderItem={(item) => <SkillItem item={item} />}
        />
      )}
      <AddButton onClick={add} label="Yetenek ekle" />
    </div>
  )
}

function SkillItem({ item }: { item: Skill }) {
  const update = useCVStore((s) => s.updateSkill)
  const remove = useCVStore((s) => s.removeSkill)

  return (
    <div className="grid grid-cols-1 items-center gap-3 px-4 py-3 sm:grid-cols-[2fr_1.5fr_auto_auto]">
      <Input
        value={item.name}
        onChange={(e) => update(item.id, { name: e.target.value })}
        placeholder="React, TypeScript..."
        className="border-b-0 py-1.5"
      />
      <Input
        value={item.category}
        onChange={(e) => update(item.id, { category: e.target.value })}
        placeholder="Kategori (opsiyonel)"
        className="border-b-0 py-1.5 text-sm text-ink/70"
      />
      <SkillLevelDots
        level={item.level}
        onChange={(level) => update(item.id, { level })}
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
