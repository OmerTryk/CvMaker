import { useCVStore } from '@/store'
import { Field, Input, MonthInput } from '@/components/ui'
import { SortableList } from '@/features/editor/SortableList'
import { ItemRow } from '@/features/editor/ItemRow'
import { AddButton } from '@/features/editor/AddButton'
import { formatMonthYear } from '@/utils/date'
import type { Certificate } from '@/types/cv'

export function CertificatesSection() {
  const certificates = useCVStore((s) => s.cv.certificates)
  const add = useCVStore((s) => s.addCertificate)
  const reorder = useCVStore((s) => s.reorderCertificates)

  return (
    <div className="flex flex-col gap-3">
      {certificates.length > 0 && (
        <SortableList
          items={certificates}
          onReorder={reorder}
          renderItem={(item) => <CertificateItem item={item} />}
        />
      )}
      <AddButton onClick={add} label="Sertifika ekle" />
    </div>
  )
}

function CertificateItem({ item }: { item: Certificate }) {
  const update = useCVStore((s) => s.updateCertificate)
  const remove = useCVStore((s) => s.removeCertificate)

  const summary = item.name || 'Yeni sertifika'
  const meta = item.issuer
    ? item.date ? `${item.issuer} · ${formatMonthYear(item.date)}` : item.issuer
    : 'düzenlemek için aç'

  return (
    <ItemRow summary={summary} meta={meta} onRemove={() => remove(item.id)}>
      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Sertifika Adı" required className="md:col-span-2">
          {(p) => (
            <Input
              {...p}
              value={item.name}
              onChange={(e) => update(item.id, { name: e.target.value })}
              placeholder="AWS Certified Solutions Architect"
            />
          )}
        </Field>
        <Field label="Veren Kurum">
          {(p) => (
            <Input
              {...p}
              value={item.issuer}
              onChange={(e) => update(item.id, { issuer: e.target.value })}
              placeholder="Amazon Web Services"
            />
          )}
        </Field>
        <Field label="Tarih">
          {(p) => (
            <MonthInput
              {...p}
              value={item.date ?? ''}
              onChange={(e) => update(item.id, { date: e.target.value || null })}
            />
          )}
        </Field>
        <Field label="Sertifika URL'si">
          {(p) => (
            <Input
              {...p}
              value={item.url}
              onChange={(e) => update(item.id, { url: e.target.value })}
              placeholder="https://credly.com/..."
            />
          )}
        </Field>
        <Field label="Sertifika ID">
          {(p) => (
            <Input
              {...p}
              value={item.credentialId}
              onChange={(e) => update(item.id, { credentialId: e.target.value })}
              placeholder="ABC-123-XYZ"
            />
          )}
        </Field>
      </div>
    </ItemRow>
  )
}
