import { Link, NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: 'Anasayfa', end: true },
  { to: '/editor', label: 'Editör' },
  { to: '/preview', label: 'Önizleme' },
]

export function Header() {
  return (
    <header className="relative z-20 border-b border-line bg-paper/80 backdrop-blur-sm">
      <div className="container-prose flex items-center justify-between py-5">
        <Link
          to="/"
          className="group flex items-baseline gap-2"
          aria-label="CV Maker anasayfa"
        >
          <span className="font-display text-2xl font-medium tracking-tightest text-ink">
            cv<span className="text-accent">·</span>maker
          </span>
          <span className="hidden font-mono text-[10px] uppercase tracking-widest text-ink/50 sm:inline">
            v0.1
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
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
      </div>
    </header>
  )
}
