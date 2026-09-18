import { NextResponse } from 'next/server'

/**
 * GEO asset — machine-readable summary of DEAL44 for LLM crawlers.
 * Serves a bilingual (Hebrew-first) plain-text brief at /llms.txt, matching
 * the fleet pattern (hub, bench, cited, blog all ship llms.txt).
 */
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const TEXT = `# DEAL44 — חדר עסקה לנדל"ן
# Hebrew/RTL multi-party property deal rooms
# https://llmstxt.org

> DEAL44 is a Hebrew/RTL digital deal room (דיל רום) for Israeli real-estate
> transactions. Brokers and the parties to a deal share one task list: every
> party, every deadline, one room. Reminders go out before each deadline.
> Setup ₪2,500 (~$679 one-time) + ₪349/month. English twin: /en.

## Key facts
- Who: Israeli real-estate brokers and deal parties (buyer, seller, bank,
  lawyers, Tabu / רמ"י / title registration).
- What: a shared multi-party task list / deal room with deadline reminders.
- Offer: one-time setup ₪2,500 (~$679) + ₪349/month; English twin $679.
- Legal: task templates are practitioner-reviewed for Israeli practice
  (30-day s.73 declarations as the only computed clock; separate templates for
  Tabu / רמ"י / חברה משכנת; no auto-dates) — see il_residential_milestones.
- Compliance: Israeli property law; no cold acquisition (Israel opt-in law);
  fleet liability-shield TOS applies.

## Main pages
- https://deal44.bizlegal-ai.com/ — landing (HE, RTL)
- https://deal44.bizlegal-ai.com/en — landing (EN)
- https://deal44.bizlegal-ai.com/start — start a deal (ILS = crypto-only, USD = both rails)
- https://deal44.bizlegal-ai.com/pricing — ₪2,500 + ₪349/mo
`

export async function GET(): Promise<NextResponse> {
  return new NextResponse(TEXT, {
    status: 200,
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  })
}
