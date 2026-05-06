import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines class names intelligently, merging Tailwind classes
 * to avoid conflicts (e.g. `px-2 px-4` -> `px-4`).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
