import { type TextareaHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  showCount?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, showCount, value, maxLength, ...props }, ref) => {
    const length = typeof value === 'string' ? value.length : 0
    return (
      <div className="relative">
        <textarea
          ref={ref}
          value={value}
          maxLength={maxLength}
          className={cn(
            'w-full resize-y border border-line bg-paper-cool/40 px-4 py-3 font-sans text-base text-ink placeholder-ink/30 outline-none transition-colors duration-200',
            'min-h-[120px] hover:border-ink/40 focus:border-accent focus:bg-paper-cool',
            'aria-[invalid=true]:border-accent',
            className,
          )}
          {...props}
        />
        {showCount && maxLength && (
          <span className="pointer-events-none absolute bottom-2 right-3 font-mono text-[10px] uppercase tracking-widest text-ink/30">
            {length}/{maxLength}
          </span>
        )}
      </div>
    )
  },
)

Textarea.displayName = 'Textarea'
