import { buildLlmsTxt } from '@bizlegal/themes'

/** /llms.txt — AEO surface for AI crawlers (fleet convention, see hub). */
export const dynamic = 'force-static'

export function GET(): Response {
  const body = buildLlmsTxt({
    name: 'CoGuard — co-parenting communication & evidentiary record',
    host: 'https://coguard.bizlegal-ai.com',
    summary:
      'CoGuard (coguard.bizlegal-ai.com, by BizLegal AI) gives separated parents a tone-checked\n' +
      'communication channel and a court-ready, Bates-numbered record of what was actually said.\n' +
      'Outgoing messages are rewritten to BIFF (brief, informative, friendly, firm); incoming\n' +
      'messages are logged unchanged. Plans $14.99–$29.99/month; attorney read-only portal.',
    links: [
      { label: 'Home', path: '/', note: 'what CoGuard records and why the record holds up.' },
      { label: 'Pricing', path: '/pricing', note: 'Solo and Family plans, monthly, cancel any time.' },
    ],
    notes: [
      'CoGuard is a communication and record-keeping tool. It is not legal advice and does not predict how a court will treat any message.',
    ],
  })
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } })
}
