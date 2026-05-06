import { type InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

type MonthInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>

/**
 * Native HTML5 month picker (<input type="month">).
 * Returns YYYY-MM strings via onChange.
 */
export const MonthInput = forwardRef<HTMLInputElement, MonthInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type="month"
        className={cn(
          'w-full border-b border-line bg-transparent py-2 font-mono text-sm text-ink outline-none transition-colors duration-200',
          'hover:border-ink/40 focus:border-accent',
          '[color-scheme:light]',
          className,
        )}
        {...props}
      />
    )
  },
)

MonthInput.displayName = 'MonthInput'
