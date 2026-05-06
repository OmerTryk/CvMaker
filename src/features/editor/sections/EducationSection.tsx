import { useCVStore } from '@/store'
import { Field, Input, MonthInput, Textarea } from '@/components/ui'
import { SortableList } from '@/features/editor/SortableList'
import { ItemRow } from '@/features/editor/ItemRow'
import { AddButton } from '@/features/editor/AddButton'
import { formatMonthYear } from '@/utils/date'
import type { Education } from '@/types/cv'

export function EducationSection() {
  const education = useCVStore((s) => s.cv.education)
  const add = useCVStore((s) => s.addEducation)
  const reorder = useCVStore((s) => s.reorderEducation)

  return (
    <div className="flex flex-col gap-3">
      {education.length > 0 && (
        <SortableList
          items={education}
          onReorder={reorder}
          renderItem={(item) => <EducationItem item={item} />}
        />
      )}
      <AddButton onClick={add} label="Eğitim ekle" />
    </div>
  )
}

function EducationItem({ item }: { item: Education }) {
  const update = useCVStore((s) => s.updateEducation)
  const remove = useCVStore((s) => s.removeEducation)

  const summary =
    item.field || item.institution || item.degree || 'Yeni eğitim'
  const meta = item.institution
    ? `${item.institution} · ${formatMonthYear(item.startDate)} — ${formatMonthYear(item.endDate)}`
    : 'düzenlemek için aç'

  return (
    <ItemRow summary={summary} meta={meta} onRemove={() => remove(item.id)}>
      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Kurum" required>
          {(p) => (
            <Input
              {...p}
              value={item.institution}
              onChange={(e) => update(item.id, { institution: e.target.value })}
              placeholder="Boğaziçi Üniversitesi"
            />
          )}
        </Field>
        <Field label="Derece">
          {(p) => (
            <Input
              {...p}
              value={item.degree}
              onChange={(e) => update(item.id, { degree: e.target.value })}
              placeholder="Lisans, Yüksek Lisans..."
            />
          )}
        </Field>
        <Field label="Bölüm" className="md:col-span-2">
          {(p) => (
            <Input
              {...p}
              value={item.field}
              onChange={(e) => update(item.id, { field: e.target.value })}
              placeholder="Bilgisayar Mühendisliği"
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
        <Field label="GPA / Not Ortalaması" hint="opsiyonel">
          {(p) => (
            <Input
              {...p}
              value={item.gpa}
              onChange={(e) => update(item.id, { gpa: e.target.value })}
              placeholder="3.42 / 4.0"
            />
          )}
        </Field>
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
          Eğitim devam ediyor
        </label>
        <Field label="Açıklama" hint="opsiyonel" className="md:col-span-2">
          {(p) => (
            <Textarea
              {...p}
              value={item.description}
              onChange={(e) => update(item.id, { description: e.target.value })}
              placeholder="Tez konusu, öne çıkan dersler, başarılar..."
              maxLength={800}
              rows={3}
            />
          )}
        </Field>
      </div>
    </ItemRow>
  )
}
