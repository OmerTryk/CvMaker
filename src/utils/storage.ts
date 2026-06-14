import { create } from 'zustand'

interface StorageErrorStore {
  quotaExceeded: boolean
  dismiss: () => void
}

export const useStorageErrorStore = create<StorageErrorStore>((set) => ({
  quotaExceeded: false,
  dismiss: () => set({ quotaExceeded: false }),
}))

const isQuotaError = (e: unknown) =>
  e instanceof DOMException &&
  (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')

export const safeStorage = {
  getItem: (name: string): string | null => {
    try { return localStorage.getItem(name) } catch { return null }
  },
  setItem: (name: string, value: string): void => {
    try {
      localStorage.setItem(name, value)
    } catch (e) {
      if (isQuotaError(e)) {
        useStorageErrorStore.setState({ quotaExceeded: true })
      }
    }
  },
  removeItem: (name: string): void => {
    try { localStorage.removeItem(name) } catch { /* ignore */ }
  },
}
