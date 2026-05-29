/**
 * job-search.ts — Company-match types, parser, and CV matching.
 *
 * Gemini (with Google Search grounding) returns real COMPANIES the candidate
 * can apply to, in a `===` delimited format. Ranking attaches a local CV-match
 * score, dedupes, caps at MAX_RESULTS, and resolves each company to the real
 * source URL Gemini read (via groundingSupports) — falling back to a precise
 * Google "open positions" search when no confident source can be mapped.
 *
 * Note: the type is still named `JobListing` for continuity, but each entry
 * now represents a company (company name + sector + why-it-fits).
 */

import { matchCVToJob } from './job-match'
import type { CVDocument } from '@/types/cv'
import type { JobMatchResult } from './job-match'
import type { GroundingSource, GroundingData } from './ai-client'
import { createId } from '@/utils/id'

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

/** Max companies to show. */
export const MAX_RESULTS = 16

export interface JobListing {
  id: string
  title: string            // sector / industry (e.g. "E-ticaret")
  company: string          // company name (primary heading)
  location: string
  description: string      // why this company fits the candidate
  platform?: string        // where to apply: kariyer.net | linkedin | şirket sitesi
  url?: string             // grounding source URL or "open positions" search
  urlIsDirect?: boolean    // true = real source page, false = search fallback
  matchResult: JobMatchResult
}

/** Listing shape before id + match score are attached (carries its source block). */
type ParsedRaw = Omit<JobListing, 'id' | 'matchResult'> & { _block: string }

export interface JobFilters {
  location: string
  seniority: 'any' | 'junior' | 'mid' | 'senior'
  remote: boolean
}

export const DEFAULT_FILTERS: JobFilters = {
  location: '',
  seniority: 'any',
  remote: false,
}

export const SENIORITY_LABELS: Record<JobFilters['seniority'], string> = {
  any: 'Herhangi',
  junior: 'Junior',
  mid: 'Orta Düzey',
  senior: 'Kıdemli',
}

// ─────────────────────────────────────────────────────────────
// Field extraction
// ─────────────────────────────────────────────────────────────

function extractField(block: string, key: string): string {
  const match = new RegExp(`${key}:\\s*(.+)`).exec(block)
  return match?.[1]?.replace(/\[\d+\]/g, '').trim() ?? '' // strip citation markers [1][2]
}

function normalizePlatform(raw: string): string {
  const s = raw.toLowerCase().trim()
  if (s.includes('kariyer'))   return 'kariyer.net'
  if (s.includes('linkedin'))  return 'linkedin'
  if (s.includes('glassdoor')) return 'glassdoor'
  if (s.includes('indeed'))    return 'indeed'
  if (s.includes('şirket') || s.includes('sirket') || s.includes('company') || s.includes('career')) return 'şirket sitesi'
  return raw.trim() || 'diğer'
}

const PLATFORM_DOMAINS: Record<string, string[]> = {
  'kariyer.net': ['kariyer.net'],
  'linkedin':    ['linkedin.com'],
  'glassdoor':   ['glassdoor.com'],
  'indeed':      ['indeed.com'],
}

const PLATFORM_PRIMARY_DOMAIN: Record<string, string> = {
  'kariyer.net': 'kariyer.net',
  'linkedin':    'linkedin.com',
  'glassdoor':   'glassdoor.com',
  'indeed':      'tr.indeed.com',
}

/**
 * Google search that surfaces a company's open positions / careers page,
 * scoped with `site:` to the declared platform when known. Fallback when
 * grounding can't map a confident direct link.
 */
function companyApplyUrl(company: string, platform?: string): string {
  const domain = platform ? PLATFORM_PRIMARY_DOMAIN[platform] : undefined
  const clean = company
    .replace(/\s+(ve\s+grup\s+şirketleri?|a\.?\s*ş\.?|ltd\.?\s*şti\.?|holding)\b/gi, '')
    .trim()
  const parts = [`"${clean}"`, 'açık pozisyonlar kariyer', domain ? `site:${domain}` : '']
  const q = encodeURIComponent(parts.filter(Boolean).join(' '))
  return `https://www.google.com/search?q=${q}`
}

/**
 * Maps a listing to the REAL source URL Gemini used, via groundingSupports
 * (text → chunk) or a chunk title containing the company name. Returns
 * undefined when no confident match — caller then uses a Google search.
 */
function resolveGroundingUrl(
  block: string,
  company: string,
  platform: string | undefined,
  grounding: GroundingData,
): { uri: string; isDirect: boolean } | undefined {
  if (!grounding.sources.length) return undefined

  const haystack = block.toLowerCase()
  const platformDomains = platform ? (PLATFORM_DOMAINS[platform] ?? []) : []
  const onPlatform = (src: GroundingSource) =>
    platformDomains.length === 0 ||
    platformDomains.some((d) => `${src.uri} ${src.title}`.toLowerCase().includes(d))

  // Strategy A — groundingSupports text overlap
  const candidateIdx = new Set<number>()
  for (const support of grounding.supports) {
    const seg = support.text.toLowerCase().trim()
    if (seg.length < 12) continue
    if (haystack.includes(seg)) {
      for (const idx of support.chunkIndices) candidateIdx.add(idx)
    }
  }
  let firstValid: GroundingSource | undefined
  for (const idx of candidateIdx) {
    const src = grounding.sources[idx]
    if (!src?.uri) continue
    if (!firstValid) firstValid = src
    if (onPlatform(src)) return { uri: src.uri, isDirect: true }
  }
  if (firstValid) return { uri: firstValid.uri, isDirect: true }

  // Strategy B — a source whose title contains the company name
  const companyLc = company.toLowerCase().trim()
  if (companyLc.length >= 4) {
    let titleMatch: GroundingSource | undefined
    for (const src of grounding.sources) {
      if (!src.uri || !src.title) continue
      if (src.title.toLowerCase().includes(companyLc)) {
        if (!titleMatch) titleMatch = src
        if (onPlatform(src)) return { uri: src.uri, isDirect: true }
      }
    }
    if (titleMatch) return { uri: titleMatch.uri, isDirect: true }
  }

  return undefined
}

// ─────────────────────────────────────────────────────────────
// Parser — extracts listings from Gemini's delimiter format
// ─────────────────────────────────────────────────────────────

export function parseJobListings(raw: string): ParsedRaw[] {
  const toListings = (blocks: string[]): ParsedRaw[] =>
    blocks
      .map((block) => {
        const rawPlatform = extractField(block, 'KAYNAK')
        return {
          company:     extractField(block, 'ŞİRKET'),
          title:       extractField(block, 'SEKTÖR'),
          location:    extractField(block, 'KONUM'),
          description: extractField(block, 'NEDEN'),
          platform:    rawPlatform ? normalizePlatform(rawPlatform) : undefined,
          _block:      block,
        }
      })
      .filter((j) => j.company)

  // Strategy 1: split on === (primary format)
  const byEquals = raw.split(/={3,}/).map((b) => b.trim()).filter((b) => /ŞİRKET:/i.test(b))
  if (byEquals.length > 1) return toListings(byEquals)

  // Strategy 2: split on --- (whole line of dashes)
  const byDash = raw.split(/^-{3,}\s*$/m).map((b) => b.trim()).filter((b) => /ŞİRKET:/i.test(b))
  if (byDash.length > 1) return toListings(byDash)

  // Strategy 3: split at every ŞİRKET: occurrence (most forgiving)
  const byCompany = raw.split(/(?=^ŞİRKET:)/im).map((b) => b.trim()).filter((b) => /ŞİRKET:/i.test(b))
  if (byCompany.length > 0) return toListings(byCompany)

  return []
}

// ─────────────────────────────────────────────────────────────
// Rank: attach match score, resolve URL, sort
// ─────────────────────────────────────────────────────────────

export function rankListings(
  cv: CVDocument,
  raw: ParsedRaw[],
  grounding: GroundingData = { sources: [], supports: [] },
): JobListing[] {
  // Dedupe by company name (case-insensitive)
  const seen = new Set<string>()
  const unique = raw.filter((j) => {
    const key = j.company.toLowerCase().trim()
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })

  return unique
    .map(({ _block, ...j }) => {
      const grounded = resolveGroundingUrl(_block, j.company, j.platform, grounding)
      const url = grounded?.uri ?? companyApplyUrl(j.company, j.platform)
      return {
        ...j,
        id: createId(),
        url,
        urlIsDirect: !!grounded,
        matchResult: matchCVToJob(cv, `${j.title} ${j.company} ${j.description}`),
      }
    })
    .sort((a, b) => b.matchResult.score - a.matchResult.score)
    .slice(0, MAX_RESULTS)
}

// ─────────────────────────────────────────────────────────────
// Build search params from CV + filters
// ─────────────────────────────────────────────────────────────

export function buildSearchParams(
  cv: CVDocument,
  filters: JobFilters,
): { jobTitle: string; skills: string; location: string; seniority: string; remote: boolean } {
  const jobTitle  = cv.personal.jobTitle || 'Yazılım Geliştirici'
  const skills    = cv.skills.slice(0, 8).map((s) => s.name).join(', ')
  const location  = filters.location || cv.contact.location || 'Türkiye'
  const remote    = filters.remote

  let seniority: string
  if (filters.seniority !== 'any') {
    seniority = SENIORITY_LABELS[filters.seniority]
  } else {
    const expCount = cv.experience.length
    seniority = expCount >= 4 ? 'Kıdemli' : expCount >= 1 ? 'Orta düzey' : 'Junior'
  }

  return { jobTitle, skills, location, seniority, remote }
}

// Re-export for convenience
export type { GroundingSource, JobMatchResult }
