import type { CVDocument } from '@/types/cv'
import { ModernTemplate } from './ModernTemplate'
import { ClassicTemplate } from './ClassicTemplate'
import { MinimalTemplate } from './MinimalTemplate'
import { ExecutiveTemplate } from './ExecutiveTemplate'
import { CreativeTemplate } from './CreativeTemplate'
import { TechnicalTemplate } from './TechnicalTemplate'
import { TimelineTemplate } from './TimelineTemplate'
import { ElegantTemplate } from './ElegantTemplate'
import { CompactTemplate } from './CompactTemplate'

export function TemplateRenderer({ cv }: { cv: CVDocument }) {
  switch (cv.settings.template) {
    case 'classic':    return <ClassicTemplate cv={cv} />
    case 'minimal':    return <MinimalTemplate cv={cv} />
    case 'executive':  return <ExecutiveTemplate cv={cv} />
    case 'creative':   return <CreativeTemplate cv={cv} />
    case 'technical':  return <TechnicalTemplate cv={cv} />
    case 'timeline':   return <TimelineTemplate cv={cv} />
    case 'elegant':    return <ElegantTemplate cv={cv} />
    case 'compact':    return <CompactTemplate cv={cv} />
    case 'modern':
    default:           return <ModernTemplate cv={cv} />
  }
}
