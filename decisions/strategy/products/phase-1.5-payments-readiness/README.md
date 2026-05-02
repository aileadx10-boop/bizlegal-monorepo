# Phase 1.5 — Payments Readiness (Paddle + LemonSqueezy)

**Scope:** Audit existing bizlegal-ai.com legal surface against Paddle and LemonSqueezy merchant-of-record (MoR) approval criteria. Fix gaps. Do not rebuild pages that already exist and work.

**Ships between:** Phase 1 (Lead Capture, Day 5) and Phase 3 (Intelligence Reports).

**Status:** planning

---

## Business entity details (provided by Moses 2026-04-21)

- **Legal name (display):** BizLegal-AI
- **Contact email:** team@bizlegal-ai.com
- **Physical address:** None — "Remote / Worldwide" on public pages
- **Registered jurisdiction:** **UAE** (Moses-confirmed 2026-04-21). Likely FZE in a free zone (DMCC, IFZA, RAKEZ, or ADGM) depending on crypto-licensing needs. ADGM is the strongest for VASP-proximity but more expensive.
- **Refund window:** 14 days default, **with carve-out: already-delivered content (Intelligence Reports, DocAI outputs, certificates) is non-refundable once delivered**

**UAE registration plan:**
- Registered address (for MoR KYB and tax): the FZE's registered agent address in the chosen free zone
- Public pages still say "Remote / Worldwide" (Moses's preference)
- Crypto-tooling angle: pick a free zone that recognizes crypto advisory / SaaS as a permitted activity; ADGM and DMCC are the usual choices for Web3 companies. RAKEZ/IFZA are cheapest and fine for pure SaaS/advisory (no regulated VASP activity).
- Tax ID: UAE TRN once registered; corporate tax 9% above AED 375k taxable income
- Timeline: 2-4 weeks for FZE setup including KYC
- Cost: AED 12k-50k depending on zone + visa package

**Still blocker for MoR application:**
- Certificate of Incorporation / Trade License (issued on registration)
- Passport scan (UAE FZE requires for shareholder)
- UAE Emirates ID or residence visa (if applicable)
- UAE bank account for payouts (takes an extra 3-6 weeks after registration in most cases)

---

## Existing legal surface audit (bizlegal-ai.com already has these)

Already live — AUDIT against MoR criteria, do not rebuild:

| Existing page | MoR audit task |
|---|---|
| `/privacy` | Verify: data collected, lawful basis (GDPR Art. 6), retention, user rights, DPO/contact email, cookie disclosure, third-party processors (Anthropic, Gemini, Cloudflare, GitHub, Vercel, Supabase, Telegram), CCPA disclosures, crypto-specific PII concerns (wallet addresses, transaction data) |
| `/terms` | Verify: service description (crypto compliance intelligence, NOT legal advice disclaimer), IP ownership of generated content, user obligations, liability cap, arbitration/venue, force majeure, crypto-specific clauses (no guarantees about regulatory interpretation, "attorney-reviewed" scope limits) |
| `/refund` | Verify: 14-day window, **non-refundable clause for already-delivered reports/certificates/DocAI outputs**, subscription cancellation terms, MoR-compliant refund process |
| `/acceptable-use` | Verify: prohibited uses (sanctions evasion, illegal activity, unauthorized scraping), enforcement, termination |
| `/disclaimer` | Verify: "not legal advice," "not financial advice," attorney-reviewed scope, jurisdictional disclaimer, AI-output limitations |
| `/trust` | Verify: SOC 2 alignment claim, AES-256 claim, GDPR compliance, zero-retention mode, third-party audit status |

Likely missing (needs creation):

| New page | Why | MoR requirement |
|---|---|---|
| `/accessibility` | No accessibility statement visible on site audit | LemonSqueezy increasingly requires WCAG 2.1 AA statement |
| `/cookies` | Cookie banner needed, plus dedicated policy page | GDPR + CCPA |
| Contact form on `/contact` | Needs MoR-validated support channel | Both require documented support method |

---

## MoR criteria checklist (combined Paddle + LemonSqueezy superset)

### Technical
- [x] Valid SSL certificate (bizlegal-ai.com on Vercel — managed)
- [ ] Cookie consent banner with granular opt-in (necessary / analytics / marketing)
- [ ] No placeholder / lorem ipsum on approval-critical pages
- [x] Mobile responsive
- [x] Professional design (forge-v3-purple brand canonical)

### Mandatory pages (audit before fixing)
- [ ] `/privacy` — audit against checklist above
- [ ] `/terms` — audit
- [ ] `/refund` — audit + ADD non-refundable clause for already-delivered content
- [ ] `/acceptable-use` — audit
- [ ] `/disclaimer` — audit
- [ ] `/contact` — verify functional form + team@bizlegal-ai.com displayed
- [ ] `/accessibility` — CREATE WCAG 2.1 AA statement
- [ ] `/cookies` — CREATE policy + wire banner
- [ ] `/pricing` — audit (exists per site inspection) + verify MoR-required clarity

### Footer requirements (audit footer)
- [ ] Business display name: "BizLegal-AI"
- [ ] Contact email: team@bizlegal-ai.com
- [ ] Remote/Worldwide designation OR registered address once known
- [ ] Copyright year auto-updating
- [ ] Links to all legal pages
- [ ] No broken links

### Product clarity (MoR rejects if unclear)
- [x] Homepage: one-sentence value prop ("Operate Where It's Allowed. Scale Where Others Won't.")
- [x] Clear product category (crypto compliance intelligence)
- [x] Screenshots / product proof (6 product subdomains live)
- [ ] No prohibited categories (crypto IS allowed by LemonSqueezy but flagged for enhanced review by Paddle — verify this per latest policy)

**Crypto-specific MoR note:** Some MoRs classify crypto-compliance tooling as "regulated financial services" requiring enhanced KYB. LemonSqueezy is more permissive for SaaS tools serving crypto businesses; Paddle may require additional documentation. Submit to LemonSqueezy first.

---

## Refund policy template (non-refundable clause)

Add to existing `/refund`:

> **Already-delivered content is non-refundable.** Reports, compliance certificates, legal document drafts (DocAI), blockchain forensics outputs (TRACR), wallet risk scores (BRAI), and other content delivered to you become your property upon delivery and cannot be returned. Refunds for subscription plans cover unused time in the current billing period only.
>
> **What IS refundable:**
> - Unused subscription time if canceled within 14 days of first purchase
> - Duplicate charges
> - Documented service failures (e.g., platform unavailable > 24 hours)
>
> **What is NOT refundable:**
> - Intelligence Reports, certificates, documents, scan results, or other content already generated and delivered
> - Subscription time past the 14-day window
> - One-time products (BOI Kit, per-document DocAI purchases) once delivered

---

## Build plan (after existing-page audit)

**Day 1 — Audit**
- Fetch each existing legal page
- Diff against MoR criteria checklist
- Produce gap report in `projects/phase-1.5-payments-readiness/audit-report.md`

**Day 2 — Content fixes**
- Draft patches for each gap using Haiku 4.5 (legal-tone system prompt)
- Add non-refundable clause to `/refund`
- Human review (Moses)

**Day 3 — New pages**
- Create `/accessibility` (WCAG 2.1 AA statement)
- Create `/cookies` (policy)
- Wire cookie consent banner (OSS lib: `cookieconsent` or custom)

**Day 4 — Contact + footer**
- Verify `/contact` form works (team@bizlegal-ai.com delivery)
- Update footer across site: business name, email, Remote/Worldwide, legal page links

**Day 5 — MoR submission prep**
- Screenshot all pages for application upload
- Prepare KYB documents (entity registration, tax ID — Moses provides)
- Submit to LemonSqueezy first (faster approval for digital goods, more crypto-tolerant)
- Queue Paddle application as fallback

---

## Out of scope (for Phase 1.5)

- Actual payment integration (wait for MoR approval, then Phase 3+)
- Invoice/receipt templates (MoR handles)
- Subscription management UI (Phase 3+)
- VAT/GST reporting (MoR handles)
- Multi-currency display (MoR handles)

---

## Cost

- $0 build (using existing stack)
- $0 cookie consent (OSS)
- Paddle / LemonSqueezy transaction fees only on first sale
- Legal review (optional, recommended): $300-800 one-time (blockchain-specialist lawyer)
- Entity registration: $0 (existing) OR $100-1500 (new entity, depending on jurisdiction)

---

## Still blocked on Moses

1. ~~UAE FZE free zone choice~~ — **LOCKED: DMCC Crypto Centre** per Moses's "choose for me" 2026-04-21. Rationale: crypto-branded free zone, "Management Consultancy" + "SaaS" activities both supported, AED 25-35k first year, solid bank-account track record, avoids ADGM VASP-licensing overkill for a SaaS product.
2. **FZE registration complete** — then Trade License number + TRN for MoR KYB (prerequisite for legal-page UAE entity disclosure and physical address)
3. **Passport scan ready** for MoR personal KYC
4. **UAE bank account** or alternative payout destination (MoRs pay out to the registered business, not personal)
5. ~~Existing legal-page content~~ — **DONE:** see `audit-report.md` for 70% MoR-ready baseline and 8 P0 gaps to close
