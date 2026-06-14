/**
 * cv-extract.ts — Maps AI-extracted CV text to a validated CVDocument.
 *
 * Pipeline:
 *   raw AI string → parseExtractedJSON (loose Zod) → extractedToCVDocument (ids + normalization) → CVDocument
 */

import { z } from 'zod'
import { createEmptyCV } from '@/lib/seed'
import { createId } from '@/utils/id'
import { parseToMonthDate, currentMonth, nowISO } from '@/utils/date'
import {
  CVDocumentSchema,
  type CVDocument,
  type LanguageProficiency,
} from '@/types/cv'

// ─────────────────────────────────────────────────────────────
// Loose extraction schema (what the AI produces)
//
// Every field is bulletproof: `.catch()` guarantees a single malformed
// value (wrong type, null, object instead of string…) falls back to a
// default instead of failing the WHOLE parse. The AI only has to get the
// rough shape right — individual deviations are absorbed silently.
// ─────────────────────────────────────────────────────────────

/** Accepts anything, coerces to string, never throws. */
const looseStr = z.preprocess(
  (v) =>
    v == null ? '' :
    typeof v === 'string' ? v :
    typeof v === 'number' || typeof v === 'boolean' ? String(v) :
    '',
  z.string(),
).catch('')

/** Accepts a string, an array, or null → always an array of strings. */
const looseStrArray = z.preprocess(
  (v) => (Array.isArray(v) ? v : typeof v === 'string' && v ? [v] : []),
  z.array(looseStr),
).catch([] as string[])

const looseBool = z.preprocess(
  (v) => (typeof v === 'boolean' ? v : /^(true|yes|evet)$/i.test(String(v))),
  z.boolean(),
).catch(false)

const ExperienceRow = z.object({
  company:      looseStr,
  position:     looseStr,
  location:     looseStr,
  startDate:    looseStr,
  endDate:      looseStr,
  current:      looseBool,
  description:  looseStr,
  achievements: looseStrArray,
}).catch({ company: '', position: '', location: '', startDate: '', endDate: '', current: false, description: '', achievements: [] })

const EducationRow = z.object({
  institution:  looseStr,
  degree:       looseStr,
  field:        looseStr,
  location:     looseStr,
  startDate:    looseStr,
  endDate:      looseStr,
  current:      looseBool,
  gpa:          looseStr,
  description:  looseStr,
}).catch({ institution: '', degree: '', field: '', location: '', startDate: '', endDate: '', current: false, gpa: '', description: '' })

// Skills may arrive as objects OR as a bare string (e.g. "React").
const SkillRow = z.preprocess(
  (v) => (typeof v === 'string' ? { name: v } : v),
  z.object({
    name:     looseStr,
    level:    z.union([z.number(), z.string()]).catch(3),
    category: looseStr,
  }),
).catch({ name: '', level: 3, category: '' })

// Languages may arrive as objects OR as a bare string (e.g. "İngilizce").
const LanguageRow = z.preprocess(
  (v) => (typeof v === 'string' ? { name: v } : v),
  z.object({
    name:        looseStr,
    proficiency: looseStr,
  }),
).catch({ name: '', proficiency: 'B2' })

const CertificateRow = z.object({
  name:         looseStr,
  issuer:       looseStr,
  date:         looseStr,
  url:          looseStr,
  credentialId: looseStr,
}).catch({ name: '', issuer: '', date: '', url: '', credentialId: '' })

const ProjectRow = z.object({
  name:         looseStr,
  description:  looseStr,
  url:          looseStr,
  technologies: looseStrArray,
  startDate:    looseStr,
  endDate:      looseStr,
}).catch({ name: '', description: '', url: '', technologies: [], startDate: '', endDate: '' })

const ExtractedCVSchema = z.object({
  personal: z.object({
    fullName: looseStr,
    jobTitle: looseStr,
  }).catch({ fullName: '', jobTitle: '' }),
  contact: z.object({
    email:    looseStr,
    phone:    looseStr,
    location: looseStr,
    website:  looseStr,
    linkedin: looseStr,
    github:   looseStr,
    twitter:  looseStr,
  }).catch({ email: '', phone: '', location: '', website: '', linkedin: '', github: '', twitter: '' }),
  summary:      looseStr,
  experience:   z.array(ExperienceRow).catch([]),
  education:    z.array(EducationRow).catch([]),
  skills:       z.array(SkillRow).catch([]),
  languages:    z.array(LanguageRow).catch([]),
  certificates: z.array(CertificateRow).catch([]),
  projects:     z.array(ProjectRow).catch([]),
}).catch({
  personal: { fullName: '', jobTitle: '' },
  contact: { email: '', phone: '', location: '', website: '', linkedin: '', github: '', twitter: '' },
  summary: '', experience: [], education: [], skills: [], languages: [], certificates: [], projects: [],
})

type ExtractedCV = z.infer<typeof ExtractedCVSchema>

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function cap(s: string, max: number): string {
  return (s ?? '').slice(0, max)
}

function normalizeUrl(s: string): string {
  const t = (s ?? '').trim()
  if (!t) return ''
  const withProto = /^https?:\/\//i.test(t) ? t : `https://${t}`
  try { new URL(withProto); return withProto } catch { return '' }
}

function normalizeEmail(s: string): string {
  const t = (s ?? '').trim()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t) ? t : ''
}

const VALID_PROFICIENCIES = new Set<string>(['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Native'])

function coerceProficiency(s: string): LanguageProficiency {
  const u = (s ?? '').toUpperCase().trim()
  if (VALID_PROFICIENCIES.has(u)) return u as LanguageProficiency
  if (/native|ana ?dil|mother/i.test(s)) return 'Native'
  if (/c2|ileri düzey|advanced/i.test(s)) return 'C2'
  if (/c1|üst orta/i.test(s)) return 'C1'
  if (/b1/i.test(s)) return 'B1'
  if (/a2/i.test(s)) return 'A2'
  if (/a1|temel/i.test(s)) return 'A1'
  return 'B2'
}

function coerceLevel(v: number | string): 1 | 2 | 3 | 4 | 5 {
  const n = typeof v === 'string' ? parseInt(v, 10) : v
  if (Number.isInteger(n) && n >= 1 && n <= 5) return n as 1 | 2 | 3 | 4 | 5
  return 3
}

// ─────────────────────────────────────────────────────────────
// JSON parser — strip markdown fences, extract outermost object
// ─────────────────────────────────────────────────────────────

/**
 * Best-effort JSON.parse for AI output. Tries the raw slice first, then a
 * repaired version (trailing commas stripped, unbalanced brackets closed) so
 * a truncated or slightly malformed response still yields usable data.
 */
function tolerantJSONParse(slice: string): unknown | null {
  try {
    return JSON.parse(slice)
  } catch {
    // ── Repair pass ──
    let s = slice
      // Remove trailing commas before } or ]
      .replace(/,\s*([}\]])/g, '$1')

    // Balance unclosed brackets/braces (common when the stream is truncated).
    // Count only those outside strings.
    let inStr = false
    let escaped = false
    const stack: string[] = []
    for (const ch of s) {
      if (escaped) { escaped = false; continue }
      if (ch === '\\') { escaped = true; continue }
      if (ch === '"') { inStr = !inStr; continue }
      if (inStr) continue
      if (ch === '{' || ch === '[') stack.push(ch)
      else if (ch === '}' || ch === ']') stack.pop()
    }
    // If a string was left open, close it first.
    if (inStr) s += '"'
    while (stack.length) s += stack.pop() === '{' ? '}' : ']'

    try {
      return JSON.parse(s)
    } catch {
      return null
    }
  }
}

function parseExtractedJSON(raw: string): ExtractedCV | null {
  // Same fence-stripping used in JobMatchWidget.tsx:107
  const cleaned = raw.replace(/```json|```/g, '').trim()
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start === -1) return null
  // If '}' is missing (truncated), parse from '{' to the end and let the
  // tolerant parser close the brackets.
  const slice = end > start ? cleaned.slice(start, end + 1) : cleaned.slice(start)

  const json = tolerantJSONParse(slice)
  if (json == null) {
    console.warn('[cv-extract] JSON parse failed after repair attempt')
    return null
  }

  // The loose schema below has .catch() on every field, so safeParse
  // effectively never fails — but keep the guard for type safety.
  const parsed = ExtractedCVSchema.safeParse(json)
  return parsed.success ? parsed.data : null
}

// ─────────────────────────────────────────────────────────────
// Mapper: ExtractedCV → CVDocument
// ─────────────────────────────────────────────────────────────

function extractedToCVDocument(e: ExtractedCV): CVDocument | null {
  const base = createEmptyCV()
  const candidate: CVDocument = {
    ...base,
    updatedAt: nowISO(),

    personal: {
      fullName: cap(e.personal.fullName, 100) || 'Bilinmiyor',
      jobTitle: cap(e.personal.jobTitle, 120),
      photoUrl: '',
    },

    contact: {
      email:    cap(normalizeEmail(e.contact.email), 200),
      phone:    cap(e.contact.phone, 30),
      location: cap(e.contact.location, 120),
      website:  cap(normalizeUrl(e.contact.website), 200),
      linkedin: cap(e.contact.linkedin, 200),
      github:   cap(e.contact.github, 200),
      twitter:  cap(e.contact.twitter, 200),
    },

    summary: { content: cap(e.summary, 800) },

    experience: e.experience
      .filter((x) => x.company || x.position)
      .map((x) => ({
        id:           createId(),
        company:      cap(x.company, 120) || 'Bilinmiyor',
        position:     cap(x.position, 120) || 'Bilinmiyor',
        location:     cap(x.location, 120),
        startDate:    parseToMonthDate(x.startDate) ?? currentMonth(),
        endDate:      parseToMonthDate(x.endDate) ?? null,
        current:      x.current || !parseToMonthDate(x.endDate),
        description:  cap(x.description, 2000),
        achievements: x.achievements.map((a) => cap(a, 300)).slice(0, 15),
      })),

    education: e.education
      .filter((x) => x.institution || x.degree)
      .map((x) => ({
        id:          createId(),
        institution: cap(x.institution, 150) || 'Bilinmiyor',
        degree:      cap(x.degree, 120),
        field:       cap(x.field, 150),
        location:    cap(x.location, 120),
        startDate:   parseToMonthDate(x.startDate) ?? '2020-09',
        endDate:     parseToMonthDate(x.endDate) ?? null,
        current:     x.current,
        gpa:         cap(x.gpa, 20),
        description: cap(x.description, 800),
      })),

    skills: e.skills
      .filter((x) => x.name)
      .map((x) => ({
        id:       createId(),
        name:     cap(x.name, 80),
        level:    coerceLevel(x.level),
        category: cap(x.category, 60),
      })),

    languages: e.languages
      .filter((x) => x.name)
      .map((x) => ({
        id:          createId(),
        name:        cap(x.name, 60),
        proficiency: coerceProficiency(x.proficiency),
      })),

    certificates: e.certificates
      .filter((x) => x.name)
      .map((x) => ({
        id:           createId(),
        name:         cap(x.name, 150),
        issuer:       cap(x.issuer, 120),
        date:         parseToMonthDate(x.date) ?? currentMonth(),
        url:          cap(normalizeUrl(x.url), 200),
        credentialId: cap(x.credentialId, 100),
      })),

    projects: e.projects
      .filter((x) => x.name)
      .map((x) => ({
        id:           createId(),
        name:         cap(x.name, 120),
        description:  cap(x.description, 800),
        url:          cap(normalizeUrl(x.url), 200),
        technologies: x.technologies.map((t) => cap(t, 40)).slice(0, 20),
        startDate:    parseToMonthDate(x.startDate) ?? null,
        endDate:      parseToMonthDate(x.endDate) ?? null,
      })),

    references: [],
  }

  const result = CVDocumentSchema.safeParse(candidate)
  if (!result.success) {
    // Should be unreachable now that the loose schema sanitizes every field,
    // but log the exact issues so any remaining edge case is diagnosable.
    console.warn('[cv-extract] CVDocument validation failed:', result.error.issues)
    return null
  }
  return result.data
}

// ─────────────────────────────────────────────────────────────
// Public entry point
// ─────────────────────────────────────────────────────────────

export function parseAndMapExtracted(raw: string): CVDocument | null {
  const extracted = parseExtractedJSON(raw)
  if (!extracted) return null
  return extractedToCVDocument(extracted)
}
