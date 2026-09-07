# agents/outbound — the AI outbound engine (rule 7 v2, 2026-09-07)

**What it is:** the agent-side half of the outbound engine Moses authorised on 2026-09-07 ("llm and ai can scrape, persuade, headhunt and sell"). The deterministic half lives in `packages/email/src/outbound.ts` (invariants), `apps/hub/app/api/cron/outbound-dispatch` (the only sender), `apps/hub/app/api/webhooks/outbound` (feedback), `apps/hub/app/api/sales/campaigns` + `/sales` (per-campaign approval). Decision: `decisions/OUTBOUND-V2-RULE-7-AMENDED-2026-09-07.md`. SOP: `decisions/workflows/outbound_campaign.md`.

**Files**
- `ROUTINE-headhunter.md` — prompt for the Claude Code cloud routine `bizlegal-outbound-headhunter` (Clay + Supabase connectors): target → source → draft → classify replies → digest. Survives $0 Anthropic API credit because it runs on the subscription.
- `templates/us-solo-revenue-report.md` — campaign #1: two persuasion variants + the approved reply set, selling the free totals of `/practice-revenue`.
- `templates/partners-bookkeepers.md` — campaign #2: affiliate invitation to law-practice bookkeepers and practice consultants.

**Rules that bind every file here**
- Never construct or guess an address; the routine writes only provider-returned, published addresses with a `source_url`.
- v1 jurisdiction is US only (`lib/outbound/lawful-basis.ts`). No EU, no Israel.
- Every template is a draft; the package appends the CAN-SPAM footer; nothing here sends.
- No call, meeting or demo anywhere; async CTA only. No "safe", "compliant", "guaranteed". Every number needs a source.
- Signature in cold mail is "Moses Dor, founder, BizLegal AI — a software company, not a law firm" (no "Adv."; Moses to confirm).
- Counts reported to Moses come from tables, never from the routine's memory.

**Envs (vault names, values by Moses):** `OUTBOUND_AUTOSEND`, `OUTBOUND_SENDING_DOMAIN`, `OUTBOUND_POSTAL_ADDRESS`, `INSTANTLY_API_KEY`, `INSTANTLY_WEBHOOK_SECRET`, `ZEROBOUNCE_API_KEY`. Deploy target: hub (Vercel) + the cloud routine.
