/**
 * useWordExport — exports CV data to .docx format using the docx library.
 *
 * Creates a professional, ATS-compliant Word document with proper formatting,
 * sections, and styling that matches the visual templates.
 */

import { useState, useCallback } from 'react'
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  LevelFormat,
  BorderStyle,
} from 'docx'
import type { CVDocument } from '@/types/cv'
import { formatMonthYear } from '@/utils/date'

export function useWordExport() {
  const [isExporting, setIsExporting] = useState(false)

  const exportToWord = useCallback(async (cv: CVDocument) => {
    setIsExporting(true)

    try {
      const doc = createWordDocument(cv)
      const blob = await Packer.toBlob(doc)

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      // Generate filename: "ada-yildiz-cv.docx"
      const slug = (cv.personal.fullName || cv.title || 'cv')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9çğıöşü]+/gi, '-')
        .replace(/^-+|-+$/g, '')
      link.download = `${slug || 'cv'}.docx`

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Word export error:', error)
      alert('Word belgesi oluşturulurken bir hata oluştu.')
    } finally {
      setIsExporting(false)
    }
  }, [])

  return { exportToWord, isExporting }
}

function createWordDocument(cv: CVDocument): Document {
  const sections: Paragraph[] = []

  // US Letter page size (required for ATS compatibility)
  const pageConfig = {
    page: {
      size: {
        width: 12240, // 8.5 inches in DXA
        height: 15840, // 11 inches in DXA
      },
      margin: {
        top: 1440, // 1 inch
        right: 1440,
        bottom: 1440,
        left: 1440,
      },
    },
  }

  // Header: Name and Job Title
  sections.push(
    new Paragraph({
      text: cv.personal.fullName,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
    }),
  )

  if (cv.personal.jobTitle) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: cv.personal.jobTitle,
            size: 24, // 12pt
            color: '666666',
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
      }),
    )
  }

  // Contact Information
  const contactParts: string[] = []
  if (cv.contact.email) contactParts.push(cv.contact.email)
  if (cv.contact.phone) contactParts.push(cv.contact.phone)
  if (cv.contact.location) contactParts.push(cv.contact.location)
  if (cv.contact.website) contactParts.push(cv.contact.website)
  if (cv.contact.linkedin) contactParts.push(cv.contact.linkedin)
  if (cv.contact.github) contactParts.push(cv.contact.github)

  if (contactParts.length > 0) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: contactParts.join(' • '),
            size: 20, // 10pt
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 360 },
        border: {
          bottom: {
            style: BorderStyle.SINGLE,
            size: 6,
            color: 'CCCCCC',
          },
        },
      }),
    )
  }

  // Add sections in the order specified
  cv.sectionOrder.forEach((sectionKey) => {
    if (cv.hiddenSections.includes(sectionKey)) return

    switch (sectionKey) {
      case 'summary':
        if (cv.summary.content) {
          sections.push(...createSummarySection(cv))
        }
        break
      case 'experience':
        if (cv.experience.length > 0) {
          sections.push(...createExperienceSection(cv))
        }
        break
      case 'education':
        if (cv.education.length > 0) {
          sections.push(...createEducationSection(cv))
        }
        break
      case 'skills':
        if (cv.skills.length > 0) {
          sections.push(...createSkillsSection(cv))
        }
        break
      case 'projects':
        if (cv.projects.length > 0) {
          sections.push(...createProjectsSection(cv))
        }
        break
      case 'languages':
        if (cv.languages.length > 0) {
          sections.push(...createLanguagesSection(cv))
        }
        break
      case 'certificates':
        if (cv.certificates.length > 0) {
          sections.push(...createCertificatesSection(cv))
        }
        break
      case 'references':
        if (cv.references.length > 0) {
          sections.push(...createReferencesSection(cv))
        }
        break
    }
  })

  return new Document({
    styles: {
      default: {
        document: {
          run: {
            font: 'Arial',
            size: 22, // 11pt
          },
        },
      },
      paragraphStyles: [
        {
          id: 'Heading1',
          name: 'Heading 1',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: {
            size: 32, // 16pt
            bold: true,
            font: 'Arial',
          },
          paragraph: {
            spacing: { before: 240, after: 120 },
            outlineLevel: 0,
          },
        },
        {
          id: 'Heading2',
          name: 'Heading 2',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: {
            size: 26, // 13pt
            bold: true,
            font: 'Arial',
            color: '2E75B6',
          },
          paragraph: {
            spacing: { before: 360, after: 180 },
            outlineLevel: 1,
          },
        },
      ],
    },
    numbering: {
      config: [
        {
          reference: 'bullets',
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: '•',
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: { left: 720, hanging: 360 },
                },
              },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: pageConfig,
        children: sections,
      },
    ],
  })
}

function createSummarySection(cv: CVDocument): Paragraph[] {
  return [
    new Paragraph({
      text: 'Özet',
      heading: HeadingLevel.HEADING_2,
    }),
    new Paragraph({
      text: cv.summary.content,
      spacing: { after: 240 },
    }),
  ]
}

function createExperienceSection(cv: CVDocument): Paragraph[] {
  const paragraphs: Paragraph[] = [
    new Paragraph({
      text: 'İş Deneyimi',
      heading: HeadingLevel.HEADING_2,
    }),
  ]

  cv.experience.forEach((exp, index) => {
    // Company and position
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: exp.position,
            bold: true,
            size: 24, // 12pt
          }),
          new TextRun({
            text: ` - ${exp.company}`,
            size: 24,
          }),
        ],
        spacing: { before: index === 0 ? 120 : 240, after: 60 },
      }),
    )

    // Date and location
    const dateRange = `${formatMonthYear(exp.startDate)} - ${exp.current ? 'Halen' : formatMonthYear(exp.endDate || '')}`
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: dateRange,
            italics: true,
            size: 20,
            color: '666666',
          }),
          exp.location
            ? new TextRun({
                text: ` • ${exp.location}`,
                italics: true,
                size: 20,
                color: '666666',
              })
            : new TextRun({ text: '' }),
        ],
        spacing: { after: 120 },
      }),
    )

    // Description
    if (exp.description) {
      paragraphs.push(
        new Paragraph({
          text: exp.description,
          spacing: { after: 120 },
        }),
      )
    }

    // Achievements (bullets)
    exp.achievements.forEach((achievement) => {
      paragraphs.push(
        new Paragraph({
          text: achievement,
          numbering: {
            reference: 'bullets',
            level: 0,
          },
          spacing: { after: 60 },
        }),
      )
    })
  })

  return paragraphs
}

function createEducationSection(cv: CVDocument): Paragraph[] {
  const paragraphs: Paragraph[] = [
    new Paragraph({
      text: 'Eğitim',
      heading: HeadingLevel.HEADING_2,
    }),
  ]

  cv.education.forEach((edu, index) => {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: edu.institution,
            bold: true,
            size: 24,
          }),
        ],
        spacing: { before: index === 0 ? 120 : 240, after: 60 },
      }),
    )

    const degreeInfo = [edu.degree, edu.field].filter(Boolean).join(', ')
    if (degreeInfo) {
      paragraphs.push(
        new Paragraph({
          text: degreeInfo,
          spacing: { after: 60 },
        }),
      )
    }

    const dateRange = `${formatMonthYear(edu.startDate)} - ${edu.current ? 'Halen' : formatMonthYear(edu.endDate || '')}`
    const meta: string[] = [dateRange]
    if (edu.location) meta.push(edu.location)
    if (edu.gpa) meta.push(`GPA: ${edu.gpa}`)

    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: meta.join(' • '),
            italics: true,
            size: 20,
            color: '666666',
          }),
        ],
        spacing: { after: edu.description ? 120 : 240 },
      }),
    )

    if (edu.description) {
      paragraphs.push(
        new Paragraph({
          text: edu.description,
          spacing: { after: 240 },
        }),
      )
    }
  })

  return paragraphs
}

function createSkillsSection(cv: CVDocument): Paragraph[] {
  const paragraphs: Paragraph[] = [
    new Paragraph({
      text: 'Yetenekler',
      heading: HeadingLevel.HEADING_2,
      spacing: { after: 120 },
    }),
  ]

  // Group skills by category
  const grouped = cv.skills.reduce(
    (acc, skill) => {
      const cat = skill.category || 'Diğer'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(skill.name)
      return acc
    },
    {} as Record<string, string[]>,
  )

  Object.entries(grouped).forEach(([category, skills]) => {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${category}: `,
            bold: true,
          }),
          new TextRun({
            text: skills.join(', '),
          }),
        ],
        spacing: { after: 120 },
      }),
    )
  })

  return paragraphs
}

function createProjectsSection(cv: CVDocument): Paragraph[] {
  const paragraphs: Paragraph[] = [
    new Paragraph({
      text: 'Projeler',
      heading: HeadingLevel.HEADING_2,
    }),
  ]

  cv.projects.forEach((project, index) => {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: project.name,
            bold: true,
            size: 24,
          }),
        ],
        spacing: { before: index === 0 ? 120 : 240, after: 60 },
      }),
    )

    // Technologies
    if (project.technologies.length > 0) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Teknolojiler: ',
              italics: true,
              size: 20,
            }),
            new TextRun({
              text: project.technologies.join(', '),
              italics: true,
              size: 20,
              color: '666666',
            }),
          ],
          spacing: { after: 60 },
        }),
      )
    }

    const meta: string[] = []
    if (project.startDate) {
      const endDateText = project.endDate ? formatMonthYear(project.endDate) : 'Devam ediyor'
      const dateRange = `${formatMonthYear(project.startDate)} - ${endDateText}`
      meta.push(dateRange)
    }
    if (project.url) meta.push(project.url)

    if (meta.length > 0) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: meta.join(' • '),
              italics: true,
              size: 20,
              color: '666666',
            }),
          ],
          spacing: { after: 120 },
        }),
      )
    }

    if (project.description) {
      paragraphs.push(
        new Paragraph({
          text: project.description,
          spacing: { after: 240 },
        }),
      )
    }
  })

  return paragraphs
}

function createLanguagesSection(cv: CVDocument): Paragraph[] {
  const paragraphs: Paragraph[] = [
    new Paragraph({
      text: 'Diller',
      heading: HeadingLevel.HEADING_2,
      spacing: { after: 120 },
    }),
  ]

  const languageText = cv.languages
    .map((lang) => `${lang.name} (${lang.proficiency})`)
    .join(' • ')

  paragraphs.push(
    new Paragraph({
      text: languageText,
      spacing: { after: 240 },
    }),
  )

  return paragraphs
}

function createCertificatesSection(cv: CVDocument): Paragraph[] {
  const paragraphs: Paragraph[] = [
    new Paragraph({
      text: 'Sertifikalar',
      heading: HeadingLevel.HEADING_2,
    }),
  ]

  cv.certificates.forEach((cert, index) => {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: cert.name,
            bold: true,
          }),
          cert.issuer
            ? new TextRun({
                text: ` - ${cert.issuer}`,
              })
            : new TextRun({ text: '' }),
        ],
        spacing: { before: index === 0 ? 120 : 180, after: 60 },
      }),
    )

    const meta: string[] = [formatMonthYear(cert.date)]
    if (cert.credentialId) meta.push(`ID: ${cert.credentialId}`)
    if (cert.url) meta.push(cert.url)

    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: meta.join(' • '),
            italics: true,
            size: 20,
            color: '666666',
          }),
        ],
        spacing: { after: 180 },
      }),
    )
  })

  return paragraphs
}

function createReferencesSection(cv: CVDocument): Paragraph[] {
  const paragraphs: Paragraph[] = [
    new Paragraph({
      text: 'Referanslar',
      heading: HeadingLevel.HEADING_2,
    }),
  ]

  cv.references.forEach((ref, index) => {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: ref.name,
            bold: true,
          }),
        ],
        spacing: { before: index === 0 ? 120 : 240, after: 60 },
      }),
    )

    if (ref.position || ref.company) {
      const title = [ref.position, ref.company].filter(Boolean).join(' - ')
      paragraphs.push(
        new Paragraph({
          text: title,
          spacing: { after: 60 },
        }),
      )
    }

    const contact: string[] = []
    if (ref.email) contact.push(ref.email)
    if (ref.phone) contact.push(ref.phone)

    if (contact.length > 0) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: contact.join(' • '),
              size: 20,
              color: '666666',
            }),
          ],
          spacing: { after: 240 },
        }),
      )
    }
  })

  return paragraphs
}
