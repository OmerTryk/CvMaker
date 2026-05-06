import { useCVStore } from '@/store'
import { Field, Input } from '@/components/ui'
import { SortableList } from '@/features/editor/SortableList'
import { ItemRow } from '@/features/editor/ItemRow'
import { AddButton } from '@/features/editor/AddButton'
import type { Reference } from '@/types/cv'

export function ReferencesSection() {
  const references = useCVStore((s) => s.cv.references)
  const add = useCVStore((s) => s.addReference)
  const reorder = useCVStore((s) => s.reorderReferences)

  return (
    <div className="flex flex-col gap-3">
      {references.length > 0 && (
        <SortableList
          items={references}
          onReorder={reorder}
          renderItem={(item) => <ReferenceItem item={item} />}
        />
      )}
      <AddButton onClick={add} label="Referans ekle" />
    </div>
  )
}

function ReferenceItem({ item }: { item: Reference }) {
  const update = useCVStore((s) => s.updateReference)
  const remove = useCVStore((s) => s.removeReference)

  const summary = item.name || 'Yeni referans'
  const meta =
    item.position && item.company
      ? `${item.position} · ${item.company}`
      : 'düzenlemek için aç'

  return (
    <ItemRow summary={summary} meta={meta} onRemove={() => remove(item.id)}>
      <div className="grid gap-6 md:grid-cols-2">
        <Field label="İsim" required>
          {(p) => (
            <Input
              {...p}
              value={item.name}
              onChange={(e) => update(item.id, { name: e.target.value })}
              placeholder="Mert Kaya"
            />
          )}
        </Field>
        <Field label="Pozisyon">
          {(p) => (
            <Input
              {...p}
              value={item.position}
              onChange={(e) => update(item.id, { position: e.target.value })}
              placeholder="Engineering Manager"
            />
          )}
        </Field>
        <Field label="Şirket">
          {(p) => (
            <Input
              {...p}
              value={item.company}
              onChange={(e) => update(item.id, { company: e.target.value })}
              placeholder="Acme Inc."
            />
          )}
        </Field>
        <Field label="E-posta">
          {(p) => (
            <Input
              {...p}
              type="email"
              value={item.email}
              onChange={(e) => update(item.id, { email: e.target.value })}
              placeholder="mert@acme.com"
            />
          )}
        </Field>
        <Field label="Telefon" className="md:col-span-2">
          {(p) => (
            <Input
              {...p}
              type="tel"
              value={item.phone}
              onChange={(e) => update(item.id, { phone: e.target.value })}
              placeholder="+90 ..."
            />
          )}
        </Field>
      </div>
    </ItemRow>
  )
}
