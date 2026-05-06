/**
 * CV data model — Zod-first.
 *
 * All types are inferred from Zod schemas, ensuring runtime validation
 * and TypeScript types stay in sync. Use these schemas to validate
 * imported JSON, form input, and persisted localStorage data.
 */

import { z } from 'zod'

// ─────────────────────────────────────────────────────────────
// Primitives
// ─────────────────────────────────────────────────────────────

/** YYYY-MM format (e.g. "2024-03") */
const monthDate = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Tarih YYYY-MM formatında olmalı')

const optionalMonthDate = monthDate.nullable().or(z.literal('').transform(() => null))

const url = z.string().url('Geçerli bir URL girin').or(z.literal(''))
const email = z.string().email('Geçerli bir e-posta girin').or(z.literal(''))

// ─────────────────────────────────────────────────────────────
// Personal Information
// ─────────────────────────────────────────────────────────────

export const PersonalInfoSchema = z.object({
  fullName: z.string().min(1, 'Ad soyad zorunludur').max(100),
  jobTitle: z.string().max(120).default(''),
  photoUrl: z.string().default(''),
})
export type PersonalInfo = z.infer<typeof PersonalInfoSchema>

// ─────────────────────────────────────────────────────────────
// Contact Information
// ─────────────────────────────────────────────────────────────

export const ContactInfoSchema = z.object({
  email: email.default(''),
  phone: z.string().max(30).default(''),
  location: z.string().max(120).default(''),
  website: url.default(''),
  linkedin: z.string().max(200).default(''),
  github: z.string().max(200).default(''),
  twitter: z.string().max(200).default(''),
})
export type ContactInfo = z.infer<typeof ContactInfoSchema>

// ─────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────

export const SummarySchema = z.object({
  content: z.string().max(800, 'Özet en fazla 800 karakter olabilir').default(''),
})
export type Summary = z.infer<typeof SummarySchema>

// ─────────────────────────────────────────────────────────────
// Experience
// ─────────────────────────────────────────────────────────────

export const ExperienceSchema = z.object({
  id: z.string(),
  company: z.string().min(1, 'Şirket adı zorunludur').max(120),
  position: z.string().min(1, 'Pozisyon zorunludur').max(120),
  location: z.string().max(120).default(''),
  startDate: monthDate,
  endDate: optionalMonthDate,
  current: z.boolean().default(false),
  description: z.string().max(2000).default(''),
  achievements: z.array(z.string().max(300)).default([]),
})
export type Experience = z.infer<typeof ExperienceSchema>

// ─────────────────────────────────────────────────────────────
// Education
// ─────────────────────────────────────────────────────────────

export const EducationSchema = z.object({
  id: z.string(),
  institution: z.string().min(1, 'Kurum adı zorunludur').max(150),
  degree: z.string().max(120).default(''),
  field: z.string().max(150).default(''),
  location: z.string().max(120).default(''),
  startDate: monthDate,
  endDate: optionalMonthDate,
  current: z.boolean().default(false),
  gpa: z.string().max(20).default(''),
  description: z.string().max(800).default(''),
})
export type Education = z.infer<typeof EducationSchema>

// ─────────────────────────────────────────────────────────────
// Skill
// ─────────────────────────────────────────────────────────────

export const SkillLevelSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
])
export type SkillLevel = z.infer<typeof SkillLevelSchema>

export const SkillSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Yetenek adı zorunludur').max(80),
  level: SkillLevelSchema.optional(),
  category: z.string().max(60).default(''),
})
export type Skill = z.infer<typeof SkillSchema>

// ─────────────────────────────────────────────────────────────
// Language
// ─────────────────────────────────────────────────────────────

export const LanguageProficiencySchema = z.enum([
  'A1',
  'A2',
  'B1',
  'B2',
  'C1',
  'C2',
  'Native',
])
export type LanguageProficiency = z.infer<typeof LanguageProficiencySchema>

export const LanguageSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Dil adı zorunludur').max(60),
  proficiency: LanguageProficiencySchema.default('B2'),
})
export type Language = z.infer<typeof LanguageSchema>

// ─────────────────────────────────────────────────────────────
// Certificate
// ─────────────────────────────────────────────────────────────

export const CertificateSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Sertifika adı zorunludur').max(150),
  issuer: z.string().max(120).default(''),
  date: monthDate,
  url: url.default(''),
  credentialId: z.string().max(100).default(''),
})
export type Certificate = z.infer<typeof CertificateSchema>

// ─────────────────────────────────────────────────────────────
// Project
// ─────────────────────────────────────────────────────────────

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Proje adı zorunludur').max(120),
  description: z.string().max(800).default(''),
  url: url.default(''),
  technologies: z.array(z.string().max(40)).default([]),
  startDate: optionalMonthDate,
  endDate: optionalMonthDate,
})
export type Project = z.infer<typeof ProjectSchema>

// ─────────────────────────────────────────────────────────────
// Reference
// ─────────────────────────────────────────────────────────────

export const ReferenceSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'İsim zorunludur').max(120),
  position: z.string().max(120).default(''),
  company: z.string().max(120).default(''),
  email: email.default(''),
  phone: z.string().max(30).default(''),
})
export type Reference = z.infer<typeof ReferenceSchema>

// ─────────────────────────────────────────────────────────────
// Settings (template, theme, language)
// ─────────────────────────────────────────────────────────────

export const TemplateSchema = z.enum(['modern', 'classic', 'minimal'])
export type Template = z.infer<typeof TemplateSchema>

export const ColorThemeSchema = z.enum(['ink', 'sienna', 'forest', 'navy', 'plum'])
export type ColorTheme = z.infer<typeof ColorThemeSchema>

export const FontFamilySchema = z.enum(['serif', 'sans', 'mixed'])
export type FontFamily = z.infer<typeof FontFamilySchema>

export const CVLanguageSchema = z.enum(['tr', 'en'])
export type CVLanguage = z.infer<typeof CVLanguageSchema>

export const CVSettingsSchema = z.object({
  template: TemplateSchema.default('modern'),
  colorTheme: ColorThemeSchema.default('ink'),
  fontFamily: FontFamilySchema.default('mixed'),
  language: CVLanguageSchema.default('tr'),
})
export type CVSettings = z.infer<typeof CVSettingsSchema>

// ─────────────────────────────────────────────────────────────
// Section ordering & visibility
// ─────────────────────────────────────────────────────────────

export const SectionKeySchema = z.enum([
  'summary',
  'experience',
  'education',
  'skills',
  'projects',
  'languages',
  'certificates',
  'references',
])
export type SectionKey = z.infer<typeof SectionKeySchema>

export const ALL_SECTIONS: readonly SectionKey[] = [
  'summary',
  'experience',
  'education',
  'skills',
  'projects',
  'languages',
  'certificates',
  'references',
] as const

export const SECTION_LABELS: Record<SectionKey, string> = {
  summary: 'Özet',
  experience: 'Deneyim',
  education: 'Eğitim',
  skills: 'Yetenekler',
  projects: 'Projeler',
  languages: 'Diller',
  certificates: 'Sertifikalar',
  references: 'Referanslar',
}

// ─────────────────────────────────────────────────────────────
// CV Document — the root entity
// ─────────────────────────────────────────────────────────────

export const CVDocumentSchema = z.object({
  id: z.string(),
  title: z.string().default('Yeni CV'),
  createdAt: z.string(),
  updatedAt: z.string(),

  // Content
  personal: PersonalInfoSchema,
  contact: ContactInfoSchema,
  summary: SummarySchema,
  experience: z.array(ExperienceSchema).default([]),
  education: z.array(EducationSchema).default([]),
  skills: z.array(SkillSchema).default([]),
  languages: z.array(LanguageSchema).default([]),
  certificates: z.array(CertificateSchema).default([]),
  projects: z.array(ProjectSchema).default([]),
  references: z.array(ReferenceSchema).default([]),

  // Settings & layout
  settings: CVSettingsSchema,
  sectionOrder: z.array(SectionKeySchema).default([...ALL_SECTIONS]),
  hiddenSections: z.array(SectionKeySchema).default(['references']),
})
export type CVDocument = z.infer<typeof CVDocumentSchema>

// ─────────────────────────────────────────────────────────────
// Helper — type for any CV section item that has an id
// ─────────────────────────────────────────────────────────────

export type CVSectionItem =
  | Experience
  | Education
  | Skill
  | Language
  | Certificate
  | Project
  | Reference
