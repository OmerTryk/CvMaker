/**
 * Picks and renders the active template based on cv.settings.template.
 */

import type { CVDocument } from '@/types/cv'
import { ModernTemplate } from './ModernTemplate'
import { ClassicTemplate } from './ClassicTemplate'
import { MinimalTemplate } from './MinimalTemplate'

interface TemplateRendererProps {
  cv: CVDocument
}

export function TemplateRenderer({ cv }: TemplateRendererProps) {
  switch (cv.settings.template) {
    case 'classic':
      return <ClassicTemplate cv={cv} />
    case 'minimal':
      return <MinimalTemplate cv={cv} />
    case 'modern':
    default:
      return <ModernTemplate cv={cv} />
  }
}
