import { META_LABEL } from '@/hooks/useKeyboardShortcuts'

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-line">
      <div className="container-prose flex flex-col items-start justify-between gap-4 py-8 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-6">
          <p className="font-mono text-xs uppercase tracking-widest text-ink/50">
            © {new Date().getFullYear()} CTRLCV
          </p>
          <p className="font-mono text-xs tracking-widest text-ink/30">
            Made by Ömer Tiryaki
          </p>
        </div>
        <p className="font-mono text-xs uppercase tracking-widest text-ink/40">
          {META_LABEL}+/ → help · {META_LABEL}+P → pdf
        </p>
      </div>
    </footer>
  )
}
