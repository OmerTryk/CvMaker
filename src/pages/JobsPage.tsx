import { JobFinderPanel } from '@/features/jobs'

export function JobsPage() {
  return (
    <div className="w-full px-6 py-8 md:px-10 md:py-10">
      {/* Header */}
      <div className="mb-7">
        <h1 className="font-display text-2xl font-light tracking-tight text-ink md:text-4xl">
          Şirket Bul
        </h1>
        <p className="mt-1 text-sm text-ink/40">
          CV'ne uygun, başvurabileceğin gerçek şirketleri keşfet
        </p>
      </div>

      <JobFinderPanel />
    </div>
  )
}
