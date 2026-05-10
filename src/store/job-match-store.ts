import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { JobMatchResult } from '@/lib/job-match'

interface JobMatchStore {
  jobDescription: string
  result: JobMatchResult | null
  aiAnalysis: string        // streaming AI response
  aiLoading: boolean

  setJobDescription: (text: string) => void
  setResult: (result: JobMatchResult | null) => void
  setAIAnalysis: (text: string) => void
  appendAIChunk: (chunk: string) => void
  setAILoading: (v: boolean) => void
  clear: () => void
}

export const useJobMatchStore = create<JobMatchStore>()(
  persist(
    (set) => ({
      jobDescription: '',
      result: null,
      aiAnalysis: '',
      aiLoading: false,

      setJobDescription: (text) => set({ jobDescription: text }),
      setResult: (result) => set({ result }),
      setAIAnalysis: (text) => set({ aiAnalysis: text }),
      appendAIChunk: (chunk) => set((s) => ({ aiAnalysis: s.aiAnalysis + chunk })),
      setAILoading: (v) => set({ aiLoading: v }),
      clear: () => set({ jobDescription: '', result: null, aiAnalysis: '', aiLoading: false }),
    }),
    {
      name: 'ctrlcv.jobmatch.v1',
      storage: createJSONStorage(() => localStorage),
      // Don't persist AI loading state
      partialize: (s) => ({
        jobDescription: s.jobDescription,
        result: s.result,
        aiAnalysis: s.aiAnalysis,
      }),
    },
  ),
)
