import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'ghost' | 'danger' | 'subtle'
type Size = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-ink text-paper hover:bg-accent border border-ink hover:border-accent',
  ghost:
    'bg-transparent text-ink border border-line hover:border-ink hover:bg-ink hover:text-paper',
  danger:
    'bg-transparent text-accent border border-accent/30 hover:bg-accent hover:text-paper hover:border-accent',
  subtle:
    'bg-transparent text-ink/60 border border-transparent hover:text-ink hover:bg-paper-warm',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-2 text-[10px]',
  md: 'px-5 py-3 text-xs',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-mono uppercase tracking-widest transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      />
    )
  },
)

Button.displayName = 'Button'
