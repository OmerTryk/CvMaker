import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit3, Copy, Trash2, Eye, FileText } from 'lucide-react'
import { useCVStore } from '@/store'
import { useCVListStore, THEME_COLORS, TEMPLATE_LABELS, type CVListItem } from '@/store/cv-list-store'
import { createEmptyCV } from '@/lib/seed'
import { createId } from '@/utils/id'
import { nowISO } from '@/utils/date'
import { cn } from '@/lib/utils'
import type { CVDocument } from '@/types/cv'

export function DashboardPage() {
  const navigate    = useNavigate()
  const cv          = useCVStore((s) => s.cv)
  const loadCV      = useCVStore((s) => s.loadCV)

  const list          = useCVListStore((s) => s.list)
  const activeId      = useCVListStore((s) => s.activeId)
  const switchTo      = useCVListStore((s) => s.switchTo)
  const registerNew   = useCVListStore((s) => s.registerNew)
  const deleteCV      = useCVListStore((s) => s.deleteCV)
  const duplicateSnap = useCVListStore((s) => s.duplicateSnapshot)
  const saveSnapshot  = useCVListStore((s) => s.saveSnapshot)

  // Resolve and load a CV, then navigate to the given route
  const handleSwitch = useCallback((id: string, route: '/editor' | '/preview') => {
    if (id === activeId) {
      navigate(route)
      return
    }
    // Always persist current CV before switching (guards against missing snapshots)
    saveSnapshot(cv)
    const loaded = switchTo(id, cv)
    if (loaded) {
      loadCV(loaded)
      navigate(route)
    }
  }, [activeId, cv, switchTo, loadCV, navigate, saveSnapshot])

  // Open a CV in the editor
  const handleOpen = useCallback((id: string) => {
    handleSwitch(id, '/editor')
  }, [handleSwitch])

  // Open a CV in preview (separate from handleOpen — no /editor conflict)
  const handlePreview = useCallback((id: string) => {
    handleSwitch(id, '/preview')
  }, [handleSwitch])

  // Create a new empty CV
  const handleCreate = useCallback(() => {
    // Save current CV to snapshot before switching
    saveSnapshot(cv)
    const newCV = createEmptyCV()
    registerNew(newCV)
    loadCV(newCV)
    navigate('/editor')
  }, [cv, saveSnapshot, registerNew, loadCV, navigate])

  // Duplicate an existing CV
  const handleDuplicate = useCallback((item: CVListItem) => {
    if (item.id === activeId) {
      // Duplicate the active CV
      const now = nowISO()
      const duped: CVDocument = {
        ...cv,
        id: createId(),
        title: `${cv.title} (kopya)`,
        createdAt: now,
        updatedAt: now,
      }
      saveSnapshot(cv)
      registerNew(duped)
      loadCV(duped)
      navigate('/editor')
    } else {
      const duped = duplicateSnap(item.id)
      if (!duped) return
      saveSnapshot(cv)
      registerNew(duped)
      loadCV(duped)
      navigate('/editor')
    }
  }, [activeId, cv, duplicateSnap, saveSnapshot, registerNew, loadCV, navigate])

  // Delete a CV
  const handleDelete = useCallback((item: CVListItem) => {
    if (list.length === 1) {
      alert('En az bir CV olmalı.')
      return
    }
    if (!confirm(`"${item.title}" silinecek. Emin misin?`)) return

    if (item.id === activeId) {
      // Switch to another CV first
      const other = list.find((l) => l.id !== item.id)!
      const loaded = switchTo(other.id, cv)
      if (loaded) loadCV(loaded)
    }
    deleteCV(item.id)
  }, [list, activeId, cv, switchTo, loadCV, deleteCV])

  // Active item always shows the cv-store version (freshest data)
  const displayList = list.map((item) =>
    item.id === activeId
      ? { ...item, title: cv.title, fullName: cv.personal.fullName, jobTitle: cv.personal.jobTitle, template: cv.settings.template, colorTheme: cv.settings.colorTheme, updatedAt: cv.updatedAt }
      : item
  )

  return (
    <div className="container-prose py-10 md:py-14">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 md:mb-10">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-ink/50">
            CTRLCV
          </p>
          <h1 className="mt-2 font-display text-3xl font-light tracking-tight text-ink md:text-5xl">
            CV'lerim
          </h1>
        </div>
        <button
          type="button"
          onClick={handleCreate}
          className="inline-flex items-center gap-2 bg-ink px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-paper transition-colors hover:bg-accent"
        >
          <Plus size={14} />
          Yeni CV
        </button>
      </div>

      {/* CV Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {displayList.map((item) => (
          <CVCard
            key={item.id}
            item={item}
            isActive={item.id === activeId}
            onOpen={() => handleOpen(item.id)}
            onPreview={() => handlePreview(item.id)}
            onDuplicate={() => handleDuplicate(item)}
            onDelete={() => handleDelete(item)}
          />
        ))}

        {/* "Yeni CV" create card */}
        <button
          type="button"
          onClick={handleCreate}
          className="group flex min-h-[200px] flex-col items-center justify-center gap-3 border-2 border-dashed border-line text-ink/30 transition-all duration-200 hover:border-accent/50 hover:text-accent"
        >
          <Plus size={28} strokeWidth={1.5} className="transition-transform duration-300 group-hover:scale-110" />
          <span className="font-mono text-[10px] uppercase tracking-widest">
            Yeni CV oluştur
          </span>
        </button>
      </div>

      {/* Empty state */}
      {list.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <FileText size={48} strokeWidth={1} className="mb-6 text-ink/20" />
          <h2 className="font-display text-2xl font-light text-ink">
            Henüz CV yok
          </h2>
          <p className="mt-3 text-sm text-ink/50">
            İlk CV'nizi oluşturarak başlayın.
          </p>
          <button
            type="button"
            onClick={handleCreate}
            className="mt-8 inline-flex items-center gap-2 bg-ink px-6 py-3 font-mono text-[10px] uppercase tracking-widest text-paper hover:bg-accent"
          >
            <Plus size={14} /> CV Oluştur
          </button>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────

function CVCard({
  item,
  isActive,
  onOpen,
  onPreview,
  onDuplicate,
  onDelete,
}: {
  item: CVListItem
  isActive: boolean
  onOpen: () => void
  onPreview: () => void
  onDuplicate: () => void
  onDelete: () => void
}) {
  const colors = THEME_COLORS[item.colorTheme]
  const templateLabel = TEMPLATE_LABELS[item.template] ?? item.template

  const relativeDate = (() => {
    try {
      const diff = Date.now() - new Date(item.updatedAt).getTime()
      const mins = Math.floor(diff / 60000)
      if (mins < 1) return 'az önce'
      if (mins < 60) return `${mins} dk önce`
      const hrs = Math.floor(mins / 60)
      if (hrs < 24) return `${hrs} saat önce`
      return `${Math.floor(hrs / 24)} gün önce`
    } catch { return '' }
  })()

  return (
    <div
      className={cn(
        'group flex flex-col border transition-all duration-200',
        isActive ? 'border-accent' : 'border-line hover:border-ink/30',
      )}
    >
      {/* Colored header */}
      <div
        className="relative flex h-28 flex-col justify-end p-5"
        style={{ background: colors.bg }}
      >
        {isActive && (
          <span
            className="absolute right-3 top-3 font-mono text-[9px] uppercase tracking-widest px-2 py-1"
            style={{ background: 'rgba(255,255,255,0.15)', color: colors.text }}
          >
            Aktif
          </span>
        )}
        <p
          className="font-display text-lg font-light leading-tight"
          style={{ color: colors.text }}
        >
          {item.fullName || 'İsimsiz'}
        </p>
        <p
          className="mt-0.5 font-mono text-[9px] uppercase tracking-widest opacity-60"
          style={{ color: colors.text }}
        >
          {item.jobTitle || '—'}
        </p>
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="font-display text-base font-light text-ink line-clamp-1">
            {item.title}
          </p>
        </div>
        <div className="mt-1.5 flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-ink/40">
          <span>{templateLabel}</span>
          <span>·</span>
          <span>{relativeDate}</span>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center gap-1">
          <button
            type="button"
            onClick={onOpen}
            className="inline-flex items-center gap-1.5 bg-ink px-3 py-1.5 font-mono text-[9px] uppercase tracking-widest text-paper transition-colors hover:bg-accent"
          >
            <Edit3 size={11} />
            Düzenle
          </button>
          <button
            type="button"
            onClick={onPreview}
            className="inline-flex items-center gap-1.5 border border-line px-3 py-1.5 font-mono text-[9px] uppercase tracking-widest text-ink/60 transition-colors hover:border-ink hover:text-ink"
          >
            <Eye size={11} />
            Önizle
          </button>
          <div className="ml-auto flex gap-1">
            <button
              type="button"
              onClick={onDuplicate}
              title="Çoğalt"
              className="flex h-7 w-7 items-center justify-center text-ink/30 transition-colors hover:text-ink"
            >
              <Copy size={13} />
            </button>
            <button
              type="button"
              onClick={onDelete}
              title="Sil"
              className="flex h-7 w-7 items-center justify-center text-ink/30 transition-colors hover:text-accent"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
