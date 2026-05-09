import { Link, NavLink } from 'react-router-dom'
import { HelpCircle, Sparkles, Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { META_LABEL } from '@/hooks/useKeyboardShortcuts'
import { useAIStore } from '@/store'

const navItems = [
  { to: '/', label: 'Anasayfa', end: true },
  { to: '/editor', label: 'Editör' },
  { to: '/preview', label: 'Önizleme' },
]

interface HeaderProps {
  onHelpOpen: () => void
  onAIOpen: () => void
  dark: boolean
  onToggleDark: () => void
}

export function Header({ onHelpOpen, onAIOpen, dark, onToggleDark }: HeaderProps) {
  const apiKey = useAIStore((s) => s.apiKey)

  return (
    <header className="relative z-20 border-b border-line bg-paper/80 backdrop-blur-sm">
      <div className="container-prose flex items-center justify-between py-5">

        {/* Logo */}
        <Link to="/" className="group flex items-center" aria-label="CTRLCV anasayfa">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 250 44"
            className="h-7 w-auto overflow-visible text-ink"
            overflow="visible"
            aria-label="CTRLCV"
          >
            <text y="36" fontFamily="Georgia, 'Times New Roman', serif" dominantBaseline="alphabetic">
              {/* currentColor inherits text-ink → flips automatically in dark mode */}
              <tspan fontSize="38" fontWeight="300" letterSpacing="1" fill="currentColor">CTRL</tspan>
              <tspan fontSize="38" fontWeight="700" fill="#B7410E">.</tspan>
              <tspan fontSize="38" fontWeight="700" letterSpacing="-1" fill="currentColor">CV</tspan>
            </text>
          </svg>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Nav */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'relative px-3 py-2 font-sans text-sm tracking-wide transition-colors duration-200',
                    isActive ? 'text-ink' : 'text-ink/50 hover:text-ink',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {item.label}
                    {isActive && (
                      <span className="absolute inset-x-3 -bottom-px h-px bg-accent" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* AI button */}
          <button
            onClick={onAIOpen}
            title="AI Asistan"
            aria-label="AI Asistan panelini aç"
            className={cn(
              'ml-1 flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-all duration-200',
              apiKey
                ? 'bg-accent text-paper hover:bg-ink'
                : 'border border-line text-ink/60 hover:border-ink hover:text-ink',
            )}
          >
            <Sparkles size={12} strokeWidth={1.5} />
            <span className="hidden sm:inline">AI</span>
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={onToggleDark}
            title={dark ? 'Açık moda geç' : 'Koyu moda geç'}
            aria-label={dark ? 'Açık mod' : 'Koyu mod'}
            className="flex h-8 w-8 items-center justify-center text-ink/40 transition-colors hover:bg-paper-warm hover:text-ink"
          >
            {dark
              ? <Sun size={16} strokeWidth={1.5} />
              : <Moon size={16} strokeWidth={1.5} />
            }
          </button>

          {/* Help button */}
          <button
            onClick={onHelpOpen}
            title={`Yardım (${META_LABEL}+/)`}
            aria-label="Klavye kısayollarını göster"
            className="flex h-8 w-8 items-center justify-center text-ink/40 transition-colors hover:bg-paper-warm hover:text-accent"
          >
            <HelpCircle size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </header>
  )
}
