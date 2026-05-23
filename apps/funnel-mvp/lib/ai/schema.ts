import { z } from 'zod'

/**
 * AI extraction schema. Mirrors services/funnel-mvp/src/ai/* but with
 * one additional `severity` field per item so the preview can rank.
 */

export const issueSchema = z.object({
  title: z.string().min(1),
  detail: z.string().min(1),
  chunk_id: z.string().optional(),
  severity: z.enum(['low', 'medium', 'high']).default('medium'),
})

export const extractionSchema = z.object({
  clauses: z.array(issueSchema).default([]),
  anomalies: z.array(issueSchema).default([]),
  missing_protections: z.array(issueSchema).default([]),
  ambiguities: z.array(issueSchema).default([]),
  overall_risk: z.enum(['low', 'medium', 'high']).default('medium'),
  summary: z.string().min(1),
})

export type ExtractionResult = z.infer<typeof extractionSchema>
export type Issue = z.infer<typeof issueSchema>

/** Generate a 2–3 issue preview text shown free, before paywall. */
export function buildPreview(extraction: ExtractionResult): string {
  const all: Array<{ title: string; detail: string; severity: string; bucket: string }> = [
    ...extraction.anomalies.map((x) => ({ ...x, bucket: 'anomaly' })),
    ...extraction.missing_protections.map((x) => ({ ...x, bucket: 'missing protection' })),
    ...extraction.ambiguities.map((x) => ({ ...x, bucket: 'ambiguity' })),
  ]
  const top = all
    .sort((a, b) => severityWeight(b.severity) - severityWeight(a.severity))
    .slice(0, 2)
  if (top.length === 0) {
    return `Overall risk: ${extraction.overall_risk}. ${extraction.summary}`
  }
  const lines = top.map((t) => `[${t.bucket}] ${t.title}`)
  return `Overall risk: ${extraction.overall_risk}.\n\nTop 2 of ${all.length} issues identified:\n- ${lines.join('\n- ')}\n\nUpgrade to see all ${all.length} issues + remediation guidance.`
}

function severityWeight(s: string): number {
  return s === 'high' ? 3 : s === 'medium' ? 2 : 1
}
