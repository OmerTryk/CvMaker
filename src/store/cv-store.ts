/**
 * Zustand store for CV state.
 *
 * Persists to localStorage automatically (Zustand `persist` middleware).
 * All array sections (experience, education, etc.) follow the same
 * add / update / remove / reorder pattern.
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import {
  CVDocumentSchema,
  type CVDocument,
  type PersonalInfo,
  type ContactInfo,
  type Experience,
  type Education,
  type Skill,
  type Language,
  type Certificate,
  type Project,
  type Reference,
  type CVSettings,
  type SectionKey,
} from '@/types/cv'
import { createEmptyCV, createSampleCV } from '@/lib/seed'
import {
  createEmptyExperience,
  createEmptyEducation,
  createEmptySkill,
  createEmptyLanguage,
  createEmptyCertificate,
  createEmptyProject,
  createEmptyReference,
} from '@/lib/seed'
import { nowISO } from '@/utils/date'

const STORAGE_KEY = 'cvmaker.cv.v1'

// ─────────────────────────────────────────────────────────────
// Store interface
// ─────────────────────────────────────────────────────────────

export type ImportResult = { success: true } | { success: false; error: string }

export interface CVStore {
  cv: CVDocument
  lastSavedAt: string | null

  // Top-level sections
  updatePersonal: (data: Partial<PersonalInfo>) => void
  updateContact: (data: Partial<ContactInfo>) => void
  updateSummary: (content: string) => void
  updateTitle: (title: string) => void

  // Experience
  addExperience: () => string
  updateExperience: (id: string, data: Partial<Experience>) => void
  removeExperience: (id: string) => void
  reorderExperience: (fromIndex: number, toIndex: number) => void

  // Education
  addEducation: () => string
  updateEducation: (id: string, data: Partial<Education>) => void
  removeEducation: (id: string) => void
  reorderEducation: (fromIndex: number, toIndex: number) => void

  // Skills
  addSkill: () => string
  updateSkill: (id: string, data: Partial<Skill>) => void
  removeSkill: (id: string) => void
  reorderSkills: (fromIndex: number, toIndex: number) => void

  // Languages
  addLanguage: () => string
  updateLanguage: (id: string, data: Partial<Language>) => void
  removeLanguage: (id: string) => void
  reorderLanguages: (fromIndex: number, toIndex: number) => void

  // Certificates
  addCertificate: () => string
  updateCertificate: (id: string, data: Partial<Certificate>) => void
  removeCertificate: (id: string) => void
  reorderCertificates: (fromIndex: number, toIndex: number) => void

  // Projects
  addProject: () => string
  updateProject: (id: string, data: Partial<Project>) => void
  removeProject: (id: string) => void
  reorderProjects: (fromIndex: number, toIndex: number) => void

  // References
  addReference: () => string
  updateReference: (id: string, data: Partial<Reference>) => void
  removeReference: (id: string) => void
  reorderReferences: (fromIndex: number, toIndex: number) => void

  // Settings
  updateSettings: (data: Partial<CVSettings>) => void

  // Section management
  toggleSection: (key: SectionKey) => void
  reorderSections: (fromIndex: number, toIndex: number) => void

  // Document operations
  resetCV: () => void
  loadSample: () => void
  loadCV: (cv: CVDocument) => void
  exportJSON: () => string
  importJSON: (json: string) => ImportResult
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function reorder<T>(arr: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= arr.length || to >= arr.length) {
    return arr
  }
  const next = [...arr]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

/**
 * Wraps a state mutation to also bump `updatedAt` and `lastSavedAt`.
 * The `persist` middleware then flushes to localStorage automatically.
 */
function touch(cv: CVDocument): CVDocument {
  return { ...cv, updatedAt: nowISO() }
}

// ─────────────────────────────────────────────────────────────
// Store implementation
// ─────────────────────────────────────────────────────────────

export const useCVStore = create<CVStore>()(
  persist(
    (set, get) => ({
      cv: createEmptyCV(),
      lastSavedAt: null,

      // Personal / Contact / Summary / Title
      updatePersonal: (data) =>
        set((s) => ({
          cv: touch({ ...s.cv, personal: { ...s.cv.personal, ...data } }),
          lastSavedAt: nowISO(),
        })),

      updateContact: (data) =>
        set((s) => ({
          cv: touch({ ...s.cv, contact: { ...s.cv.contact, ...data } }),
          lastSavedAt: nowISO(),
        })),

      updateSummary: (content) =>
        set((s) => ({
          cv: touch({ ...s.cv, summary: { content } }),
          lastSavedAt: nowISO(),
        })),

      updateTitle: (title) =>
        set((s) => ({
          cv: touch({ ...s.cv, title }),
          lastSavedAt: nowISO(),
        })),

      // Experience
      addExperience: () => {
        const item = createEmptyExperience()
        set((s) => ({
          cv: touch({ ...s.cv, experience: [...s.cv.experience, item] }),
          lastSavedAt: nowISO(),
        }))
        return item.id
      },
      updateExperience: (id, data) =>
        set((s) => ({
          cv: touch({
            ...s.cv,
            experience: s.cv.experience.map((e) =>
              e.id === id ? { ...e, ...data } : e,
            ),
          }),
          lastSavedAt: nowISO(),
        })),
      removeExperience: (id) =>
        set((s) => ({
          cv: touch({
            ...s.cv,
            experience: s.cv.experience.filter((e) => e.id !== id),
          }),
          lastSavedAt: nowISO(),
        })),
      reorderExperience: (from, to) =>
        set((s) => ({
          cv: touch({ ...s.cv, experience: reorder(s.cv.experience, from, to) }),
          lastSavedAt: nowISO(),
        })),

      // Education
      addEducation: () => {
        const item = createEmptyEducation()
        set((s) => ({
          cv: touch({ ...s.cv, education: [...s.cv.education, item] }),
          lastSavedAt: nowISO(),
        }))
        return item.id
      },
      updateEducation: (id, data) =>
        set((s) => ({
          cv: touch({
            ...s.cv,
            education: s.cv.education.map((e) =>
              e.id === id ? { ...e, ...data } : e,
            ),
          }),
          lastSavedAt: nowISO(),
        })),
      removeEducation: (id) =>
        set((s) => ({
          cv: touch({
            ...s.cv,
            education: s.cv.education.filter((e) => e.id !== id),
          }),
          lastSavedAt: nowISO(),
        })),
      reorderEducation: (from, to) =>
        set((s) => ({
          cv: touch({ ...s.cv, education: reorder(s.cv.education, from, to) }),
          lastSavedAt: nowISO(),
        })),

      // Skills
      addSkill: () => {
        const item = createEmptySkill()
        set((s) => ({
          cv: touch({ ...s.cv, skills: [...s.cv.skills, item] }),
          lastSavedAt: nowISO(),
        }))
        return item.id
      },
      updateSkill: (id, data) =>
        set((s) => ({
          cv: touch({
            ...s.cv,
            skills: s.cv.skills.map((sk) => (sk.id === id ? { ...sk, ...data } : sk)),
          }),
          lastSavedAt: nowISO(),
        })),
      removeSkill: (id) =>
        set((s) => ({
          cv: touch({ ...s.cv, skills: s.cv.skills.filter((sk) => sk.id !== id) }),
          lastSavedAt: nowISO(),
        })),
      reorderSkills: (from, to) =>
        set((s) => ({
          cv: touch({ ...s.cv, skills: reorder(s.cv.skills, from, to) }),
          lastSavedAt: nowISO(),
        })),

      // Languages
      addLanguage: () => {
        const item = createEmptyLanguage()
        set((s) => ({
          cv: touch({ ...s.cv, languages: [...s.cv.languages, item] }),
          lastSavedAt: nowISO(),
        }))
        return item.id
      },
      updateLanguage: (id, data) =>
        set((s) => ({
          cv: touch({
            ...s.cv,
            languages: s.cv.languages.map((l) =>
              l.id === id ? { ...l, ...data } : l,
            ),
          }),
          lastSavedAt: nowISO(),
        })),
      removeLanguage: (id) =>
        set((s) => ({
          cv: touch({
            ...s.cv,
            languages: s.cv.languages.filter((l) => l.id !== id),
          }),
          lastSavedAt: nowISO(),
        })),
      reorderLanguages: (from, to) =>
        set((s) => ({
          cv: touch({ ...s.cv, languages: reorder(s.cv.languages, from, to) }),
          lastSavedAt: nowISO(),
        })),

      // Certificates
      addCertificate: () => {
        const item = createEmptyCertificate()
        set((s) => ({
          cv: touch({ ...s.cv, certificates: [...s.cv.certificates, item] }),
          lastSavedAt: nowISO(),
        }))
        return item.id
      },
      updateCertificate: (id, data) =>
        set((s) => ({
          cv: touch({
            ...s.cv,
            certificates: s.cv.certificates.map((c) =>
              c.id === id ? { ...c, ...data } : c,
            ),
          }),
          lastSavedAt: nowISO(),
        })),
      removeCertificate: (id) =>
        set((s) => ({
          cv: touch({
            ...s.cv,
            certificates: s.cv.certificates.filter((c) => c.id !== id),
          }),
          lastSavedAt: nowISO(),
        })),
      reorderCertificates: (from, to) =>
        set((s) => ({
          cv: touch({ ...s.cv, certificates: reorder(s.cv.certificates, from, to) }),
          lastSavedAt: nowISO(),
        })),

      // Projects
      addProject: () => {
        const item = createEmptyProject()
        set((s) => ({
          cv: touch({ ...s.cv, projects: [...s.cv.projects, item] }),
          lastSavedAt: nowISO(),
        }))
        return item.id
      },
      updateProject: (id, data) =>
        set((s) => ({
          cv: touch({
            ...s.cv,
            projects: s.cv.projects.map((p) => (p.id === id ? { ...p, ...data } : p)),
          }),
          lastSavedAt: nowISO(),
        })),
      removeProject: (id) =>
        set((s) => ({
          cv: touch({
            ...s.cv,
            projects: s.cv.projects.filter((p) => p.id !== id),
          }),
          lastSavedAt: nowISO(),
        })),
      reorderProjects: (from, to) =>
        set((s) => ({
          cv: touch({ ...s.cv, projects: reorder(s.cv.projects, from, to) }),
          lastSavedAt: nowISO(),
        })),

      // References
      addReference: () => {
        const item = createEmptyReference()
        set((s) => ({
          cv: touch({ ...s.cv, references: [...s.cv.references, item] }),
          lastSavedAt: nowISO(),
        }))
        return item.id
      },
      updateReference: (id, data) =>
        set((s) => ({
          cv: touch({
            ...s.cv,
            references: s.cv.references.map((r) =>
              r.id === id ? { ...r, ...data } : r,
            ),
          }),
          lastSavedAt: nowISO(),
        })),
      removeReference: (id) =>
        set((s) => ({
          cv: touch({
            ...s.cv,
            references: s.cv.references.filter((r) => r.id !== id),
          }),
          lastSavedAt: nowISO(),
        })),
      reorderReferences: (from, to) =>
        set((s) => ({
          cv: touch({ ...s.cv, references: reorder(s.cv.references, from, to) }),
          lastSavedAt: nowISO(),
        })),

      // Settings
      updateSettings: (data) =>
        set((s) => ({
          cv: touch({ ...s.cv, settings: { ...s.cv.settings, ...data } }),
          lastSavedAt: nowISO(),
        })),

      // Section visibility & ordering
      toggleSection: (key) =>
        set((s) => {
          const isHidden = s.cv.hiddenSections.includes(key)
          return {
            cv: touch({
              ...s.cv,
              hiddenSections: isHidden
                ? s.cv.hiddenSections.filter((k) => k !== key)
                : [...s.cv.hiddenSections, key],
            }),
            lastSavedAt: nowISO(),
          }
        }),
      reorderSections: (from, to) =>
        set((s) => ({
          cv: touch({ ...s.cv, sectionOrder: reorder(s.cv.sectionOrder, from, to) }),
          lastSavedAt: nowISO(),
        })),

      // Document operations
      // NOTE: reset/sample/import REPLACE the current CV in place — they keep
      // the existing id so the cv-list entry is updated, not orphaned.
      resetCV: () =>
        set((s) => ({
          cv: { ...createEmptyCV(), id: s.cv.id, createdAt: s.cv.createdAt },
          lastSavedAt: nowISO(),
        })),

      loadSample: () =>
        set((s) => ({
          cv: { ...createSampleCV(), id: s.cv.id, createdAt: s.cv.createdAt },
          lastSavedAt: nowISO(),
        })),

      loadCV: (cv) =>
        set({ cv: touch(cv), lastSavedAt: nowISO() }),

      exportJSON: () => JSON.stringify(get().cv, null, 2),

      importJSON: (json) => {
        try {
          const raw = JSON.parse(json)
          const parsed = CVDocumentSchema.safeParse(raw)
          if (!parsed.success) {
            return {
              success: false,
              error: parsed.error.issues
                .slice(0, 3)
                .map((i) => `${i.path.join('.')}: ${i.message}`)
                .join('; '),
            }
          }
          // Replace in place: keep current id so the cv-list entry is updated.
          set((s) => ({ cv: touch({ ...parsed.data, id: s.cv.id }), lastSavedAt: nowISO() }))
          return { success: true }
        } catch (e) {
          return {
            success: false,
            error: e instanceof Error ? e.message : 'JSON parse hatası',
          }
        }
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      version: 1,
      // Only persist the CV + lastSavedAt, not the action functions
      partialize: (state) => ({
        cv: state.cv,
        lastSavedAt: state.lastSavedAt,
      }),
    },
  ),
)

// ─────────────────────────────────────────────────────────────
// Convenience selectors
// ─────────────────────────────────────────────────────────────

export const selectCV = (s: CVStore) => s.cv
export const selectLastSaved = (s: CVStore) => s.lastSavedAt
export const selectSettings = (s: CVStore) => s.cv.settings
