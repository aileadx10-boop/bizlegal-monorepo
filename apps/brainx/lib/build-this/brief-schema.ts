import { z } from 'zod'

/**
 * Schema for a BUILD THIS brief, written by a Claude Code session following
 * agents/brainx/build-this/prompt.md and validated by tools/ingest-brief.ts.
 * Every section cites evidence_ids that must be a subset of the opportunity's
 * own evidence — a brief cannot introduce a new, unverified source.
 */

const section = z.strictObject({
  text: z.string().min(20).max(3000),
  evidence_ids: z.array(z.string()).max(20),
})

export const brief = z.strictObject({
  offer: section,
  buyer: section,
  deliverable: section,
  pricing_hypothesis: section,
  sales_angle: section,
  landing_page_brief: section,
  delivery_workflow: section,
  evidence_pack: section,
  next_actions: section,
})

export type BriefInput = z.infer<typeof brief>

const URL_IN_PROSE = /https?:\/\/[^\s)>\]"']+/gi

/** A brief may only cite URLs that are already in its own evidence pack — never a fresh, unverified one. */
export function briefUrlViolations(b: BriefInput, attachedEvidenceUrls: readonly string[]): string[] {
  const allowed = new Set(attachedEvidenceUrls)
  const out: string[] = []
  for (const [key, sec] of Object.entries(b) as [string, z.infer<typeof section>][]) {
    for (const m of sec.text.match(URL_IN_PROSE) ?? []) {
      if (!allowed.has(m)) out.push(`${key}: URL not in evidence pack: ${m}`)
    }
  }
  return out
}
