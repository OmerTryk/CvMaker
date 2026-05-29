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
// ─────────────────────────────────────────────────────────────

const ExperienceRow = z.object({
  company:      z.string().default(''),
  position:     z.string().default(''),
  location:     z.string().default(''),
  startDate:    z.string().default(''),
  endDate:      z.union([z.string(), z.null()]).default(null),
  current:      z.boolean().default(false),
  description:  z.string().default(''),
  achievements: z.array(z.string()).default([]),
})

const EducationRow = z.object({
  institution:  z.string().default(''),
  degree:       z.string().default(''),
  field:        z.string().default(''),
  location:     z.string().default(''),
  startDate:    z.string().default(''),
  endDate:      z.union([z.string(), z.null()]).default(null),
  current:      z.boolean().default(false),
  gpa:          z.string().default(''),
  description:  z.string().default(''),
})

const SkillRow = z.object({
  name:     z.string().default(''),
  level:    z.union([z.number(), z.string()]).default(3),
  category: z.string().default(''),
})

const LanguageRow = z.object({
  name:        z.string().default(''),
  proficiency: z.string().default('B2'),
})

const CertificateRow = z.object({
  name:         z.string().default(''),
  issuer:       z.string().default(''),
  date:         z.string().default(''),
  url:          z.string().default(''),
  credentialId: z.string().default(''),
})

const ProjectRow = z.object({
  name:         z.string().default(''),
  description:  z.string().default(''),
  url:          z.string().default(''),
  technologies: z.array(z.string()).default([]),
  startDate:    z.union([z.string(), z.null()]).default(null),
  endDate:      z.union([z.string(), z.null()]).default(null),
})

const ExtractedCVSchema = z.object({
  personal: z.object({
    fullName: z.string().default(''),
    jobTitle: z.string().default(''),
  }).default({}),
  contact: z.object({
    email:    z.string().default(''),
    phone:    z.string().default(''),
    location: z.string().default(''),
    website:  z.string().default(''),
    linkedin: z.string().default(''),
    github:   z.string().default(''),
    twitter:  z.string().default(''),
  }).default({}),
  summary:      z.string().default(''),
  experience:   z.array(ExperienceRow).default([]),
  education:    z.array(EducationRow).default([]),
  skills:       z.array(SkillRow).default([]),
  languages:    z.array(LanguageRow).default([]),
  certificates: z.array(CertificateRow).default([]),
  projects:     z.array(ProjectRow).default([]),
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

function parseExtractedJSON(raw: string): ExtractedCV | null {
  try {
    // Same fence-stripping used in JobMatchWidget.tsx:107
    const cleaned = raw.replace(/```json|```/g, '').trim()
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    if (start === -1 || end === -1) return null
    const parsed = ExtractedCVSchema.safeParse(JSON.parse(cleaned.slice(start, end + 1)))
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
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
      fullName: cap(e.personal.fullName, 100),
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
  return result.success ? result.data : null
}

// ─────────────────────────────────────────────────────────────
// Public entry point
// ─────────────────────────────────────────────────────────────

export function parseAndMapExtracted(raw: string): CVDocument | null {
  const extracted = parseExtractedJSON(raw)
  if (!extracted) return null
  return extractedToCVDocument(extracted)
}
