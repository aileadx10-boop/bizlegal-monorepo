import { buildLlmsTxt } from '@bizlegal/themes/seo'

/**
 * /llms.txt — AEO surface for AI crawlers (fleet convention). No outcome
 * claims: this says what BrainX computes and how often, never what it will
 * find or save anyone.
 */

export const dynamic = 'force-static'

const HOST = 'https://brainx.bizlegal-ai.com'

export function GET(): Response {
  const body = buildLlmsTxt({
    name: 'BrainX — Opportunity Radar',
    host: HOST,
    summary: [
      'BrainX (brainx.bizlegal-ai.com, by BizLegal AI) is a weekly, operator-run',
      'opportunity radar across three verticals — real estate compliance, legal',
      'practice growth, and AI/fintech regulation. Every opportunity carries at',
      'least 3 verified public sources (an evidence vault) and a transparent',
      'seven-factor BrainX Decision Score v1. Subscribers can request a BUILD',
      'THIS brief — offer, buyer, deliverable, pricing hypothesis and next',
      'actions, every claim cited to an attached source.',
    ].join('\n'),
    links: [
      { label: 'Sample radar', path: '/sample', note: 'five real, evidence-verified opportunities — no signup.' },
      { label: 'Pricing', path: '/pricing', note: 'Radar $99/mo or $999/yr; Radar + Build $249/mo or $2,499/yr.' },
      { label: 'Disclaimer', path: '/disclaimer' },
      { label: 'Terms', path: '/terms' },
      { label: 'Privacy', path: '/privacy' },
      { label: 'Contact', path: '/contact' },
    ],
    notes: [
      'The radar runs weekly, not continuously — every opportunity shows the timestamp of the run that found it.',
      'No fabricated evidence: every source URL is independently resolved before an opportunity is published.',
      'Not legal advice. No outcome guarantee. Decision-support software, not a law firm.',
    ],
  })

  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } })
}
