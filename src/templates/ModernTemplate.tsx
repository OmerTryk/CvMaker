/**
 * Modern Template — two-column with colored sidebar.
 *
 * Sidebar: contact, skills, languages
 * Main: summary, experience, education, projects, certificates, references
 */

import type { CVDocument, SectionKey } from '@/types/cv'
import { COLOR_THEMES, FONT_FAMILIES } from './shared/tokens'
import {
  formatDateRange,
  getVisibleSections,
  joinParts,
  normalizeUrl,
  PROFICIENCY_LABEL,
  sectionHasContent,
} from './shared/helpers'
import { Mail, Phone, MapPin, Globe, Linkedin, Github, Twitter } from 'lucide-react'

interface ModernTemplateProps {
  cv: CVDocument
}

// Sections that live in the sidebar
const SIDEBAR_SECTIONS = new Set<SectionKey>(['skills', 'languages'])

export function ModernTemplate({ cv }: ModernTemplateProps) {
  const colors = COLOR_THEMES[cv.settings.colorTheme]
  const fonts = FONT_FAMILIES[cv.settings.fontFamily]
  const visible = getVisibleSections(cv)

  const sidebarSections = visible.filter((s) => SIDEBAR_SECTIONS.has(s))
  const mainSections = visible.filter((s) => !SIDEBAR_SECTIONS.has(s))

  return (
    <article
      className="flex h-full w-full"
      style={{
        fontFamily: fonts.body,
        color: colors.text,
        background: colors.surface,
      }}
    >
      {/* SIDEBAR */}
      <aside
        className="w-[34%] shrink-0 px-7 py-9"
        style={{ background: colors.surfaceAlt }}
      >
        {/* Identity */}
        <header className="mb-8">
          {/* Photo */}
          {cv.personal.photoUrl && (
            <div className="mb-4">
              <img
                src={cv.personal.photoUrl}
                alt={cv.personal.fullName}
                style={{
                  width: '76px',
                  height: '76px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: `2px solid ${colors.divider}`,
                }}
              />
            </div>
          )}
          <h1
            className="text-[28px] font-medium leading-[1.05] tracking-tight"
            style={{ fontFamily: fonts.display, color: colors.primary }}
          >
            {cv.personal.fullName || 'Ad Soyad'}
          </h1>
          {cv.personal.jobTitle && (
            <p
              className="mt-1.5 text-[12px] uppercase tracking-[0.18em]"
              style={{ color: colors.muted }}
            >
              {cv.personal.jobTitle}
            </p>
          )}
        </header>

        {/* Contact */}
        <SidebarSection title="İletişim" colors={colors} fonts={fonts}>
          <ul className="flex flex-col gap-2 text-[11px] leading-relaxed">
            {cv.contact.email && (
              <ContactRow icon={<Mail size={11} />} colors={colors}>
                {cv.contact.email}
              </ContactRow>
            )}
            {cv.contact.phone && (
              <ContactRow icon={<Phone size={11} />} colors={colors}>
                {cv.contact.phone}
              </ContactRow>
            )}
            {cv.contact.location && (
              <ContactRow icon={<MapPin size={11} />} colors={colors}>
                {cv.contact.location}
              </ContactRow>
            )}
            {cv.contact.website && (
              <ContactRow icon={<Globe size={11} />} colors={colors}>
                {normalizeUrl(cv.contact.website)}
              </ContactRow>
            )}
            {cv.contact.linkedin && (
              <ContactRow icon={<Linkedin size={11} />} colors={colors}>
                {normalizeUrl(cv.contact.linkedin)}
              </ContactRow>
            )}
            {cv.contact.github && (
              <ContactRow icon={<Github size={11} />} colors={colors}>
                {normalizeUrl(cv.contact.github)}
              </ContactRow>
            )}
            {cv.contact.twitter && (
              <ContactRow icon={<Twitter size={11} />} colors={colors}>
                {cv.contact.twitter}
              </ContactRow>
            )}
          </ul>
        </SidebarSection>

        {/* Sidebar configurable sections */}
        {sidebarSections.map((key) => {
          if (!sectionHasContent(cv, key)) return null
          if (key === 'skills') {
            return (
              <SidebarSection
                key={key}
                title="Yetenekler"
                colors={colors}
                fonts={fonts}
              >
                <ul className="flex flex-col gap-2.5">
                  {cv.skills.map((skill) => (
                    <li key={skill.id} className="text-[11px]">
                      <div className="flex items-center justify-between">
                        <span style={{ color: colors.text }}>{skill.name}</span>
                        {skill.level && (
                          <span className="flex gap-0.5">
                            {Array.from({ length: 5 }, (_, i) => (
                              <span
                                key={i}
                                className="h-1.5 w-1.5 rounded-full"
                                style={{
                                  background:
                                    i < (skill.level ?? 0)
                                      ? colors.primary
                                      : colors.divider,
                                }}
                              />
                            ))}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </SidebarSection>
            )
          }
          if (key === 'languages') {
            return (
              <SidebarSection
                key={key}
                title="Diller"
                colors={colors}
                fonts={fonts}
              >
                <ul className="flex flex-col gap-2 text-[11px]">
                  {cv.languages.map((lang) => (
                    <li key={lang.id} className="flex justify-between">
                      <span>{lang.name}</span>
                      <span style={{ color: colors.muted }}>
                        {PROFICIENCY_LABEL[lang.proficiency] ?? lang.proficiency}
                      </span>
                    </li>
                  ))}
                </ul>
              </SidebarSection>
            )
          }
          return null
        })}
      </aside>

      {/* MAIN */}
      <main className="flex-1 px-9 py-9">
        {mainSections.map((key) => {
          if (!sectionHasContent(cv, key)) return null
          return (
            <MainSectionRenderer
              key={key}
              sectionKey={key}
              cv={cv}
              colors={colors}
              fonts={fonts}
            />
          )
        })}
      </main>
    </article>
  )
}

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

function SidebarSection({
  title,
  colors,
  fonts,
  children,
}: {
  title: string
  colors: ReturnType<typeof getColors>
  fonts: { display: string; body: string }
  children: React.ReactNode
}) {
  return (
    <section className="mb-7">
      <h2
        className="mb-3 text-[10px] font-medium uppercase tracking-[0.22em]"
        style={{ fontFamily: fonts.display, color: colors.primary }}
      >
        {title}
      </h2>
      {children}
    </section>
  )
}

function ContactRow({
  icon,
  colors,
  children,
}: {
  icon: React.ReactNode
  colors: ReturnType<typeof getColors>
  children: React.ReactNode
}) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-0.5 shrink-0" style={{ color: colors.primary }}>
        {icon}
      </span>
      <span className="break-all">{children}</span>
    </li>
  )
}

function MainSectionTitle({
  children,
  colors,
  fonts,
}: {
  children: React.ReactNode
  colors: ReturnType<typeof getColors>
  fonts: { display: string; body: string }
}) {
  return (
    <h2
      className="mb-3 mt-1 text-[16px] font-medium uppercase tracking-[0.16em]"
      style={{
        fontFamily: fonts.display,
        color: colors.primary,
        borderBottom: `2px solid ${colors.primary}`,
        paddingBottom: '6px',
      }}
    >
      {children}
    </h2>
  )
}

function MainSectionRenderer({
  sectionKey,
  cv,
  colors,
  fonts,
}: {
  sectionKey: SectionKey
  cv: CVDocument
  colors: ReturnType<typeof getColors>
  fonts: { display: string; body: string }
}) {
  if (sectionKey === 'summary') {
    return (
      <section className="mb-6">
        <MainSectionTitle colors={colors} fonts={fonts}>
          Özet
        </MainSectionTitle>
        <p className="text-[12px] leading-[1.65]" style={{ color: colors.text }}>
          {cv.summary.content}
        </p>
      </section>
    )
  }

  if (sectionKey === 'experience') {
    return (
      <section className="mb-6">
        <MainSectionTitle colors={colors} fonts={fonts}>
          Deneyim
        </MainSectionTitle>
        <div className="flex flex-col gap-4">
          {cv.experience.map((exp) => (
            <div key={exp.id} className="cv-item">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <h3
                  className="text-[13px] font-semibold"
                  style={{ color: colors.text, fontFamily: fonts.body }}
                >
                  {exp.position}
                </h3>
                <span
                  className="text-[10.5px] uppercase tracking-wider"
                  style={{ color: colors.muted }}
                >
                  {formatDateRange(exp.startDate, exp.current ? null : exp.endDate)}
                </span>
              </div>
              <p
                className="text-[12px] italic"
                style={{ color: colors.primary }}
              >
                {joinParts([exp.company, exp.location])}
              </p>
              {exp.description && (
                <p
                  className="mt-1.5 text-[11.5px] leading-[1.6]"
                  style={{ color: colors.text }}
                >
                  {exp.description}
                </p>
              )}
              {exp.achievements.length > 0 && (
                <ul className="mt-1.5 flex flex-col gap-1">
                  {exp.achievements.map((a, i) => (
                    <li
                      key={i}
                      className="flex gap-2 text-[11.5px] leading-[1.55]"
                      style={{ color: colors.text }}
                    >
                      <span style={{ color: colors.primary }}>—</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (sectionKey === 'education') {
    return (
      <section className="mb-6">
        <MainSectionTitle colors={colors} fonts={fonts}>
          Eğitim
        </MainSectionTitle>
        <div className="flex flex-col gap-3">
          {cv.education.map((edu) => (
            <div key={edu.id} className="cv-item">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <h3
                  className="text-[13px] font-semibold"
                  style={{ color: colors.text, fontFamily: fonts.body }}
                >
                  {joinParts([edu.degree, edu.field], ' · ') || edu.institution}
                </h3>
                <span
                  className="text-[10.5px] uppercase tracking-wider"
                  style={{ color: colors.muted }}
                >
                  {formatDateRange(edu.startDate, edu.current ? null : edu.endDate)}
                </span>
              </div>
              <p className="text-[12px] italic" style={{ color: colors.primary }}>
                {joinParts([edu.institution, edu.location, edu.gpa && `GPA ${edu.gpa}`])}
              </p>
              {edu.description && (
                <p
                  className="mt-1 text-[11.5px] leading-[1.55]"
                  style={{ color: colors.text }}
                >
                  {edu.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (sectionKey === 'projects') {
    return (
      <section className="mb-6">
        <MainSectionTitle colors={colors} fonts={fonts}>
          Projeler
        </MainSectionTitle>
        <div className="flex flex-col gap-3">
          {cv.projects.map((p) => (
            <div key={p.id} className="cv-item">
              <div className="flex items-baseline justify-between gap-x-3">
                <h3
                  className="text-[13px] font-semibold"
                  style={{ color: colors.text, fontFamily: fonts.body }}
                >
                  {p.name}
                </h3>
                {p.url && (
                  <span
                    className="text-[10.5px]"
                    style={{ color: colors.muted }}
                  >
                    {normalizeUrl(p.url)}
                  </span>
                )}
              </div>
              {p.description && (
                <p
                  className="mt-1 text-[11.5px] leading-[1.55]"
                  style={{ color: colors.text }}
                >
                  {p.description}
                </p>
              )}
              {p.technologies.length > 0 && (
                <p
                  className="mt-1 text-[10.5px] italic"
                  style={{ color: colors.primary }}
                >
                  {p.technologies.join(' · ')}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (sectionKey === 'certificates') {
    return (
      <section className="mb-6">
        <MainSectionTitle colors={colors} fonts={fonts}>
          Sertifikalar
        </MainSectionTitle>
        <ul className="flex flex-col gap-2">
          {cv.certificates.map((c) => (
            <li
              key={c.id}
              className="flex flex-wrap items-baseline justify-between gap-x-3 text-[11.5px]"
            >
              <span style={{ color: colors.text }}>
                <strong style={{ fontWeight: 600 }}>{c.name}</strong>
                {c.issuer && (
                  <span style={{ color: colors.primary }}> · {c.issuer}</span>
                )}
              </span>
              <span
                className="text-[10.5px] uppercase tracking-wider"
                style={{ color: colors.muted }}
              >
                {formatDateRange(c.date, c.date)}
              </span>
            </li>
          ))}
        </ul>
      </section>
    )
  }

  if (sectionKey === 'references') {
    return (
      <section className="mb-6">
        <MainSectionTitle colors={colors} fonts={fonts}>
          Referanslar
        </MainSectionTitle>
        <div className="grid grid-cols-2 gap-4">
          {cv.references.map((r) => (
            <div key={r.id} className="text-[11.5px]">
              <p className="font-semibold" style={{ color: colors.text }}>
                {r.name}
              </p>
              <p style={{ color: colors.primary }}>
                {joinParts([r.position, r.company])}
              </p>
              {r.email && <p style={{ color: colors.muted }}>{r.email}</p>}
              {r.phone && <p style={{ color: colors.muted }}>{r.phone}</p>}
            </div>
          ))}
        </div>
      </section>
    )
  }

  return null
}

// Tiny helper so TS infers the colors type for child props
function getColors() {
  return COLOR_THEMES.ink
}
