export const SOCIAL_LINKS = {
  linkedin:  'https://www.linkedin.com/company/bizlegal-ai',
  instagram: 'https://www.instagram.com/bizlegal_ai/',
  facebook:  'https://www.facebook.com/bizlegal_ai/',
  youtube:   'https://www.youtube.com/@bizlegal_ai',
  twitter:   'https://x.com/bizlegal_ai',
  github:    'https://github.com/aileadx10-boop',
} as const

export const SOCIAL_DISPLAY = [
  { label: 'LinkedIn',   href: SOCIAL_LINKS.linkedin,  icon: 'in' },
  { label: 'X / Twitter', href: SOCIAL_LINKS.twitter,   icon: 'x'  },
  { label: 'Instagram',  href: SOCIAL_LINKS.instagram, icon: 'ig' },
  { label: 'YouTube',    href: SOCIAL_LINKS.youtube,   icon: 'yt' },
  { label: 'Facebook',   href: SOCIAL_LINKS.facebook,  icon: 'fb' },
  { label: 'GitHub',     href: SOCIAL_LINKS.github,    icon: 'gh' },
] as const