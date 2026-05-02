# BizLegal-AI MoR Readiness Audit

**Scope:** Paddle / LemonSqueezy merchant-of-record approval readiness
**Target:** https://bizlegal-ai.com (UAE FZE, crypto/Web3 compliance product)
**Date:** 2026-04-21
**Method:** WebFetch of 11 legal/commercial surfaces; homepage footer inspection

**Note on head-tag checks:** WebFetch returns rendered markdown, not raw HTML head. `<meta viewport>` and `<link rel=canonical>` presence could not be programmatically verified for individual pages in this audit; sandboxed curl/PowerShell access was blocked. These items are flagged as **UNVERIFIED** and should be spot-checked via browser View Source before submission.

---

## Page-by-page findings

### /privacy — LOADS (~1,200–1,400 words)
- **Present:** Data collected list; retention ("90 days post-closure"); access/erasure/portability rights; DPO email (`privacy@bizlegal-ai.com`); cookie disclosure (essential + analytics, no ad trackers); crypto PII explicitly named ("wallet addresses, document inputs, compliance queries"); partial CCPA opt-out.
- **Gaps:** No GDPR Art. 6 lawful basis language (consent / contract / legitimate interest). Third-party processors listed only as generic categories — **Cloudflare, GitHub, Vercel, Supabase, Anthropic, Gemini, Telegram are NOT named**. CCPA detail is light.
- **Placeholders:** None.

### /terms — LOADS (~950 words)
- **Present:** Service description; "not legal advice"; IP ownership of generated content; user obligations; 12-month liability cap; AI-output limitations ("intelligence instruments — not binding regulatory determinations").
- **Gaps:** **UAE jurisdiction/venue not specified** (generic "binding arbitration or competent courts"). **No force majeure clause.** No "attorney-reviewed scope" language. No crypto-specific service description.
- **Placeholders:** None.

### /refund — LOADS (~650 words)
- **Present:** 14-day money-back guarantee; non-refundable carve-out for fully-downloaded reports and custom integrations already in delivery; self-serve subscription cancellation; `billing@bizlegal-ai.com`; chargeback/dispute section.
- **Gaps:** None material for MoR.
- **Placeholders:** "Last updated April 2026" is the current month — OK, not a template artifact.

### /acceptable-use — LOADS (~850 words)
- **Present:** Sanctions/OFAC/AML evasion prohibition; money laundering / fraud / terrorist financing prohibition; scraping/bulk extraction prohibition; reverse-engineering prohibition; `security@bizlegal-ai.com` for reporting.
- **Gaps:** **No explicit prohibition on training AI/ML models on platform outputs** — P1 gap for LLM-era MoR AUP.
- **Placeholders:** None (marketing tagline at bottom is brand copy, not placeholder).

### /disclaimer — LOADS (~520 words)
- **Present:** "Not legal advice"; no attorney-client relationship; AI-output disclosure; jurisdictional limitations ("Legal outcomes depend on jurisdiction, deal facts…"); use-at-own-risk.
- **Gaps:** **"Not financial advice" / "not investment advice" missing** — material for a crypto/Web3 product. No "not tax advice" either.
- **Placeholders:** None.

### /trust — LOADS (~1,100 words)
- **Present:** SOC 2 Type II aligned (via Vercel/Supabase); AES-256 at rest, TLS 1.3 in transit; GDPR DPA available; right-to-erasure; zero-retention mode default; annual third-party audit claimed.
- **Gaps:** SOC 2 and audit claims are stated but not evidenced with report/badge links. Paddle/LemonSqueezy reviewers often ask for the underlying attestation letter.
- **Placeholders:** None.

### /pricing — LOADS (~850 words)
- **Present:** Free ($0), Pro ($149/mo "Most Popular"), Scale ($499/mo); monthly billing; downgrade-at-next-cycle renewal note.
- **Gaps:** **No VAT/sales-tax disclosure** — P0 blocker for MoR (Paddle and LemonSqueezy explicitly require "prices exclusive/inclusive of tax" language). **No annual billing option.** No currency explicitly stated (assumed USD). **Current tiers do NOT match the new Free / Scout $149 / Operator $999 / Enterprise structure** — full tier rewrite needed on this page.
- **Placeholders:** None.

### /contact — LOADS (~280 words)
- **Present:** `team@bizlegal-ai.com` (×2); contact form (Name/Email/Subject/Message); response SLA (1 business day standard; 4 hours for expert review); support hours (Mon–Fri 9am–6pm CET).
- **Gaps:** **No physical business address** — P0 blocker (MoRs require registered address, typically the UAE FZE address). **No UAE FZE legal-entity disclosure.**
- **Placeholders:** None.

### /about — LOADS (~450 words)
- **Present:** Multi-jurisdiction operating scope (UAE, EU, US, UK, Singapore); mission statement; practitioner credentials (LLB/LLM, 20 yrs).
- **Gaps:** **No UAE FZE legal name, trade-license number, or registered office.** Founding team anonymous ("a practitioner"). No corporate registration evidence.

### /accessibility — LOADS (~580 words)
- **Present:** WCAG 2.1 Level AA target stated; partial conformance declared; known limitations disclosed (WebGL, data tables); complaints procedure; feedback contact.
- **Gaps:** Not linked from homepage footer (see below).

### /cookies — **404 CONFIRMED**
- Page does not exist. **Hard blocker** for GDPR/ePrivacy compliance expectations — MoRs generally require either a cookie policy page OR a functional consent banner covering equivalent content.

---

## Homepage footer

- Business name present: **"BizLegal AI"** (note: missing hyphen vs. brand spec "BizLegal-AI"; no "FZE" suffix)
- Location: "Dubai · London · Singapore · Global" — acceptable worldwide signal
- Copyright: "© 2026 BizLegal AI. All rights reserved."
- `team@bizlegal-ai.com`: **NOT in footer** (only on /contact)
- Legal links in footer: Privacy, Terms, Refund, Acceptable Use, Disclaimer, Trust Center
- **Missing footer links:** Accessibility, Cookies, Contact
- **Cookie consent banner: NOT detected on first visit** — P0 blocker alongside the missing /cookies page

---

## Head-tag / infra (UNVERIFIED in this session)

- `<meta name=viewport>`: not confirmable via WebFetch on any page — spot-check required
- `<link rel=canonical>`: not confirmable via WebFetch on any page — spot-check required
- SSL cert validity: not testable in sandbox (curl/PowerShell blocked); site served over HTTPS successfully for all WebFetch calls, indicating a valid cert chain at minimum

---

## Prioritized gap list

### P0 — MoR application blockers (fix before submission)

1. **Create /cookies page** — Currently 404. Required for GDPR/ePrivacy.
2. **Deploy cookie consent banner** — Not present on first visit; required for EU traffic.
3. **Add tax language to /pricing** — "Prices exclusive of VAT/sales tax; tax calculated at checkout based on jurisdiction" (or equivalent). Paddle/LS both require this.
4. **Rewrite /pricing tiers** to new structure: Free / Scout $149 / Operator $999 / Enterprise (contact). Current site shows old Free/Pro/Scale.
5. **Add UAE FZE legal entity disclosure** — Legal name (BizLegal-AI FZE), DMCC trade-license number, registered FZE address on /about, /contact, and /terms. Required for MoR KYC.
6. **Add physical business address to /contact and footer** — MoRs require a registered address. Use DMCC registered address once license issued.
7. **Name third-party data processors in /privacy** — Cloudflare, GitHub, Vercel, Supabase, Anthropic, Google (Gemini), Telegram (plus Paddle/LemonSqueezy once signed). Required for GDPR Art. 28/30 and CCPA service-provider disclosure.
8. **Specify UAE governing law + venue in /terms** — DIFC Courts or DMCC-specific arbitration center.

### P1 — Should fix before launch

9. **Add GDPR Art. 6 lawful basis statements** to /privacy for each processing purpose.
10. **Add "not financial advice" / "not investment advice" / "not tax advice"** to /disclaimer (critical for crypto/Web3).
11. **Add force majeure clause** to /terms.
12. **Add AI-training prohibition** to /acceptable-use ("You may not use outputs to train ML/AI models").
13. **Add annual billing option** (~17% off) and explicit currency label (USD) to /pricing.
14. **Add Accessibility, Cookies, Contact links** to homepage footer.
15. **Expand CCPA section** in /privacy (categories of PI collected/sold/shared, "Do Not Sell" link).
16. **Link to SOC 2 attestation evidence** on /trust (letter, Vanta/Drata badge, or bridging letter).

### P2 — Nice to have

17. **Brand spelling consistency** — "BizLegal AI" vs "BizLegal-AI" across footer and /about.
18. **Add "attorney-reviewed scope" statement** to /terms (clarify which outputs, if any, are reviewed).
19. **Verify `<meta viewport>` and `<link rel=canonical>`** are present on every legal page via browser View Source.
20. **Name founders / add corporate leadership section** to /about (MoR reviewers often check).
21. **Add crypto-specific service description** to /terms (clarifying this is compliance intel, not custody/brokerage/exchange service).

---

**Bottom line:** Site is approximately **70% MoR-ready**. Content is substantive and non-templated — no lorem ipsum or "coming soon" text anywhere. Eight P0 items (including pricing rewrite to new tier structure) must be fixed before submitting to Paddle or LemonSqueezy underwriting. Estimated work: 2-3 days of copy/legal work plus banner implementation once DMCC FZE is registered (trade license + registered address are prerequisites).
