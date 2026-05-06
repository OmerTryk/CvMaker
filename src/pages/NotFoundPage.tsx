import { Link, useRouteError } from 'react-router-dom'

export function NotFoundPage() {
  const error = useRouteError() as { statusText?: string; message?: string } | null

  return (
    <div className="container-prose flex min-h-[70vh] flex-col items-start justify-center py-20">
      <p className="font-mono text-xs uppercase tracking-widest text-ink/50">
        Error · 404
      </p>
      <h1 className="mt-4 font-display text-7xl font-light tracking-tightest text-ink md:text-9xl">
        Yok.
      </h1>
      <p className="mt-6 max-w-md text-base leading-relaxed text-ink/60">
        Aradığın sayfa kaybolmuş ya da hiç var olmamış.
        {error?.statusText || error?.message ? (
          <span className="block mt-2 font-mono text-xs text-ink/40">
            {error.statusText || error.message}
          </span>
        ) : null}
      </p>
      <Link to="/" className="btn-primary mt-10">
        Anasayfaya Dön
      </Link>
    </div>
  )
}
