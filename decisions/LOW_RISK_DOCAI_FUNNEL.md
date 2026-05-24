# Low-Risk DocAI Funnel — Bot, Preview, and Revenue Gates

## Objective
Ship one paid `$97` evidence-cited contract risk report within 14 days using the existing DocAI flow, without deploying the separate Fastify/Firebase funnel before Z7 is green.

## Acquisition Rules
- X is the only automated social DM candidate in v1.
- LinkedIn stays manual or semi-manual; no automated LinkedIn DMs.
- No automated Instagram or Reddit solicitation.
- No unsolicited DMs: the user must comment `RISK`, DM first, or clearly request a scan.
- First production week cap: 20 DMs/day total.
- Every bot link must include `utm_source=bot&utm_medium=dm&utm_campaign=<bot_handle>&ref=<platform_comment_id>`.

## Classifier Gate
- Build a 100-comment manual eval set before production bot DMs.
- Launch only if precision is at least 80% for “real contract/legal deal concern.”
- If precision fails, tune prompts/rules and rerun the eval before sending any production DM.

## Outbound Copy
Use this safe default:

> You asked for a contract risk scan. Upload the draft here for an evidence-cited preview: <tracked link>. This is not legal advice. Reply STOP to opt out.

## Preview + Paid Offer
- Free preview shows two supported medium/high findings with visible severity and evidence snippets.
- Locked summary shows counts such as `+3 high-severity`, `+1 critical`, and `+4 missing protections`.
- Paid CTA: `$97` for an evidence-cited clause review formatted for attorney action.
- Refund line: “If the report cites an issue that is not actually supported by your uploaded document, request a refund within 7 days.”

## Grounding Rules
- Main findings require evidence references.
- Unsupported or weak findings move to “Needs Human Review” with no severity badge.
- Every customer-facing output includes: “This is not legal advice.”

## Payment Path
- Immediate path: existing DocAI NOWPayments and Payoneer/card links.
- Manual launch check: hosted Payoneer link must point to the `$97` report offer before traffic is sent.
- Stripe/Lemon/Paddle upgrade is post-Z7 unless current verification gate is already green.

## Secondary Organic Path
- LexAudit homepage includes “Free contract risk scan” CTA routing to DocAI with tracked UTM parameters.
- This reduces single-platform bot risk and gives organic traffic a second revenue path.

## Z7 Definition
Latest production deploy is green only when:
- Lighthouse score is at least 90.
- Auth path passes.
- Payment webhook unlocks a paid report.
- Scan API returns 200 on a known fixture.

## 14-Day Revenue Review
If no paid report ships within 14 days, review in order:
1. Classifier precision.
2. DM/source quality.
3. Preview copy and locked-risk counts.
4. Checkout friction.
5. Price and refund framing.
