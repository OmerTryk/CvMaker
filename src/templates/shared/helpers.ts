/**
 * Shared rendering helpers for CV templates.
 */

import type { CVDocument, SectionKey } from '@/types/cv'
import { formatMonthYear } from '@/utils/date'

/**
 * Returns the ordered list of visible sections for rendering.
 */
export function getVisibleSections(cv: CVDocument): SectionKey[] {
  const hidden = new Set(cv.hiddenSections)
  return cv.sectionOrder.filter((s) => !hidden.has(s))
}

/**
 * True when a section has any content worth rendering.
 */
export function sectionHasContent(cv: CVDocument, key: SectionKey): boolean {
  switch (key) {
    case 'summary':
      return cv.summary.content.trim().length > 0
    case 'experience':
      return cv.experience.length > 0
    case 'education':
      return cv.education.length > 0
    case 'skills':
      return cv.skills.length > 0
    case 'projects':
      return cv.projects.length > 0
    case 'languages':
      return cv.languages.length > 0
    case 'certificates':
      return cv.certificates.length > 0
    case 'references':
      return cv.references.length > 0
  }
}

/**
 * "Mart 2022 — Devam ediyor" style date range.
 */
export function formatDateRange(
  start: string | null | undefined,
  end: string | null | undefined,
  locale: 'tr' | 'en' = 'tr',
): string {
  if (!start) return ''
  const startStr = formatMonthYear(start, locale)
  const endStr = formatMonthYear(end, locale)
  return `${startStr} — ${endStr}`
}

/**
 * Strip empty strings, return joined non-empty parts.
 * Useful for "City, Country" or "Company · Location"
 */
export function joinParts(parts: (string | null | undefined)[], sep = ' · '): string {
  return parts.filter((p) => p && p.trim()).join(sep)
}

/**
 * Builds a URL display string. Strips https:// and trailing slashes.
 * @example normalizeUrl('https://example.com/') -> 'example.com'
 */
export function normalizeUrl(url: string): string {
  if (!url) return ''
  return url
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')
}

/**
 * Maps language proficiency to a human-readable label.
 */
export const PROFICIENCY_LABEL: Record<string, string> = {
  A1: 'Başlangıç',
  A2: 'Temel',
  B1: 'Orta',
  B2: 'Orta-Üstü',
  C1: 'İleri',
  C2: 'Yetkin',
  Native: 'Anadil',
}
