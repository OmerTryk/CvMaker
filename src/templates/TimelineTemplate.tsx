import type { CVDocument, SectionKey } from '@/types/cv'
import { COLOR_THEMES, FONT_FAMILIES } from './shared/tokens'
import { formatDateRange, getVisibleSections, joinParts, PROFICIENCY_LABEL, sectionHasContent } from './shared/helpers'

export function TimelineTemplate({ cv }: { cv: CVDocument }) {
  const c = COLOR_THEMES[cv.settings.colorTheme]
  const f = FONT_FAMILIES[cv.settings.fontFamily]
  const visible = getVisibleSections(cv)

  return (
    <article style={{ fontFamily: f.body, color: c.text, background: c.surface, padding: '28px 36px', minHeight: '100%' }}>
      {/* Header — centered */}
      <header style={{ textAlign: 'center', borderBottom: `1px solid ${c.divider}`, paddingBottom: '18px', marginBottom: '22px' }}>
        {cv.personal.photoUrl && (
          <img
            src={cv.personal.photoUrl}
            alt={cv.personal.fullName}
            style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${c.divider}`, display: 'block', margin: '0 auto 12px' }}
          />
        )}
        <h1 style={{ fontFamily: f.display, fontSize: '28px', fontWeight: 600, letterSpacing: '-0.01em', margin: '0 0 4px' }}>
          {cv.personal.fullName || 'Ad Soyad'}
        </h1>
        {cv.personal.jobTitle && (
          <p style={{ fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase', color: c.muted, margin: '0 0 12px' }}>
            {cv.personal.jobTitle}
          </p>
        )}
        <div style={{ display: 'flex', gap: '18px', justifyContent: 'center', flexWrap: 'wrap', fontSize: '11px', color: c.muted }}>
          {[cv.contact.email, cv.contact.phone, cv.contact.location, cv.contact.linkedin].filter(Boolean).map((v, i) => <span key={i}>{v}</span>)}
        </div>
      </header>

      {/* Summary */}
      {sectionHasContent(cv, 'summary') && !cv.hiddenSections.includes('summary') && (
        <p style={{ fontSize: '12px', lineHeight: 1.75, color: c.text, textAlign: 'center', maxWidth: '520px', margin: '0 auto 24px', fontStyle: 'italic' }}>
          {cv.summary.content}
        </p>
      )}

      {/* Sections */}
      {visible.filter((k) => k !== 'summary').map((key) => !sectionHasContent(cv, key) ? null : (
        <TimelineSection key={key} sectionKey={key} cv={cv} c={c} f={f} />
      ))}
    </article>
  )
}

function SectionLabel({ children, c, f }: { children: React.ReactNode; c: any; f: any }) {
  return (
    <p style={{ fontFamily: f.display, fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: c.muted, textAlign: 'center', margin: '0 0 14px' }}>
      {children}
    </p>
  )
}

function TimelineSection({ sectionKey, cv, c, f }: { sectionKey: SectionKey; cv: CVDocument; c: any; f: any }) {
  const labels: Record<string, string> = { experience: 'Deneyim', education: 'Eğitim', projects: 'Projeler', skills: 'Yetenekler', languages: 'Diller', certificates: 'Sertifikalar', references: 'Referanslar' }

  if (sectionKey === 'experience') return (
    <section style={{ marginBottom: '22px' }}>
      <SectionLabel c={c} f={f}>{labels[sectionKey]}</SectionLabel>
      <div style={{ maxWidth: '520px', margin: '0 auto' }}>
        {cv.experience.map((e, idx) => (
          <div key={e.id} className="cv-item" style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: idx === 0 ? c.primary : c.divider, border: `2px solid ${idx === 0 ? c.primary : c.divider}`, flexShrink: 0 }} />
              {idx < cv.experience.length - 1 && <div style={{ width: '1.5px', background: c.divider, flex: 1, minHeight: '32px' }} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                <span style={{ fontSize: '13.5px', fontWeight: 600, color: idx === 0 ? c.text : '#444' }}>{e.position}</span>
                <span style={{ fontSize: '10px', fontFamily: 'monospace', color: c.muted }}>{formatDateRange(e.startDate, e.current ? null : e.endDate)}</span>
              </div>
              <p style={{ fontSize: '11px', color: c.primary, fontStyle: 'italic', margin: '0 0 5px' }}>{joinParts([e.company, e.location])}</p>
              {e.description && <p style={{ fontSize: '11.5px', lineHeight: 1.65, color: idx === 0 ? c.text : c.muted, margin: '0 0 4px' }}>{e.description}</p>}
              {e.achievements.map((a, i) => <div key={i} style={{ fontSize: '11.5px', display: 'flex', gap: '6px', color: idx === 0 ? c.text : c.muted }}><span style={{ color: c.primary }}>—</span>{a}</div>)}
            </div>
          </div>
        ))}
      </div>
    </section>
  )

  if (sectionKey === 'education') return (
    <section style={{ marginBottom: '20px' }}>
      <SectionLabel c={c} f={f}>{labels[sectionKey]}</SectionLabel>
      <div style={{ maxWidth: '520px', margin: '0 auto' }}>
        {cv.education.map((e, idx) => (
          <div key={e.id} className="cv-item" style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: idx === 0 ? c.primary : c.divider, border: `2px solid ${idx === 0 ? c.primary : c.divider}` }} />
            </div>
            <div>
              <span style={{ fontSize: '13px', fontWeight: 600 }}>{e.institution}</span>
              <p style={{ fontSize: '11px', color: c.primary, fontStyle: 'italic', margin: '1px 0 2px' }}>{joinParts([e.degree, e.field])}</p>
              <span style={{ fontSize: '10px', color: c.muted }}>{formatDateRange(e.startDate, e.current ? null : e.endDate)}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )

  if (sectionKey === 'skills') return (
    <section style={{ marginBottom: '20px' }}>
      <SectionLabel c={c} f={f}>{labels[sectionKey]}</SectionLabel>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
        {cv.skills.map((s) => <span key={s.id} style={{ fontSize: '11px', border: `1px solid ${c.divider}`, padding: '3px 10px', borderRadius: '20px', color: c.text }}>{s.name}</span>)}
      </div>
    </section>
  )

  if (sectionKey === 'languages') return (
    <section style={{ marginBottom: '20px' }}>
      <SectionLabel c={c} f={f}>{labels[sectionKey]}</SectionLabel>
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', fontSize: '11.5px' }}>
        {cv.languages.map((l) => <span key={l.id}>{l.name} <span style={{ color: c.muted, fontSize: '10.5px' }}>({PROFICIENCY_LABEL[l.proficiency]})</span></span>)}
      </div>
    </section>
  )

  if (sectionKey === 'projects') return (
    <section style={{ marginBottom: '20px' }}>
      <SectionLabel c={c} f={f}>{labels[sectionKey]}</SectionLabel>
      <div style={{ maxWidth: '520px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {cv.projects.map((p) => (
          <div key={p.id} className="cv-item">
            <span style={{ fontSize: '13px', fontWeight: 600 }}>{p.name}</span>
            {p.description && <p style={{ fontSize: '11.5px', lineHeight: 1.6, color: c.text, margin: '3px 0' }}>{p.description}</p>}
            {p.technologies.length > 0 && <p style={{ fontSize: '10.5px', color: c.primary, margin: 0 }}>{p.technologies.join(' · ')}</p>}
          </div>
        ))}
      </div>
    </section>
  )

  if (sectionKey === 'certificates') return (
    <section style={{ marginBottom: '20px' }}>
      <SectionLabel c={c} f={f}>{labels[sectionKey]}</SectionLabel>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
        {cv.certificates.map((cert) => (
          <div key={cert.id} style={{ textAlign: 'center', fontSize: '11px' }}>
            <p style={{ fontWeight: 600, margin: 0 }}>{cert.name}</p>
            <p style={{ color: c.muted, margin: 0 }}>{cert.issuer}</p>
          </div>
        ))}
      </div>
    </section>
  )

  if (sectionKey === 'references') return (
    <section style={{ marginBottom: '20px' }}>
      <SectionLabel c={c} f={f}>{labels[sectionKey]}</SectionLabel>
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {cv.references.map((r) => (
          <div key={r.id} style={{ textAlign: 'center', fontSize: '11px' }}>
            <p style={{ fontWeight: 600, margin: 0 }}>{r.name}</p>
            <p style={{ color: c.primary, fontStyle: 'italic', margin: 0 }}>{joinParts([r.position, r.company])}</p>
          </div>
        ))}
      </div>
    </section>
  )

  return null
}
