import { useCVStore } from '@/store'
import { Field, Input } from '@/components/ui'

export function ContactSection() {
  const contact = useCVStore((s) => s.cv.contact)
  const update = useCVStore((s) => s.updateContact)

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Field label="E-posta">
        {(p) => (
          <Input
            {...p}
            type="email"
            value={contact.email}
            onChange={(e) => update({ email: e.target.value })}
            placeholder="ada@example.com"
          />
        )}
      </Field>
      <Field label="Telefon">
        {(p) => (
          <Input
            {...p}
            type="tel"
            value={contact.phone}
            onChange={(e) => update({ phone: e.target.value })}
            placeholder="+90 555 123 45 67"
          />
        )}
      </Field>
      <Field label="Konum" className="md:col-span-2">
        {(p) => (
          <Input
            {...p}
            value={contact.location}
            onChange={(e) => update({ location: e.target.value })}
            placeholder="İstanbul, Türkiye"
          />
        )}
      </Field>
      <Field label="Web Sitesi">
        {(p) => (
          <Input
            {...p}
            value={contact.website}
            onChange={(e) => update({ website: e.target.value })}
            placeholder="https://adayildiz.dev"
          />
        )}
      </Field>
      <Field label="LinkedIn">
        {(p) => (
          <Input
            {...p}
            value={contact.linkedin}
            onChange={(e) => update({ linkedin: e.target.value })}
            placeholder="linkedin.com/in/adayildiz"
          />
        )}
      </Field>
      <Field label="GitHub">
        {(p) => (
          <Input
            {...p}
            value={contact.github}
            onChange={(e) => update({ github: e.target.value })}
            placeholder="github.com/adayildiz"
          />
        )}
      </Field>
      <Field label="Twitter / X">
        {(p) => (
          <Input
            {...p}
            value={contact.twitter}
            onChange={(e) => update({ twitter: e.target.value })}
            placeholder="@adayildiz"
          />
        )}
      </Field>
    </div>
  )
}
