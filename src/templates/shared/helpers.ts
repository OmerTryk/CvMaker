/**
 * Shared rendering helpers for CV templates.
 */

import type { CVDocument, CVLanguage, SectionKey, LanguageProficiency } from '@/types/cv'
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
 * Maps language proficiency to a human-readable label (locale-aware).
 */
export const PROFICIENCY_LABELS: Record<CVLanguage, Record<LanguageProficiency, string>> = {
  tr: {
    A1: 'Başlangıç',
    A2: 'Temel',
    B1: 'Orta',
    B2: 'Orta-Üstü',
    C1: 'İleri',
    C2: 'Yetkin',
    Native: 'Anadil',
  },
  en: {
    A1: 'Beginner',
    A2: 'Elementary',
    B1: 'Intermediate',
    B2: 'Upper-Intermediate',
    C1: 'Advanced',
    C2: 'Proficient',
    Native: 'Native',
  },
}

/**
 * Returns the proficiency label for the given language, falling back to the
 * raw proficiency code if it is not a known value.
 */
export function proficiencyLabel(
  proficiency: string,
  lang: CVLanguage = 'tr',
): string {
  return PROFICIENCY_LABELS[lang][proficiency as LanguageProficiency] ?? proficiency
}

/**
 * Backward-compatible Turkish proficiency map (legacy callers).
 * @deprecated use {@link proficiencyLabel} with the CV language.
 */
export const PROFICIENCY_LABEL = PROFICIENCY_LABELS.tr

// ─────────────────────────────────────────────────────────────
// Section titles (locale-aware)
// ─────────────────────────────────────────────────────────────

export const SECTION_TITLES: Record<CVLanguage, Record<SectionKey, string>> = {
  tr: {
    summary: 'Özet',
    experience: 'Deneyim',
    education: 'Eğitim',
    skills: 'Yetenekler',
    projects: 'Projeler',
    languages: 'Diller',
    certificates: 'Sertifikalar',
    references: 'Referanslar',
  },
  en: {
    summary: 'Profile',
    experience: 'Experience',
    education: 'Education',
    skills: 'Skills',
    projects: 'Projects',
    languages: 'Languages',
    certificates: 'Certifications',
    references: 'References',
  },
}

/** Returns the localized title for a section. */
export function sectionTitle(key: SectionKey, lang: CVLanguage = 'tr'): string {
  return SECTION_TITLES[lang][key]
}

/** Misc repeated UI labels used across templates. */
export const MISC_LABELS: Record<CVLanguage, { technologies: string }> = {
  tr: { technologies: 'Teknolojiler' },
  en: { technologies: 'Technologies' },
}
