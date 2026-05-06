/**
 * Generates a short, URL-safe unique ID using crypto.randomUUID.
 * Returns a 12-char prefix (collision-safe for client-side lists).
 */
export function createId(): string {
  // crypto.randomUUID is available in modern browsers + Node 19+
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 12)
  }
  // Fallback for older environments
  return Math.random().toString(36).slice(2, 14).padEnd(12, '0')
}
