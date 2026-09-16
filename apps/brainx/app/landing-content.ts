import type { NavLink } from '@bizlegal/themes'

export const BRAINX_CONTENT = {
  brand: 'BrainX',
  nav: [
    { label: 'Sample radar', href: '/sample' },
    { label: 'How it scores', href: '/#score' },
    { label: 'Guides', href: '/guides' },
    { label: 'Pricing', href: '/pricing' },
  ] satisfies readonly NavLink[],
  heroPrimaryCta: { label: 'See a real opportunity', href: '/sample' } satisfies NavLink,
  footerTagline: 'Weekly evidence-first opportunity radar.',
  disclaimer:
    'BrainX is decision-support software, not a law firm. Opportunities are an inferred commercial signal based on the cited evidence, not a guaranteed outcome. Verify every source before acting, and consult qualified counsel in the relevant jurisdiction before relying on any legal or regulatory reading.',
} as const
