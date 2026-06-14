/**
 * Date utilities for CV data.
 * CVs use 'YYYY-MM' (monthly precision) for start/end dates.
 */

const TR_MONTHS = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
]

const EN_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export type DateLocale = 'tr' | 'en'

/**
 * Formats a YYYY-MM date string into a human-readable form.
 * Returns "Devam ediyor" / "Present" for null end dates.
 *
 * @example formatMonthYear('2024-03', 'tr') -> 'Mart 2024'
 * @example formatMonthYear(null, 'en') -> 'Present'
 */
export function formatMonthYear(
  yyyymm: string | null | undefined,
  locale: DateLocale = 'tr',
): string {
  if (!yyyymm) return locale === 'tr' ? 'Devam ediyor' : 'Present'

  const match = /^(\d{4})-(\d{2})$/.exec(yyyymm)
  if (!match) return yyyymm

  const year = match[1]
  const monthIdx = Number(match[2]) - 1
  if (monthIdx < 0 || monthIdx > 11) return yyyymm

  const months = locale === 'tr' ? TR_MONTHS : EN_MONTHS
  return `${months[monthIdx]} ${year}`
}

/**
 * Returns "YYYY-MM" for the current month.
 */
export function currentMonth(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

/**
 * Returns the current ISO timestamp.
 */
export function nowISO(): string {
  return new Date().toISOString()
}

/**
 * Formats an ISO timestamp into a relative time string (Turkish).
 * @example formatRelative(Date.now() - 30000) -> '30 saniye önce'
 */
const MONTH_MAP: Record<string, string> = {
  ocak: '01', şubat: '02', mart: '03', nisan: '04',
  mayıs: '05', haziran: '06', temmuz: '07', ağustos: '08',
  eylül: '09', ekim: '10', kasım: '11', aralık: '12',
  january: '01', february: '02', march: '03', april: '04',
  may: '05', june: '06', july: '07', august: '08',
  september: '09', october: '10', november: '11', december: '12',
  jan: '01', feb: '02', mar: '03', apr: '04',
  jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
}

/**
 * Parses various date string formats into YYYY-MM, or null when the value
 * represents "ongoing" (Present, Devam ediyor, …) or cannot be parsed.
 */
export function parseToMonthDate(value: string | null | undefined): string | null {
  if (!value) return null
  const v = value.trim()
  if (!v) return null

  // "present / devam / halen / şu an" → ongoing
  if (/present|current|devam|halen|günümüz|şu an|bugün/i.test(v)) return null

  // Already YYYY-MM — validate month range (01-12)
  if (/^\d{4}-(0[1-9]|1[0-2])$/.test(v)) return v

  // YYYY-MM-DD → drop the day
  const full = /^(\d{4})-(\d{2})-\d{2}$/.exec(v)
  if (full) return `${full[1]}-${full[2]}`

  // MM/YYYY or MM.YYYY
  const slash = /^(\d{1,2})[/.](\d{4})$/.exec(v)
  if (slash) return `${slash[2]}-${String(slash[1]).padStart(2, '0')}`

  // Bare year → January of that year
  const year = /^(\d{4})$/.exec(v)
  if (year) return `${year[1]}-01`

  // "Mart 2024", "March 2024", "2024 Mart", "Mar. 2024" …
  const lower = v.toLowerCase()
  for (const [name, num] of Object.entries(MONTH_MAP)) {
    const m1 = new RegExp(`\\b${name}\\.?\\s+(\\d{4})`).exec(lower)
    if (m1) return `${m1[1]}-${num}`
    const m2 = new RegExp(`(\\d{4})\\s+${name}`).exec(lower)
    if (m2) return `${m2[1]}-${num}`
  }

  return null
}

export function formatRelative(timestamp: number | string | null): string {
  if (!timestamp) return '—'
  const date = typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp
  const diff = Date.now() - date
  const seconds = Math.floor(diff / 1000)
  if (seconds < 5) return 'az önce'
  if (seconds < 60) return `${seconds} saniye önce`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} dakika önce`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} saat önce`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} gün önce`
  return new Date(date).toLocaleDateString('tr-TR')
}
