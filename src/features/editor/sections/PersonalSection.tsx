import { useCVStore } from '@/store'
import { Field, Input, PhotoUpload } from '@/components/ui'

export function PersonalSection() {
  const personal = useCVStore((s) => s.cv.personal)
  const update = useCVStore((s) => s.updatePersonal)

  return (
    <div className="flex flex-col gap-6">
      {/* Photo */}
      <PhotoUpload
        value={personal.photoUrl}
        onChange={(base64) => update({ photoUrl: base64 })}
        onRemove={() => update({ photoUrl: '' })}
      />

      {/* Name + title */}
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
      </div>
    </div>
  )
}
