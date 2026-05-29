import { useCallback, useRef, useMemo } from 'react'
import { streamAI, generateGemini } from '@/lib/ai-client'
import { JOB_SEARCH_SYSTEM, JOB_CHAT_SYSTEM, buildJobSearchPrompt } from '@/lib/prompts'
import { parseJobListings, rankListings, buildSearchParams } from '@/lib/job-search'
import { useAIStore, PROVIDERS } from '@/store/ai-store'
import { useCVStore } from '@/store'
import { useCVListStore } from '@/store/cv-list-store'
import { useJobSearchStore } from '@/store/job-search-store'
import type { GroundingSource, AIError } from '@/lib/ai-client'
import type { CVDocument } from '@/types/cv'

export function useJobSearch() {
  const { apiKey, provider, model } = useAIStore()
  const baseUrl = PROVIDERS[provider].baseUrl

  const activeCV = useCVStore((s) => s.cv)
  const { list, activeId, snapshots } = useCVListStore()
  const {
    filters, selectedCVId, listings,
    setListings, appendListings,
    setListingLoading, setLoadingMore, setListingError, setSearched, setNoMoreResults,
    messages,
    addMessage, appendChatChunk, finalizeMessage,
    setChatLoading, setChatError,
  } = useJobSearchStore()

  /** Resolve the CV to use — selected snapshot or active CV */
  const cv: CVDocument = useMemo(() => {
    if (!selectedCVId || selectedCVId === activeId) return activeCV
    const raw = snapshots[selectedCVId]
    if (!raw) return activeCV
    try { return JSON.parse(raw) as CVDocument } catch { return activeCV }
  }, [selectedCVId, activeId, activeCV, snapshots])

  const abortRef = useRef<AbortController | null>(null)

  const cancelAll = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  // ── One-click search (Gemini Google Search grounding) ────────
  const searchJobs = useCallback(async () => {
    if (!apiKey) {
      setListingError('API anahtarı gerekli.')
      return
    }
    if (provider !== 'gemini') {
      setListingError('İlan araması Google arama entegrasyonu için Gemini gerektirir.')
      return
    }

    setListingLoading(true)
    setListingError(null)
    setNoMoreResults(false)

    const ctrl = new AbortController()
    abortRef.current = ctrl

    const params = buildSearchParams(cv, filters)
    const prompt = buildJobSearchPrompt(params.jobTitle, params.skills, params.location)

    try {
      // Non-streaming → full grounding metadata (chunks + supports) so we can
      // attach a real source URL to each listing.
      const { text, grounding } = await generateGemini({
        apiKey, model,
        system: JOB_SEARCH_SYSTEM,
        prompt,
        maxTokens: 3000,
        useSearch: true,
        signal: ctrl.signal,
      })
      const raw = parseJobListings(text)
      const ranked = rankListings(cv, raw, grounding)
      setListings(ranked)
      setSearched(true)
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') return   // user cancelled — stay silent
      setListingError((err as AIError)?.message ?? 'İlanlar getirilemedi.')
    } finally {
      setListingLoading(false)
    }
  }, [apiKey, provider, model, cv, filters,
      setListings, setListingLoading, setListingError, setSearched, setNoMoreResults])

  // ── Load more — fetch another batch, excluding companies already shown ──
  const loadMoreCompanies = useCallback(async () => {
    if (!apiKey || provider !== 'gemini') return

    setLoadingMore(true)
    setListingError(null)

    const ctrl = new AbortController()
    abortRef.current = ctrl

    const existing = listings.map((l) => l.company)
    const params = buildSearchParams(cv, filters)
    const prompt = buildJobSearchPrompt(params.jobTitle, params.skills, params.location, existing)

    try {
      const { text, grounding } = await generateGemini({
        apiKey, model,
        system: JOB_SEARCH_SYSTEM,
        prompt,
        maxTokens: 3000,
        useSearch: true,
        signal: ctrl.signal,
      })
      const raw = parseJobListings(text)
      const ranked = rankListings(cv, raw, grounding)
      const added = appendListings(ranked)
      if (added === 0) setNoMoreResults(true)
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') return
      setListingError((err as AIError)?.message ?? 'Daha fazla şirket getirilemedi.')
    } finally {
      setLoadingMore(false)
    }
  }, [apiKey, provider, model, cv, filters, listings,
      appendListings, setLoadingMore, setListingError, setNoMoreResults])

  // ── Chat send ────────────────────────────────────────────────
  const sendChatMessage = useCallback(async (userText: string) => {
    if (!apiKey || !userText.trim()) return

    addMessage('user', userText)
    setChatLoading(true)
    setChatError(null)

    const history = messages.map((m) => ({ role: m.role, text: m.text }))
    const ctrl = new AbortController()
    abortRef.current = ctrl

    const cvSummary = [
      cv.personal.fullName   && `Ad: ${cv.personal.fullName}`,
      cv.personal.jobTitle   && `Hedef pozisyon: ${cv.personal.jobTitle}`,
      cv.skills.length       && `Yetenekler: ${cv.skills.slice(0, 8).map((s) => s.name).join(', ')}`,
      cv.contact.location    && `Konum: ${cv.contact.location}`,
    ].filter(Boolean).join('\n')

    const systemWithCV = `${JOB_CHAT_SYSTEM}\n\nAday bilgileri:\n${cvSummary}`
    const msgId = addMessage('model', '')
    const collectedSources: GroundingSource[] = []

    await streamAI({
      provider, baseUrl, apiKey, model,
      system: systemWithCV,
      prompt: userText,
      history,
      maxTokens: 1200,
      useSearch: provider === 'gemini',
      signal: ctrl.signal,
      onGrounding: (data) => {
        // Collect unique sources (by uri) for citation display
        for (const src of data.sources) {
          if (src.uri && !collectedSources.some((s) => s.uri === src.uri)) {
            collectedSources.push(src)
          }
        }
      },
      onChunk: (chunk) => appendChatChunk(msgId, chunk),
      onDone: () => {
        finalizeMessage(msgId, collectedSources.length ? collectedSources : undefined)
        setChatLoading(false)
      },
      onError: (err) => {
        setChatError(err.message)
        setChatLoading(false)
      },
    })
  }, [apiKey, provider, baseUrl, model, cv, messages,
      addMessage, appendChatChunk, finalizeMessage, setChatLoading, setChatError])

  // activeCV = globally active CV (for display); cv = job-search-resolved CV (may differ)
  return { searchJobs, loadMoreCompanies, sendChatMessage, cancelAll, cv, activeCV, cvList: list, activeId }
}
