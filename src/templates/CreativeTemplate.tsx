import type { CVDocument, SectionKey } from '@/types/cv'
import { COLOR_THEMES, FONT_FAMILIES } from './shared/tokens'
import { formatDateRange, getVisibleSections, joinParts, normalizeUrl, PROFICIENCY_LABEL, sectionHasContent } from './shared/helpers'

const SIDEBAR_KEYS: SectionKey[] = ['skills', 'languages', 'certificates']

export function CreativeTemplate({ cv }: { cv: CVDocument }) {
  const c = COLOR_THEMES[cv.settings.colorTheme]
  const f = FONT_FAMILIES[cv.settings.fontFamily]
  const visible = getVisibleSections(cv)
  const mainKeys = visible.filter((k) => !SIDEBAR_KEYS.includes(k))
  const sideKeys = visible.filter((k) => SIDEBAR_KEYS.includes(k))

  // Pastel version of primary for sidebar background
  const sidebarBg = c.surfaceAlt

  return (
    <article style={{ fontFamily: f.body, color: c.text, display: 'flex', minHeight: '100%', background: c.surface }}>
      {/* Left panel */}
      <aside style={{ width: '220px', flexShrink: 0, background: sidebarBg, padding: '28px 20px' }}>
        {/* Avatar */}
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: c.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.primaryFg, fontSize: '20px', fontWeight: 600, fontFamily: f.display, marginBottom: '12px' }}>
          {(cv.personal.fullName || 'AY').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
        </div>
        <h1 style={{ fontFamily: f.display, fontSize: '18px', fontWeight: 600, color: c.text, margin: '0 0 3px' }}>
          {cv.personal.fullName || 'Ad Soyad'}
        </h1>
        {cv.personal.jobTitle && (
          <p style={{ fontSize: '10.5px', letterSpacing: '0.1em', textTransform: 'uppercase', color: c.primary, margin: '0 0 16px' }}>
            {cv.personal.jobTitle}
          </p>
        )}
        {/* Contact */}
        <div style={{ fontSize: '10.5px', lineHeight: 2, color: c.text, marginBottom: '16px' }}>
          {cv.contact.email && <div>{cv.contact.email}</div>}
          {cv.contact.phone && <div>{cv.contact.phone}</div>}
          {cv.contact.location && <div>{cv.contact.location}</div>}
          {cv.contact.website && <div>{normalizeUrl(cv.contact.website)}</div>}
          {cv.contact.linkedin && <div>{normalizeUrl(cv.contact.linkedin)}</div>}
          {cv.contact.github && <div>{normalizeUrl(cv.contact.github)}</div>}
        </div>
        {/* Sidebar sections */}
        {sideKeys.map((key) => !sectionHasContent(cv, key) ? null : (
          <div key={key} style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '9.5px', letterSpacing: '0.18em', textTransform: 'uppercase', color: c.primary, borderBottom: `1px solid ${c.divider}`, paddingBottom: '3px', marginBottom: '8px' }}>
              {({ skills: 'Yetenekler', languages: 'Diller', certificates: 'Sertifikalar' } as Record<string, string>)[key]}
            </div>
            {key === 'skills' && cv.skills.map((s) => (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '5px' }}>
                <span>{s.name}</span>
                {s.level && <span style={{ display: 'flex', gap: '2px' }}>{Array.from({ length: 5 }, (_, i) => <span key={i} style={{ width: '5px', height: '5px', borderRadius: '50%', background: i < (s.level ?? 0) ? c.primary : c.divider }} />)}</span>}
              </div>
            ))}
            {key === 'languages' && cv.languages.map((l) => (
              <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px' }}>
                <span>{l.name}</span><span style={{ color: c.muted }}>{PROFICIENCY_LABEL[l.proficiency]}</span>
              </div>
            ))}
            {key === 'certificates' && cv.certificates.map((cert) => (
              <div key={cert.id} style={{ fontSize: '10.5px', marginBottom: '5px' }}>
                <p style={{ fontWeight: 600, margin: 0 }}>{cert.name}</p>
                <p style={{ color: c.muted, margin: 0 }}>{cert.issuer}</p>
              </div>
            ))}
          </div>
        ))}
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: '28px 28px' }}>
        {mainKeys.map((key) => !sectionHasContent(cv, key) ? null : (
          <CreativeSection key={key} sectionKey={key} cv={cv} c={c} f={f} />
        ))}
      </main>
    </article>
  )
}

function SectionTitle({ children, c, f }: { children: React.ReactNode; c: any; f: any }) {
  return (
    <div style={{ fontSize: '10.5px', letterSpacing: '0.18em', textTransform: 'uppercase', color: c.primary, borderBottom: `1px solid ${c.divider}`, paddingBottom: '4px', marginBottom: '10px', marginTop: '18px', fontFamily: f.display }}>
      {children}
    </div>
  )
}

function CreativeSection({ sectionKey, cv, c, f }: { sectionKey: SectionKey; cv: CVDocument; c: any; f: any }) {
  if (sectionKey === 'summary') return (
    <div><SectionTitle c={c} f={f}>Özet</SectionTitle>
      <p style={{ fontSize: '12px', lineHeight: 1.7, color: c.text }}>{cv.summary.content}</p>
    </div>
  )
  if (sectionKey === 'experience') return (
    <div><SectionTitle c={c} f={f}>Deneyim</SectionTitle>
      {cv.experience.map((e) => (
        <div key={e.id} className="cv-item" style={{ marginBottom: '13px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>{e.position}</span>
            <span style={{ fontSize: '10px', color: c.muted }}>{formatDateRange(e.startDate, e.current ? null : e.endDate)}</span>
          </div>
          <p style={{ fontSize: '11px', color: c.primary, fontStyle: 'italic', margin: '2px 0 4px' }}>{joinParts([e.company, e.location])}</p>
          {e.description && <p style={{ fontSize: '11.5px', lineHeight: 1.65, color: c.text, margin: '0 0 3px' }}>{e.description}</p>}
          {e.achievements.map((a, i) => <div key={i} style={{ fontSize: '11.5px', color: c.text, display: 'flex', gap: '6px' }}><span style={{ color: c.primary }}>—</span>{a}</div>)}
        </div>
      ))}
    </div>
  )
  if (sectionKey === 'education') return (
    <div><SectionTitle c={c} f={f}>Eğitim</SectionTitle>
      {cv.education.map((e) => (
        <div key={e.id} className="cv-item" style={{ marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 600 }}>{e.institution}</span>
            <span style={{ fontSize: '10px', color: c.muted }}>{formatDateRange(e.startDate, e.current ? null : e.endDate)}</span>
          </div>
          <p style={{ fontSize: '11px', color: c.primary, fontStyle: 'italic', margin: '2px 0' }}>{joinParts([e.degree, e.field])}</p>
        </div>
      ))}
    </div>
  )
  if (sectionKey === 'projects') return (
    <div><SectionTitle c={c} f={f}>Projeler</SectionTitle>
      {cv.projects.map((p) => (
        <div key={p.id} className="cv-item" style={{ marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 600 }}>{p.name}</span>
            {p.url && <span style={{ fontSize: '10px', color: c.muted }}>{normalizeUrl(p.url)}</span>}
          </div>
          {p.description && <p style={{ fontSize: '11.5px', lineHeight: 1.6, color: c.text, margin: '2px 0' }}>{p.description}</p>}
          {p.technologies.length > 0 && <p style={{ fontSize: '10.5px', color: c.primary, fontStyle: 'italic', margin: 0 }}>{p.technologies.join(' · ')}</p>}
        </div>
      ))}
    </div>
  )
  if (sectionKey === 'references') return (
    <div><SectionTitle c={c} f={f}>Referanslar</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {cv.references.map((r) => (
          <div key={r.id} style={{ fontSize: '11px' }}>
            <p style={{ fontWeight: 600, margin: 0 }}>{r.name}</p>
            <p style={{ color: c.primary, fontStyle: 'italic', margin: 0 }}>{joinParts([r.position, r.company])}</p>
          </div>
        ))}
      </div>
    </div>
  )
  return null
}
