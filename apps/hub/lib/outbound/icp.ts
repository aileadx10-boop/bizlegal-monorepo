/**
 * ICP (target definition) as data. A campaign stores one of these in
 * sales_campaign.icp; the sourcing routine reads it, the dashboard shows it,
 * and Moses approves it together with the template and the cap.
 */
import { z } from 'zod'

export const IcpSchema = z.object({
  name: z.string().min(3).max(120),
  jurisdictions: z.array(z.string().length(2)).min(1).default(['US']),
  practiceAreas: z.array(z.string().min(2)).min(1),
  excludePracticeAreas: z.array(z.string()).default(['personal injury', 'contingency', 'class action']),
  firmSizeMax: z.number().int().min(1).max(50).default(5),
  billingModel: z.enum(['hourly', 'flat', 'mixed']).default('hourly'),
  languages: z.array(z.string()).default(['en']),
  excludeDomains: z.array(z.string()).default([]),
  targetCount: z.number().int().min(1).max(2000).default(200),
  notes: z.string().max(2000).optional(),
})

export type Icp = z.infer<typeof IcpSchema>

export function parseIcp(raw: unknown): { ok: true; icp: Icp } | { ok: false; error: string } {
  const r = IcpSchema.safeParse(raw)
  if (r.success) return { ok: true, icp: r.data }
  return { ok: false, error: r.error.issues.map((i) => `${i.path.join('.') || 'icp'}: ${i.message}`).join('; ') }
}

/** Campaign #1 — US solo and small hourly-billing firms, the Practice Revenue Report offer. */
export const US_SOLO_REVENUE_ICP: Icp = IcpSchema.parse({
  name: 'US solo/small hourly-billing firms — Practice Revenue Report',
  jurisdictions: ['US'],
  practiceAreas: ['business law', 'commercial litigation', 'family law', 'real estate', 'estate planning', 'employment law', 'intellectual property'],
  excludePracticeAreas: ['personal injury', 'contingency', 'class action', 'criminal defense'],
  firmSizeMax: 5,
  billingModel: 'hourly',
  languages: ['en'],
  excludeDomains: [],
  targetCount: 200,
  notes: 'Owner or managing attorney only. Published business address on the firm site is the lawful-basis evidence (source_url). No role inboxes.',
})

/** Campaign #2 — partners who resell so Moses does not: law-practice bookkeepers and practice consultants. */
export const PARTNER_BOOKKEEPERS_ICP: Icp = IcpSchema.parse({
  name: 'US law-practice bookkeepers and practice-management consultants — affiliate invitation',
  jurisdictions: ['US'],
  practiceAreas: ['legal bookkeeping', 'law firm accounting', 'practice management consulting', 'law firm billing consulting'],
  excludePracticeAreas: [],
  firmSizeMax: 20,
  billingModel: 'mixed',
  languages: ['en'],
  excludeDomains: [],
  targetCount: 100,
  notes: 'Invite to the affiliate program (20% commission, tracked by referral code). Async only.',
})
