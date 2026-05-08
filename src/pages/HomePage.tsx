import { Link } from 'react-router-dom'
import { ArrowUpRight, Sparkles, FileText, Layers } from 'lucide-react'

const features = [
  {
    icon: Layers,
    title: 'Çoklu Şablon',
    description:
      'Modern, klasik ve minimal şablonlar arasında anında geçiş yap. Hepsi ATS dostu.',
  },
  {
    icon: Sparkles,
    title: 'AI Destek',
    description:
      'Claude ile profil özetini güçlendir, deneyim açıklamalarını profesyonel diliyle yeniden yaz.',
  },
  {
    icon: FileText,
    title: 'PDF Export',
    description:
      'Tek tıkla A4 boyutunda, baskıya hazır PDF olarak indir. Yazı tipleri gömülü gelir.',
  },
]

export function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* HERO */}
      <section className="container-prose relative pt-20 pb-32 md:pt-32 md:pb-40">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-8">
            <p
              className="mb-6 flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-ink/60 opacity-0 animate-fade-up"
              style={{ animationDelay: '0ms' }}
            >
              <span className="h-px w-8 bg-ink/40" />
              Sprint 0 · Foundation
            </p>

            <h1
              className="font-display text-5xl font-light leading-[0.95] tracking-tightest text-ink opacity-0 animate-fade-up md:text-7xl lg:text-8xl"
              style={{ animationDelay: '120ms' }}
            >
              Profesyonel
              <br />
              <span className="italic text-accent">özgeçmişin</span>,
              <br />
              birkaç dakikada.
            </h1>

            <p
              className="mt-8 max-w-xl text-lg leading-relaxed text-ink/70 opacity-0 animate-fade-up md:text-xl"
              style={{ animationDelay: '240ms' }}
            >
              Yapay zekâ destekli, ATS uyumlu ve özenle tasarlanmış şablonlarla
              kariyer hikâyeni anlat. Form doldur, anlık önizle, indir.
            </p>

            <div
              className="mt-12 flex flex-wrap items-center gap-4 opacity-0 animate-fade-up"
              style={{ animationDelay: '360ms' }}
            >
              <Link to="/editor" className="btn-primary group">
                Hemen Başla
                <ArrowUpRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
              <Link to="/preview" className="btn-ghost">
                Şablonları Gör
              </Link>
            </div>
          </div>

          {/* Editorial side note */}
          <aside
            className="hidden md:col-span-4 md:flex md:items-end opacity-0 animate-fade-up"
            style={{ animationDelay: '480ms' }}
          >
            <div className="border-l border-accent pl-6">
              <p className="font-mono text-[10px] uppercase tracking-widest text-ink/40">
                Note · 01
              </p>
              <p className="mt-3 font-display text-base italic leading-relaxed text-ink/70">
                "İyi bir CV, abartısız bir hikâyedir. Ne fazlası, ne eksiği."
              </p>
            </div>
          </aside>
        </div>
      </section>

      {/* DIVIDER */}
      <div className="container-prose">
        <div className="hairline border-t" />
      </div>

      {/* FEATURES */}
      <section className="container-prose py-24 md:py-32">
        <div className="mb-16 flex items-baseline justify-between">
          <h2 className="font-display text-3xl font-light tracking-tight text-ink md:text-4xl">
            Ne sunuyor?
          </h2>
          <span className="font-mono text-xs uppercase tracking-widest text-ink/40">
            03 / Özellikler
          </span>
        </div>

        <div className="grid gap-px bg-line md:grid-cols-3">
          {features.map((f, i) => (
            <article
              key={f.title}
              className="group relative bg-paper p-8 transition-colors duration-300 hover:bg-paper-warm"
            >
              <span className="absolute right-6 top-6 font-mono text-[10px] uppercase tracking-widest text-ink/30">
                0{i + 1}
              </span>
              <f.icon
                size={28}
                strokeWidth={1.25}
                className="text-ink transition-transform duration-500 group-hover:-translate-y-1 group-hover:text-accent"
              />
              <h3 className="mt-6 font-display text-2xl font-light text-ink">
                {f.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink/60">
                {f.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* SPRINT STATUS */}
      <section className="container-prose pb-24">
        <div className="border border-ink bg-ink p-10 text-paper md:p-14">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-paper/60">
                Sprint Durumu
              </p>
              <h2 className="mt-3 font-display text-3xl font-light leading-tight md:text-4xl">
                Sprint 6 · Deploy
                <span className="ml-3 font-sans text-base text-accent">
                  ● tamamlandı
                </span>
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-paper/70">
                Tüm sprintler tamamlandı. Vercel ile deploy hazır.
                Profesyonel CV’ni dakikalar içinde oluştur.
              </p>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-paper/60">
              <span>Status</span>
              <span className="h-px w-12 bg-paper/40" />
              <span className="text-accent">● Prod'da</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
