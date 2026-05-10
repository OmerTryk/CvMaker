/**
 * CV Scoring Engine
 *
 * Two independent scores:
 *
 * 1. COMPLETION SCORE (0–100)
 *    How filled-in is the CV? Each section/field earns points.
 *
 * 2. ATS SCORE (0–100)
 *    How readable is the CV for Applicant Tracking Systems?
 *    Based on template choice, content quality, and formatting.
 */

import type { CVDocument } from '@/types/cv'

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface ScoreItem {
  label: string
  done: boolean
  points: number       // max points for this item
  earned: number       // points actually earned
  tip?: string         // what to do to earn the points
}

export interface CVScoreResult {
  score: number        // 0–100 rounded
  items: ScoreItem[]
  label: string        // "Zayıf" | "İyi" | "Güçlü" | "Mükemmel"
  color: 'red' | 'amber' | 'green' | 'emerald'
}

export interface CVScores {
  completion: CVScoreResult
  ats: CVScoreResult
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function hasNumbers(text: string) {
  return /\d/.test(text)
}

function hasQuantifiers(text: string) {
  return /(\d+\s*%|×\d|\d+x|\d+\s*(kat|saat|ay|yıl|kişi|müşteri|kullanıcı))/i.test(text)
}

function scoreLabel(s: number): CVScoreResult['label'] {
  if (s >= 90) return 'Mükemmel'
  if (s >= 70) return 'Güçlü'
  if (s >= 50) return 'İyi'
  return 'Zayıf'
}

function scoreColor(s: number): CVScoreResult['color'] {
  if (s >= 90) return 'emerald'
  if (s >= 70) return 'green'
  if (s >= 50) return 'amber'
  return 'red'
}

function build(items: ScoreItem[]): CVScoreResult {
  const total = items.reduce((a, i) => a + i.points, 0)
  const earned = items.reduce((a, i) => a + i.earned, 0)
  const score = Math.round((earned / total) * 100)
  return { score, items, label: scoreLabel(score), color: scoreColor(score) }
}

// ─────────────────────────────────────────────────────────────
// Completion Score
// ─────────────────────────────────────────────────────────────

/** ATS-friendly single-column templates */
const ATS_SINGLE_COL = new Set(['classic', 'minimal', 'timeline', 'elegant'])
/** Templates with moderate ATS support */
const ATS_MODERATE   = new Set(['technical', 'compact', 'executive'])

export function calcCompletionScore(cv: CVDocument): CVScoreResult {
  const items: ScoreItem[] = [
    // ── Identity (20 pts) ──
    {
      label: 'Ad Soyad',
      done: !!cv.personal.fullName,
      points: 8,
      earned: cv.personal.fullName ? 8 : 0,
      tip: 'Ad ve soyadınızı girin',
    },
    {
      label: 'Pozisyon / Unvan',
      done: !!cv.personal.jobTitle,
      points: 5,
      earned: cv.personal.jobTitle ? 5 : 0,
      tip: 'Hedef pozisyonunuzu veya unvanınızı ekleyin',
    },
    {
      label: 'Profil fotoğrafı',
      done: !!cv.personal.photoUrl,
      points: 4,
      earned: cv.personal.photoUrl ? 4 : 0,
      tip: 'Profesyonel bir fotoğraf yükleyin',
    },
    // ── Contact (15 pts) ──
    {
      label: 'E-posta',
      done: !!cv.contact.email,
      points: 6,
      earned: cv.contact.email ? 6 : 0,
      tip: 'E-posta adresinizi ekleyin',
    },
    {
      label: 'Telefon',
      done: !!cv.contact.phone,
      points: 4,
      earned: cv.contact.phone ? 4 : 0,
      tip: 'Telefon numaranızı ekleyin',
    },
    {
      label: 'Konum',
      done: !!cv.contact.location,
      points: 3,
      earned: cv.contact.location ? 3 : 0,
      tip: 'Şehir / ülke bilgisi ekleyin',
    },
    {
      label: 'LinkedIn veya GitHub',
      done: !!(cv.contact.linkedin || cv.contact.github),
      points: 4,
      earned: (cv.contact.linkedin || cv.contact.github) ? 4 : 0,
      tip: 'LinkedIn veya GitHub profilinizi ekleyin',
    },
    // ── Summary (10 pts) ──
    {
      label: 'Profil özeti (50+ karakter)',
      done: cv.summary.content.length >= 50,
      points: 10,
      earned: cv.summary.content.length >= 50 ? 10
            : cv.summary.content.length > 0   ? 5  : 0,
      tip: 'Güçlü bir profil özeti yazın (en az 50 karakter)',
    },
    // ── Experience (25 pts) ──
    {
      label: 'En az 1 deneyim',
      done: cv.experience.length >= 1,
      points: 8,
      earned: cv.experience.length >= 1 ? 8 : 0,
      tip: 'İş deneyimlerinizi ekleyin',
    },
    {
      label: 'Deneyim açıklamaları',
      done: cv.experience.some((e) => e.description.length > 30),
      points: 8,
      earned: (() => {
        const filled = cv.experience.filter((e) => e.description.length > 30).length
        return Math.min(8, Math.round((filled / Math.max(1, cv.experience.length)) * 8))
      })(),
      tip: 'Her deneyime açıklama yazın',
    },
    {
      label: 'Başarı maddeleri',
      done: cv.experience.some((e) => e.achievements.length > 0),
      points: 9,
      earned: (() => {
        const withAch = cv.experience.filter((e) => e.achievements.length > 0).length
        return Math.min(9, Math.round((withAch / Math.max(1, cv.experience.length)) * 9))
      })(),
      tip: 'Deneyimlere somut başarı maddeleri ekleyin',
    },
    // ── Education (10 pts) ──
    {
      label: 'Eğitim bilgisi',
      done: cv.education.length >= 1,
      points: 8,
      earned: cv.education.length >= 1 ? 8 : 0,
      tip: 'Eğitim geçmişinizi ekleyin',
    },
    {
      label: 'Eğitim alanı / bölüm',
      done: cv.education.some((e) => !!e.field),
      points: 2,
      earned: cv.education.some((e) => !!e.field) ? 2 : 0,
      tip: 'Bölüm/alan bilgisi ekleyin',
    },
    // ── Skills & Languages (15 pts) ──
    {
      label: 'En az 3 yetenek',
      done: cv.skills.length >= 3,
      points: 8,
      earned: Math.min(8, Math.round((Math.min(cv.skills.length, 8) / 8) * 8)),
      tip: 'En az 3 yetenek ekleyin (8 ideal)',
    },
    {
      label: 'Dil bilgisi',
      done: cv.languages.length >= 1,
      points: 4,
      earned: cv.languages.length >= 1 ? 4 : 0,
      tip: 'Konuştuğunuz dilleri ekleyin',
    },
    // ── Extras (5 pts) ──
    {
      label: 'Proje veya sertifika',
      done: cv.projects.length > 0 || cv.certificates.length > 0,
      points: 5,
      earned: (cv.projects.length > 0 || cv.certificates.length > 0) ? 5 : 0,
      tip: 'Proje veya sertifika ekleyin',
    },
  ]

  return build(items)
}

// ─────────────────────────────────────────────────────────────
// ATS Score
// ─────────────────────────────────────────────────────────────

export function calcATSScore(cv: CVDocument): CVScoreResult {
  const tpl = cv.settings.template

  const isSingleCol = ATS_SINGLE_COL.has(tpl)
  const isModerate  = ATS_MODERATE.has(tpl)
  const tplPoints   = isSingleCol ? 15 : isModerate ? 8 : 3

  // Check for quantified achievements
  const allAchievements = cv.experience.flatMap((e) => e.achievements)
  const allDescriptions = cv.experience.map((e) => e.description)
  const quantifiedCount = [...allAchievements, ...allDescriptions]
    .filter((t) => hasNumbers(t) || hasQuantifiers(t)).length
  const hasQuantified = quantifiedCount > 0
  const quantifiedPts = Math.min(15, quantifiedCount * 5)

  // Experience with proper dates
  const expWithDates = cv.experience.filter((e) => e.startDate).length
  const datePts = cv.experience.length === 0
    ? 0
    : Math.round((expWithDates / cv.experience.length) * 12)

  const items: ScoreItem[] = [
    // ── Template choice (15 pts) ──
    {
      label: `Şablon: ${tpl} (${isSingleCol ? 'ATS ideal' : isModerate ? 'orta uyum' : 'düşük uyum'})`,
      done: isSingleCol,
      points: 15,
      earned: tplPoints,
      tip: 'Klasik veya Minimal şablon ATS için en uygun',
    },
    // ── No photo penalty / neutral (5 pts) ──
    {
      label: 'Fotoğrafsız (ATS dostu)',
      done: !cv.personal.photoUrl,
      points: 5,
      earned: !cv.personal.photoUrl ? 5 : 2,
      tip: 'Bazı ATS sistemleri fotoğrafları okuyamaz',
    },
    // ── Contact info (15 pts) ──
    {
      label: 'E-posta mevcut',
      done: !!cv.contact.email,
      points: 8,
      earned: cv.contact.email ? 8 : 0,
      tip: 'E-posta adresi ATS için zorunlu',
    },
    {
      label: 'Telefon mevcut',
      done: !!cv.contact.phone,
      points: 4,
      earned: cv.contact.phone ? 4 : 0,
      tip: 'Telefon numarası ekleyin',
    },
    {
      label: 'Konum mevcut',
      done: !!cv.contact.location,
      points: 3,
      earned: cv.contact.location ? 3 : 0,
      tip: 'Şehir/konum bilgisi ekleyin',
    },
    // ── Experience quality (12 pts) ──
    {
      label: 'Deneyimlerde tarih bilgisi',
      done: expWithDates === cv.experience.length && cv.experience.length > 0,
      points: 12,
      earned: datePts,
      tip: 'Tüm deneyimlere başlangıç ve bitiş tarihi ekleyin',
    },
    // ── Quantified achievements (15 pts) ──
    {
      label: 'Sayısal/ölçülebilir başarılar',
      done: hasQuantified,
      points: 15,
      earned: quantifiedPts,
      tip: '% artış, ×2 büyüme gibi ölçülebilir sonuçlar ekleyin',
    },
    // ── Sections (20 pts) ──
    {
      label: 'Profil özeti var',
      done: cv.summary.content.length >= 50,
      points: 8,
      earned: cv.summary.content.length >= 50 ? 8
            : cv.summary.content.length > 0   ? 4 : 0,
      tip: 'ATS özet alanını anahtar kelime için tarar',
    },
    {
      label: 'Yetenekler bölümü (≥5 yetenek)',
      done: cv.skills.length >= 5,
      points: 10,
      earned: Math.min(10, cv.skills.length * 2),
      tip: 'Yetenekler bölümü iş ilanındaki anahtar kelimelerle eşleşmeli',
    },
    {
      label: 'İş deneyimi mevcut',
      done: cv.experience.length >= 1,
      points: 8,
      earned: cv.experience.length >= 1 ? 8 : 0,
      tip: 'ATS iş deneyimini öncelikli tarar',
    },
  ]

  return build(items)
}

// ─────────────────────────────────────────────────────────────
// Combined
// ─────────────────────────────────────────────────────────────

export function calcCVScores(cv: CVDocument): CVScores {
  return {
    completion: calcCompletionScore(cv),
    ats: calcATSScore(cv),
  }
}
