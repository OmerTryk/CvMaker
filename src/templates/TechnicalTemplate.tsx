import type { CVDocument, SectionKey } from '@/types/cv'
import { COLOR_THEMES, FONT_FAMILIES } from './shared/tokens'
import { formatDateRange, getVisibleSections, joinParts, normalizeUrl, sectionHasContent } from './shared/helpers'

export function TechnicalTemplate({ cv }: { cv: CVDocument }) {
  const c = COLOR_THEMES[cv.settings.colorTheme]
  const f = FONT_FAMILIES[cv.settings.fontFamily]
  const visible = getVisibleSections(cv)

  const rightKeys: SectionKey[] = ['skills', 'languages', 'certificates', 'education']
  const mainKeys = visible.filter((k) => !rightKeys.includes(k))
  const sideKeys = visible.filter((k) => rightKeys.includes(k))

  return (
    <article style={{ fontFamily: f.body, color: c.text, background: c.surface, padding: '24px 28px', minHeight: '100%' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: `2px solid ${c.primary}`, paddingBottom: '14px', marginBottom: '20px', position: 'relative' }}>
        <div>
          <h1 style={{ fontFamily: f.display, fontSize: '26px', fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 3px' }}>
            {cv.personal.fullName || 'Ad Soyad'}
          </h1>
          <p style={{ fontFamily: 'monospace', fontSize: '11px', color: c.muted, letterSpacing: '0.05em', margin: 0 }}>
            {cv.personal.jobTitle}
          </p>
        </div>
        {cv.personal.photoUrl && (
          <img
            src={cv.personal.photoUrl}
            alt={cv.personal.fullName}
            style={{ position: 'absolute', left: '50%', top: '0', transform: 'translateX(-50%)', width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${c.divider}` }}
          />
        )}
        <div style={{ textAlign: 'right', fontSize: '10.5px', color: c.muted, lineHeight: 1.9 }}>
          {cv.contact.email && <div>{cv.contact.email}</div>}
          {cv.contact.github && <div>{normalizeUrl(cv.contact.github)}</div>}
          {cv.contact.linkedin && <div>{normalizeUrl(cv.contact.linkedin)}</div>}
          {cv.contact.location && <div>{cv.contact.location}</div>}
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 175px', gap: '24px' }}>
        {/* Main */}
        <div>
          {mainKeys.map((key) => !sectionHasContent(cv, key) ? null : (
            <TechSection key={key} sectionKey={key} cv={cv} c={c} />
          ))}
        </div>
        {/* Sidebar */}
        <div>
          {sideKeys.map((key) => !sectionHasContent(cv, key) ? null : (
            <TechSide key={key} sectionKey={key} cv={cv} c={c} />
          ))}
        </div>
      </div>
    </article>
  )
}

function TechLabel({ children, c }: { children: React.ReactNode; c: any }) {
  return (
    <div style={{ fontFamily: 'monospace', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: c.text, marginBottom: '8px', marginTop: '16px' }}>
      {children}
    </div>
  )
}

function TechSection({ sectionKey, cv, c }: { sectionKey: SectionKey; cv: CVDocument; c: any }) {
  if (sectionKey === 'summary') return (
    <div><TechLabel c={c}>Summary</TechLabel>
      <p style={{ fontSize: '12px', lineHeight: 1.7, color: c.text, margin: 0 }}>{cv.summary.content}</p>
    </div>
  )
  if (sectionKey === 'experience') return (
    <div><TechLabel c={c}>Experience</TechLabel>
      {cv.experience.map((e) => (
        <div key={e.id} className="cv-item" style={{ paddingLeft: '12px', borderLeft: `2px solid ${c.primary}`, marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>{e.position} · {e.company}</span>
            <span style={{ fontFamily: 'monospace', fontSize: '10px', color: c.muted }}>{formatDateRange(e.startDate, e.current ? null : e.endDate)}</span>
          </div>
          {e.location && <p style={{ fontSize: '10.5px', color: c.muted, margin: '0 0 4px', fontFamily: 'monospace' }}>{e.location}</p>}
          {e.description && <p style={{ fontSize: '11.5px', lineHeight: 1.6, color: c.text, margin: '0 0 4px' }}>{e.description}</p>}
          {e.achievements.map((a, i) => <div key={i} style={{ fontSize: '11.5px', color: c.text, display: 'flex', gap: '6px' }}><span style={{ color: c.primary }}>→</span>{a}</div>)}
        </div>
      ))}
    </div>
  )
  if (sectionKey === 'projects') return (
    <div><TechLabel c={c}>Projects</TechLabel>
      {cv.projects.map((p) => (
        <div key={p.id} className="cv-item" style={{ paddingLeft: '12px', borderLeft: `2px solid ${c.divider}`, marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 600 }}>{p.name}</span>
            {p.url && <span style={{ fontFamily: 'monospace', fontSize: '10px', color: c.muted }}>{normalizeUrl(p.url)}</span>}
          </div>
          {p.description && <p style={{ fontSize: '11.5px', lineHeight: 1.6, color: c.text, margin: '2px 0' }}>{p.description}</p>}
          {p.technologies.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginTop: '4px' }}>
              {p.technologies.map((t, i) => <span key={i} style={{ fontFamily: 'monospace', fontSize: '10px', background: c.surfaceAlt, border: `0.5px solid ${c.divider}`, padding: '1px 6px', borderRadius: '3px' }}>{t}</span>)}
            </div>
          )}
        </div>
      ))}
    </div>
  )
  if (sectionKey === 'references') return (
    <div><TechLabel c={c}>References</TechLabel>
      {cv.references.map((r) => (
        <div key={r.id} style={{ fontSize: '11px', marginBottom: '8px' }}>
          <p style={{ fontWeight: 600, margin: 0 }}>{r.name} · {joinParts([r.position, r.company])}</p>
          {r.email && <p style={{ color: c.muted, margin: 0, fontFamily: 'monospace', fontSize: '10.5px' }}>{r.email}</p>}
        </div>
      ))}
    </div>
  )
  return null
}

function TechSide({ sectionKey, cv, c }: { sectionKey: SectionKey; cv: CVDocument; c: any }) {
  const label = ({ skills: 'Skills', languages: 'Languages', certificates: 'Certs', education: 'Education' } as Record<string, string>)[sectionKey]
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ fontFamily: 'monospace', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: c.text, borderBottom: `1px solid ${c.primary}`, paddingBottom: '3px', marginBottom: '8px' }}>{label}</div>
      {sectionKey === 'skills' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {cv.skills.map((s) => <span key={s.id} style={{ fontFamily: 'monospace', fontSize: '10px', background: c.surfaceAlt, border: `0.5px solid ${c.divider}`, padding: '2px 7px', borderRadius: '3px', color: c.text }}>{s.name}</span>)}
        </div>
      )}
      {sectionKey === 'languages' && cv.languages.map((l) => (
        <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px' }}>
          <span>{l.name}</span><span style={{ color: c.muted, fontFamily: 'monospace', fontSize: '10px' }}>{l.proficiency}</span>
        </div>
      ))}
      {sectionKey === 'certificates' && cv.certificates.map((cert) => (
        <div key={cert.id} style={{ fontSize: '10.5px', marginBottom: '5px' }}>
          <p style={{ fontWeight: 600, margin: 0 }}>{cert.name}</p>
          <p style={{ color: c.muted, margin: 0, fontFamily: 'monospace', fontSize: '10px' }}>{cert.issuer}</p>
        </div>
      ))}
      {sectionKey === 'education' && cv.education.map((e) => (
        <div key={e.id} style={{ marginBottom: '8px' }}>
          <p style={{ fontSize: '11.5px', fontWeight: 600, margin: '0 0 1px' }}>{e.institution}</p>
          <p style={{ fontSize: '10.5px', color: c.muted, margin: '0 0 1px' }}>{joinParts([e.degree, e.field])}</p>
          <p style={{ fontFamily: 'monospace', fontSize: '10px', color: c.muted, margin: 0 }}>{formatDateRange(e.startDate, e.current ? null : e.endDate)}</p>
        </div>
      ))}
    </div>
  )
}
