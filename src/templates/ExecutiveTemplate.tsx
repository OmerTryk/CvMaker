import type { CVDocument, SectionKey } from '@/types/cv'
import { COLOR_THEMES, FONT_FAMILIES } from './shared/tokens'
import { formatDateRange, getVisibleSections, joinParts, normalizeUrl, PROFICIENCY_LABEL, sectionHasContent } from './shared/helpers'

export function ExecutiveTemplate({ cv }: { cv: CVDocument }) {
  const c = COLOR_THEMES[cv.settings.colorTheme]
  const f = FONT_FAMILIES[cv.settings.fontFamily]
  const visible = getVisibleSections(cv)
  const sideKeys: SectionKey[] = ['skills', 'languages', 'certificates']
  const mainKeys = visible.filter((k) => !sideKeys.includes(k))
  const sideVisible = visible.filter((k) => sideKeys.includes(k))

  return (
    <article style={{ fontFamily: f.body, color: c.text, background: c.surface, height: '100%' }}>
      {/* Dark header band */}
      <header style={{ background: c.primary, color: c.primaryFg, padding: '28px 36px 22px', position: 'relative' }}>
        {cv.personal.photoUrl && (
          <img
            src={cv.personal.photoUrl}
            alt={cv.personal.fullName}
            style={{ position: 'absolute', right: '36px', top: '28px', width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.35)' }}
          />
        )}
        <h1 style={{ fontFamily: f.display, fontSize: '28px', fontWeight: 600, letterSpacing: '-0.01em', margin: '0 0 4px' }}>
          {cv.personal.fullName || 'Ad Soyad'}
        </h1>
        {cv.personal.jobTitle && (
          <p style={{ fontSize: '11.5px', letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.65, margin: '0 0 14px' }}>
            {cv.personal.jobTitle}
          </p>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '10.5px', opacity: 0.55 }}>
          {[cv.contact.email, cv.contact.phone, cv.contact.location,
            cv.contact.linkedin && normalizeUrl(cv.contact.linkedin),
            cv.contact.github && normalizeUrl(cv.contact.github),
          ].filter(Boolean).map((v, i) => <span key={i}>{v}</span>)}
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '0', padding: '24px 36px', minHeight: 'calc(100% - 90px)' }}>
        {/* Main */}
        <div style={{ paddingRight: '28px', borderRight: `1px solid ${c.divider}` }}>
          {mainKeys.map((key) => !sectionHasContent(cv, key) ? null : (
            <ExecSection key={key} sectionKey={key} cv={cv} c={c} f={f} />
          ))}
        </div>
        {/* Sidebar */}
        <div style={{ paddingLeft: '24px' }}>
          {sideVisible.map((key) => !sectionHasContent(cv, key) ? null : (
            <ExecSideSection key={key} sectionKey={key} cv={cv} c={c} f={f} />
          ))}
        </div>
      </div>
    </article>
  )
}

function ExecSectionTitle({ children, c, f }: { children: React.ReactNode; c: any; f: any }) {
  return (
    <div style={{ fontSize: '10px', fontFamily: f.display, letterSpacing: '0.2em', textTransform: 'uppercase', color: c.primary, borderBottom: `1.5px solid ${c.primary}`, paddingBottom: '4px', marginBottom: '10px', marginTop: '16px' }}>
      {children}
    </div>
  )
}

function ExecSection({ sectionKey, cv, c, f }: { sectionKey: SectionKey; cv: CVDocument; c: any; f: any }) {
  if (sectionKey === 'summary') return (
    <div className="cv-item">
      <ExecSectionTitle c={c} f={f}>Özet</ExecSectionTitle>
      <p style={{ fontSize: '12px', lineHeight: 1.7, color: c.text }}>{cv.summary.content}</p>
    </div>
  )
  if (sectionKey === 'experience') return (
    <div>
      <ExecSectionTitle c={c} f={f}>Deneyim</ExecSectionTitle>
      {cv.experience.map((e) => (
        <div key={e.id} className="cv-item" style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>{e.position}</span>
            <span style={{ fontSize: '10px', color: c.muted }}>{formatDateRange(e.startDate, e.current ? null : e.endDate)}</span>
          </div>
          <div style={{ fontSize: '11px', color: c.primary, fontStyle: 'italic', marginBottom: '3px' }}>{joinParts([e.company, e.location])}</div>
          {e.description && <p style={{ fontSize: '11.5px', lineHeight: 1.6, color: c.text, margin: '0 0 3px' }}>{e.description}</p>}
          {e.achievements.map((a, i) => <div key={i} style={{ fontSize: '11.5px', color: c.text, display: 'flex', gap: '6px' }}><span style={{ color: c.primary }}>—</span>{a}</div>)}
        </div>
      ))}
    </div>
  )
  if (sectionKey === 'education') return (
    <div>
      <ExecSectionTitle c={c} f={f}>Eğitim</ExecSectionTitle>
      {cv.education.map((e) => (
        <div key={e.id} className="cv-item" style={{ marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>{joinParts([e.degree, e.field]) || e.institution}</span>
            <span style={{ fontSize: '10px', color: c.muted }}>{formatDateRange(e.startDate, e.current ? null : e.endDate)}</span>
          </div>
          <div style={{ fontSize: '11px', color: c.primary, fontStyle: 'italic' }}>{joinParts([e.institution, e.location])}</div>
        </div>
      ))}
    </div>
  )
  if (sectionKey === 'projects') return (
    <div>
      <ExecSectionTitle c={c} f={f}>Projeler</ExecSectionTitle>
      {cv.projects.map((p) => (
        <div key={p.id} className="cv-item" style={{ marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
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
    <div>
      <ExecSectionTitle c={c} f={f}>Referanslar</ExecSectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {cv.references.map((r) => (
          <div key={r.id} style={{ fontSize: '11.5px' }}>
            <p style={{ fontWeight: 600, margin: 0 }}>{r.name}</p>
            <p style={{ color: c.primary, fontStyle: 'italic', margin: 0 }}>{joinParts([r.position, r.company])}</p>
            {r.email && <p style={{ color: c.muted, margin: 0 }}>{r.email}</p>}
          </div>
        ))}
      </div>
    </div>
  )
  return null
}

function ExecSideSection({ sectionKey, cv, c, f }: { sectionKey: SectionKey; cv: CVDocument; c: any; f: any }) {
  const title = ({ skills: 'Yetenekler', languages: 'Diller', certificates: 'Sertifikalar' } as Record<string, string>)[sectionKey]
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ fontSize: '9.5px', fontFamily: f.display, letterSpacing: '0.2em', textTransform: 'uppercase', color: c.primary, borderBottom: `1px solid ${c.divider}`, paddingBottom: '3px', marginBottom: '8px' }}>{title}</div>
      {sectionKey === 'skills' && cv.skills.map((s) => (
        <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '11px' }}>
          <span>{s.name}</span>
          {s.level && <span style={{ display: 'flex', gap: '2px' }}>{Array.from({ length: 5 }, (_, i) => <span key={i} style={{ width: '5px', height: '5px', borderRadius: '50%', background: i < (s.level ?? 0) ? c.primary : c.divider }} />)}</span>}
        </div>
      ))}
      {sectionKey === 'languages' && cv.languages.map((l) => (
        <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px' }}>
          <span>{l.name}</span><span style={{ color: c.muted }}>{PROFICIENCY_LABEL[l.proficiency]}</span>
        </div>
      ))}
      {sectionKey === 'certificates' && cv.certificates.map((cert) => (
        <div key={cert.id} style={{ fontSize: '11px', marginBottom: '5px' }}>
          <p style={{ fontWeight: 600, margin: 0 }}>{cert.name}</p>
          <p style={{ color: c.muted, margin: 0, fontSize: '10.5px' }}>{cert.issuer}</p>
        </div>
      ))}
    </div>
  )
}
