/**
 * Job-CV Matching Engine
 *
 * Two-pass keyword extraction:
 *  1. Skill database lookup (exact & partial match)
 *  2. Capitalized word heuristic (custom tech names not in DB)
 *
 * Matching is case-insensitive and handles common suffixes
 * (e.g. "APIs" → "api", "developer" → "develop").
 */

import type { CVDocument } from '@/types/cv'
import { ALL_SKILLS, SKILL_CATEGORY } from './skill-database'

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface MatchedKeyword {
  keyword: string
  category: string   // e.g. 'frontend', 'devops', 'soft'
  inCV: boolean
}

export interface JobMatchResult {
  score: number                  // 0–100
  matched: MatchedKeyword[]
  missing: MatchedKeyword[]
  totalKeywords: number
  jobKeywords: string[]          // all extracted from job
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function normalize(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9#.+\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Very light stemmer: strips trailing common suffixes for fuzzy match */
function stem(word: string): string {
  return word
    .replace(/ler$|lar$/, '')   // Turkish plural
    .replace(/ing$|er$|ed$|s$/, '')  // English basic
}

function cvContains(cvText: string, keyword: string): boolean {
  const norm = normalize(cvText)
  const kw = normalize(keyword)
  // Direct substring
  if (norm.includes(kw)) return true
  // Stemmed
  if (stem(norm).includes(stem(kw))) return true
  return false
}

// ─────────────────────────────────────────────────────────────
// Extract keywords from job description
// ─────────────────────────────────────────────────────────────

export function extractJobKeywords(jobDescription: string): MatchedKeyword[] {
  const text = normalize(jobDescription)
  const found = new Map<string, string>() // keyword → category

  // Pass 1: Database lookup
  for (const skill of ALL_SKILLS) {
    const normSkill = normalize(skill)
    if (text.includes(normSkill)) {
      found.set(skill, SKILL_CATEGORY[skill] ?? 'other')
    }
  }

  // Pass 2: Capitalized word heuristic (likely tech/product names)
  const capitalWords = jobDescription
    .split(/[\s,;:()\[\]\/]+/)
    .filter((w) => w.length >= 3 && /^[A-Z]/.test(w) && /[a-z]/.test(w))
    .map((w) => w.replace(/[^a-zA-Z0-9#+.]/g, ''))
    .filter((w) => w.length >= 3)

  for (const word of capitalWords) {
    const lower = word.toLowerCase()
    if (!found.has(lower) && !found.has(word)) {
      // Only add if not common english word
      const stopWords = new Set(['The', 'And', 'For', 'With', 'You', 'Your', 'Our', 'This', 'That', 'Are', 'Will', 'Have', 'Has', 'Not', 'But', 'Can', 'May', 'All', 'Any', 'New', 'Team', 'Work', 'Must', 'Good', 'Strong'])
      if (!stopWords.has(word)) {
        found.set(word, 'custom')
      }
    }
  }

  return Array.from(found.entries()).map(([keyword, category]) => ({
    keyword,
    category,
    inCV: false, // set later
  }))
}

// ─────────────────────────────────────────────────────────────
// Build CV keyword corpus
// ─────────────────────────────────────────────────────────────

function buildCVText(cv: CVDocument): string {
  const parts: string[] = [
    cv.personal.fullName,
    cv.personal.jobTitle,
    cv.summary.content,
    ...cv.skills.map((s) => s.name),
    ...cv.languages.map((l) => l.name),
    ...cv.experience.map((e) => [
      e.position,
      e.company,
      e.description,
      ...e.achievements,
    ].join(' ')),
    ...cv.education.map((e) => [e.institution, e.degree, e.field].join(' ')),
    ...cv.projects.map((p) => [p.name, p.description, ...p.technologies].join(' ')),
    ...cv.certificates.map((c) => c.name),
  ]
  return parts.join(' ')
}

// ─────────────────────────────────────────────────────────────
// Main matching function
// ─────────────────────────────────────────────────────────────

export function matchCVToJob(cv: CVDocument, jobDescription: string): JobMatchResult {
  if (!jobDescription.trim()) {
    return { score: 0, matched: [], missing: [], totalKeywords: 0, jobKeywords: [] }
  }

  const cvText = buildCVText(cv)
  const keywords = extractJobKeywords(jobDescription)

  if (keywords.length === 0) {
    return { score: 0, matched: [], missing: [], totalKeywords: 0, jobKeywords: [] }
  }

  // Mark each keyword as found / not found in CV
  const annotated: MatchedKeyword[] = keywords.map((kw) => ({
    ...kw,
    inCV: cvContains(cvText, kw.keyword),
  }))

  const matched = annotated.filter((k) => k.inCV)
  const missing = annotated.filter((k) => !k.inCV)

  // Weight: database skills count double vs custom/heuristic
  let earnedWeight = 0
  let totalWeight = 0
  for (const kw of annotated) {
    const w = kw.category === 'custom' ? 0.5 : 1
    totalWeight += w
    if (kw.inCV) earnedWeight += w
  }

  const score = totalWeight === 0 ? 0 : Math.round((earnedWeight / totalWeight) * 100)

  return {
    score,
    matched,
    missing,
    totalKeywords: annotated.length,
    jobKeywords: annotated.map((k) => k.keyword),
  }
}
