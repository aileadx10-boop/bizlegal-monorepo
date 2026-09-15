import { buildLlmsTxt } from '@bizlegal/themes/seo'

/**
 * llmstxt.org summary for answer engines. Every claim here has to survive a
 * reader checking it: text-layer PDFs only, one lease per purchase, and the
 * abstract is decision support — a document-analysis tool, not legal advice.
 */

export const dynamic = 'force-static'

const BODY = buildLlmsTxt({
  name: 'LeaseParse — commercial lease abstracting',
  host: 'https://leaseparse.bizlegal-ai.com',
  summary: [
    'LeaseParse turns one commercial lease PDF into a structured abstract: parties, premises, term, rent and escalations, options, and the critical dates (expiration, renewal notice windows, termination rights) with the notice period attached to each.',
    'It also flags the clauses that tend to cost money later — assignment, indemnity, holdover, relocation, personal guaranty — quoting the lease verbatim rather than paraphrasing it.',
    '$59 per lease, one-time. No subscription, no portfolio tier.',
  ].join('\n'),
  links: [
    { label: 'Home and pricing', path: '/', note: '$59 per lease abstract, one-time' },
  ],
  notes: [
    'Text-layer PDFs only. A scanned or image-only lease is detected before any model sees it and the order is refundable — LeaseParse has no OCR.',
    'One purchase covers exactly one lease abstract.',
    'The abstract is decision support for reviewing a lease you already have. It is not legal advice, and BizLegal AI (DOR INNOVATIONS) is a software company, not a law firm. Verify every date against the executed lease before acting on it.',
  ],
})

export function GET(): Response {
  return new Response(BODY, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  })
}
