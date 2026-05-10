import { createBrowserRouter } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { Layout } from '@/components/layout/Layout'
import { NotFoundPage } from '@/pages/NotFoundPage'

const DashboardPage = lazy(() => import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const HomePage      = lazy(() => import('@/pages/HomePage').then((m) => ({ default: m.HomePage })))
const EditorPage    = lazy(() => import('@/pages/EditorPage').then((m) => ({ default: m.EditorPage })))
const PreviewPage   = lazy(() => import('@/pages/PreviewPage').then((m) => ({ default: m.PreviewPage })))

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <span className="animate-pulse font-mono text-xs uppercase tracking-widest text-ink/30">
        Yükleniyor...
      </span>
    </div>
  )
}

function S({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true,          element: <S><HomePage /></S> },
      { path: 'dashboard',    element: <S><DashboardPage /></S> },
      { path: 'editor',       element: <S><EditorPage /></S> },
      { path: 'preview',      element: <S><PreviewPage /></S> },
      { path: '*',            element: <NotFoundPage /> },
    ],
  },
])
