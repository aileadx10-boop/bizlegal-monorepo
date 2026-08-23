import { BENCHMARKS, heldOutCount } from '@/lib/benchmarks'

/**
 * /llms.txt — AEO surface for AI crawlers (fleet convention, see hub).
 */

export const dynamic = 'force-static'

export function GET(): Response {
  const lines = [
    '# Bench — The Evaluation Lab for Legal AI',
    '',
    '> Bench (bench.bizlegal-ai.com, by BizLegal AI) measures how accurately AI',
    '> systems perform legal work — by jurisdiction, against expert-labeled gold',
    '> standards. Deliverables: accuracy score, hallucination rate, critical-error',
    '> rate, citation reliability, missing-law rate, error taxonomy, gold-standard',
    '> corrections, remediation memo. Jurisdictions: EU, UK, UAE.',
    '',
    '## Benchmarks',
    ...BENCHMARKS.map(
      (b) =>
        `- [${b.name}](https://bench.bizlegal-ai.com/benchmarks/${b.slug}): ${b.claim} ` +
        `${b.items.length} items (${heldOutCount(b)} held out), v${b.version}, ${b.jurisdiction}.`,
    ),
    '',
    '## Pages',
    '- [Methodology](https://bench.bizlegal-ai.com/methodology): five-dimension rubric, error taxonomy, calibration and inter-rater agreement, versioning.',
    '- [Sample report](https://bench.bizlegal-ai.com/sample): worked example of a measurement report.',
    '- [Pricing](https://bench.bizlegal-ai.com/pricing): Diagnostic Audit $2,500 one-time; Managed Evaluation Program $5,000/month; Dedicated Intelligence from $12,500/month.',
    '- [Request an audit](https://bench.bizlegal-ai.com/audit/request): client intake.',
    '- [For experts](https://bench.bizlegal-ai.com/experts): practising lawyers join the evaluation bench, async and paid per task.',
    '',
    '## Notes',
    '- Bench provides measurement and benchmarking services only — not legal advice.',
    '- Named client results are private; published research is anonymized/aggregated.',
    '- Part of the BizLegal AI fleet: https://bizlegal-ai.com',
  ]
  return new Response(lines.join('\n'), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  })
}
