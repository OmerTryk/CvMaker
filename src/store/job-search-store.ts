import { create } from 'zustand'
import type { JobListing, JobFilters } from '@/lib/job-search'
import type { GroundingSource } from '@/lib/ai-client'
import { DEFAULT_FILTERS } from '@/lib/job-search'
import { createId } from '@/utils/id'

export interface ChatMessage {
  id: string
  role: 'user' | 'model'
  text: string
  sources?: GroundingSource[]
}

interface JobSearchStore {
  // ── Panel (one-click) ──────────────────────────────────────
  listings: JobListing[]
  listingLoading: boolean
  /** loading an additional batch via "Daha Fazla" (keeps current results visible) */
  loadingMore: boolean
  listingError: string | null
  /** true once a search has completed (to distinguish "no results" from "not searched yet") */
  searched: boolean
  /** true when a "load more" returned no new companies — hides the button */
  noMoreResults: boolean
  groundingSources: GroundingSource[]
  filters: JobFilters
  /** null = use active CV from cv-store */
  selectedCVId: string | null

  // ── Chat ──────────────────────────────────────────────────
  messages: ChatMessage[]
  chatLoading: boolean
  chatError: string | null

  // ── Actions ───────────────────────────────────────────────
  setListings: (listings: JobListing[]) => void
  /** Append a batch, deduping by company name against current listings. Returns # added. */
  appendListings: (listings: JobListing[]) => number
  setListingLoading: (v: boolean) => void
  setLoadingMore: (v: boolean) => void
  setListingError: (v: string | null) => void
  setSearched: (v: boolean) => void
  setNoMoreResults: (v: boolean) => void
  setGroundingSources: (sources: GroundingSource[]) => void
  updateFilters: (patch: Partial<JobFilters>) => void
  clearListings: () => void
  setSelectedCVId: (id: string | null) => void

  addMessage: (role: ChatMessage['role'], text: string) => string
  appendChatChunk: (id: string, chunk: string) => void
  finalizeMessage: (id: string, sources?: GroundingSource[]) => void
  setChatLoading: (v: boolean) => void
  setChatError: (v: string | null) => void
  clearChat: () => void
}

export const useJobSearchStore = create<JobSearchStore>()((set) => ({
  listings: [],
  listingLoading: false,
  loadingMore: false,
  listingError: null,
  searched: false,
  noMoreResults: false,
  groundingSources: [],
  filters: DEFAULT_FILTERS,
  selectedCVId: null,

  messages: [],
  chatLoading: false,
  chatError: null,

  setListings: (listings) => set({ listings }),
  appendListings: (incoming) => {
    let added = 0
    set((s) => {
      const seen = new Set(s.listings.map((l) => l.company.toLowerCase().trim()))
      const fresh = incoming.filter((l) => {
        const key = l.company.toLowerCase().trim()
        if (!key || seen.has(key)) return false
        seen.add(key)
        return true
      })
      added = fresh.length
      return { listings: [...s.listings, ...fresh] }
    })
    return added
  },
  setListingLoading: (v) => set({ listingLoading: v }),
  setLoadingMore: (v) => set({ loadingMore: v }),
  setListingError: (v) => set({ listingError: v }),
  setSearched: (v) => set({ searched: v }),
  setNoMoreResults: (v) => set({ noMoreResults: v }),
  setGroundingSources: (sources) => set({ groundingSources: sources }),
  updateFilters: (patch) => set((s) => ({ filters: { ...s.filters, ...patch } })),
  clearListings: () => set({ listings: [], listingError: null, searched: false, noMoreResults: false, groundingSources: [] }),
  setSelectedCVId: (id) => set({ selectedCVId: id, listings: [], listingError: null, searched: false, noMoreResults: false }),

  addMessage: (role, text) => {
    const id = createId()
    set((s) => ({ messages: [...s.messages, { id, role, text }] }))
    return id
  },
  appendChatChunk: (id, chunk) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id ? { ...m, text: m.text + chunk } : m,
      ),
    })),
  finalizeMessage: (id, sources) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id ? { ...m, sources } : m,
      ),
    })),
  setChatLoading: (v) => set({ chatLoading: v }),
  setChatError: (v) => set({ chatError: v }),
  clearChat: () => set({ messages: [], chatError: null }),
}))
