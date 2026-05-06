import { useCVStore } from '@/store'
import { Field, Input, MonthInput, Textarea, TagInput } from '@/components/ui'
import { SortableList } from '@/features/editor/SortableList'
import { ItemRow } from '@/features/editor/ItemRow'
import { AddButton } from '@/features/editor/AddButton'
import { formatMonthYear } from '@/utils/date'
import type { Project } from '@/types/cv'

export function ProjectsSection() {
  const projects = useCVStore((s) => s.cv.projects)
  const add = useCVStore((s) => s.addProject)
  const reorder = useCVStore((s) => s.reorderProjects)

  return (
    <div className="flex flex-col gap-3">
      {projects.length > 0 && (
        <SortableList
          items={projects}
          onReorder={reorder}
          renderItem={(item) => <ProjectItem item={item} />}
        />
      )}
      <AddButton onClick={add} label="Proje ekle" />
    </div>
  )
}

function ProjectItem({ item }: { item: Project }) {
  const update = useCVStore((s) => s.updateProject)
  const remove = useCVStore((s) => s.removeProject)

  const summary = item.name || 'Yeni proje'
  const meta =
    item.technologies.length > 0
      ? item.technologies.slice(0, 3).join(' · ')
      : item.startDate
        ? formatMonthYear(item.startDate)
        : 'düzenlemek için aç'

  return (
    <ItemRow summary={summary} meta={meta} onRemove={() => remove(item.id)}>
      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Proje Adı" required>
          {(p) => (
            <Input
              {...p}
              value={item.name}
              onChange={(e) => update(item.id, { name: e.target.value })}
              placeholder="design-tokens-cli"
            />
          )}
        </Field>
        <Field label="URL">
          {(p) => (
            <Input
              {...p}
              value={item.url}
              onChange={(e) => update(item.id, { url: e.target.value })}
              placeholder="https://github.com/..."
            />
          )}
        </Field>
        <Field label="Başlangıç" hint="opsiyonel">
          {(p) => (
            <MonthInput
              {...p}
              value={item.startDate ?? ''}
              onChange={(e) =>
                update(item.id, { startDate: e.target.value || null })
              }
            />
          )}
        </Field>
        <Field label="Bitiş" hint="opsiyonel">
          {(p) => (
            <MonthInput
              {...p}
              value={item.endDate ?? ''}
              onChange={(e) => update(item.id, { endDate: e.target.value || null })}
            />
          )}
        </Field>
        <Field label="Açıklama" className="md:col-span-2">
          {(p) => (
            <Textarea
              {...p}
              value={item.description}
              onChange={(e) => update(item.id, { description: e.target.value })}
              placeholder="Projenin ne yaptığını ve etkisini anlat..."
              maxLength={800}
              rows={3}
            />
          )}
        </Field>
        <div className="md:col-span-2">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-ink/60">
            Teknolojiler
          </p>
          <TagInput
            value={item.technologies}
            onChange={(technologies) => update(item.id, { technologies })}
            placeholder="React, TypeScript, ... (Enter ile ekle)"
          />
        </div>
      </div>
    </ItemRow>
  )
}
