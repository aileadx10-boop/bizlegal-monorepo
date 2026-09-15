/**
 * CasePage gallery seed — clean-room template data.
 * Every page ships with byline + reviewed-by + source line (phase gating).
 * No outcome guarantees. The 100-page surface area is scheduled after G0;
 * this is the week-1 canonical set.
 */
export interface GallerySeed {
  slug: string
  title: string
  question: string
  answer: string
  byline: string
  reviewedBy: string
  source: string
  jurisdiction: string
}

export const GALLERY_SEEDS: GallerySeed[] = [
  {
    slug: 'residential-closing-dubai',
    title: 'Residential closing milestones (Dubai)',
    question: 'What happens after the Dubai residential SPA is signed?',
    answer: 'After signing, the key milestones are deposit clearance, Oqood title registration, service-charge clearance, and the DLD transfer date. Verify each against the current DLD rules.',
    byline: 'Moses Dor',
    reviewedBy: 'Moses Dor, Adv.',
    source: 'Dubai Land Department guidance; verify against current rules.',
    jurisdiction: 'dubai',
  },
  {
    slug: 'divorce-matter',
    title: 'Divorce matter milestones',
    question: 'What should a client track after filing for divorce?',
    answer: 'Typical milestones include filing, temporary orders, discovery, settlement negotiations, and final decree submission. Exact sequence varies by jurisdiction.',
    byline: 'Moses Dor',
    reviewedBy: 'Moses Dor, Adv.',
    source: 'General law-firm process examples; verify jurisdiction-specific rules.',
    jurisdiction: 'us',
  },
  {
    slug: 'personal-injury-case',
    title: 'Personal injury case milestones',
    question: 'What are the main checkpoints in a PI case?',
    answer: 'Main checkpoints are demand letter, discovery, mediation, trial date, and settlement approval. No outcome guarantee; timelines vary by court.',
    byline: 'Moses Dor',
    reviewedBy: 'Moses Dor, Adv.',
    source: 'General PI process; verify by jurisdiction.',
    jurisdiction: 'us',
  },
  {
    slug: 'llc-formation',
    title: 'LLC formation milestones',
    question: 'What steps does an LLC formation take?',
    answer: 'Typical steps: name check, filing articles, operating agreement, EIN, bank account. Exact state rules vary.',
    byline: 'Moses Dor',
    reviewedBy: 'Moses Dor, Adv.',
    source: 'General state LLC formation process; verify state rules.',
    jurisdiction: 'us',
  },
]
