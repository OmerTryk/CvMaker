import { useCVStore } from '@/store'
import { Field, Input, MonthInput, Textarea, AchievementList } from '@/components/ui'
import { SortableList } from '@/features/editor/SortableList'
import { ItemRow } from '@/features/editor/ItemRow'
import { AddButton } from '@/features/editor/AddButton'
import { formatMonthYear } from '@/utils/date'
import type { Experience } from '@/types/cv'

export function ExperienceSection() {
  const experience = useCVStore((s) => s.cv.experience)
  const add = useCVStore((s) => s.addExperience)
  const reorder = useCVStore((s) => s.reorderExperience)

  return (
    <div className="flex flex-col gap-3">
      {experience.length > 0 && (
        <SortableList
          items={experience}
          onReorder={reorder}
          renderItem={(item, idx) => (
            <ExperienceItem item={item} defaultOpen={idx === 0 && !item.company} />
          )}
        />
      )}
      <AddButton onClick={add} label="Deneyim ekle" />
    </div>
  )
}

function ExperienceItem({
  item,
  defaultOpen,
}: {
  item: Experience
  defaultOpen?: boolean
}) {
  const update = useCVStore((s) => s.updateExperience)
  const remove = useCVStore((s) => s.removeExperience)

  const summary = item.position || item.company || 'Yeni deneyim'
  const meta =
    item.company && item.position
      ? `${item.company} · ${formatMonthYear(item.startDate)} — ${formatMonthYear(item.endDate)}`
      : 'düzenlemek için aç'

  return (
    <ItemRow
      summary={summary}
      meta={meta}
      onRemove={() => remove(item.id)}
      defaultOpen={defaultOpen}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Pozisyon" required>
          {(p) => (
            <Input
              {...p}
              value={item.position}
              onChange={(e) => update(item.id, { position: e.target.value })}
              placeholder="Senior Frontend Engineer"
            />
          )}
        </Field>
        <Field label="Şirket" required>
          {(p) => (
            <Input
              {...p}
              value={item.company}
              onChange={(e) => update(item.id, { company: e.target.value })}
              placeholder="Acme Inc."
            />
          )}
        </Field>
        <Field label="Konum">
          {(p) => (
            <Input
              {...p}
              value={item.location}
              onChange={(e) => update(item.id, { location: e.target.value })}
              placeholder="İstanbul, Türkiye"
            />
          )}
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Başlangıç">
            {(p) => (
              <MonthInput
                {...p}
                value={item.startDate}
                onChange={(e) => update(item.id, { startDate: e.target.value })}
              />
            )}
          </Field>
          <Field label={item.current ? 'Devam ediyor' : 'Bitiş'}>
            {(p) => (
              <MonthInput
                {...p}
                value={item.endDate ?? ''}
                onChange={(e) =>
                  update(item.id, { endDate: e.target.value || null })
                }
                disabled={item.current}
              />
            )}
          </Field>
        </div>
        <label className="flex items-center gap-2 self-start font-mono text-[11px] uppercase tracking-widest text-ink/60 md:col-span-2">
          <input
            type="checkbox"
            checked={item.current}
            onChange={(e) =>
              update(item.id, {
                current: e.target.checked,
                endDate: e.target.checked ? null : item.endDate,
              })
            }
            className="h-4 w-4 accent-accent"
          />
          Hâlâ bu pozisyondayım
        </label>
        <Field label="Açıklama" hint="kısa bağlam" className="md:col-span-2">
          {(p) => (
            <Textarea
              {...p}
              value={item.description}
              onChange={(e) => update(item.id, { description: e.target.value })}
              placeholder="Rolünü ve sorumluluğunu birkaç cümleyle anlat..."
              maxLength={2000}
              rows={3}
            />
          )}
        </Field>
        <div className="md:col-span-2">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-ink/60">
            Başarılar / Öne Çıkanlar
          </p>
          <AchievementList
            value={item.achievements}
            onChange={(achievements) => update(item.id, { achievements })}
            placeholder="Ölçülebilir bir başarı yaz... (örn. dönüşümü %12 artırdım)"
          />
        </div>
      </div>
    </ItemRow>
  )
}
