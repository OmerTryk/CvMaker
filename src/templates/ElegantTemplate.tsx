/**
 * Elegant Template — centered serif, thin rules, very formal.
 * For law, finance, academia, consulting.
 */
import type { CVDocument, SectionKey } from '@/types/cv'
import { COLOR_THEMES, FONT_FAMILIES } from './shared/tokens'
import { formatDateRange, getVisibleSections, joinParts, normalizeUrl, PROFICIENCY_LABEL, sectionHasContent } from './shared/helpers'

export function ElegantTemplate({ cv }: { cv: CVDocument }) {
  const c = COLOR_THEMES[cv.settings.colorTheme]
  const f = FONT_FAMILIES[cv.settings.fontFamily]
  const visible = getVisibleSections(cv)

  return (
    <article style={{ fontFamily: f.body, color: c.text, background: c.surface, padding: '36px 48px', minHeight: '100%' }}>
      {/* Centered header */}
      <header style={{ textAlign: 'center', marginBottom: '24px' }}>
        {cv.personal.photoUrl && (
          <img
            src={cv.personal.photoUrl}
            alt={cv.personal.fullName}
            style={{ width: '68px', height: '68px', borderRadius: '50%', objectFit: 'cover', border: `1px solid ${c.divider}`, display: 'block', margin: '0 auto 14px' }}
          />
        )}
        <h1 style={{ fontFamily: f.display, fontSize: '32px', fontWeight: 300, letterSpacing: '0.05em', margin: '0 0 6px', color: c.text }}>
          {cv.personal.fullName || 'Ad Soyad'}
        </h1>
        {cv.personal.jobTitle && (
          <p style={{ fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', color: c.muted, margin: '0 0 12px' }}>
            {cv.personal.jobTitle}
          </p>
        )}
        <div style={{ height: '1px', background: c.primary, maxWidth: '60px', margin: '0 auto 12px' }} />
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', fontSize: '10.5px', color: c.muted }}>
          {[cv.contact.email, cv.contact.phone, cv.contact.location,
            cv.contact.linkedin && normalizeUrl(cv.contact.linkedin),
            cv.contact.website && normalizeUrl(cv.contact.website),
          ].filter(Boolean).map((v, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              {i > 0 && <span style={{ color: c.divider }}>·</span>}
              {v}
            </span>
          ))}
        </div>
      </header>

      {visible.map((key) => !sectionHasContent(cv, key) ? null : (
        <ElegantSection key={key} sectionKey={key} cv={cv} c={c} f={f} />
      ))}
    </article>
  )
}

function ElegantSectionTitle({ children, c, f }: { children: React.ReactNode; c: any; f: any }) {
  return (
    <div style={{ margin: '20px 0 10px', textAlign: 'center' }}>
      <h2 style={{ fontFamily: f.display, fontSize: '10px', fontWeight: 400, letterSpacing: '0.3em', textTransform: 'uppercase', color: c.primary, margin: '0 0 6px' }}>
        {children}
      </h2>
      <div style={{ height: '0.5px', background: c.divider, width: '100%' }} />
    </div>
  )
}

function ElegantSection({ sectionKey, cv, c, f }: { sectionKey: SectionKey; cv: CVDocument; c: any; f: any }) {
  const titles: Record<string, string> = { summary: 'Profil', experience: 'Deneyim', education: 'Eğitim', skills: 'Yetenekler', projects: 'Projeler', languages: 'Diller', certificates: 'Sertifikalar', references: 'Referanslar' }

  if (sectionKey === 'summary') return (
    <section><ElegantSectionTitle c={c} f={f}>{titles[sectionKey]}</ElegantSectionTitle>
      <p style={{ fontSize: '12px', lineHeight: 1.8, color: c.text, textAlign: 'center', margin: 0, fontStyle: 'italic' }}>{cv.summary.content}</p>
    </section>
  )

  if (sectionKey === 'experience') return (
    <section><ElegantSectionTitle c={c} f={f}>{titles[sectionKey]}</ElegantSectionTitle>
      {cv.experience.map((e) => (
        <div key={e.id} className="cv-item" style={{ marginBottom: '14px', display: 'grid', gridTemplateColumns: '130px 1fr' }}>
          <div style={{ paddingTop: '1px', paddingRight: '16px', borderRight: `0.5px solid ${c.divider}`, textAlign: 'right' }}>
            <p style={{ fontSize: '10.5px', color: c.muted, margin: '0 0 2px', fontFamily: 'monospace' }}>{formatDateRange(e.startDate, e.current ? null : e.endDate)}</p>
            <p style={{ fontSize: '10.5px', color: c.primary, margin: 0, fontStyle: 'italic' }}>{e.location}</p>
          </div>
          <div style={{ paddingLeft: '16px' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, margin: '0 0 1px' }}>{e.position}</p>
            <p style={{ fontSize: '11px', color: c.primary, fontStyle: 'italic', margin: '0 0 5px' }}>{e.company}</p>
            {e.description && <p style={{ fontSize: '11.5px', lineHeight: 1.65, color: c.text, margin: '0 0 3px' }}>{e.description}</p>}
            {e.achievements.map((a, i) => <div key={i} style={{ fontSize: '11.5px', display: 'flex', gap: '6px' }}><span style={{ color: c.primary }}>—</span>{a}</div>)}
          </div>
        </div>
      ))}
    </section>
  )

  if (sectionKey === 'education') return (
    <section><ElegantSectionTitle c={c} f={f}>{titles[sectionKey]}</ElegantSectionTitle>
      {cv.education.map((e) => (
        <div key={e.id} className="cv-item" style={{ marginBottom: '12px', display: 'grid', gridTemplateColumns: '130px 1fr' }}>
          <div style={{ paddingRight: '16px', borderRight: `0.5px solid ${c.divider}`, textAlign: 'right' }}>
            <p style={{ fontSize: '10.5px', color: c.muted, margin: 0, fontFamily: 'monospace' }}>{formatDateRange(e.startDate, e.current ? null : e.endDate)}</p>
          </div>
          <div style={{ paddingLeft: '16px' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, margin: '0 0 1px' }}>{e.institution}</p>
            <p style={{ fontSize: '11px', color: c.primary, fontStyle: 'italic', margin: 0 }}>{joinParts([e.degree, e.field])}</p>
            {e.gpa && <p style={{ fontSize: '10.5px', color: c.muted, margin: '1px 0 0' }}>GPA {e.gpa}</p>}
          </div>
        </div>
      ))}
    </section>
  )

  if (sectionKey === 'skills') return (
    <section><ElegantSectionTitle c={c} f={f}>{titles[sectionKey]}</ElegantSectionTitle>
      <p style={{ fontSize: '11.5px', textAlign: 'center', color: c.text, lineHeight: 2, margin: 0 }}>
        {cv.skills.map((s) => s.name).join('  ·  ')}
      </p>
    </section>
  )

  if (sectionKey === 'languages') return (
    <section><ElegantSectionTitle c={c} f={f}>{titles[sectionKey]}</ElegantSectionTitle>
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap', fontSize: '11.5px' }}>
        {cv.languages.map((l) => <span key={l.id}>{l.name} <span style={{ color: c.muted, fontSize: '10.5px' }}>({PROFICIENCY_LABEL[l.proficiency]})</span></span>)}
      </div>
    </section>
  )

  if (sectionKey === 'projects') return (
    <section><ElegantSectionTitle c={c} f={f}>{titles[sectionKey]}</ElegantSectionTitle>
      {cv.projects.map((p) => (
        <div key={p.id} className="cv-item" style={{ marginBottom: '12px', display: 'grid', gridTemplateColumns: '130px 1fr' }}>
          <div style={{ paddingRight: '16px', borderRight: `0.5px solid ${c.divider}`, textAlign: 'right' }}>
            {p.url && <p style={{ fontSize: '10px', color: c.muted, margin: 0, wordBreak: 'break-all', fontFamily: 'monospace' }}>{normalizeUrl(p.url)}</p>}
          </div>
          <div style={{ paddingLeft: '16px' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, margin: '0 0 2px' }}>{p.name}</p>
            {p.description && <p style={{ fontSize: '11.5px', lineHeight: 1.6, color: c.text, margin: 0 }}>{p.description}</p>}
          </div>
        </div>
      ))}
    </section>
  )

  if (sectionKey === 'certificates') return (
    <section><ElegantSectionTitle c={c} f={f}>{titles[sectionKey]}</ElegantSectionTitle>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'center' }}>
        {cv.certificates.map((cert) => (
          <div key={cert.id} style={{ textAlign: 'center', fontSize: '11px' }}>
            <p style={{ fontWeight: 600, margin: 0 }}>{cert.name}</p>
            <p style={{ color: c.muted, margin: 0, fontStyle: 'italic' }}>{cert.issuer}</p>
          </div>
        ))}
      </div>
    </section>
  )

  if (sectionKey === 'references') return (
    <section><ElegantSectionTitle c={c} f={f}>{titles[sectionKey]}</ElegantSectionTitle>
      <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {cv.references.map((r) => (
          <div key={r.id} style={{ textAlign: 'center', fontSize: '11.5px' }}>
            <p style={{ fontWeight: 600, margin: 0 }}>{r.name}</p>
            <p style={{ color: c.primary, fontStyle: 'italic', margin: 0 }}>{joinParts([r.position, r.company])}</p>
            {r.email && <p style={{ color: c.muted, margin: 0, fontSize: '10.5px' }}>{r.email}</p>}
          </div>
        ))}
      </div>
    </section>
  )

  return null
}
