import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { HelpCircle, Sparkles, Sun, Moon, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { META_LABEL } from '@/hooks/useKeyboardShortcuts'
import { useAIStore } from '@/store'

const navItems = [
  { to: '/dashboard', label: 'CV\'lerim', end: true },
  { to: '/editor',    label: 'Editör' },
  { to: '/preview',   label: 'Önizleme' },
  { to: '/jobs',      label: 'Şirketler' },
]

interface HeaderProps {
  onHelpOpen: () => void
  onAIOpen: () => void
  dark: boolean
  onToggleDark: () => void
}

export function Header({ onHelpOpen, onAIOpen, dark, onToggleDark }: HeaderProps) {
  const apiKey = useAIStore((s) => s.apiKey)
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="relative z-20 border-b border-line bg-paper/80 backdrop-blur-sm">
      <div className="container-prose flex items-center justify-between py-4 md:py-5">

        {/* Logo */}
        <Link to="/" data-tour="home-logo" className="group flex items-center" aria-label="CTRLCV anasayfa">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 250 44"
            className="h-6 w-auto overflow-visible text-ink md:h-7"
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
          {/* Desktop Nav — hidden on mobile */}
          <nav data-tour="home-nav" className="hidden items-center gap-1 md:flex">
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
            data-tour="ai-btn"
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
            data-tour="dark-mode"
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

          {/* Help button — hidden on mobile */}
          <button
            data-tour="help-btn"
            onClick={onHelpOpen}
            title={`Yardım (${META_LABEL}+/)`}
            aria-label="Klavye kısayollarını göster"
            className="hidden h-8 w-8 items-center justify-center text-ink/40 transition-colors hover:bg-paper-warm hover:text-accent md:flex"
          >
            <HelpCircle size={16} strokeWidth={1.5} />
          </button>

          {/* Hamburger — mobile only */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
            className="flex h-8 w-8 items-center justify-center text-ink/60 transition-colors hover:bg-paper-warm hover:text-ink md:hidden"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="border-t border-line bg-paper md:hidden">
          <nav className="container-prose flex flex-col py-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 px-1 py-3 font-sans text-sm tracking-wide transition-colors',
                    'border-b border-line/50 last:border-0',
                    isActive ? 'text-ink font-medium' : 'text-ink/60',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && <span className="h-1 w-1 rounded-full bg-accent" />}
                    {item.label}
                  </>
                )}
              </NavLink>
            ))}
            {/* Help in mobile menu */}
            <button
              type="button"
              onClick={() => { setMenuOpen(false); onHelpOpen() }}
              className="flex items-center gap-2 px-1 py-3 text-left font-sans text-sm tracking-wide text-ink/60 transition-colors"
            >
              <HelpCircle size={14} className="text-ink/30" />
              Yardım &amp; Kısayollar
            </button>
          </nav>
        </div>
      )}
    </header>
  )
}
