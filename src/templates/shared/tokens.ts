/**
 * Design tokens shared by all CV templates.
 *
 * Color themes and font stacks are intentionally separate from
 * the app UI tokens — these are what the END USER's CV looks like,
 * and need to stay neutral & professional.
 */

import type { ColorTheme, FontFamily, Template } from '@/types/cv'

// ─────────────────────────────────────────────────────────────
// Color themes — each is a small, balanced palette
// ─────────────────────────────────────────────────────────────

export interface TemplateColors {
  primary: string // accent color (headings, dividers, sidebar bg)
  primaryFg: string // foreground on primary surfaces
  text: string // body text
  muted: string // secondary text
  divider: string // subtle lines
  surface: string // page background
  surfaceAlt: string // sidebar / card background
}

export const COLOR_THEMES: Record<ColorTheme, TemplateColors> = {
  ink: {
    primary: '#111111',
    primaryFg: '#ffffff',
    text: '#1a1a1a',
    muted: '#5a5a5a',
    divider: '#d8d8d8',
    surface: '#ffffff',
    surfaceAlt: '#f4f2ee',
  },
  sienna: {
    primary: '#9C3409',
    primaryFg: '#ffffff',
    text: '#1f1410',
    muted: '#6a564b',
    divider: '#dcd0c5',
    surface: '#ffffff',
    surfaceAlt: '#f8efe6',
  },
  forest: {
    primary: '#2D5016',
    primaryFg: '#ffffff',
    text: '#10180b',
    muted: '#506247',
    divider: '#d4d9cf',
    surface: '#ffffff',
    surfaceAlt: '#eef1eb',
  },
  navy: {
    primary: '#1B3A5C',
    primaryFg: '#ffffff',
    text: '#0d1620',
    muted: '#4d5d6e',
    divider: '#cdd5dc',
    surface: '#ffffff',
    surfaceAlt: '#eef2f6',
  },
  plum: {
    primary: '#5B2A6B',
    primaryFg: '#ffffff',
    text: '#1d1322',
    muted: '#5e4f66',
    divider: '#d8cfdc',
    surface: '#ffffff',
    surfaceAlt: '#f3eef5',
  },
}

export const COLOR_THEME_LABELS: Record<ColorTheme, string> = {
  ink: 'Mürekkep',
  sienna: 'Toprak',
  forest: 'Orman',
  navy: 'Lacivert',
  plum: 'Erik',
}

// ─────────────────────────────────────────────────────────────
// Font stacks
// ─────────────────────────────────────────────────────────────

export interface TemplateFonts {
  display: string // headings
  body: string // body text
}

export const FONT_FAMILIES: Record<FontFamily, TemplateFonts> = {
  serif: {
    display: '"Fraunces", Georgia, serif',
    body: '"Fraunces", Georgia, serif',
  },
  sans: {
    display: '"Geist", system-ui, sans-serif',
    body: '"Geist", system-ui, sans-serif',
  },
  mixed: {
    display: '"Fraunces", Georgia, serif',
    body: '"Geist", system-ui, sans-serif',
  },
}

export const FONT_FAMILY_LABELS: Record<FontFamily, string> = {
  serif: 'Klasik (serif)',
  sans: 'Modern (sans)',
  mixed: 'Karışık',
}

// ─────────────────────────────────────────────────────────────
// Template metadata
// ─────────────────────────────────────────────────────────────

export interface TemplateMeta {
  key: Template
  name: string
  description: string
}

export const TEMPLATE_LIST: readonly TemplateMeta[] = [
  {
    key: 'modern',
    name: 'Modern',
    description: 'Renkli sidebar, iki kolon, görsel hiyerarşi',
  },
  {
    key: 'classic',
    name: 'Klasik',
    description: 'Tek kolon, klasik tipografi, ATS-friendly',
  },
  {
    key: 'minimal',
    name: 'Minimal',
    description: 'Sade, tipografi odaklı, beyaz alan dolu',
  },
] as const

// ─────────────────────────────────────────────────────────────
// A4 dimensions (used for preview canvas)
// ─────────────────────────────────────────────────────────────

export const A4 = {
  widthMM: 210,
  heightMM: 297,
  widthPX: 794, // at 96 DPI
  heightPX: 1123,
} as const
