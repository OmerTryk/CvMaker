import { useEffect, useCallback } from 'react'
import { HelpCircle } from 'lucide-react'
import { JobFinderPanel } from '@/features/jobs'
import { useTour } from '@/features/help/useTour'
import { TourOverlay } from '@/features/help/TourOverlay'
import { JOBS_TOUR } from '@/features/help/tourSteps'

const TOUR_KEY = 'ctrlcv_jobs_toured'

export function JobsPage() {
  const tour = useTour(JOBS_TOUR)

  // İlk ziyarette otomatik tur başlat
  useEffect(() => {
    if (localStorage.getItem(TOUR_KEY)) return
    const t = setTimeout(() => tour.start(), 700)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleTourClose = useCallback(() => {
    localStorage.setItem(TOUR_KEY, '1')
    tour.stop()
  }, [tour])

  return (
    <div className="w-full px-6 py-8 md:px-10 md:py-10">
      {/* Header */}
      <div data-tour="jobs-header" className="mb-7 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-light tracking-tight text-ink md:text-4xl">
            Şirket Bul
          </h1>
          <p className="mt-1 text-sm text-ink/40">
            CV'ne uygun, başvurabileceğin gerçek şirketleri keşfet
          </p>
        </div>
        <button
          type="button"
          onClick={tour.start}
          className="inline-flex items-center gap-1.5 border border-line px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-ink/60 transition-colors hover:border-accent hover:text-accent"
        >
          <HelpCircle size={12} strokeWidth={1.5} />
          Nasıl çalışır?
        </button>
      </div>

      <JobFinderPanel />

      {tour.active && tour.current && (
        <TourOverlay
          step={tour.current}
          stepIndex={tour.stepIndex}
          totalSteps={tour.totalSteps}
          isFirst={tour.isFirst}
          isLast={tour.isLast}
          onNext={tour.next}
          onPrev={tour.prev}
          onClose={handleTourClose}
        />
      )}
    </div>
  )
}
