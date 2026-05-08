import { Link } from 'react-router-dom'
import { ArrowLeft, Edit3 } from 'lucide-react'
import { useCVStore } from '@/store'
import { TemplateRenderer } from '@/templates'
import { TEMPLATE_LIST } from '@/templates/shared/tokens'
import { ExportButton } from '@/features/export'

export function PreviewPage() {
  const cv = useCVStore((s) => s.cv)
  const template = useCVStore((s) => s.cv.settings.template)
  const updateSettings = useCVStore((s) => s.updateSettings)

  return (
    <div className="container-prose py-10 md:py-14">
      {/* Header strip */}
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-ink/50">
            Sprint 04 · PDF Export
          </p>
          <h1 className="mt-2 font-display text-4xl font-light tracking-tight text-ink md:text-5xl">
            {cv.title || 'CV Önizleme'}
          </h1>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-ink/40">
            Hazır olduğunda PDF olarak indir →
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {TEMPLATE_LIST.map((tpl) => {
            const active = template === tpl.key
            return (
              <button
                key={tpl.key}
                type="button"
                onClick={() => updateSettings({ template: tpl.key })}
                className={`px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition-all duration-200 ${
                  active
                    ? 'bg-ink text-paper'
                    : 'border border-line text-ink/60 hover:border-ink hover:text-ink'
                }`}
              >
                {tpl.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Primary CTA — PDF download */}
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border border-ink bg-ink p-6 text-paper">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-paper/60">
            Hazır mısın?
          </p>
          <p className="mt-1 font-display text-xl font-light">
            CV'ni şimdi <span className="italic text-accent">PDF</span> olarak indir.
          </p>
          <p className="mt-2 max-w-md font-mono text-[10px] uppercase tracking-wider text-paper/50">
            Tarayıcı yazdırma penceresi açılır · "PDF olarak kaydet" seçeneğini seç
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ExportButton variant="primary" label="PDF olarak indir" />
          <Link
            to="/editor"
            className="inline-flex items-center gap-2 border border-paper/30 px-4 py-3 font-mono text-xs uppercase tracking-widest text-paper/80 transition-colors hover:bg-paper hover:text-ink"
          >
            <Edit3 size={12} />
            Düzenle
          </Link>
        </div>
      </div>

      {/* Full-size A4 page (centered) */}
      <div className="flex justify-center overflow-x-auto">
        <div
          className="bg-white shadow-[0_4px_60px_rgba(0,0,0,0.12)]"
          style={{ width: '794px', height: '1123px', overflow: 'hidden' }}
        >
          <TemplateRenderer cv={cv} />
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <Link
          to="/editor"
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-ink/50 transition-colors hover:text-accent"
        >
          <ArrowLeft size={14} /> Editöre dön
        </Link>
      </div>

      {/* PDF tips */}
      <div className="mt-16 grid gap-px bg-line md:grid-cols-3">
        <Tip
          number="01"
          title="Selectable text"
          description="Çıktı görsel değil; metin seçilebilir, kopyalanabilir, ATS sistemleri okuyabilir."
        />
        <Tip
          number="02"
          title="Gömülü fontlar"
          description="Fraunces ve Geist tarayıcı tarafından PDF'e gömülür. Açan kişide eksik font olmaz."
        />
        <Tip
          number="03"
          title="Tek sayfa A4"
          description="Tasarım tek sayfa olacak şekilde optimize edildi. İçerik fazlaysa Sprint 5'te otomatik çoklu sayfa."
        />
      </div>
    </div>
  )
}

function Tip({
  number,
  title,
  description,
}: {
  number: string
  title: string
  description: string
}) {
  return (
    <div className="bg-paper-cool p-6">
      <p className="font-mono text-[10px] uppercase tracking-widest text-ink/30">
        {number}
      </p>
      <h3 className="mt-2 font-display text-lg font-light text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink/60">{description}</p>
    </div>
  )
}
