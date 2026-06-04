/**
 * Classic Template — single column, ATS-friendly.
 *
 * Centered name at top, traditional section dividers,
 * bullet points for achievements. Maximum readability.
 */

import type { CVDocument, CVLanguage, SectionKey } from '@/types/cv'
import { COLOR_THEMES, FONT_FAMILIES } from './shared/tokens'
import {
  formatDateRange,
  getVisibleSections,
  joinParts,
  MISC_LABELS,
  normalizeUrl,
  proficiencyLabel,
  SECTION_TITLES,
  sectionHasContent,
} from './shared/helpers'

interface ClassicTemplateProps {
  cv: CVDocument
}

export function ClassicTemplate({ cv }: ClassicTemplateProps) {
  const colors = COLOR_THEMES[cv.settings.colorTheme]
  const fonts = FONT_FAMILIES[cv.settings.fontFamily]
  const lang = cv.settings.language
  const visible = getVisibleSections(cv)

  const contactLine1 = [cv.contact.email, cv.contact.phone, cv.contact.location]
    .filter(Boolean)
    .join(' · ')
  const contactLine2 = [
    cv.contact.website && normalizeUrl(cv.contact.website),
    cv.contact.linkedin && normalizeUrl(cv.contact.linkedin),
    cv.contact.github && normalizeUrl(cv.contact.github),
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <article
      lang={lang}
      className="h-full w-full px-12 py-10"
      style={{
        fontFamily: fonts.body,
        color: colors.text,
        background: colors.surface,
      }}
    >
      {/* HEADER — centered identity */}
      <header className="mb-6 text-center" style={{ position: 'relative' }}>
        {cv.personal.photoUrl && (
          <img
            src={cv.personal.photoUrl}
            alt={cv.personal.fullName}
            style={{ position: 'absolute', right: 0, top: 0, width: '68px', height: '68px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${colors.divider}` }}
          />
        )}
        <h1
          className="text-[30px] font-semibold uppercase tracking-[0.18em]"
          style={{ fontFamily: fonts.display, color: colors.primary }}
        >
          {cv.personal.fullName || 'Ad Soyad'}
        </h1>
        {cv.personal.jobTitle && (
          <p
            className="mt-1 text-[13px] italic"
            style={{ color: colors.muted, fontFamily: fonts.display }}
          >
            {cv.personal.jobTitle}
          </p>
        )}
        {contactLine1 && (
          <p className="mt-3 text-[11px]" style={{ color: colors.text }}>
            {contactLine1}
          </p>
        )}
        {contactLine2 && (
          <p className="mt-0.5 text-[11px]" style={{ color: colors.muted }}>
            {contactLine2}
          </p>
        )}
      </header>

      {/* Sections */}
      {visible.map((key) => {
        if (!sectionHasContent(cv, key)) return null
        return (
          <ClassicSection
            key={key}
            sectionKey={key}
            cv={cv}
            colors={colors}
            fonts={fonts}
            lang={lang}
          />
        )
      })}
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
    <div className="mb-3 mt-6">
      <h2
        className="text-center text-[12px] font-semibold uppercase tracking-[0.3em]"
        style={{ fontFamily: fonts.display, color: colors.primary }}
      >
        {children}
      </h2>
      <div
        className="mx-auto mt-1.5 h-px w-full"
        style={{ background: colors.divider }}
      />
    </div>
  )
}

function ClassicSection({
  sectionKey,
  cv,
  colors,
  fonts,
  lang,
}: {
  sectionKey: SectionKey
  cv: CVDocument
  colors: ReturnType<typeof getColors>
  fonts: { display: string; body: string }
  lang: CVLanguage
}) {
  // Localized title: keep each template's Turkish wording, use shared EN titles.
  const t = (key: SectionKey, tr: string) =>
    lang === 'en' ? SECTION_TITLES.en[key] : tr

  if (sectionKey === 'summary') {
    return (
      <section>
        <SectionTitle colors={colors} fonts={fonts}>
          {t('summary', 'Profil Özeti')}
        </SectionTitle>
        <p className="text-[12px] leading-[1.7]" style={{ color: colors.text }}>
          {cv.summary.content}
        </p>
      </section>
    )
  }

  if (sectionKey === 'experience') {
    return (
      <section>
        <SectionTitle colors={colors} fonts={fonts}>
          {t('experience', 'Deneyim')}
        </SectionTitle>
        <div className="flex flex-col gap-4">
          {cv.experience.map((exp) => (
            <div key={exp.id} className="cv-item">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <h3
                  className="text-[13.5px] font-semibold uppercase tracking-wide"
                  style={{ color: colors.text, fontFamily: fonts.display }}
                >
                  {exp.position}
                </h3>
                <span
                  className="text-[11px] italic"
                  style={{ color: colors.muted }}
                >
                  {formatDateRange(exp.startDate, exp.current ? null : exp.endDate, lang)}
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
                  className="mt-1.5 text-[12px] leading-[1.65]"
                  style={{ color: colors.text }}
                >
                  {exp.description}
                </p>
              )}
              {exp.achievements.length > 0 && (
                <ul className="mt-1.5 ml-5 flex flex-col gap-1 list-disc">
                  {exp.achievements.map((a, i) => (
                    <li
                      key={i}
                      className="text-[12px] leading-[1.6]"
                      style={{ color: colors.text }}
                    >
                      {a}
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
      <section>
        <SectionTitle colors={colors} fonts={fonts}>
          {t('education', 'Eğitim')}
        </SectionTitle>
        <div className="flex flex-col gap-3">
          {cv.education.map((edu) => (
            <div key={edu.id} className="cv-item">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <h3
                  className="text-[13.5px] font-semibold uppercase tracking-wide"
                  style={{ color: colors.text, fontFamily: fonts.display }}
                >
                  {edu.institution}
                </h3>
                <span
                  className="text-[11px] italic"
                  style={{ color: colors.muted }}
                >
                  {formatDateRange(edu.startDate, edu.current ? null : edu.endDate, lang)}
                </span>
              </div>
              <p
                className="text-[12px] italic"
                style={{ color: colors.primary }}
              >
                {joinParts([edu.degree, edu.field, edu.location, edu.gpa && `GPA ${edu.gpa}`])}
              </p>
              {edu.description && (
                <p
                  className="mt-1 text-[12px] leading-[1.6]"
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

  if (sectionKey === 'skills') {
    // Group skills by category
    const grouped = cv.skills.reduce<Record<string, typeof cv.skills>>((acc, s) => {
      const cat = s.category || (lang === 'en' ? 'General' : 'Genel')
      acc[cat] = acc[cat] ?? []
      acc[cat].push(s)
      return acc
    }, {})
    const groups = Object.entries(grouped)

    return (
      <section>
        <SectionTitle colors={colors} fonts={fonts}>
          {t('skills', 'Yetenekler')}
        </SectionTitle>
        <div className="flex flex-col gap-1.5">
          {groups.map(([cat, items]) => (
            <p key={cat} className="text-[12px]" style={{ color: colors.text }}>
              <strong style={{ color: colors.primary }}>{cat}:</strong>{' '}
              {items.map((s) => s.name).join(', ')}
            </p>
          ))}
        </div>
      </section>
    )
  }

  if (sectionKey === 'languages') {
    return (
      <section>
        <SectionTitle colors={colors} fonts={fonts}>
          {t('languages', 'Diller')}
        </SectionTitle>
        <p className="text-[12px]" style={{ color: colors.text }}>
          {cv.languages
            .map((l) => `${l.name} (${proficiencyLabel(l.proficiency, lang)})`)
            .join(' · ')}
        </p>
      </section>
    )
  }

  if (sectionKey === 'projects') {
    return (
      <section>
        <SectionTitle colors={colors} fonts={fonts}>
          {t('projects', 'Projeler')}
        </SectionTitle>
        <div className="flex flex-col gap-3">
          {cv.projects.map((p) => (
            <div key={p.id} className="cv-item">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <h3
                  className="text-[13px] font-semibold"
                  style={{ color: colors.text, fontFamily: fonts.display }}
                >
                  {p.name}
                </h3>
                {p.url && (
                  <span
                    className="text-[11px] italic"
                    style={{ color: colors.muted }}
                  >
                    {normalizeUrl(p.url)}
                  </span>
                )}
              </div>
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
                  {MISC_LABELS[lang].technologies}: {p.technologies.join(', ')}
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
      <section>
        <SectionTitle colors={colors} fonts={fonts}>
          {t('certificates', 'Sertifikalar')}
        </SectionTitle>
        <ul className="ml-5 flex flex-col gap-1.5 list-disc">
          {cv.certificates.map((c) => (
            <li
              key={c.id}
              className="text-[12px]"
              style={{ color: colors.text }}
            >
              <strong>{c.name}</strong>
              {c.issuer && <span> — {c.issuer}</span>}
              {c.date && (
                <span style={{ color: colors.muted }}>
                  {' '}
                  ({formatDateRange(c.date, c.date, lang)})
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>
    )
  }

  if (sectionKey === 'references') {
    return (
      <section>
        <SectionTitle colors={colors} fonts={fonts}>
          {t('references', 'Referanslar')}
        </SectionTitle>
        <div className="grid grid-cols-2 gap-4">
          {cv.references.map((r) => (
            <div key={r.id} className="text-[11.5px]">
              <p className="font-semibold" style={{ color: colors.text }}>
                {r.name}
              </p>
              <p className="italic" style={{ color: colors.primary }}>
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

function getColors() {
  return COLOR_THEMES.ink
}
