import { type InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

type InputProps = InputHTMLAttributes<HTMLInputElement>

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full border-b border-line bg-transparent py-2 font-sans text-base text-ink placeholder-ink/30 outline-none transition-colors duration-200',
          'hover:border-ink/40 focus:border-accent',
          'aria-[invalid=true]:border-accent',
          className,
        )}
        {...props}
      />
    )
  },
)

Input.displayName = 'Input'
