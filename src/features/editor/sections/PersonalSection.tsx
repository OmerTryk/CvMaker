import { useCVStore } from '@/store'
import { Field, Input } from '@/components/ui'

export function PersonalSection() {
  const personal = useCVStore((s) => s.cv.personal)
  const update = useCVStore((s) => s.updatePersonal)

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Field label="Ad Soyad" required>
        {(p) => (
          <Input
            {...p}
            value={personal.fullName}
            onChange={(e) => update({ fullName: e.target.value })}
            placeholder="Ada Yıldız"
          />
        )}
      </Field>
      <Field label="Pozisyon / Unvan">
        {(p) => (
          <Input
            {...p}
            value={personal.jobTitle}
            onChange={(e) => update({ jobTitle: e.target.value })}
            placeholder="Senior Frontend Engineer"
          />
        )}
      </Field>
      <Field label="Fotoğraf URL" hint="opsiyonel" className="md:col-span-2">
        {(p) => (
          <Input
            {...p}
            value={personal.photoUrl}
            onChange={(e) => update({ photoUrl: e.target.value })}
            placeholder="https://..."
          />
        )}
      </Field>
    </div>
  )
}
