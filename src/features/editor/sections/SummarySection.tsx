import { useCVStore } from '@/store'
import { Field, Textarea } from '@/components/ui'

export function SummarySection() {
  const summary = useCVStore((s) => s.cv.summary)
  const update = useCVStore((s) => s.updateSummary)

  return (
    <Field
      label="Profil Özeti"
      hint="2-4 cümle, sektörünü ve farkını anlat"
    >
      {(p) => (
        <Textarea
          {...p}
          value={summary.content}
          onChange={(e) => update(e.target.value)}
          placeholder="7+ yıl deneyimli, ürün odaklı frontend mühendisiyim..."
          maxLength={800}
          showCount
          rows={5}
        />
      )}
    </Field>
  )
}
