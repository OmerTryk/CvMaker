/**
 * CV List Store — manages multiple CVs.
 *
 * The ACTIVE CV always lives in cv-store (backward compatible).
 * All INACTIVE CVs are serialized as JSON strings in `snapshots`.
 *
 * Switching flow:
 *   1. Serialize current cv-store CV → snapshots[currentActiveId]
 *   2. Load snapshots[targetId] → cv-store.loadCV()
 *   3. Remove snapshots[targetId] (it's now active, lives in cv-store)
 *   4. Set activeId = targetId
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { safeStorage } from '@/utils/storage'
import type { CVDocument, Template, ColorTheme } from '@/types/cv'
import { nowISO } from '@/utils/date'
import { createId } from '@/utils/id'

export interface CVListItem {
  id: string
  title: string
  template: Template
  colorTheme: ColorTheme
  updatedAt: string
  createdAt: string
  fullName: string
  jobTitle: string
}

interface CVListStore {
  list: CVListItem[]
  activeId: string
  /** Inactive CVs serialized as JSON — keyed by CV id */
  snapshots: Record<string, string>

  /** On first launch: register the existing single CV as the active one */
  initFromCV: (cv: CVDocument) => void

  /**
   * Keep the list in sync with whatever CV currently lives in cv-store.
   * Registers it if unknown, refreshes its snapshot, and marks it active.
   * Called on every cv-store change so the two stores never drift apart.
   */
  mirrorActive: (cv: CVDocument) => void

  /** Save current CV to snapshot, load target CV, return it (or null if not found) */
  switchTo: (targetId: string, currentCV: CVDocument) => CVDocument | null

  /** Create new empty CV entry, return a starter CVDocument */
  registerNew: (cv: CVDocument) => void

  /** Duplicate an inactive CV */
  duplicateSnapshot: (id: string) => CVDocument | null

  /** Delete a CV (active or inactive) */
  deleteCV: (id: string) => void

  /** Sync metadata from the currently active CV */
  syncMeta: (cv: CVDocument) => void

  /** Save current CV snapshot (called before leaving editor) */
  saveSnapshot: (cv: CVDocument) => void

  /**
   * Remove list entries that are neither active nor have a snapshot — i.e.
   * un-openable orphans left by older buggy versions. The active entry is
   * always kept (matched by id) regardless of snapshot timing.
   */
  pruneOrphans: () => void
}

function toListItem(cv: CVDocument): CVListItem {
  return {
    id: cv.id,
    title: cv.title,
    template: cv.settings.template,
    colorTheme: cv.settings.colorTheme,
    updatedAt: cv.updatedAt,
    createdAt: cv.createdAt,
    fullName: cv.personal.fullName,
    jobTitle: cv.personal.jobTitle,
  }
}

export const useCVListStore = create<CVListStore>()(
  persist(
    (set, get) => ({
      list: [],
      activeId: '',
      snapshots: {},

      initFromCV: (cv) => {
        const { list } = get()
        if (list.length > 0) return // already initialized

        set({
          list: [toListItem(cv)],
          activeId: cv.id,
          snapshots: { [cv.id]: JSON.stringify(cv) },
        })
      },

      mirrorActive: (cv) =>
        set((s) => {
          const inList = s.list.some((l) => l.id === cv.id)
          return {
            activeId: cv.id,
            list: inList
              ? s.list.map((l) => (l.id === cv.id ? toListItem(cv) : l))
              : [...s.list, toListItem(cv)],
            snapshots: { ...s.snapshots, [cv.id]: JSON.stringify(cv) },
          }
        }),

      switchTo: (targetId, currentCV) => {
        const { list, activeId, snapshots } = get()

        if (targetId === activeId) return null
        if (!list.find((l) => l.id === targetId)) return null

        const raw = snapshots[targetId]
        if (!raw) return null

        let targetCV: CVDocument
        try {
          targetCV = JSON.parse(raw) as CVDocument
        } catch {
          return null
        }

        // Snapshot current active CV. We KEEP the target's snapshot too — every
        // CV (active included) stays mirrored, so switching can never lose data.
        const updatedSnapshots: Record<string, string> = {
          ...snapshots,
          [activeId]: JSON.stringify(currentCV),
        }

        // Update meta for current CV (it just got snapshotted)
        const updatedList = list.map((item) =>
          item.id === activeId ? toListItem(currentCV) : item,
        )

        set({ snapshots: updatedSnapshots, activeId: targetId, list: updatedList })
        return targetCV
      },

      registerNew: (cv) => {
        const { list, snapshots } = get()
        set({
          list: [...list, toListItem(cv)],
          activeId: cv.id,
          snapshots,
        })
      },

      duplicateSnapshot: (id) => {
        const { snapshots } = get()
        const raw = snapshots[id]
        if (!raw) return null
        try {
          const source = JSON.parse(raw) as CVDocument
          const now = nowISO()
          return {
            ...source,
            id: createId(),
            title: `${source.title} (kopya)`,
            createdAt: now,
            updatedAt: now,
          }
        } catch {
          return null
        }
      },

      deleteCV: (id) => {
        const { list, snapshots } = get()
        const updated = { ...snapshots }
        delete updated[id]
        set({
          list: list.filter((l) => l.id !== id),
          snapshots: updated,
        })
      },

      syncMeta: (cv) => {
        set((s) => ({
          list: s.list.map((item) =>
            item.id === cv.id ? toListItem(cv) : item,
          ),
        }))
      },

      saveSnapshot: (cv) => {
        set((s) => ({
          snapshots: { ...s.snapshots, [cv.id]: JSON.stringify(cv) },
          list: s.list.map((item) =>
            item.id === cv.id ? toListItem(cv) : item,
          ),
        }))
      },

      pruneOrphans: () =>
        set((s) => ({
          list: s.list.filter(
            (l) => l.id === s.activeId || s.snapshots[l.id] !== undefined,
          ),
        })),
    }),
    {
      name: 'ctrlcv.cvlist.v1',
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({
        list: s.list,
        activeId: s.activeId,
        // Snapshots are stored separately to avoid size issues
        snapshots: Object.fromEntries(
          Object.entries(s.snapshots).map(([k, v]) => [k, v]),
        ),
      }),
    },
  ),
)

// ─────────────────────────────────────────────────────────────
// Theme accent colors for card display
// ─────────────────────────────────────────────────────────────

export const THEME_COLORS: Record<ColorTheme, { bg: string; text: string }> = {
  ink:    { bg: '#111111', text: '#FAF7F2' },
  sienna: { bg: '#9C3409', text: '#FAF7F2' },
  forest: { bg: '#2D5016', text: '#FAF7F2' },
  navy:   { bg: '#1B3A5C', text: '#FAF7F2' },
  plum:   { bg: '#5B2A6B', text: '#FAF7F2' },
}

export const TEMPLATE_LABELS: Record<string, string> = {
  modern:    'Modern',
  classic:   'Klasik',
  minimal:   'Minimal',
  executive: 'Executive',
  creative:  'Creative',
  technical: 'Technical',
  timeline:  'Timeline',
  elegant:   'Elegant',
  compact:   'Compact',
}
