import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  tone?: 'default' | 'danger' | 'accent'
}

const toneClasses = {
  default: 'text-ink/40 hover:text-ink hover:bg-paper-warm',
  danger: 'text-ink/30 hover:text-accent hover:bg-accent/10',
  accent: 'text-accent hover:bg-accent hover:text-paper',
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ label, tone = 'default', className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        title={label}
        className={cn(
          'inline-flex h-8 w-8 items-center justify-center transition-colors duration-200',
          toneClasses[tone],
          className,
        )}
        {...props}
      >
        {children}
      </button>
    )
  },
)

IconButton.displayName = 'IconButton'
