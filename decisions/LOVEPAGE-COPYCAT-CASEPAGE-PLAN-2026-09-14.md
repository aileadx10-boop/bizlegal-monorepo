# CASEPAGE PLAY — legal copycat of YourLovePage/MRRPlanet into bizlegal-ai

**Date:** 2026-09-14 · **Status:** PROPOSED — awaiting Moses CONFIRM/REMOVE/CHANGE on §7 checklist
**Sources analyzed:** yourlovepage.com (live), mrrplanet.com/p/your-love-page (live), founder post ($694/mo, $1.6k total, 216 customers, 51 countries, 3 months, 100% organic search, templates = main driver)
**Fleet state:** BIZLEGAL_SYSTEM_MAP_MEMORY.md (2026-09-11 sync) · G0 = first payment 2026-09-20 · Anthropic credits $0 (blocker #1)

---

## 1. What the two sites actually proved

| Signal | YourLovePage | Lesson for us |
|---|---|---|
| $694/mo after 3 months, zero paid ads | B2C emotional-gift pages convert at ~$7–10 avg order purely via long-tail SEO | A page-builder with **template-first onboarding** can reach 4 figures/mo with no ad spend |
| Ready-made templates >> blank canvas | Most customers pick a template and tweak | Our onboarding must be: pick matter-type template → edit → publish. No blank states |
| Custom public URL (`/your-custom-url`) | Shareability IS the product | Every case page gets a firm-branded public URL = organic backlink + referral loop |
| AI couple portraits (14+ styles) | AI generation is the upsell hook, not the core | AI milestone summaries from matter facts = our upsell hook |
| Chat-history "who says I love you more" analysis | People pay for data-about-their-own-relationship | Firms pay for **intake analytics** (response-time league table, lead-source quality) |
| MRRPlanet: live transactions → animated pixel characters on 3D globe, per-product shared planets | Live social proof is a marketing engine | **Live milestone widget** on the firm's own site (anonymized, opt-in): "Matter #127 closed" |

## 2. Legal copycat boundary (the "legally" part)

- **Not protected:** the idea of personalized celebration/status pages, templates-as-onboarding, AI style transfer, public URLs, live social-proof widgets. We build all of it clean-room.
- **Protected — do NOT touch:** their code, their template layouts/copy/artwork, the "YourLovePage" name/trade dress, their exact page designs.
- **Trademark care:** do not market AI styles as "Pixar/Ghibli/etc." — use generic names ("3D animated", "storybook watercolor").
- **Privacy:** chat/document upload only with explicit consent + PII redaction BEFORE any LLM call (reuse `docai/lib/safe/redact` pattern). Pages are attorney-controlled; AI never writes anything public without attorney approval.
- **UPL shield (the liability shrinker):** CasePage is a *communication/status* surface, never legal advice. No outcome guarantees anywhere. Named-human-reviewer (Moses) on every template before it ships. TCPA: automated follow-up only ≤90-day inquiry leads.

## 3. The product — 5 mingled ideas → ONE app: **CasePage**

**One sentence:** CasePage lets a law firm spin up a beautiful, live, client-facing matter page in 3 minutes — milestones, timeline, doc checklist, next-hearing countdown — at a firm-branded public URL, plus an embeddable live-milestones widget for the firm's website.

| # | Idea (source) | CasePage adaptation | Revenue lever | Liability shrinker |
|---|---|---|---|---|
| 1 | Template-first love pages (YLP) | 8 matter-type templates (residential closing, divorce, PI, probate, LLC formation…) — pick → edit → publish | $49–149/mo firm plans; $490 setup | Templates pre-reviewed by Moses (named-human-reviewer); fixed legal-text blocks locked from client editing |
| 2 | Custom public URL (YLP) | `case.bizlegal-ai.com/matter-x7k2` per matter; client gets link, not a login | Shareability → referrals → SEO backlinks | Token-gated URLs (unguessable slug), no indexation of private pages by default |
| 3 | AI portraits/styles upsell (YLP) | AI-written milestone summaries from matter facts the ATTORNEY enters; attorney approves before publish | +$20/mo AI add-on | Human-in-the-loop: nothing AI-generated goes live unapproved; disclaimer auto-appended |
| 4 | "Who says I love you more" chat analytics (YLP) | Intake-leak analytics: avg response time per lead, which inquiries died unanswered — feeds FirmCited Leak Scan | Bridges into `revos_setup_2000` / `revos_monthly_750` | No PII stored raw; redaction-first; aggregates only |
| 5 | Live pixel-globe social proof (MRRPlanet) | Embeddable live milestone widget for firm sites: "3 closings this month 🔒" animated ticker, anonymized | Free viral widget → backlink + firm signup funnel | Strictly anonymized (matter type + count only, no names); opt-in per firm; kill switch |

## 4. Why this fits bizlegal-ai (not a distraction)

- **Serves G2 directly** (4 figures/mo by month 6) and the G0→G2 ladder without touching the W0 money gate.
- **Reuses everything already built:** hub `/api/pay/start` universal checkout → `payment_orders` → IPN → Resend fulfillment; Turnstile + Upstash rate-limit; Supabase prod; ops-spine logging; FirmCited `fc_*` intake tables for idea #4.
- **Funnels into the Revenue OS:** CasePage is the top-of-funnel wedge that exposes intake leaks (idea #4) and upsells `revos_monthly_750/1500`. One product, one funnel — 90/10 rule intact.
- **Kill-criterion safe:** firm self-serve onboarding from templates; no per-customer manual configuration.

## 5. Revenue stack & 6-month math ($2–3k/mo target)

| Tier | Price | What |
|---|---|---|
| Free | $0 | Template gallery + demo page (SEO asset + lead magnet) |
| Solo | $49/mo | 10 live pages, standard themes, milestone widget |
| Firm | $149/mo | Unlimited pages, white-label domain, AI summaries add-on |
| Setup | $490 one-time | Template pack + branding + widget install (mirrors FirmCited Gate-1 pricing) |
| **Lifetime** | **$290 one-time** | Firm plan, lifetime access — adopted from Local TTS lesson (on-device audio = zero marginal cost makes lifetime viable); cash funds runway, subs build MRR |
| Bridge | — | CasePage analytics → `revos_setup_2000` + `revos_monthly_750/1500` |

**Add-on feature (from Local TTS analysis 2026-09-15): "Listen to your matter"** — one-click audio narration of milestones via browser SpeechSynthesis (on-device, no API bill, zero marginal cost). Bundled in $149/mo + Lifetime tiers.

**Ramp model (conservative):**
- M1–2: build + 30 SEO template pages + 3 pilot firms (free, Moses's network)
- M3: 6 firms × ~$60 avg = $360/mo + 1 setup = **$850**
- M4: 12 firms × ~$70 = $840 + 2 setups = **$1,820**
- M5: 18 firms × ~$75 = $1,350 + 2 setups + 1 revos bridge = **$2,840**
- M6: 22 firms × ~$80 = $1,760 + setups + 1–2 revos bridges = **$3.1–3.7k/mo** ✅

Sensitivity: at 50% of plan we still clear $1.5k/mo; breakeven is ~3 paying firms.

## 6. Cost estimate (cash + effort)

| Item | Cost | Notes |
|---|---|---|
| Domain (casepage brand) | ~$12/yr | or serve under existing `*.bizlegal-ai.com` subdomain = $0 |
| Vercel / Supabase / Resend / Turnstile | $0 marginal | Already in fleet; within existing tiers |
| **Anthropic credits top-up** | **~$20–50 (BLOCKER)** | Fleet blocker #1 — required by G0 anyway; nothing LLM works until topped up |
| AI image gen (idea #3 v2) | deferred, paygo ~$0.03/img | Phase 2 only |
| Build effort | ~60–90 agent-hours | Template engine + hub checkout wiring + widget + 30 SEO pages |
| **Total cash to launch** | **<$100** | Main cost is dev time, which the existing fleet absorbs |

Apps/stack: Next.js app in `apps/casepage` (monorepo convention), `@bizlegal/payment` products file, Supabase `cp_*` tables, ops-spine logging, no new vendors (per WAT convention: look for existing tools first).

## 7. GRILL CHECKLIST — Moses must answer before build starts

Adapting the bizlegal-grill-me CONFIRM/REMOVE/CHANGE mechanic. Reply with C/R/C per line:

| # | Item | Default proposal | Your call |
|---|---|---|---|
| 1 | Product name | "CasePage" (casepage.bizlegal-ai.com to start, $0) | [ ] |
| 2 | Audience | B2B2C law firms only (B2C love-page clone deferred — off-brand, splits 90/10 focus) | [ ] |
| 3 | Pricing | $49 / $149 / $490-setup as above | [ ] |
| 4 | Sequencing | Build AFTER G0 (09-20) money gate; W0 must not slip. Start build 09-21 | [ ] |
| 5 | AI summaries | Ship with human-approval gate from day 1 (not after) | [ ] |
| 6 | Widget anonymization | Matter type + count only; no client names, ever | [ ] |
| 7 | First vertical templates | Dubai residential (reuse deal-engine pack), divorce, PI, LLC formation | [ ] |
| 8 | Checkout | hub `/api/pay/start` + NOWP/PayPal only (Stripe stays dead) | [ ] |

## 8. Next actions on CONFIRM

1. 09-15: top up Anthropic credits (unblocks G0 AND this build)
2. 09-21 (post-G0): scaffold `apps/casepage`, Supabase `cp_*` migration, wire hub checkout
3. 09-28: template engine + 4 templates (Moses reviews each — named-human-reviewer)
4. 10-05: public URLs + milestone widget + Turnstile; demo page live
5. 10-12: 30 SEO template-gallery pages published; 3 pilot firms onboarded
6. Weekly: Five-numbers report (pages live · firms · MRR · setups · bridge-upsells)

*Plan by Kimi Work session 2026-09-14. Evidence: live fetches of both sites this session; fleet memory 2026-09-11.*
