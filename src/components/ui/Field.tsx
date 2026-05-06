import { type ReactNode, useId } from 'react'
import { cn } from '@/lib/utils'

interface FieldProps {
  label?: string
  required?: boolean
  hint?: string
  error?: string
  className?: string
  children: (props: { id: string; 'aria-invalid'?: boolean }) => ReactNode
}

/**
 * Form field wrapper providing label, hint and error display.
 * Render-prop style so the input gets a stable `id` for accessibility.
 */
export function Field({
  label,
  required,
  hint,
  error,
  className,
  children,
}: FieldProps) {
  const id = useId()
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label
          htmlFor={id}
          className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-widest text-ink/60"
        >
          <span>
            {label}
            {required && <span className="ml-1 text-accent">*</span>}
          </span>
          {hint && <span className="text-ink/30 normal-case">{hint}</span>}
        </label>
      )}
      {children({ id, 'aria-invalid': !!error || undefined })}
      {error && (
        <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
          {error}
        </p>
      )}
    </div>
  )
}
