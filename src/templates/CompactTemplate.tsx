/**
 * Compact Template — dense 3-column layout.
 * Maximizes content per page. Great for experienced professionals.
 */
import type { CVDocument, SectionKey } from '@/types/cv'
import { COLOR_THEMES, FONT_FAMILIES } from './shared/tokens'
import { formatDateRange, getVisibleSections, joinParts, normalizeUrl, PROFICIENCY_LABEL, sectionHasContent } from './shared/helpers'

export function CompactTemplate({ cv }: { cv: CVDocument }) {
  const c = COLOR_THEMES[cv.settings.colorTheme]
  const f = FONT_FAMILIES[cv.settings.fontFamily]
  const visible = getVisibleSections(cv)

  const leftKeys: SectionKey[] = ['experience', 'projects']
  const midKeys: SectionKey[] = ['education', 'certificates']
  const rightKeys: SectionKey[] = ['skills', 'languages', 'references']

  const col = (keys: SectionKey[]) => visible.filter((k) => keys.includes(k))

  return (
    <article style={{ fontFamily: f.body, color: c.text, background: c.surface, padding: '18px 22px', minHeight: '100%', fontSize: '11px' }}>
      {/* Header */}
      <header style={{ borderBottom: `2px solid ${c.primary}`, paddingBottom: '10px', marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontFamily: f.display, fontSize: '22px', fontWeight: 600, margin: '0 0 2px', letterSpacing: '-0.01em' }}>{cv.personal.fullName || 'Ad Soyad'}</h1>
            {cv.personal.jobTitle && <p style={{ fontSize: '10.5px', letterSpacing: '0.12em', textTransform: 'uppercase', color: c.muted, margin: 0 }}>{cv.personal.jobTitle}</p>}
          </div>
          <div style={{ textAlign: 'right', fontSize: '10px', color: c.muted, lineHeight: 1.8 }}>
            {cv.contact.email && <div>{cv.contact.email}</div>}
            {cv.contact.phone && <div>{cv.contact.phone}</div>}
            {cv.contact.location && <div>{cv.contact.location}</div>}
            {cv.contact.github && <div>{normalizeUrl(cv.contact.github)}</div>}
          </div>
        </div>
        {sectionHasContent(cv, 'summary') && !cv.hiddenSections.includes('summary') && (
          <p style={{ fontSize: '11px', lineHeight: 1.6, color: c.text, margin: '8px 0 0' }}>{cv.summary.content}</p>
        )}
      </header>

      {/* 3-column content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 160px', gap: '18px' }}>
        {/* Left */}
        <div>
          {col(leftKeys).map((key) => !sectionHasContent(cv, key) ? null : (
            <CompactSection key={key} sectionKey={key} cv={cv} c={c} f={f} />
          ))}
        </div>
        {/* Mid */}
        <div>
          {col(midKeys).map((key) => !sectionHasContent(cv, key) ? null : (
            <CompactSection key={key} sectionKey={key} cv={cv} c={c} f={f} />
          ))}
        </div>
        {/* Right */}
        <div>
          {col(rightKeys).map((key) => !sectionHasContent(cv, key) ? null : (
            <CompactSection key={key} sectionKey={key} cv={cv} c={c} f={f} />
          ))}
        </div>
      </div>
    </article>
  )
}

function CLabel({ children, c, f }: { children: React.ReactNode; c: any; f: any }) {
  return (
    <div style={{ fontFamily: f.display, fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: c.primary, borderBottom: `1px solid ${c.divider}`, paddingBottom: '3px', marginBottom: '7px', marginTop: '12px' }}>
      {children}
    </div>
  )
}

function CompactSection({ sectionKey, cv, c, f }: { sectionKey: SectionKey; cv: CVDocument; c: any; f: any }) {
  const titles: Record<string, string> = { experience: 'Deneyim', education: 'Eğitim', skills: 'Yetenekler', projects: 'Projeler', languages: 'Diller', certificates: 'Sertifikalar', references: 'Referanslar' }

  if (sectionKey === 'experience') return (
    <div><CLabel c={c} f={f}>{titles[sectionKey]}</CLabel>
      {cv.experience.map((e) => (
        <div key={e.id} className="cv-item" style={{ marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: 600, lineHeight: 1.3 }}>{e.position}</span>
            <span style={{ fontSize: '9.5px', color: c.muted, whiteSpace: 'nowrap', flexShrink: 0 }}>{formatDateRange(e.startDate, e.current ? null : e.endDate)}</span>
          </div>
          <p style={{ fontSize: '10.5px', color: c.primary, fontStyle: 'italic', margin: '1px 0 3px' }}>{joinParts([e.company, e.location])}</p>
          {e.description && <p style={{ fontSize: '10.5px', lineHeight: 1.6, color: c.text, margin: '0 0 2px' }}>{e.description}</p>}
          {e.achievements.slice(0, 3).map((a, i) => <div key={i} style={{ fontSize: '10.5px', display: 'flex', gap: '5px', color: c.text }}><span style={{ color: c.primary, flexShrink: 0 }}>—</span>{a}</div>)}
        </div>
      ))}
    </div>
  )

  if (sectionKey === 'education') return (
    <div><CLabel c={c} f={f}>{titles[sectionKey]}</CLabel>
      {cv.education.map((e) => (
        <div key={e.id} className="cv-item" style={{ marginBottom: '9px' }}>
          <p style={{ fontSize: '11.5px', fontWeight: 600, margin: '0 0 1px' }}>{e.institution}</p>
          <p style={{ fontSize: '10.5px', color: c.primary, fontStyle: 'italic', margin: '0 0 1px' }}>{joinParts([e.degree, e.field])}</p>
          <p style={{ fontSize: '9.5px', color: c.muted, margin: 0 }}>{formatDateRange(e.startDate, e.current ? null : e.endDate)}{e.gpa ? ` · GPA ${e.gpa}` : ''}</p>
        </div>
      ))}
    </div>
  )

  if (sectionKey === 'skills') return (
    <div><CLabel c={c} f={f}>{titles[sectionKey]}</CLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {cv.skills.map((s) => (
          <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10.5px' }}>
            <span style={{ color: c.text }}>{s.name}</span>
            {s.level && <span style={{ display: 'flex', gap: '2px' }}>{Array.from({ length: 5 }, (_, i) => <span key={i} style={{ width: '5px', height: '5px', borderRadius: '50%', background: i < (s.level ?? 0) ? c.primary : c.divider }} />)}</span>}
          </div>
        ))}
      </div>
    </div>
  )

  if (sectionKey === 'languages') return (
    <div><CLabel c={c} f={f}>{titles[sectionKey]}</CLabel>
      {cv.languages.map((l) => (
        <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', marginBottom: '3px' }}>
          <span>{l.name}</span><span style={{ color: c.muted }}>{PROFICIENCY_LABEL[l.proficiency]}</span>
        </div>
      ))}
    </div>
  )

  if (sectionKey === 'certificates') return (
    <div><CLabel c={c} f={f}>{titles[sectionKey]}</CLabel>
      {cv.certificates.map((cert) => (
        <div key={cert.id} style={{ marginBottom: '6px' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, margin: '0 0 1px' }}>{cert.name}</p>
          <p style={{ fontSize: '10px', color: c.muted, margin: 0 }}>{cert.issuer}</p>
        </div>
      ))}
    </div>
  )

  if (sectionKey === 'projects') return (
    <div><CLabel c={c} f={f}>{titles[sectionKey]}</CLabel>
      {cv.projects.map((p) => (
        <div key={p.id} className="cv-item" style={{ marginBottom: '9px' }}>
          <p style={{ fontSize: '11.5px', fontWeight: 600, margin: '0 0 1px' }}>{p.name}</p>
          {p.description && <p style={{ fontSize: '10.5px', lineHeight: 1.6, color: c.text, margin: '0 0 2px' }}>{p.description}</p>}
          {p.technologies.length > 0 && <p style={{ fontSize: '10px', color: c.primary, margin: 0 }}>{p.technologies.join(', ')}</p>}
        </div>
      ))}
    </div>
  )

  if (sectionKey === 'references') return (
    <div><CLabel c={c} f={f}>{titles[sectionKey]}</CLabel>
      {cv.references.map((r) => (
        <div key={r.id} style={{ marginBottom: '8px', fontSize: '10.5px' }}>
          <p style={{ fontWeight: 600, margin: 0 }}>{r.name}</p>
          <p style={{ color: c.primary, fontStyle: 'italic', margin: 0 }}>{joinParts([r.position, r.company])}</p>
          {r.email && <p style={{ color: c.muted, margin: 0 }}>{r.email}</p>}
        </div>
      ))}
    </div>
  )

  return null
}
