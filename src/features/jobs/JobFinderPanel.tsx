import { useState } from 'react'
import { Briefcase, Search, Loader2, AlertCircle, RefreshCw, Sparkles, MapPin, FileText, ChevronDown, Info, X } from 'lucide-react'
import { useJobSearch } from './useJobSearch'
import { JobCard } from './JobCard'
import { useJobSearchStore } from '@/store/job-search-store'
import { useAIStore } from '@/store/ai-store'

export function JobFinderPanel() {
  const { searchJobs, loadMoreCompanies, cv, activeCV, cvList, activeId } = useJobSearch()
  const {
    listings, listingLoading, loadingMore, listingError, searched, noMoreResults, filters,
    selectedCVId, updateFilters, clearListings, setSelectedCVId,
  } = useJobSearchStore()
  const apiKey = useAIStore((s) => s.apiKey)
  const openAIPanel = useAIStore((s) => s.openPanel)

  const hasCV = !!(cv.personal.jobTitle || cv.skills.length)
  const effectiveCVId = selectedCVId ?? activeId

  // One-time (dismissible) token-usage warning — this page is the heaviest
  // AI consumer (grounded search + load-more + per-card analysis).
  const [showTokenNotice, setShowTokenNotice] = useState(
    () => { try { return localStorage.getItem('cvmaker.jobs.tokenNotice') !== 'dismissed' } catch { return true } },
  )
  const dismissTokenNotice = () => {
    setShowTokenNotice(false)
    try { localStorage.setItem('cvmaker.jobs.tokenNotice', 'dismissed') } catch { /* ignore */ }
  }

  /* ── No API key ─────────────────────────────────────────────── */
  if (!apiKey) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-line bg-paper px-6 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-paper-warm">
          <Briefcase size={20} className="text-ink/40" />
        </div>
        <div className="max-w-sm">
          <h3 className="font-sans text-base font-semibold text-ink">API Anahtarı Gerekli</h3>
          <p className="mt-1 text-sm text-ink/50">İlan arama özelliği Gemini API anahtarı gerektirir.</p>
        </div>
        <button
          type="button"
          onClick={openAIPanel}
          className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-accent"
        >
          <Sparkles size={14} /> AI Panelini Aç
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">

    {/* Token-usage warning (dismissible) */}
    {showTokenNotice && (
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/40 dark:bg-amber-950/20">
        <Info size={14} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
        <p className="flex-1 text-xs leading-relaxed text-amber-700 dark:text-amber-400">
          Bu sayfa Google arama entegrasyonu kullandığı için <strong className="font-semibold">en çok AI kotası/token tüketen</strong> bölümdür.
          Her arama, "Daha Fazla" ve kart analizleri ayrı istek harcar — gereksiz tekrar aramalardan kaçın.
        </p>
        <button
          type="button"
          onClick={dismissTokenNotice}
          aria-label="Kapat"
          className="shrink-0 text-amber-600/60 transition-colors hover:text-amber-700 dark:text-amber-400/60 dark:hover:text-amber-300"
        >
          <X size={14} />
        </button>
      </div>
    )}

    {/* ── Full-width rows (above two columns) ───────────────────── */}

    {/* Mobile filters */}
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-line bg-paper p-4 lg:hidden">
      <div className="flex flex-col gap-1">
        <label className="font-mono text-[9px] uppercase tracking-widest text-ink/40">Konum</label>
        <input
          type="text"
          value={filters.location}
          onChange={(e) => updateFilters({ location: e.target.value })}
          placeholder={cv.contact.location || 'Türkiye'}
          className="w-32 rounded-lg border border-line bg-paper-warm/50 px-2.5 py-1.5 text-sm text-ink outline-none placeholder-ink/30 focus:border-accent"
        />
      </div>
      <button
        type="button"
        onClick={searchJobs}
        disabled={listingLoading || !hasCV}
        className="ml-auto flex items-center gap-2 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-accent disabled:opacity-40"
      >
        {listingLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
        {listingLoading ? 'Aranıyor...' : 'Şirketleri Bul'}
      </button>
    </div>

    {/* Error */}
    {listingError && (
      <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-950/20">
        <AlertCircle size={14} className="mt-0.5 shrink-0 text-red-500" />
        <p className="text-sm text-red-600 dark:text-red-400">{listingError}</p>
      </div>
    )}

    {/* Count + Yenile */}
    {listings.length > 0 && (
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-widest text-ink/40">
          {listings.length} şirket bulundu
        </p>
        <button
          type="button"
          onClick={() => { clearListings(); searchJobs() }}
          className="flex items-center gap-1.5 text-xs text-ink/40 transition-colors hover:text-ink"
        >
          <RefreshCw size={11} /> Yenile
        </button>
      </div>
    )}

    {/* ── Two-column: sidebar + cards ───────────────────────────── */}
    <div className="flex gap-6">

      {/* ── Left sidebar: filters ──────────────────────────────── */}
      <aside data-tour="jobs-filters" className="hidden w-60 shrink-0 lg:block">
        <div className="sticky top-6 overflow-hidden rounded-xl border border-line bg-paper">

          {/* Header — CV selector */}
          <div className="border-b border-line px-5 py-4">
            <p className="mb-2.5 font-sans text-sm font-semibold text-ink">Arama Kriterleri</p>

            {cvList.length > 1 ? (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-ink/50">CV Seç</label>
                <div className="relative">
                  <FileText size={12} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/30" />
                  <select
                    value={effectiveCVId}
                    onChange={(e) => setSelectedCVId(e.target.value === activeId ? null : e.target.value)}
                    className="w-full appearance-none rounded-lg border border-line bg-paper-warm/40 py-2 pl-8 pr-7 text-sm text-ink outline-none focus:border-accent focus:bg-paper"
                  >
                    {cvList.map((item) => {
                      // Active CV: use activeCV (live cv-store data) so the label reflects
                      // the globally active CV regardless of which CV is selected for job search
                      const name = item.id === activeId
                        ? (activeCV.personal.fullName || activeCV.personal.jobTitle || 'Aktif CV')
                        : (item.fullName || item.title || item.jobTitle || 'İsimsiz CV')
                      return (
                        <option key={item.id} value={item.id}>
                          {name}{item.id === activeId ? ' ★' : ''}
                        </option>
                      )
                    })}
                  </select>
                  <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink/30" />
                </div>
                {activeCV.personal.jobTitle && (
                  <p className="truncate text-xs text-ink/40">{activeCV.personal.jobTitle}</p>
                )}
              </div>
            ) : (
              activeCV.personal.jobTitle && (
                <p className="truncate text-xs text-ink/40">{activeCV.personal.jobTitle}</p>
              )
            )}
          </div>

          {/* Fields */}
          <div className="flex flex-col gap-5 p-5">

            {/* Location */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-ink/50">Konum</label>
              <div className="relative">
                <MapPin size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/30" />
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => updateFilters({ location: e.target.value })}
                  placeholder={cv.contact.location || 'Türkiye'}
                  className="w-full rounded-lg border border-line bg-paper-warm/40 py-2 pl-8 pr-3 text-sm text-ink outline-none placeholder-ink/30 focus:border-accent focus:bg-paper"
                />
              </div>
            </div>

            {/* No CV hint */}
            {!hasCV && (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-400">
                Şirket araması için editörde pozisyon veya yetenek ekle.
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-col gap-2 border-t border-line p-4">
            <button
              type="button"
              onClick={searchJobs}
              disabled={listingLoading || !hasCV}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-ink py-2.5 text-sm font-medium text-paper transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
            >
              {listingLoading
                ? <Loader2 size={14} className="animate-spin" />
                : <Search size={14} />}
              {listingLoading ? 'Aranıyor...' : 'Şirketleri Bul'}
            </button>

            {listings.length > 0 && (
              <button
                type="button"
                onClick={() => { clearListings(); searchJobs() }}
                className="flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs text-ink/40 transition-colors hover:bg-paper-warm hover:text-ink"
              >
                <RefreshCw size={11} /> Yenile
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main content area ──────────────────────────────────── */}
      <div data-tour="jobs-results" className="flex min-w-0 flex-1 flex-col gap-3">

        {/* Loading skeleton */}
        {listingLoading && listings.length === 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-line bg-paper p-4">
                <div className="mb-3 h-1 w-full animate-pulse rounded-full bg-paper-warm" />
                <div className="space-y-2.5">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-paper-warm" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-paper-warm" />
                  <div className="h-3 w-1/3 animate-pulse rounded bg-paper-warm" />
                  <div className="flex gap-1.5 pt-1">
                    {[60, 48, 56].map((w) => (
                      <div key={w} className={`h-5 w-${w === 60 ? '14' : w === 48 ? '12' : '16'} animate-pulse rounded-full bg-paper-warm`} />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {listings.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {listings.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}

        {/* Load more */}
        {listings.length > 0 && !listingLoading && (
          <div className="flex justify-center pt-2">
            {noMoreResults ? (
              <p className="font-mono text-[10px] uppercase tracking-widest text-ink/30">
                Başka şirket bulunamadı
              </p>
            ) : (
              <button
                type="button"
                onClick={loadMoreCompanies}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 rounded-lg border border-line px-4 py-2.5 text-sm font-medium text-ink/70 transition-colors hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loadingMore
                  ? <Loader2 size={14} className="animate-spin" />
                  : <RefreshCw size={14} />}
                {loadingMore ? 'Daha fazla aranıyor...' : 'Daha Fazla Şirket'}
              </button>
            )}
          </div>
        )}

        {/* Empty state — searched with no results */}
        {!listingLoading && !listingError && listings.length === 0 && hasCV && searched && (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-line py-20 text-center">
            <Briefcase size={32} className="text-ink/15" />
            <p className="max-w-sm text-sm text-ink/40">
              Bu arama için şirket bulunamadı. Farklı bir <strong className="font-medium text-ink/60">pozisyon</strong> veya
              <strong className="font-medium text-ink/60"> konum</strong> dene, ya da uzaktan filtresini kaldır.
            </p>
          </div>
        )}

        {/* Initial state — not searched yet */}
        {!listingLoading && !listingError && listings.length === 0 && hasCV && !searched && (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-line py-20 text-center">
            <Briefcase size={32} className="text-ink/15" />
            <p className="text-sm text-ink/40">
              Filtreleri ayarla ve <strong className="font-medium text-ink/60">Şirketleri Bul</strong>'a tıkla
            </p>
          </div>
        )}
      </div>
    </div>
    </div>
  )
}
