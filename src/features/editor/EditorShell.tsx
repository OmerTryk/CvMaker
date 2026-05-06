import { type ComponentType } from 'react'
import { useCVStore } from '@/store'
import { SECTION_LABELS, type SectionKey } from '@/types/cv'
import { SectionCard } from './SectionCard'
import { PersonalSection } from './sections/PersonalSection'
import { ContactSection } from './sections/ContactSection'
import { SummarySection } from './sections/SummarySection'
import { ExperienceSection } from './sections/ExperienceSection'
import { EducationSection } from './sections/EducationSection'
import { SkillsSection } from './sections/SkillsSection'
import { LanguagesSection } from './sections/LanguagesSection'
import { CertificatesSection } from './sections/CertificatesSection'
import { ProjectsSection } from './sections/ProjectsSection'
import { ReferencesSection } from './sections/ReferencesSection'

const SECTION_COMPONENTS: Record<SectionKey, ComponentType> = {
  summary: SummarySection,
  experience: ExperienceSection,
  education: EducationSection,
  skills: SkillsSection,
  projects: ProjectsSection,
  languages: LanguagesSection,
  certificates: CertificatesSection,
  references: ReferencesSection,
}

export function EditorShell() {
  const cv = useCVStore((s) => s.cv)
  const toggleSection = useCVStore((s) => s.toggleSection)

  // Item counts per section (for the header badge)
  const counts: Record<SectionKey, number> = {
    summary: cv.summary.content.length > 0 ? 1 : 0,
    experience: cv.experience.length,
    education: cv.education.length,
    skills: cv.skills.length,
    projects: cv.projects.length,
    languages: cv.languages.length,
    certificates: cv.certificates.length,
    references: cv.references.length,
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Always-shown identity sections */}
      <SectionCard
        title="Kişisel Bilgiler"
        description="ad, unvan, fotoğraf"
        required
      >
        <PersonalSection />
      </SectionCard>

      <SectionCard title="İletişim" description="e-posta, telefon, sosyal" required>
        <ContactSection />
      </SectionCard>

      {/* Configurable sections — rendered in user's preferred order */}
      {cv.sectionOrder.map((key) => {
        const Component = SECTION_COMPONENTS[key]
        const isHidden = cv.hiddenSections.includes(key)

        return (
          <SectionCard
            key={key}
            title={SECTION_LABELS[key]}
            count={counts[key]}
            hidden={isHidden}
            onToggleHidden={() => toggleSection(key)}
            defaultOpen={key === 'summary' || key === 'experience'}
          >
            <Component />
          </SectionCard>
        )
      })}
    </div>
  )
}
