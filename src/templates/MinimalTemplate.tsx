/**
 * Minimal Template — typography-focused, generous whitespace.
 *
 * No lines, no boxes, no colored backgrounds (just one accent).
 * Left rail for dates, right side for content.
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

interface MinimalTemplateProps {
  cv: CVDocument
}

export function MinimalTemplate({ cv }: MinimalTemplateProps) {
  const colors = COLOR_THEMES[cv.settings.colorTheme]
  const fonts = FONT_FAMILIES[cv.settings.fontFamily]
  const visible = getVisibleSections(cv)

  return (
    <article
      className="h-full w-full px-14 py-12"
      style={{
        fontFamily: fonts.body,
        color: colors.text,
        background: colors.surface,
      }}
    >
      {/* HEADER — bold typography */}
      <header className="mb-12" style={{ position: 'relative' }}>
        {cv.personal.photoUrl && (
          <img
            src={cv.personal.photoUrl}
            alt={cv.personal.fullName}
            style={{ position: 'absolute', right: 0, top: 0, width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${colors.divider}` }}
          />
        )}
        <h1
          className="text-[44px] font-light leading-[0.95] tracking-tight"
          style={{ fontFamily: fonts.display, color: colors.text }}
        >
          {cv.personal.fullName || 'Ad Soyad'}
          <span style={{ color: colors.primary }}>.</span>
        </h1>
        {cv.personal.jobTitle && (
          <p
            className="mt-2 text-[14px]"
            style={{ color: colors.muted }}
          >
            {cv.personal.jobTitle}
          </p>
        )}

        {/* Single-line contact strip */}
        <p
          className="mt-5 text-[10.5px] uppercase tracking-[0.2em]"
          style={{ color: colors.muted }}
        >
          {[
            cv.contact.email,
            cv.contact.phone,
            cv.contact.location,
            cv.contact.website && normalizeUrl(cv.contact.website),
            cv.contact.github && normalizeUrl(cv.contact.github),
            cv.contact.linkedin && normalizeUrl(cv.contact.linkedin),
          ]
            .filter(Boolean)
            .join('  ·  ')}
        </p>
      </header>

      {/* Sections */}
      <div className="flex flex-col gap-9">
        {visible.map((key) => {
          if (!sectionHasContent(cv, key)) return null
          return (
            <MinimalSection
              key={key}
              sectionKey={key}
              cv={cv}
              colors={colors}
              fonts={fonts}
            />
          )
        })}
      </div>
    </article>
  )
}

// ─────────────────────────────────────────────────────────────

function SectionTitle({
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
      className="mb-4 text-[18px] font-light italic"
      style={{ fontFamily: fonts.display, color: colors.primary }}
    >
      {children}
    </h2>
  )
}

/**
 * Two-column row: left = date/meta, right = content.
 */
function Row({
  left,
  right,
  colors,
  className,
}: {
  left: React.ReactNode
  right: React.ReactNode
  colors: ReturnType<typeof getColors>
  className?: string
}) {
  return (
    <div className={`grid grid-cols-[110px_1fr] gap-6 ${className ?? ''}`}>
      <div
        className="pt-0.5 text-[10.5px] uppercase tracking-[0.16em]"
        style={{ color: colors.muted }}
      >
        {left}
      </div>
      <div>{right}</div>
    </div>
  )
}

function MinimalSection({
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
      <section>
        <SectionTitle colors={colors} fonts={fonts}>
          Özet
        </SectionTitle>
        <p
          className="max-w-[520px] text-[13px] leading-[1.7]"
          style={{ color: colors.text }}
        >
          {cv.summary.content}
        </p>
      </section>
    )
  }

  if (sectionKey === 'experience') {
    return (
      <section>
        <SectionTitle colors={colors} fonts={fonts}>
          Deneyim
        </SectionTitle>
        <div className="flex flex-col gap-6">
          {cv.experience.map((exp) => (
            <Row
              key={exp.id}
              colors={colors}
              className="cv-item"
              left={formatDateRange(exp.startDate, exp.current ? null : exp.endDate)}
              right={
                <div>
                  <h3
                    className="text-[14px] font-medium"
                    style={{ color: colors.text }}
                  >
                    {exp.position}
                  </h3>
                  <p
                    className="text-[12px] italic"
                    style={{ color: colors.muted }}
                  >
                    {joinParts([exp.company, exp.location], ' — ')}
                  </p>
                  {exp.description && (
                    <p
                      className="mt-2 text-[12px] leading-[1.65]"
                      style={{ color: colors.text }}
                    >
                      {exp.description}
                    </p>
                  )}
                  {exp.achievements.length > 0 && (
                    <ul className="mt-2 flex flex-col gap-1">
                      {exp.achievements.map((a, i) => (
                        <li
                          key={i}
                          className="flex gap-2 text-[12px] leading-[1.6]"
                          style={{ color: colors.text }}
                        >
                          <span style={{ color: colors.primary }}>—</span>
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              }
            />
          ))}
        </div>
      </section>
    )
  }

  if (sectionKey === 'education') {
    return (
      <section>
        <SectionTitle colors={colors} fonts={fonts}>
          Eğitim
        </SectionTitle>
        <div className="flex flex-col gap-5">
          {cv.education.map((edu) => (
            <Row
              key={edu.id}
              colors={colors}
              className="cv-item"
              left={formatDateRange(edu.startDate, edu.current ? null : edu.endDate)}
              right={
                <div>
                  <h3
                    className="text-[14px] font-medium"
                    style={{ color: colors.text }}
                  >
                    {edu.institution}
                  </h3>
                  <p
                    className="text-[12px] italic"
                    style={{ color: colors.muted }}
                  >
                    {joinParts([edu.degree, edu.field, edu.gpa && `GPA ${edu.gpa}`])}
                  </p>
                  {edu.description && (
                    <p
                      className="mt-1.5 text-[12px] leading-[1.6]"
                      style={{ color: colors.text }}
                    >
                      {edu.description}
                    </p>
                  )}
                </div>
              }
            />
          ))}
        </div>
      </section>
    )
  }

  if (sectionKey === 'skills') {
    const grouped = cv.skills.reduce<Record<string, typeof cv.skills>>((acc, s) => {
      const cat = s.category || 'Genel'
      acc[cat] = acc[cat] ?? []
      acc[cat].push(s)
      return acc
    }, {})

    return (
      <section>
        <SectionTitle colors={colors} fonts={fonts}>
          Yetenekler
        </SectionTitle>
        <div className="flex flex-col gap-3">
          {Object.entries(grouped).map(([cat, items]) => (
            <Row
              key={cat}
              colors={colors}
              left={cat}
              right={
                <p className="text-[12px]" style={{ color: colors.text }}>
                  {items.map((s) => s.name).join(' · ')}
                </p>
              }
            />
          ))}
        </div>
      </section>
    )
  }

  if (sectionKey === 'languages') {
    return (
      <section>
        <SectionTitle colors={colors} fonts={fonts}>
          Diller
        </SectionTitle>
        <div className="flex flex-col gap-2">
          {cv.languages.map((l) => (
            <Row
              key={l.id}
              colors={colors}
              left={PROFICIENCY_LABEL[l.proficiency] ?? l.proficiency}
              right={
                <span className="text-[13px]" style={{ color: colors.text }}>
                  {l.name}
                </span>
              }
            />
          ))}
        </div>
      </section>
    )
  }

  if (sectionKey === 'projects') {
    return (
      <section>
        <SectionTitle colors={colors} fonts={fonts}>
          Projeler
        </SectionTitle>
        <div className="flex flex-col gap-5">
          {cv.projects.map((p) => (
            <Row
              key={p.id}
              colors={colors}
              className="cv-item"
              left={
                p.startDate
                  ? formatDateRange(p.startDate, p.endDate)
                  : p.url
                    ? 'açık kaynak'
                    : ''
              }
              right={
                <div>
                  <h3
                    className="text-[14px] font-medium"
                    style={{ color: colors.text }}
                  >
                    {p.name}
                    {p.url && (
                      <span
                        className="ml-2 text-[11px] italic"
                        style={{ color: colors.muted }}
                      >
                        {normalizeUrl(p.url)}
                      </span>
                    )}
                  </h3>
                  {p.description && (
                    <p
                      className="mt-1 text-[12px] leading-[1.6]"
                      style={{ color: colors.text }}
                    >
                      {p.description}
                    </p>
                  )}
                  {p.technologies.length > 0 && (
                    <p
                      className="mt-1 text-[11px] italic"
                      style={{ color: colors.primary }}
                    >
                      {p.technologies.join(' · ')}
                    </p>
                  )}
                </div>
              }
            />
          ))}
        </div>
      </section>
    )
  }

  if (sectionKey === 'certificates') {
    return (
      <section>
        <SectionTitle colors={colors} fonts={fonts}>
          Sertifikalar
        </SectionTitle>
        <div className="flex flex-col gap-3">
          {cv.certificates.map((c) => (
            <Row
              key={c.id}
              colors={colors}
              left={formatDateRange(c.date, c.date)}
              right={
                <div>
                  <p
                    className="text-[13px] font-medium"
                    style={{ color: colors.text }}
                  >
                    {c.name}
                  </p>
                  {c.issuer && (
                    <p
                      className="text-[11.5px] italic"
                      style={{ color: colors.muted }}
                    >
                      {c.issuer}
                    </p>
                  )}
                </div>
              }
            />
          ))}
        </div>
      </section>
    )
  }

  if (sectionKey === 'references') {
    return (
      <section>
        <SectionTitle colors={colors} fonts={fonts}>
          Referanslar
        </SectionTitle>
        <div className="grid grid-cols-2 gap-5">
          {cv.references.map((r) => (
            <div key={r.id}>
              <p
                className="text-[13px] font-medium"
                style={{ color: colors.text }}
              >
                {r.name}
              </p>
              <p
                className="text-[11.5px] italic"
                style={{ color: colors.muted }}
              >
                {joinParts([r.position, r.company])}
              </p>
              {r.email && (
                <p
                  className="mt-0.5 text-[11px]"
                  style={{ color: colors.muted }}
                >
                  {r.email}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    )
  }

  return null
}

function getColors() {
  return COLOR_THEMES.ink
}
