import { Link } from 'react-router-dom'
import { ArrowUpRight, Sparkles, FileText, Layers, HelpCircle } from 'lucide-react'
import { useTour } from '@/features/help/useTour'
import { TourOverlay } from '@/features/help/TourOverlay'
import { HOME_TOUR } from '@/features/help/tourSteps'

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
      'Gemini ve Llama ile profil özetini güçlendir, deneyim açıklamalarını profesyonel diliyle yeniden yaz.',
  },
  {
    icon: FileText,
    title: 'PDF Export',
    description:
      'Tek tıkla A4 boyutunda, baskıya hazır PDF olarak indir. Yazı tipleri gömülü gelir.',
  },
]

export function HomePage() {
  const tour = useTour(HOME_TOUR)


  return (
    <div className="relative overflow-hidden">
      {/* HERO */}
      <section className="container-prose relative pt-12 pb-20 md:pt-32 md:pb-40">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-8">
            <h1
              className="font-display text-4xl font-light leading-[0.95] tracking-tightest text-ink opacity-0 animate-fade-up sm:text-5xl md:text-7xl lg:text-8xl"
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
              data-tour="home-cta"
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
              <button
                type="button"
                onClick={tour.start}
                className="inline-flex items-center gap-1.5 border border-line px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-ink/60 transition-colors hover:border-accent hover:text-accent"
              >
                <HelpCircle size={12} strokeWidth={1.5} />
                Nasıl çalışır?
              </button>
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
        <div className="mb-10 flex flex-wrap items-baseline justify-between gap-3 md:mb-16">
          <h2 className="font-display text-2xl font-light tracking-tight text-ink md:text-4xl">
            Ne sunuyor?
          </h2>
          <span className="font-mono text-xs uppercase tracking-widest text-ink/40">
            03 / Özellikler
          </span>
        </div>

        <div data-tour="home-features" className="grid gap-px bg-line sm:grid-cols-3">
          {features.map((f, i) => (
            <article
              key={f.title}
              className="group relative bg-paper p-5 transition-colors duration-300 hover:bg-paper-warm sm:p-8"
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

      {tour.active && tour.current && (
        <TourOverlay
          step={tour.current}
          stepIndex={tour.stepIndex}
          totalSteps={tour.totalSteps}
          isFirst={tour.isFirst}
          isLast={tour.isLast}
          onNext={tour.next}
          onPrev={tour.prev}
          onClose={tour.stop}
        />
      )}
    </div>
  )
}
