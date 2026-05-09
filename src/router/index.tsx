import { createBrowserRouter } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { Layout } from '@/components/layout/Layout'
import { NotFoundPage } from '@/pages/NotFoundPage'

// Lazy-load heavy pages so they're only fetched when navigated to
const HomePage    = lazy(() => import('@/pages/HomePage').then((m) => ({ default: m.HomePage })))
const EditorPage  = lazy(() => import('@/pages/EditorPage').then((m) => ({ default: m.EditorPage })))
const PreviewPage = lazy(() => import('@/pages/PreviewPage').then((m) => ({ default: m.PreviewPage })))

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <span className="font-mono text-xs uppercase tracking-widest text-ink/30 animate-pulse">
        Yükleniyor...
      </span>
    </div>
  )
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoader />}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: 'editor',
        element: (
          <Suspense fallback={<PageLoader />}>
            <EditorPage />
          </Suspense>
        ),
      },
      {
        path: 'preview',
        element: (
          <Suspense fallback={<PageLoader />}>
            <PreviewPage />
          </Suspense>
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
