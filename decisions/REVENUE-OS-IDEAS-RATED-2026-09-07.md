# Revenue OS ideas — researched, rated, and the two builds that followed (2026-09-07)

**Status:** decided · **Owner:** Moses · **Orders:** O-020 (Practice Revenue Report), O-021 (AI outbound, rule 7 v2) · **Plan:** `~/.claude/plans/read-1-the-verdict-abundant-wombat.md`

## 1. What was asked

Moses pasted a three-part AI conversation — a "Legal Revenue OS" verdict, fifteen "mingled" ideas, a Base44-class platform plan and a solo-introvert 90-day sprint — and asked for research, sharpening and a rating of the ideas **against the infrastructure that already exists in this monorepo**, under five rules: fully automated, introvert (no calls), solopreneur, international, and (added mid-plan) **the machine does the selling** — "llm and ai can scrape, persuade, headhunt and sell".

## 2. What the market says (sources at the end)

| Finding | Number | Source |
|---|---|---|
| Lawyers' working time that becomes collected revenue | ~30% (utilization 38% × realization 88% × collection 93%) | Clio Legal Trends 2025 (secondary quotes; primary PDF to be verified by Moses) |
| Solo hourly average | $288 | Embroker solo statistics (ABA-derived) |
| Solos using practice-management software | 38% | Embroker / ABA TechReport |
| Solos who say admin eats practice time | 77% | Embroker |
| Passive time-capture market | PointOne $16M Series A (Mar 2026); Clio Duo $149/user; MyCase Smart Time Finder $39/user; Billables.ai $39–99; Tempello $0.49 per billable email (needs Clio/MyCase); WiseTime/Memtime $12–40 | PointOne roundup, Tempello site |
| Gmail `readonly` scope | restricted → CASA assessment $500–4,500, re-verified every 12 months | Google restricted-scope verification |
| ABA Opinion 512 | informed consent before confidential client information enters a self-learning tool | ABA Formal Opinion 512 (2024) |
| Freelancers / SMBs | owed $6,000 avg; 56% of US SMBs hold unpaid invoices averaging $17,500 | Clockify / Agiled late-payment statistics |
| Platform play | Lovable $0→$200M ARR in 12 months; Base44 $100M ARR nine months after Wix's $80M acquisition | CTech, ARR Club |
| Cold email legality | US CAN-SPAM opt-out; CA CASL implied consent via conspicuous publication; AU Spam Act inferred consent; UK PECR corporate-only (sole traders need consent); Israel Amendment 40 opt-in | see §5 |
| Cold email physics | dedicated domain; 2–4 weeks warm-up; 30–50 mails/mailbox/day; spam rate < 0.1% (0.3% = rejection); Resend AUP bans cold mail outright | Mailreach, Google/Yahoo sender rules, resend.com/legal/acceptable-use |

**The gap nobody fills:** every "find missed billable time" product is a desktop agent, an OAuth connection or a practice-management add-on. None is zero-permission, one-time and PMS-independent — and the 62% of solos with no PMS cannot use any of them.

## 3. The rating

Weights: reuse of existing infra ×3 · time to first stranger dollar ×3 · zero-permission/trust ×2 · liability ×2 · automation & introvert fit ×2 · differentiation ×2 · cost under cap ×1 · international ×1 · compounding ×1 → normalised to 100. Fleet reality that dominates: $0 captured across 12 surfaces (verified 2026-08-23) and zero real inbound humans in 90 days.

| # | Idea | Score | Verdict |
|---|---|---|---|
| 1 | **Practice Revenue Report** — invoice CSV (+ optional time CSV) → deterministic leak report; free totals; $99 unlock | **93** | **BUILT (A)** — `/practice-revenue` |
| 2 | **AI outbound engine** — Clay-sourced, verified, insight-led email to US solos; per-campaign approval; auto replies | **88** | **BUILT (B)** — rule 7 amended |
| 3 | Dogfood on Moses's own export → the article | 90 | drafted with `[placeholders]` |
| 4 | Partner headhunting → affiliate program | 82 | campaign #2 in B |
| 5 | Inbox Money Audit (Sent-mail export/forward + LLM) | 74 | LATER — gate ≥3 paid reports; needs CaseAudit's confidentiality package + LLM spend |
| 6 | Monthly monitor / "Revenue Ritual" delta email | 80 | LATER — gate ≥10 paid + recurring card billing (F5) closed; SellerRadar monitor cron is the template |
| 7 | Practice continuity kit $49 | 79 | LATER — kit rule: after two memos |
| 8 | Consultant/agency variant (invoice-only, new copy) | 78 | LATER — same engine, second landing + second ICP |
| 9 | Shadow-firm benchmark | 69 | LATER — ≥50 reports |
| 10 | Client archetypes ("poker tells") | 55 | LATER — seed = reply-intent classifier |
| 11–16 | Matter autopsy · profitability map ("reprice or decline new work") · time machine (timing, never gains) · dormant drafts (never sent by us) · plain section labels · provenance hash | — | folded into A |
| 17 | Forward-10-threads micro-audit | — | = #5 lead magnet |
| 18 | Malpractice-insurer data | — | park (year 2) |
| 19 | Invoice lottery | 30 | KILL — gimmick, no-hype voice |
| 20 | Second-chair marketplace | 25 | KILL — marketplace endgame already killed |
| 21 | Matter-swap referral network | 20 | KILL — referral-fee splitting (Rule 5.4/7.2) |
| 22 | Meme factory / LinkedIn automation | 20 | KILL — LinkedIn manual-only; ToS |
| 23 | Law-firm rollup | 15 | KILL — not solo, not automated |
| 24 | Base44-class platform | 10 | KILL — $100–200M-ARR incumbents; three engineers minimum |
| 25 | 7-agent Revenue OS SaaS $299–599/mo | 30 | KILL for now — seats and matter-tracking SaaS rejected on record; recurring billing not live |
| 26 | Gmail-OAuth "Revenue Radar" | 20 | KILL — CASA + ABA 512 + trust wall |
| 27 | Success fee (% of collections) | 15 | KILL — Rule 5.4 exposure; flat fees only |
| 28 | Israel-first, Hebrew doc AI, court integration | 10 | KILL — international; no Hebrew; Israeli spam law |

## 4. What was built (2026-09-07, branch `feat/revenue-marathon`)

**A — Practice Revenue Report** (`decisions/workflows/practice_revenue_report.md`): pure engine with 27 tests against hand-computed answers; browser-side pseudonymisation so no client name is stored; free totals + one teaser row; $99 unlock through `/api/pay/start` → both webhooks → `lib/payments/practice-revenue-grant.ts`; migration `20260908_practice_revenue_reports.sql`. Benchmarks hidden until Moses flips `verified`.

**B — Outbound engine** (`decisions/OUTBOUND-V2-RULE-7-AMENDED-2026-09-07.md`, `decisions/workflows/outbound_campaign.md`): kind `outbound` in `@bizlegal/email` with 23 invariants and 33 tests; dispatch cron as the only sender; Instantly adapter; webhook; campaigns API + `/sales` panel; migration `20260908_outbound_v2.sql`; templates + reply sets for campaigns #1 and #2; routine prompt. Sends stay dark until Moses sets the vault values and `OUTBOUND_AUTOSEND=1`.

## 5. The outbound legal matrix (v1 = US only)

| Jurisdiction | Regime | v1 |
|---|---|---|
| US | CAN-SPAM: accurate headers, non-deceptive subject, postal address, unsubscribe honoured ≤ 10 business days | **yes** |
| Canada | CASL implied consent only where the business email is conspicuously published and the message is relevant; sender address required | phase 2 (`source_url` evidence already stored) |
| Australia | Spam Act inferred consent via conspicuous publication with no no-unsolicited statement | phase 2 |
| UK | PECR: corporate subscribers only; sole traders and partnerships are individuals | phase 2, companies only |
| EU | member-state variance (Germany requires consent even B2B) | excluded |
| Israel | Amendment 40 opt-in; only a one-time non-advertising "may we send you ads?" request is lawful | excluded; Moses to confirm it does not bind an Israeli sender mailing US businesses |

## 6. Gates for what comes next

- Phase 2 (Inbox Money Audit, $149): ≥ 3 non-Moses paid reports.
- Phase 3 (monthly monitor): ≥ 10 paid reports and PayPal recurring (F5) closed.
- Outbound phase 2 jurisdictions: Moses flips `enabled` in `lib/outbound/lawful-basis.ts` per row after confirming the requirements.
- Kill: 0 paid reports 45 days after ≥ 200 verified sends → reprice or re-target before adding anything.

## 7. Contradictions found this session (Moses to adjudicate)

- FirmCited `/grok-bot` (O-019) offers a "30-min setup call" and a workshop; `decisions/PHASE-1-INTROVERT-FOUNDER.md` and `AI-TEAMMATES-FOUR-CS-2026-09-06.md` forbid both.
- `growth_agent.py` + `/api/cron/social-queue` auto-post to LinkedIn and Reddit; `agents/socials/CLAUDE.md` says LinkedIn is manual-only and Reddit needs a ToS review.

## Sources

Clio benchmarks page and 2025 Legal Trends summaries (clio.com/resources/legal-trends/benchmarks; tlturnergroup.com 2025 summary) · Embroker "50 Solo Law Firm Statistics" · PointOne "AI Time Tracking for Lawyers: 10 Best Tools (July 2026)" · tempello.ai · MyCase Smart Time Finder help centre · Google "Restricted scope verification" and CASA guides · ABA Formal Opinion 512 (americanbar.org, July 2024) · Clockify / Agiled late-payment statistics 2026 · CTech "Base44 hits $100M ARR" · Mailreach "How many cold emails per day (2026)" · Google/Yahoo bulk-sender requirements 2026 · resend.com/legal/acceptable-use · Israeli Amendment 40 commentary (Mondaq, law.co.il) · CASL / Spam Act / PECR summaries (Egressif, Puzzle Inbox, TermsFeed).
