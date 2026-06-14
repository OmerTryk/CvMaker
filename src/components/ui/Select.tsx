import {
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  /** Optional leading icon rendered inside the trigger. */
  icon?: ReactNode
  /** Extra classes for the trigger button. */
  className?: string
  'aria-invalid'?: boolean
  id?: string
}

interface PopupPos {
  top: number
  left: number
  width: number
  /** true → opened above the trigger (not enough room below) */
  flipped: boolean
}

const MAX_POPUP_H = 256 // px — keeps long lists scrollable

/**
 * Custom dropdown — replaces the native <select> so the option list is fully
 * styleable and readable in both themes. The popup renders through a portal
 * (fixed-positioned) so it is never clipped by scrollable/overflow-hidden
 * ancestors such as the AI drawer.
 */
export function Select({
  value,
  onChange,
  options,
  placeholder = 'Seç…',
  disabled,
  icon,
  className,
  id,
  'aria-invalid': ariaInvalid,
}: SelectProps) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<PopupPos | null>(null)
  const [activeIdx, setActiveIdx] = useState(-1)

  const triggerRef = useRef<HTMLButtonElement>(null)
  const popupRef = useRef<HTMLUListElement>(null)

  const selected = options.find((o) => o.value === value)

  const measure = useCallback(() => {
    const el = triggerRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const spaceBelow = window.innerHeight - r.bottom
    const desiredH = Math.min(MAX_POPUP_H, options.length * 40 + 8)
    const flipped = spaceBelow < desiredH + 8 && r.top > spaceBelow
    setPos({
      top: flipped ? r.top : r.bottom,
      left: r.left,
      width: r.width,
      flipped,
    })
  }, [options.length])

  // Reposition while open; close on outside interaction.
  useLayoutEffect(() => {
    if (!open) return
    measure()
    const onScroll = () => measure()
    const onResize = () => measure()
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node
      if (
        !triggerRef.current?.contains(t) &&
        !popupRef.current?.contains(t)
      ) {
        setOpen(false)
      }
    }
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onResize)
    window.addEventListener('pointerdown', onPointerDown, true)
    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointerdown', onPointerDown, true)
    }
  }, [open, measure])

  const openMenu = useCallback(() => {
    if (disabled) return
    setActiveIdx(Math.max(0, options.findIndex((o) => o.value === value)))
    setOpen(true)
  }, [disabled, options, value])

  const choose = useCallback(
    (v: string) => {
      onChange(v)
      setOpen(false)
      triggerRef.current?.focus()
    },
    [onChange],
  )

  const onTriggerKey = (e: React.KeyboardEvent) => {
    if (disabled) return
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        openMenu()
      }
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => Math.min(options.length - 1, i + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => Math.max(0, i - 1))
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      const opt = options[activeIdx]
      if (opt) choose(opt.value)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
    } else if (e.key === 'Tab') {
      setOpen(false)
    }
  }

  // Keep the active option scrolled into view.
  useEffect(() => {
    if (!open || !popupRef.current) return
    const node = popupRef.current.children[activeIdx] as HTMLElement | undefined
    node?.scrollIntoView({ block: 'nearest' })
  }, [activeIdx, open])

  return (
    <>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-invalid={ariaInvalid}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onTriggerKey}
        className={cn(
          'relative flex w-full items-center border-b border-line bg-transparent py-2 pr-8 text-left font-sans text-base text-ink outline-none transition-colors duration-200',
          'hover:border-ink/40 focus-visible:border-accent',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'aria-[invalid=true]:border-accent',
          icon ? 'pl-7' : 'pl-0',
          className,
        )}
      >
        {icon && (
          <span className="pointer-events-none absolute left-1.5 top-1/2 -translate-y-1/2 text-ink/40">
            {icon}
          </span>
        )}
        <span className={cn('truncate', !selected && 'text-ink/40')}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={14}
          className={cn(
            'pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-ink/40 transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>

      {open &&
        pos &&
        createPortal(
          <ul
            ref={popupRef}
            role="listbox"
            style={{
              position: 'fixed',
              left: pos.left,
              width: pos.width,
              maxHeight: MAX_POPUP_H,
              ...(pos.flipped
                ? { bottom: window.innerHeight - pos.top + 4 }
                : { top: pos.top + 4 }),
            }}
            className="z-[70] overflow-y-auto border border-line bg-paper py-1 shadow-xl shadow-ink/10 ring-1 ring-ink/5"
          >
            {options.map((opt, i) => {
              const isSelected = opt.value === value
              const isActive = i === activeIdx
              return (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  onPointerEnter={() => setActiveIdx(i)}
                  onClick={() => choose(opt.value)}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 px-3 py-2 font-sans text-sm transition-colors',
                    isActive ? 'bg-accent/10 text-ink' : 'text-ink/70',
                    isSelected && 'font-medium text-ink',
                  )}
                >
                  <Check
                    size={13}
                    className={cn(
                      'shrink-0 text-accent transition-opacity',
                      isSelected ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  <span className="truncate">{opt.label}</span>
                </li>
              )
            })}
          </ul>,
          document.body,
        )}
    </>
  )
}
