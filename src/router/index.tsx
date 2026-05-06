import { createBrowserRouter } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { HomePage } from '@/pages/HomePage'
import { EditorPage } from '@/pages/EditorPage'
import { PreviewPage } from '@/pages/PreviewPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'editor', element: <EditorPage /> },
      { path: 'preview', element: <PreviewPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
