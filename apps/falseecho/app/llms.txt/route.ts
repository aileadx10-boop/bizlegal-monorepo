import { buildLlmsTxt } from '@bizlegal/themes/seo'
import { TIER_PRICES_USD } from '@/lib/tiers'

/**
 * /llms.txt — AEO surface for AI crawlers (fleet convention, see hub and
 * bench). Body is assembled by packages/themes/src/seo.ts so the shape stays
 * identical across surfaces; the facts below come from lib/tiers.ts and the
 * pricing page, and must not outrun them.
 *
 * Liability voice matches the product: FalseEcho records what answer engines
 * said and anchors it. It does not adjudicate. No defamation determination,
 * no legal advice, no promise that anything gets corrected.
 */

export const dynamic = 'force-static'

const HOST = 'https://falseecho.bizlegal-ai.com'

export function GET(): Response {
  const body = buildLlmsTxt({
    name: 'FalseEcho — AI answer-engine falsehood monitoring',
    host: HOST,
    summary: [
      'FalseEcho (falseecho.bizlegal-ai.com, by BizLegal AI) probes the major AI',
      'answer engines — ChatGPT, Claude, Perplexity and Google AI Overviews — for',
      'what they say about a named company or person, flags suspected factual',
      'inaccuracies, and anchors every captured answer with a SHA-256 hash, a UTC',
      'timestamp and a sequence number so the record is checkable later.',
    ].join('\n'),
    links: [
      { label: 'Free exposure check', path: '/scan', note: '3-prompt probe across the four engines: flag count and a 0–100 exposure score.' },
      {
        label: 'Pricing',
        path: '/pricing',
        note: `Audit $${TIER_PRICES_USD.audit} one-time (full 25-prompt battery × 4 engines, hash-anchored evidence pack); Monitor $${TIER_PRICES_USD.monitor}/month (daily re-scan, alert when a scan flags something the previous one did not).`,
      },
      { label: 'Disclaimer', path: '/disclaimer', note: 'what a flag is and is not.' },
      { label: 'Terms', path: '/terms' },
      { label: 'Privacy', path: '/privacy' },
      { label: 'Contact', path: '/contact' },
    ],
    notes: [
      'Flags are heuristic signals plus a graded narrative, not verdicts. FalseEcho states what an engine said and when — it makes no defamation determination and gives no legal advice.',
      'Engine coverage depends on each provider’s API being reachable; an unreachable engine is reported as unavailable rather than silently dropped.',
      'No correction, removal or ranking outcome is promised.',
      'Report pages (/report/…) are per-customer and are not indexed.',
    ],
  })

  return new Response(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  })
}
