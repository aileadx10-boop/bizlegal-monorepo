/**
 * BizLegal-AI theme registry. Twilight, Daybreak, and Royal Dark are
 * the canonical brand themes; Royal Light is derived from Daybreak's
 * shape with the royal-blue brand identity preserved (the bright
 * alternate for BRAI / TRACR / DocAI).
 */

export type ThemeId = 'twilight' | 'daybreak' | 'royal-dark' | 'royal-light'

/** Canonical CSS custom-property keys every ThemeSpec must define.
 *  Adding a key here forces all 4 themes to populate it (the
 *  Record<ThemeVarKey, string> type below is exhaustive, not Partial),
 *  so TypeScript catches both typos and missing-on-one-theme drift. */
export const THEME_VAR_KEYS = [
  '--ink',
  '--ink-2',
  '--ink-3',
  '--surface',
  '--surface-2',
  '--brand',
  '--brand-soft',
  '--accent-a',
  '--accent-b',
  '--accent-c',
  '--ember',
  '--ember-2',
  '--paper',
  '--paper-dim',
  '--line',
  '--line-2',
  '--hero-bg',
  '--audits-bg',
  '--spotlight-bg',
  '--bleed-bg',
  '--contact-bg',
  '--footer-bg',
  '--shield-grad',
] as const
export type ThemeVarKey = typeof THEME_VAR_KEYS[number]

export interface ThemeSpec {
  readonly id: ThemeId
  readonly name: string
  readonly subtitle: string
  readonly mode: 'dark' | 'light'
  readonly displayFamily: string
  readonly bodyFamily: string
  readonly vars: Readonly<Record<ThemeVarKey, string>>
}

const FAMILIES = {
  display: '"Fraunces", serif',
  body: '"Inter", system-ui, sans-serif',
}

export const TWILIGHT: ThemeSpec = {
  id: 'twilight',
  name: 'Twilight Violet',
  subtitle: 'Original — Xtract DNA, deep purple twilight',
  mode: 'dark',
  displayFamily: FAMILIES.display,
  bodyFamily: FAMILIES.body,
  vars: {
    '--ink': '#0B0717',
    '--ink-2': '#0F0A1F',
    '--ink-3': '#15102B',
    '--surface': 'rgba(15,10,31,.55)',
    '--surface-2': 'rgba(20,14,40,.6)',
    '--brand': '#6E5CFF',
    '--brand-soft': '#9C8EFF',
    '--accent-a': '#27D4B0',
    '--accent-b': '#F5C26B',
    '--accent-c': '#FF5A1F',
    '--ember': '#FFB347',
    '--ember-2': '#FF3D00',
    '--paper': '#E9E5F5',
    '--paper-dim': '#B8B0D6',
    '--line': 'rgba(233,229,245,.10)',
    '--line-2': 'rgba(233,229,245,.06)',
    '--hero-bg': `
      radial-gradient(60% 50% at 18% 20%, rgba(110,92,255,.35), transparent 60%),
      radial-gradient(70% 60% at 82% 30%, rgba(156,142,255,.25), transparent 60%),
      radial-gradient(50% 40% at 50% 95%, rgba(110,92,255,.18), transparent 60%),
      linear-gradient(180deg,#1A1132 0%,#0F0A1F 60%,#0B0717 100%)
    `,
    '--audits-bg': `
      radial-gradient(50% 60% at 0% 0%, rgba(110,92,255,.28), transparent 60%),
      linear-gradient(180deg,#0B0717,#100A22)
    `,
    '--spotlight-bg': `
      radial-gradient(60% 50% at 100% 30%, rgba(39,212,176,.18), transparent 60%),
      radial-gradient(40% 50% at 0% 80%, rgba(110,92,255,.18), transparent 60%),
      linear-gradient(180deg,#0E0A1F,#0B0717)
    `,
    '--bleed-bg': `
      radial-gradient(80% 60% at 50% 0%, rgba(110,92,255,.5), transparent 60%),
      radial-gradient(60% 60% at 50% 100%, rgba(39,212,176,.25), transparent 60%),
      linear-gradient(180deg,#1A1340,#0F0A22)
    `,
    '--contact-bg': `
      radial-gradient(50% 70% at 0% 100%, rgba(110,92,255,.3), transparent 60%),
      radial-gradient(50% 70% at 100% 0%, rgba(110,92,255,.18), transparent 60%),
      linear-gradient(180deg,#100A22,#15102B)
    `,
    '--footer-bg': '#080510',
    '--shield-grad':
      'linear-gradient(160deg,rgba(255,255,255,.15),rgba(255,255,255,.02) 35%,rgba(110,92,255,.25) 80%),linear-gradient(180deg,#1B1340 0%,#0E0926 100%)',
  },
}

export const DAYBREAK: ThemeSpec = {
  id: 'daybreak',
  name: 'Daybreak',
  subtitle: 'Bright paper · ink type · violet accents',
  mode: 'light',
  displayFamily: FAMILIES.display,
  bodyFamily: FAMILIES.body,
  vars: {
    '--ink': '#FBF9F4',
    '--ink-2': '#F2EEE5',
    '--ink-3': '#EAE4D5',
    '--surface': 'rgba(255,255,255,.7)',
    '--surface-2': 'rgba(255,255,255,.85)',
    '--brand': '#5B49E0',
    /* Was #7E6DFF (3.78:1 on cream); darkened to pass WCAG 1.4.3 4.5:1
       on small text while preserving the violet hue of brand-soft. */
    '--brand-soft': '#3F33B8',
    '--accent-a': '#0F8C6E',
    '--accent-b': '#B8852D',
    '--accent-c': '#E14B16',
    '--ember': '#FFB347',
    '--ember-2': '#E14B16',
    '--paper': '#1A1530',
    '--paper-dim': '#5C5670',
    '--line': 'rgba(26,21,48,.12)',
    '--line-2': 'rgba(26,21,48,.06)',
    '--hero-bg': `
      radial-gradient(60% 50% at 18% 20%, rgba(110,92,255,.22), transparent 60%),
      radial-gradient(70% 60% at 82% 30%, rgba(245,194,107,.18), transparent 60%),
      radial-gradient(50% 40% at 50% 95%, rgba(15,140,110,.10), transparent 60%),
      linear-gradient(180deg,#FFFDF7 0%,#F6F0E2 60%,#EFE7D3 100%)
    `,
    '--audits-bg': `
      radial-gradient(50% 60% at 0% 0%, rgba(110,92,255,.14), transparent 60%),
      linear-gradient(180deg,#FBF9F4,#F4EFE2)
    `,
    '--spotlight-bg': `
      radial-gradient(60% 50% at 100% 30%, rgba(15,140,110,.10), transparent 60%),
      radial-gradient(40% 50% at 0% 80%, rgba(110,92,255,.10), transparent 60%),
      linear-gradient(180deg,#F8F4E9,#FBF9F4)
    `,
    '--bleed-bg': `
      radial-gradient(80% 60% at 50% 0%, rgba(110,92,255,.30), transparent 60%),
      radial-gradient(60% 60% at 50% 100%, rgba(245,194,107,.18), transparent 60%),
      linear-gradient(180deg,#EAE4D5,#F2EEE5)
    `,
    '--contact-bg': `
      radial-gradient(50% 70% at 0% 100%, rgba(110,92,255,.18), transparent 60%),
      radial-gradient(50% 70% at 100% 0%, rgba(245,194,107,.16), transparent 60%),
      linear-gradient(180deg,#F2EEE5,#EAE4D5)
    `,
    '--footer-bg': '#1A1530',
    '--shield-grad':
      'linear-gradient(160deg,rgba(255,255,255,.95),rgba(255,255,255,.6) 35%,rgba(110,92,255,.25) 80%),linear-gradient(180deg,#FFFFFF 0%,#EDE7FF 100%)',
  },
}

export const ROYAL_DARK: ThemeSpec = {
  id: 'royal-dark',
  name: 'Royal Blue on Black',
  subtitle: 'Electric royal · onyx · platinum accents',
  mode: 'dark',
  displayFamily: FAMILIES.display,
  bodyFamily: FAMILIES.body,
  vars: {
    '--ink': '#03060F',
    '--ink-2': '#060A1A',
    '--ink-3': '#0A1230',
    '--surface': 'rgba(8,12,28,.6)',
    '--surface-2': 'rgba(8,12,28,.75)',
    '--brand': '#2B5BFF',
    '--brand-soft': '#6E8CFF',
    '--accent-a': '#43E0F5',
    '--accent-b': '#E8C26A',
    '--accent-c': '#FF6A2C',
    '--ember': '#FFB347',
    '--ember-2': '#FF3D00',
    '--paper': '#E8EEFF',
    '--paper-dim': '#9AA8CC',
    '--line': 'rgba(232,238,255,.10)',
    '--line-2': 'rgba(232,238,255,.06)',
    '--hero-bg': `
      radial-gradient(60% 50% at 18% 20%, rgba(43,91,255,.45), transparent 60%),
      radial-gradient(70% 60% at 82% 30%, rgba(110,140,255,.22), transparent 60%),
      radial-gradient(50% 40% at 50% 95%, rgba(67,224,245,.12), transparent 60%),
      linear-gradient(180deg,#0A1338 0%,#04081C 60%,#020512 100%)
    `,
    '--audits-bg': `
      radial-gradient(50% 60% at 0% 0%, rgba(43,91,255,.32), transparent 60%),
      linear-gradient(180deg,#03060F,#070D24)
    `,
    '--spotlight-bg': `
      radial-gradient(60% 50% at 100% 30%, rgba(67,224,245,.12), transparent 60%),
      radial-gradient(40% 50% at 0% 80%, rgba(43,91,255,.22), transparent 60%),
      linear-gradient(180deg,#050920,#03060F)
    `,
    '--bleed-bg': `
      radial-gradient(80% 60% at 50% 0%, rgba(43,91,255,.55), transparent 60%),
      radial-gradient(60% 60% at 50% 100%, rgba(67,224,245,.2), transparent 60%),
      linear-gradient(180deg,#0A1338,#04081C)
    `,
    '--contact-bg': `
      radial-gradient(50% 70% at 0% 100%, rgba(43,91,255,.32), transparent 60%),
      radial-gradient(50% 70% at 100% 0%, rgba(43,91,255,.20), transparent 60%),
      linear-gradient(180deg,#070D24,#0A1230)
    `,
    '--footer-bg': '#02040C',
    '--shield-grad':
      'linear-gradient(160deg,rgba(255,255,255,.18),rgba(255,255,255,.02) 35%,rgba(43,91,255,.35) 80%),linear-gradient(180deg,#0E1A4A 0%,#04081C 100%)',
  },
}

/**
 * Royal Light — derived. Daybreak shape (light surfaces, dark type)
 * but the royal-blue brand identity preserved on toggle. Used as the
 * bright alternate for DocAI / BRAI / TRACR.
 */
export const ROYAL_LIGHT: ThemeSpec = {
  id: 'royal-light',
  name: 'Royal Blue Bright',
  subtitle: 'Royal blue brand · paper canvas · ink type',
  mode: 'light',
  displayFamily: FAMILIES.display,
  bodyFamily: FAMILIES.body,
  vars: {
    '--ink': '#F5F8FF',
    '--ink-2': '#ECF1FB',
    '--ink-3': '#DEE6F6',
    '--surface': 'rgba(255,255,255,.75)',
    '--surface-2': 'rgba(255,255,255,.9)',
    '--brand': '#2B5BFF',
    /* Was #6E8CFF (2.92:1 on light blue); darkened to pass WCAG 1.4.3
       4.5:1 on small text while keeping the royal-blue brand identity. */
    '--brand-soft': '#1E47CC',
    /* Was #0FA9C0 (~3.4:1 chip text); darkened to ~5:1 for WCAG 1.4.3. */
    '--accent-a': '#0A6F84',
    '--accent-b': '#B8852D',
    '--accent-c': '#FF6A2C',
    '--ember': '#FFB347',
    '--ember-2': '#E14B16',
    '--paper': '#0A1230',
    '--paper-dim': '#4A597A',
    '--line': 'rgba(10,18,48,.12)',
    '--line-2': 'rgba(10,18,48,.06)',
    '--hero-bg': `
      radial-gradient(60% 50% at 18% 20%, rgba(43,91,255,.22), transparent 60%),
      radial-gradient(70% 60% at 82% 30%, rgba(110,140,255,.18), transparent 60%),
      radial-gradient(50% 40% at 50% 95%, rgba(67,224,245,.12), transparent 60%),
      linear-gradient(180deg,#FFFFFF 0%,#EFF4FF 60%,#DCE6FA 100%)
    `,
    '--audits-bg': `
      radial-gradient(50% 60% at 0% 0%, rgba(43,91,255,.14), transparent 60%),
      linear-gradient(180deg,#F5F8FF,#E9EFFB)
    `,
    '--spotlight-bg': `
      radial-gradient(60% 50% at 100% 30%, rgba(67,224,245,.12), transparent 60%),
      radial-gradient(40% 50% at 0% 80%, rgba(43,91,255,.10), transparent 60%),
      linear-gradient(180deg,#EEF2FE,#F5F8FF)
    `,
    '--bleed-bg': `
      radial-gradient(80% 60% at 50% 0%, rgba(43,91,255,.30), transparent 60%),
      radial-gradient(60% 60% at 50% 100%, rgba(67,224,245,.20), transparent 60%),
      linear-gradient(180deg,#DEE6F6,#ECF1FB)
    `,
    '--contact-bg': `
      radial-gradient(50% 70% at 0% 100%, rgba(43,91,255,.18), transparent 60%),
      radial-gradient(50% 70% at 100% 0%, rgba(67,224,245,.18), transparent 60%),
      linear-gradient(180deg,#ECF1FB,#DEE6F6)
    `,
    '--footer-bg': '#0A1230',
    '--shield-grad':
      'linear-gradient(160deg,rgba(255,255,255,.95),rgba(255,255,255,.6) 35%,rgba(43,91,255,.30) 80%),linear-gradient(180deg,#FFFFFF 0%,#DEE6F6 100%)',
  },
}

export const THEMES: Readonly<Record<ThemeId, ThemeSpec>> = {
  twilight: TWILIGHT,
  daybreak: DAYBREAK,
  'royal-dark': ROYAL_DARK,
  'royal-light': ROYAL_LIGHT,
}

export function getTheme(id: ThemeId): ThemeSpec {
  const theme = THEMES[id]
  if (!theme) throw new Error(`Unknown theme: ${id}`)
  return theme
}
