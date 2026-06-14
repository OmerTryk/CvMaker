import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from '@/router'
import './index.css'

// Eski otomatik tur key'lerini temizle (artık kullanılmıyor)
;['ctrlcv_home_toured', 'ctrlcv_ai_toured', 'ctrlcv_jobs_toured', 'ctrlcv_preview_toured', 'ctrlcv_editor_toured']
  .forEach((k) => localStorage.removeItem(k))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
