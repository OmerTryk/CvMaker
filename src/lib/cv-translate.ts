/**
 * cv-translate.ts — Produces an English copy of a CV from AI translation output.
 *
 * Strategy: send ONLY translatable text fields (positional), get the same
 * shape back translated, then merge onto a deep clone of the original CV so
 * that ids, dates, proper nouns and structure are preserved.
 *
 * Pipeline:
 *   buildTranslationPayload(cv) → JSON → AI → applyTranslation(cv, raw) → CVDocument
 */

import { z } from 'zod'
import { CVDocumentSchema, type CVDocument } from '@/types/cv'
import { createId } from '@/utils/id'
import { nowISO } from '@/utils/date'

// ─────────────────────────────────────────────────────────────
// Payload — only translatable text, positional by array index
// ─────────────────────────────────────────────────────────────

export interface TranslationPayload {
  title: string
  jobTitle: string
  summary: string
  experience: { position: string; description: string; achievements: string[] }[]
  education: { degree: string; field: string }[]
  /** Unique, non-empty skill categories (mapped back by value). */
  skillCategories: string[]
  languageNames: string[]
  projects: { name: string; description: string }[]
  references: { position: string }[]
}

export function buildTranslationPayload(cv: CVDocument): TranslationPayload {
  const uniqueCategories = Array.from(
    new Set(cv.skills.map((s) => s.category).filter((c) => c.trim().length > 0)),
  )

  return {
    title: cv.title,
    jobTitle: cv.personal.jobTitle,
    summary: cv.summary.content,
    experience: cv.experience.map((e) => ({
      position: e.position,
      description: e.description,
      achievements: e.achievements,
    })),
    education: cv.education.map((e) => ({ degree: e.degree, field: e.field })),
    skillCategories: uniqueCategories,
    languageNames: cv.languages.map((l) => l.name),
    projects: cv.projects.map((p) => ({ name: p.name, description: p.description })),
    references: cv.references.map((r) => ({ position: r.position })),
  }
}

// ─────────────────────────────────────────────────────────────
// Loose schema for the AI response (all optional / defaulted)
// ─────────────────────────────────────────────────────────────

const TranslatedSchema = z.object({
  title: z.string().optional(),
  jobTitle: z.string().optional(),
  summary: z.string().optional(),
  experience: z
    .array(
      z.object({
        position: z.string().optional(),
        description: z.string().optional(),
        achievements: z.array(z.string()).optional(),
      }),
    )
    .optional(),
  education: z
    .array(z.object({ degree: z.string().optional(), field: z.string().optional() }))
    .optional(),
  skillCategories: z.array(z.string()).optional(),
  languageNames: z.array(z.string()).optional(),
  projects: z
    .array(z.object({ name: z.string().optional(), description: z.string().optional() }))
    .optional(),
  references: z.array(z.object({ position: z.string().optional() })).optional(),
})

type Translated = z.infer<typeof TranslatedSchema>

/** Strip markdown fences and parse the outermost JSON object. */
function parseTranslated(raw: string): Translated | null {
  try {
    const cleaned = raw.replace(/```json|```/g, '').trim()
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    if (start === -1 || end === -1) return null
    const parsed = TranslatedSchema.safeParse(JSON.parse(cleaned.slice(start, end + 1)))
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

/** Returns `next` when it is a non-empty string, otherwise keeps `prev`. */
function pick(prev: string, next: string | undefined): string {
  return next && next.trim().length > 0 ? next : prev
}

// ─────────────────────────────────────────────────────────────
// Merge translated text onto a clone of the original CV
// ─────────────────────────────────────────────────────────────

export function applyTranslation(cv: CVDocument, raw: string): CVDocument | null {
  const t = parseTranslated(raw)
  if (!t) return null

  // Deep clone — dates/ids/proper nouns stay intact.
  const next: CVDocument = JSON.parse(JSON.stringify(cv))

  next.title = pick(cv.title, t.title)
  next.personal.jobTitle = pick(cv.personal.jobTitle, t.jobTitle)
  next.summary.content = pick(cv.summary.content, t.summary)

  next.experience = next.experience.map((exp, i) => {
    const te = t.experience?.[i]
    return {
      ...exp,
      position: pick(exp.position, te?.position),
      description: pick(exp.description, te?.description),
      achievements: exp.achievements.map((a, j) => pick(a, te?.achievements?.[j])),
    }
  })

  next.education = next.education.map((edu, i) => {
    const te = t.education?.[i]
    return {
      ...edu,
      degree: pick(edu.degree, te?.degree),
      field: pick(edu.field, te?.field),
    }
  })

  // Skill categories: map original unique value → translated value.
  const originalCategories = buildTranslationPayload(cv).skillCategories
  const categoryMap = new Map<string, string>()
  originalCategories.forEach((cat, i) => {
    categoryMap.set(cat, pick(cat, t.skillCategories?.[i]))
  })
  next.skills = next.skills.map((s) => ({
    ...s,
    category: categoryMap.get(s.category) ?? s.category,
  }))

  next.languages = next.languages.map((l, i) => ({
    ...l,
    name: pick(l.name, t.languageNames?.[i]),
  }))

  next.projects = next.projects.map((p, i) => {
    const tp = t.projects?.[i]
    return {
      ...p,
      name: pick(p.name, tp?.name),
      description: pick(p.description, tp?.description),
    }
  })

  next.references = next.references.map((r, i) => ({
    ...r,
    position: pick(r.position, t.references?.[i]?.position),
  }))

  // New identity + English language.
  const now = nowISO()
  next.id = createId()
  next.createdAt = now
  next.updatedAt = now
  next.settings = { ...next.settings, language: 'en' }
  if (!t.title || !t.title.trim()) {
    next.title = `${cv.title} (EN)`
  }

  const result = CVDocumentSchema.safeParse(next)
  return result.success ? result.data : null
}
