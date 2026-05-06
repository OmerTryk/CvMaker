export function PreviewPage() {
  return (
    <div className="container-prose py-20">
      <div className="mb-12 flex items-baseline justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-ink/50">
            Sprint 03 · Templates
          </p>
          <h1 className="mt-4 font-display text-4xl font-light tracking-tight text-ink md:text-5xl">
            Önizleme & <span className="italic text-accent">şablonlar</span>.
          </h1>
        </div>
      </div>

      {/* Placeholder template cards */}
      <div className="grid gap-px bg-line md:grid-cols-3">
        {['Modern', 'Classic', 'Minimal'].map((name, i) => (
          <div
            key={name}
            className="group flex aspect-[3/4] flex-col justify-between bg-paper-cool p-6 transition-colors duration-300 hover:bg-paper-warm"
          >
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink/30">
              0{i + 1}
            </span>
            <div>
              <h3 className="font-display text-2xl font-light text-ink">{name}</h3>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-ink/40">
                yakında
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
