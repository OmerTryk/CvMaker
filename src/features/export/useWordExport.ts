import { useCallback, useState } from 'react'
import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  Paragraph,
  TextRun,
  type IRunOptions,
} from 'docx'
import { useCVStore } from '@/store'
import type { CVDocument, CVLanguage } from '@/types/cv'
import {
  formatDateRange,
  getVisibleSections,
  proficiencyLabel,
  SECTION_TITLES,
} from '@/templates/shared/helpers'

// ─── helpers ────────────────────────────────────────────────────────────────

const FONT = 'Calibri'

const run = (text: string, opts: Omit<IRunOptions, 'text' | 'children'> = {}) =>
  new TextRun({ text, font: FONT, ...opts })

const heading = (text: string) =>
  new Paragraph({
    children: [run(text.toUpperCase(), { bold: true, size: 22 })],
    spacing: { before: 280, after: 100 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: '1a1a1a', space: 4 } },
  })

const spacer = () => new Paragraph({ children: [], spacing: { after: 40 } })

// ─── document builder ───────────────────────────────────────────────────────

function buildDocument(cv: CVDocument): Document {
  const { personal, contact, summary, experience, education, skills, languages, certificates, projects, references } = cv
  const lang: CVLanguage = cv.settings.language
  const title = (key: keyof typeof SECTION_TITLES['tr']) => SECTION_TITLES[lang][key]
  const visibleSet = new Set(getVisibleSections(cv))
  const order = cv.sectionOrder.filter((s) => visibleSet.has(s))

  const children: Paragraph[] = []

  // ── Header ──────────────────────────────────────────────────────────────
  if (personal.fullName) {
    children.push(
      new Paragraph({
        children: [run(personal.fullName, { bold: true, size: 40 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
      }),
    )
  }

  if (personal.jobTitle) {
    children.push(
      new Paragraph({
        children: [run(personal.jobTitle, { size: 26, color: '555555' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
      }),
    )
  }

  const contactParts = [
    contact.email,
    contact.phone,
    contact.location,
    contact.website ? contact.website.replace(/^https?:\/\//, '') : '',
    contact.linkedin,
    contact.github,
    contact.twitter,
  ].filter(Boolean)

  if (contactParts.length > 0) {
    children.push(
      new Paragraph({
        children: [run(contactParts.join(' · '), { size: 18, color: '555555' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 160 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'cccccc', space: 6 } },
      }),
    )
  }

  // ── Sections in user-defined order ──────────────────────────────────────
  for (const section of order) {
    switch (section) {
      case 'summary': {
        if (!summary.content) break
        children.push(heading(title('summary')))
        children.push(
          new Paragraph({
            children: [run(summary.content, { size: 20 })],
            spacing: { after: 80 },
          }),
        )
        break
      }

      case 'experience': {
        if (!experience.length) break
        children.push(heading(title('experience')))
        experience.forEach((exp) => {
          const dateStr = formatDateRange(exp.startDate, exp.current ? null : exp.endDate, lang)
          const meta = [exp.location].filter(Boolean).join(' · ')

          children.push(
            new Paragraph({
              children: [
                run(exp.position, { bold: true, size: 22 }),
                run(`  ·  ${exp.company}`, { size: 22 }),
                ...(meta ? [run(`  ·  ${meta}`, { size: 20, color: '777777' })] : []),
              ],
              spacing: { before: 160, after: 40 },
            }),
          )
          children.push(
            new Paragraph({
              children: [run(dateStr, { size: 18, italics: true, color: '777777' })],
              spacing: { after: 60 },
            }),
          )
          if (exp.description) {
            children.push(
              new Paragraph({
                children: [run(exp.description, { size: 20 })],
                spacing: { after: 40 },
              }),
            )
          }
          exp.achievements.forEach((ach) => {
            children.push(
              new Paragraph({
                children: [run(`• ${ach}`, { size: 20 })],
                spacing: { after: 40 },
                indent: { left: 240 },
              }),
            )
          })
        })
        break
      }

      case 'education': {
        if (!education.length) break
        children.push(heading(title('education')))
        education.forEach((edu) => {
          const dateStr = formatDateRange(edu.startDate, edu.current ? null : edu.endDate, lang)
          const degreeField = [edu.degree, edu.field].filter(Boolean).join(' · ')

          children.push(
            new Paragraph({
              children: [run(edu.institution, { bold: true, size: 22 })],
              spacing: { before: 120, after: 40 },
            }),
          )
          if (degreeField) {
            children.push(
              new Paragraph({
                children: [run(degreeField, { size: 20 })],
                spacing: { after: 40 },
              }),
            )
          }
          children.push(
            new Paragraph({
              children: [run(dateStr, { size: 18, italics: true, color: '777777' })],
              spacing: { after: edu.gpa ? 40 : 80 },
            }),
          )
          if (edu.gpa) {
            children.push(
              new Paragraph({
                children: [run(`GPA: ${edu.gpa}`, { size: 18, color: '777777' })],
                spacing: { after: 80 },
              }),
            )
          }
        })
        break
      }

      case 'skills': {
        if (!skills.length) break
        children.push(heading(title('skills')))

        const grouped = skills.reduce<Record<string, string[]>>((acc, s) => {
          const cat = s.category || (lang === 'en' ? 'Other' : 'Diğer')
          ;(acc[cat] ??= []).push(s.name)
          return acc
        }, {})

        Object.entries(grouped).forEach(([cat, names]) => {
          children.push(
            new Paragraph({
              children: [
                run(`${cat}:  `, { bold: true, size: 20 }),
                run(names.join(' · '), { size: 20 }),
              ],
              spacing: { after: 60 },
            }),
          )
        })
        break
      }

      case 'languages': {
        if (!languages.length) break
        children.push(heading(title('languages')))
        children.push(
          new Paragraph({
            children: [run(languages.map((l) => `${l.name} (${proficiencyLabel(l.proficiency, lang)})`).join(' · '), { size: 20 })],
            spacing: { after: 80 },
          }),
        )
        break
      }

      case 'projects': {
        if (!projects.length) break
        children.push(heading(title('projects')))
        projects.forEach((proj) => {
          const dateStr = proj.startDate ? formatDateRange(proj.startDate, proj.endDate, lang) : ''
          children.push(
            new Paragraph({
              children: [
                run(proj.name, { bold: true, size: 22 }),
                ...(proj.url ? [run(`  ·  ${proj.url.replace(/^https?:\/\//, '')}`, { size: 18, color: '777777' })] : []),
              ],
              spacing: { before: 120, after: 40 },
            }),
          )
          if (dateStr) {
            children.push(
              new Paragraph({
                children: [run(dateStr, { size: 18, italics: true, color: '777777' })],
                spacing: { after: 40 },
              }),
            )
          }
          if (proj.description) {
            children.push(
              new Paragraph({
                children: [run(proj.description, { size: 20 })],
                spacing: { after: 40 },
              }),
            )
          }
          if (proj.technologies.length) {
            children.push(
              new Paragraph({
                children: [
                  run(`${lang === 'en' ? 'Technologies' : 'Teknolojiler'}:  `, { bold: true, size: 18 }),
                  run(proj.technologies.join(', '), { size: 18, color: '555555' }),
                ],
                spacing: { after: 60 },
              }),
            )
          }
        })
        break
      }

      case 'certificates': {
        if (!certificates.length) break
        children.push(heading(title('certificates')))
        certificates.forEach((cert) => {
          const parts: string[] = [cert.name]
          if (cert.issuer) parts.push(cert.issuer)
          if (cert.date) parts.push(formatDateRange(cert.date, cert.date, lang))
          children.push(
            new Paragraph({
              children: [run(`• ${parts.join(' · ')}`, { size: 20 })],
              spacing: { after: 60 },
              indent: { left: 240 },
            }),
          )
        })
        break
      }

      case 'references': {
        if (!references.length) break
        children.push(heading(title('references')))
        references.forEach((ref) => {
          const nameLine = [ref.name, ref.position, ref.company].filter(Boolean).join(' · ')
          const contactLine = [ref.email, ref.phone].filter(Boolean).join(' · ')
          children.push(
            new Paragraph({
              children: [run(nameLine, { bold: true, size: 20 })],
              spacing: { before: 100, after: 40 },
            }),
          )
          if (contactLine) {
            children.push(
              new Paragraph({
                children: [run(contactLine, { size: 18, color: '777777' })],
                spacing: { after: 80 },
              }),
            )
          }
        })
        break
      }
    }
  }

  children.push(spacer())

  return new Document({
    creator: 'CTRLCV',
    title: cv.title,
    description: `${personal.fullName} — CV`,
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, right: 900, bottom: 720, left: 900 },
          },
        },
        children,
      },
    ],
  })
}

// ─── hook ───────────────────────────────────────────────────────────────────

export function useWordExport() {
  const cv = useCVStore((s) => s.cv)
  const [isExporting, setIsExporting] = useState(false)

  const filename = (() => {
    const slug = (cv.personal.fullName || cv.title || 'cv')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9çğıöşü]+/gi, '-')
      .replace(/^-+|-+$/g, '')
    return `${slug || 'cv'}.docx`
  })()

  const exportWord = useCallback(async () => {
    setIsExporting(true)
    try {
      const doc = buildDocument(cv)
      const blob = await Packer.toBlob(doc)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setIsExporting(false)
    }
  }, [cv, filename])

  return { exportWord, isExporting }
}
