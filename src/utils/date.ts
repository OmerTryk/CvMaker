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
