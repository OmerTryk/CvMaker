/**
 * Default & seed data factories for CV documents.
 */

import {
  ALL_SECTIONS,
  type CVDocument,
  type Experience,
  type Education,
  type Skill,
  type Language,
  type Project,
  type Certificate,
  type Reference,
} from '@/types/cv'
import { createId } from '@/utils/id'
import { nowISO } from '@/utils/date'

/**
 * Creates a brand-new, empty CV document.
 */
export function createEmptyCV(): CVDocument {
  const now = nowISO()
  return {
    id: createId(),
    title: 'Yeni CV',
    createdAt: now,
    updatedAt: now,
    personal: {
      fullName: '',
      jobTitle: '',
      photoUrl: '',
    },
    contact: {
      email: '',
      phone: '',
      location: '',
      website: '',
      linkedin: '',
      github: '',
      twitter: '',
    },
    summary: {
      content: '',
    },
    experience: [],
    education: [],
    skills: [],
    languages: [],
    certificates: [],
    projects: [],
    references: [],
    settings: {
      template: 'modern',
      colorTheme: 'ink',
      fontFamily: 'mixed',
      language: 'tr',
    },
    sectionOrder: [...ALL_SECTIONS],
    hiddenSections: ['references'],
  }
}

// ─────────────────────────────────────────────────────────────
// Section item factories
// ─────────────────────────────────────────────────────────────

export function createEmptyExperience(): Experience {
  return {
    id: createId(),
    company: '',
    position: '',
    location: '',
    startDate: '2024-01',
    endDate: null,
    current: true,
    description: '',
    achievements: [],
  }
}

export function createEmptyEducation(): Education {
  return {
    id: createId(),
    institution: '',
    degree: '',
    field: '',
    location: '',
    startDate: '2020-09',
    endDate: null,
    current: false,
    gpa: '',
    description: '',
  }
}

export function createEmptySkill(): Skill {
  return {
    id: createId(),
    name: '',
    level: 3,
    category: '',
  }
}

export function createEmptyLanguage(): Language {
  return {
    id: createId(),
    name: '',
    proficiency: 'B2',
  }
}

export function createEmptyCertificate(): Certificate {
  return {
    id: createId(),
    name: '',
    issuer: '',
    date: '2024-01',
    url: '',
    credentialId: '',
  }
}

export function createEmptyProject(): Project {
  return {
    id: createId(),
    name: '',
    description: '',
    url: '',
    technologies: [],
    startDate: null,
    endDate: null,
  }
}

export function createEmptyReference(): Reference {
  return {
    id: createId(),
    name: '',
    position: '',
    company: '',
    email: '',
    phone: '',
  }
}

// ─────────────────────────────────────────────────────────────
// Sample CV — for demos, onboarding, and "load example" UX
// ─────────────────────────────────────────────────────────────

export function createSampleCV(): CVDocument {
  const base = createEmptyCV()

  return {
    ...base,
    title: 'Yazılım Mühendisi CV',
    personal: {
      fullName: 'Ada Yıldız',
      jobTitle: 'Senior Frontend Engineer',
      photoUrl: '',
    },
    contact: {
      email: 'ada.yildiz@example.com',
      phone: '+90 555 123 45 67',
      location: 'İstanbul, Türkiye',
      website: 'https://adayildiz.dev',
      linkedin: 'linkedin.com/in/adayildiz',
      github: 'github.com/adayildiz',
      twitter: '',
    },
    summary: {
      content:
        '7+ yıl deneyimli, ürün odaklı frontend mühendisi. React, TypeScript ve modern web standartlarıyla milyonlarca kullanıcıya ulaşan arayüzler tasarladım. Tasarım sistemleri, performans ve erişilebilirlik konularında derin uzmanlığa sahibim.',
    },
    experience: [
      {
        id: createId(),
        company: 'Trendyol',
        position: 'Senior Frontend Engineer',
        location: 'İstanbul, Türkiye',
        startDate: '2022-03',
        endDate: null,
        current: true,
        description:
          'Ana web platformunda checkout deneyimini yeniden tasarlayan ekibe liderlik ediyorum.',
        achievements: [
          'Checkout dönüşüm oranını A/B testlerle %12 artırdım.',
          '40+ bileşenli iç tasarım sistemini başlattım, 6 takım kullanıyor.',
          'Lighthouse skorunu 67 → 94 seviyesine çıkardım.',
        ],
      },
      {
        id: createId(),
        company: 'Hepsiburada',
        position: 'Frontend Engineer',
        location: 'İstanbul, Türkiye',
        startDate: '2019-06',
        endDate: '2022-02',
        current: false,
        description: 'Satıcı paneli ekibinde React + TypeScript ile arayüz geliştirdim.',
        achievements: [
          'Ürün listeleme akışını React Query ile yeniden yazarak yükleme süresini %40 azalttım.',
          'Junior geliştiricilere mentorluk yaptım.',
        ],
      },
      {
        id: createId(),
        company: 'Freelance',
        position: 'Frontend Developer',
        location: 'Remote',
        startDate: '2017-09',
        endDate: '2019-05',
        current: false,
        description:
          'KOBİ ve startup\'lar için landing page, dashboard ve e-ticaret arayüzleri geliştirdim.',
        achievements: [],
      },
    ],
    education: [
      {
        id: createId(),
        institution: 'Boğaziçi Üniversitesi',
        degree: 'Lisans',
        field: 'Bilgisayar Mühendisliği',
        location: 'İstanbul, Türkiye',
        startDate: '2013-09',
        endDate: '2017-06',
        current: false,
        gpa: '3.42 / 4.0',
        description: '',
      },
    ],
    skills: [
      { id: createId(), name: 'TypeScript', level: 5, category: 'Languages' },
      { id: createId(), name: 'React', level: 5, category: 'Frameworks' },
      { id: createId(), name: 'Next.js', level: 4, category: 'Frameworks' },
      { id: createId(), name: 'Tailwind CSS', level: 5, category: 'Styling' },
      { id: createId(), name: 'Node.js', level: 4, category: 'Backend' },
      { id: createId(), name: 'PostgreSQL', level: 3, category: 'Database' },
      { id: createId(), name: 'Figma', level: 4, category: 'Design' },
    ],
    languages: [
      { id: createId(), name: 'Türkçe', proficiency: 'Native' },
      { id: createId(), name: 'İngilizce', proficiency: 'C1' },
      { id: createId(), name: 'Almanca', proficiency: 'A2' },
    ],
    certificates: [
      {
        id: createId(),
        name: 'AWS Certified Solutions Architect',
        issuer: 'Amazon Web Services',
        date: '2023-08',
        url: '',
        credentialId: 'AWS-SAA-123456',
      },
    ],
    projects: [
      {
        id: createId(),
        name: 'design-tokens-cli',
        description:
          'Figma değişkenlerini tüm popüler frameworklere dönüştüren açık kaynak CLI aracı. 1.2k+ GitHub yıldız.',
        url: 'https://github.com/adayildiz/design-tokens-cli',
        technologies: ['TypeScript', 'Node.js', 'Figma API'],
        startDate: '2022-11',
        endDate: null,
      },
    ],
    references: [],
  }
}
