/**
 * Job-CV Matching Engine (local, no AI)
 *
 * Improvements over naive substring matching:
 *  - Token-boundary matching → no more false positives ("Go" inside "good",
 *    "R" inside "your", "api" inside "rapidapi"). Multi-word skills still use
 *    phrase matching.
 *  - Keyword frequency + importance (repeated/known skills weigh more).
 *  - Per-category coverage breakdown (frontend, backend, …).
 *  - Required-experience detection vs the candidate's actual years.
 *  - Locally generated, prioritized recommendations.
 */

import type { CVDocument } from '@/types/cv'
import { ALL_SKILLS, SKILL_CATEGORY } from './skill-database'

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface MatchedKeyword {
  keyword: string
  category: string
  inCV: boolean
  frequency: number   // times mentioned in the job posting
  important: boolean  // known skill, or mentioned more than once
}

export interface CategoryCoverage {
  category: string
  label: string
  matched: number
  total: number
  score: number       // 0–100
}

export interface JobMatchResult {
  score: number                  // 0–100
  matched: MatchedKeyword[]
  missing: MatchedKeyword[]
  totalKeywords: number
  jobKeywords: string[]
  categories: CategoryCoverage[]
  requiredYears: number | null   // detected from the job text
  cvYears: number                // candidate's total experience (years)
  recommendations: string[]      // locally derived, prioritized
}

const CATEGORY_LABELS: Record<string, string> = {
  languages: 'Diller',
  frontend: 'Frontend',
  backend: 'Backend',
  databases: 'Veritabanı',
  devops: 'DevOps / Bulut',
  mobile: 'Mobil',
  data: 'Veri / AI',
  tools: 'Araçlar',
  methods: 'Metodoloji',
  soft: 'Yetkinlik',
}

// ─────────────────────────────────────────────────────────────
// Text helpers
// ─────────────────────────────────────────────────────────────

function normalize(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9#.+\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Split into tokens, preserving tech punctuation (#, +, .) inside words. */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9#.+\s]/g, ' ')
    .split(/\s+/)
    .map((t) => t.replace(/\.$/, ''))   // strip a trailing sentence dot ("react." → "react"), keep ".net"
    .filter(Boolean)
}

/** Light stemmer for fuzzy single-token matching. */
function stem(word: string): string {
  return word
    .replace(/ler$|lar$/, '')           // Turkish plural
    .replace(/ing$|ed$|s$/, '')          // English basic (keep 'er' — too lossy)
}

// ─────────────────────────────────────────────────────────────
// Required experience (years) detection
// ─────────────────────────────────────────────────────────────

function detectRequiredYears(jobText: string): number | null {
  const re = /(\d{1,2})\s*\+?\s*(?:yıl|yil|sene|years?|yrs?)\b/gi
  let max: number | null = null
  let m: RegExpExecArray | null
  while ((m = re.exec(jobText)) !== null) {
    const n = Number(m[1])
    if (n > 0 && n <= 40 && (max === null || n > max)) max = n
  }
  return max
}

function parseYearMonth(s?: string | null): Date | null {
  if (!s) return null
  const m = /^(\d{4})-(\d{1,2})/.exec(s.trim())
  if (!m) return null
  return new Date(Number(m[1]), Number(m[2]) - 1, 1)
}

function cvExperienceYears(cv: CVDocument): number {
  let months = 0
  for (const e of cv.experience) {
    const start = parseYearMonth(e.startDate)
    const end = e.current ? new Date() : parseYearMonth(e.endDate)
    if (start && end) {
      const diff = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
      if (diff > 0) months += diff
    }
  }
  return Math.round((months / 12) * 10) / 10
}

// ─────────────────────────────────────────────────────────────
// Keyword extraction (with frequency)
// ─────────────────────────────────────────────────────────────

export function extractJobKeywords(jobDescription: string): MatchedKeyword[] {
  const normText = normalize(jobDescription)
  const tokens = tokenize(jobDescription)
  const tokenCounts = new Map<string, number>()
  for (const t of tokens) tokenCounts.set(t, (tokenCounts.get(t) ?? 0) + 1)

  /** Frequency of a skill/phrase in the job text. */
  const freqOf = (skill: string): number => {
    const s = skill.toLowerCase()
    if (s.includes(' ')) {
      // phrase → count substring occurrences (word-bounded enough for phrases)
      let count = 0, idx = normText.indexOf(s)
      while (idx !== -1) { count++; idx = normText.indexOf(s, idx + s.length) }
      return count
    }
    return tokenCounts.get(s) ?? 0
  }

  const found = new Map<string, { category: string; frequency: number }>()

  // Pass 1: skill database (token/phrase bounded — no substring false positives)
  for (const skill of ALL_SKILLS) {
    const f = freqOf(skill)
    if (f > 0) found.set(skill, { category: SKILL_CATEGORY[skill] ?? 'other', frequency: f })
  }

  // Pass 2: Capitalized-word heuristic for custom product/tech names not in DB
  const stopWords = new Set([
    'The', 'And', 'For', 'With', 'You', 'Your', 'Our', 'This', 'That', 'Are',
    'Will', 'Have', 'Has', 'Not', 'But', 'Can', 'May', 'All', 'Any', 'New',
    'Team', 'Work', 'Must', 'Good', 'Strong', 'Bir', 'Ve', 'İle', 'İçin',
    'Veya', 'Olan', 'Gibi', 'Daha', 'Çok', 'Tüm', 'Bu', 'Şu',
  ])
  const capitalWords = jobDescription
    .split(/[\s,;:()[\]/]+/)
    .filter((w) => w.length >= 3 && /^[A-ZÇĞİÖŞÜ]/.test(w) && /[a-zçğıöşü]/.test(w))
    .map((w) => w.replace(/[^a-zA-Z0-9#+.ÇĞİÖŞÜçğıöşü]/g, ''))
    .filter((w) => w.length >= 3 && !stopWords.has(w))

  for (const word of capitalWords) {
    const lower = word.toLowerCase()
    if (!found.has(lower) && !found.has(word)) {
      found.set(word, { category: 'custom', frequency: tokenCounts.get(lower) ?? 1 })
    }
  }

  return Array.from(found.entries()).map(([keyword, { category, frequency }]) => ({
    keyword,
    category,
    inCV: false,
    frequency,
    important: category !== 'custom' || frequency >= 2,
  }))
}

// ─────────────────────────────────────────────────────────────
// CV corpus
// ─────────────────────────────────────────────────────────────

function buildCVText(cv: CVDocument): string {
  const parts: string[] = [
    cv.personal.fullName,
    cv.personal.jobTitle,
    cv.summary.content,
    ...cv.skills.map((s) => s.name),
    ...cv.languages.map((l) => l.name),
    ...cv.experience.map((e) => [e.position, e.company, e.description, ...e.achievements].join(' ')),
    ...cv.education.map((e) => [e.institution, e.degree, e.field].join(' ')),
    ...cv.projects.map((p) => [p.name, p.description, ...p.technologies].join(' ')),
    ...cv.certificates.map((c) => c.name),
  ]
  return parts.join(' ')
}

// ─────────────────────────────────────────────────────────────
// Main matching
// ─────────────────────────────────────────────────────────────

function emptyResult(cvYears = 0): JobMatchResult {
  return {
    score: 0, matched: [], missing: [], totalKeywords: 0, jobKeywords: [],
    categories: [], requiredYears: null, cvYears, recommendations: [],
  }
}

export function matchCVToJob(cv: CVDocument, jobDescription: string): JobMatchResult {
  const cvYears = cvExperienceYears(cv)
  if (!jobDescription.trim()) return emptyResult(cvYears)

  const keywords = extractJobKeywords(jobDescription)
  if (keywords.length === 0) return emptyResult(cvYears)

  // CV token set + phrase corpus for bounded matching
  const cvNorm = normalize(buildCVText(cv))
  const cvTokens = new Set(tokenize(buildCVText(cv)))
  const cvStems = new Set([...cvTokens].map(stem))

  const cvHas = (keyword: string): boolean => {
    const k = keyword.toLowerCase()
    if (k.includes(' ')) return cvNorm.includes(k)          // phrase
    if (cvTokens.has(k)) return true                         // exact token
    return cvStems.has(stem(k))                              // stemmed fallback
  }

  const annotated: MatchedKeyword[] = keywords.map((kw) => ({ ...kw, inCV: cvHas(kw.keyword) }))

  // Sort: important first, then by frequency
  const byImportance = (a: MatchedKeyword, b: MatchedKeyword) =>
    Number(b.important) - Number(a.important) || b.frequency - a.frequency
  const matched = annotated.filter((k) => k.inCV).sort(byImportance)
  const missing = annotated.filter((k) => !k.inCV).sort(byImportance)

  // Importance-weighted score
  let earned = 0, total = 0
  for (const kw of annotated) {
    const w = kw.important ? 1 : 0.5
    total += w
    if (kw.inCV) earned += w
  }
  const score = total === 0 ? 0 : Math.round((earned / total) * 100)

  // Per-category coverage (skip noise categories)
  const catMap = new Map<string, { matched: number; total: number }>()
  for (const kw of annotated) {
    if (kw.category === 'custom' || kw.category === 'other') continue
    const c = catMap.get(kw.category) ?? { matched: 0, total: 0 }
    c.total += 1
    if (kw.inCV) c.matched += 1
    catMap.set(kw.category, c)
  }
  const categories: CategoryCoverage[] = [...catMap.entries()]
    .map(([category, v]) => ({
      category,
      label: CATEGORY_LABELS[category] ?? category,
      matched: v.matched,
      total: v.total,
      score: Math.round((v.matched / v.total) * 100),
    }))
    .sort((a, b) => b.total - a.total)

  const requiredYears = detectRequiredYears(jobDescription)

  // ── Local recommendations ──
  const recommendations: string[] = []
  if (requiredYears !== null && cvYears < requiredYears) {
    recommendations.push(
      `İlan ~${requiredYears} yıl deneyim istiyor; CV'nde yaklaşık ${cvYears} yıl görünüyor. Deneyimini öne çıkar.`,
    )
  }
  const topMissing = missing.filter((k) => k.important).slice(0, 5).map((k) => k.keyword)
  if (topMissing.length) {
    recommendations.push(`Şu önemli anahtar kelimeleri CV'ne ekle: ${topMissing.join(', ')}.`)
  }
  const weakCat = categories
    .filter((c) => c.total >= 2 && c.score < 50)
    .sort((a, b) => a.score - b.score)[0]
  if (weakCat) {
    recommendations.push(`${weakCat.label} uyumun düşük (%${weakCat.score}) — bu alanı güçlendir.`)
  }
  if (score >= 75 && recommendations.length === 0) {
    recommendations.push('CV bu ilana güçlü uyum sağlıyor. 🎯')
  }

  return {
    score,
    matched,
    missing,
    totalKeywords: annotated.length,
    jobKeywords: annotated.map((k) => k.keyword),
    categories,
    requiredYears,
    cvYears,
    recommendations,
  }
}
