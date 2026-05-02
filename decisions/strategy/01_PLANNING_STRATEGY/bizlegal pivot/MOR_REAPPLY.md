# MoR reapplication kit

**Status:** **GATED** — do not submit until ALL of the following are true:
1. New BizLegal-AI hub is fully live + functioning on `bizlegal-ai.com` production.
2. All 6 product subdomains return 200 + serve real content.
3. **Old version of bizlegal-ai (legacy SEO factory + DOR INNOVATIONS branding + any pre-pivot copy) no longer exists or is publicly visible.**
4. A real $0.50 test transaction completes on NOWPayments **or** PayPal end-to-end.
5. Cookie banner + footer entity + banned-claim sweep verified by a non-Moses tester.

When 1–5 are true → submit using the messages below.

**Goal:** Get LemonSqueezy approved as merchant of record. Paddle in parallel as fallback.

**Pre-flight (done before sending):**
- [x] Hub build green (cb6bc60 + merge commit `000b0e4` deployed to main 2026-04-26)
- [x] All 9 legal pages live + dated within 60 days (terms, privacy, refund, acceptable-use, disclaimer, faq, trust, methodology, accessibility)
- [x] Cookie consent banner mounted in app/layout.tsx
- [x] Footer shows entity (BizLegal AI · operated by [Moses Dor / DOR INNOVATIONS])
- [x] Banned-claim sweep complete (no "instant", "guaranteed", "100% of X", "certified")
- [x] Pricing page wired to LemonSqueezy checkout URL (env: `NEXT_PUBLIC_LEMONSQUEEZY_PRO_URL`)
- [x] LemonSqueezy webhook handler at `app/api/payments/lemonsqueezy/route.ts` with HMAC verify

**Pre-send Moses TODO:**
- [ ] Set `NEXT_PUBLIC_LEMONSQUEEZY_PRO_URL` in Vercel env (production scope)
- [ ] Create LemonSqueezy "Pro" product ($149/mo, $0.50 test mode for review)
- [ ] Set `LEMONSQUEEZY_WEBHOOK_SECRET` in Vercel env
- [ ] Verify a $0.50 test transaction completes end-to-end before submitting

---

## A. LemonSqueezy reapply message

**To:** support@lemonsqueezy.com (or via dashboard reapply form)
**Subject:** Reapplication — BizLegal AI (regulatory intelligence pivot)

```
Hi LemonSqueezy team,

I'm reapplying for merchant onboarding for BizLegal AI
(bizlegal-ai.com). Account previously rejected during the prior
business model — we have since pivoted, and the platform is now a
clear fit for your acceptable-use policy.

What changed:

1. Business model. We pivoted from "AI legal services" (which
   created confusion with regulated legal practice) to
   "regulatory intelligence" — a software-only intelligence
   platform that helps fintech, crypto, and cross-border operators
   understand their compliance posture. We do not provide legal
   advice; every output carries an explicit AI disclosure and
   recommends qualified counsel for legal decisions. See
   bizlegal-ai.com/disclaimer.

2. Product clarity. We sell:
   - Forge BOI Kit ($149 one-off) — a CTA/FinCEN BOI report
     scanner. Software output, not legal advice.
   - Pro subscription ($149/mo) — unlimited compliance health
     analyses across 50+ jurisdictions, real-time regulatory
     alerts, exportable PDF reports.
   - TRACR forensic reports ($149-$500) — on-chain transaction
     forensics for crypto investigators and recovery firms.

3. Trust posture (you can verify each):
   - Cookie consent banner with essential / analytics toggle.
   - Privacy policy, terms of service, refund policy (14-day
     no-questions), acceptable use, and disclaimer all dated
     within 60 days.
   - Footer carries operator entity name + contact email
     (legal@bizlegal-ai.com).
   - Trust Center (bizlegal-ai.com/trust) documents our
     four-layer verification system + AI confidence scoring +
     audit trail.
   - All marketing copy stripped of banned claims ("instant",
     "guaranteed-outcome", "100% of X", "certified") per
     standard merchant guidelines.

4. Compliance hooks already shipped:
   - HMAC-signed inter-service POSTs (already in production).
   - LemonSqueezy webhook handler implemented at
     /api/payments/lemonsqueezy with signature verification.
   - 14-day refund policy honored automatically.
   - PCI scope minimized — we don't handle card data; LS does.

What I'd like next:

- Review of the reapplication.
- A test product priced at $0.50 to validate the full payment +
  webhook + refund flow end-to-end with my own card.
- Production approval for the $149 Forge BOI Kit and $149/mo
  Pro tier.

Direct contact: mdmdmd63@gmail.com / Moses Dor (founder).

Account ref (if you can find the prior rejected app): [paste old
account email or app ID here]

Thanks for your time.

— Moses Dor
   Founder, BizLegal AI
   bizlegal-ai.com
```

---

## B. Paddle reapply message (parallel — as fallback)

**To:** support@paddle.com (or via dashboard reapply form)
**Subject:** Reapplication — BizLegal AI (regulatory intelligence pivot)

```
Hi Paddle,

I'm reapplying for merchant onboarding for BizLegal AI. The
platform was previously rejected; we've since pivoted to a clear
software-intelligence model that fits your acceptable-use policy.

Summary of the pivot:

- Old: "AI legal services" (rejected — too close to regulated
  legal practice).
- New: Regulatory intelligence platform — software-only
  outputs, AI disclosure on every page, "not legal advice"
  prominent in disclaimer + footer.

Products & pricing (all software, all clearly scoped):

- Forge BOI Kit — $149 one-off CTA/FinCEN beneficial-ownership
  scan with PDF report.
- Pro subscription — $149/mo for unlimited compliance health
  analyses across 50+ jurisdictions + enforcement alerts.
- TRACR forensic reports — $149/$249/$500 tiered on-chain
  transaction forensics.

Trust signals (all live, you can verify):

- Privacy / Terms / Refund / Acceptable Use / Disclaimer / FAQ
  / Trust Center / Methodology / Accessibility — all dated
  within 60 days.
- Cookie consent banner mounted on every page.
- Footer carries operator entity + branded contact email
  (legal@bizlegal-ai.com).
- 14-day refund window honored automatically.
- HMAC-signed payment webhook + signature verification in
  production code.
- Trust Center (bizlegal-ai.com/trust) documents the four-layer
  AI verification system, confidence scoring, and audit trail.

Acceptable-use compliance:

- No "guaranteed-outcome", "100%", "instant", or "certified"
  claims on marketing pages.
- Every AI output carries an explicit confidence score and the
  disclaimer that legal decisions require qualified counsel.
- We do not provide regulated services (legal advice,
  investment advice, custody, brokerage).

What I'd like:

- Review of the reapplication with the pivoted business.
- A $0.50 test transaction path for validating the full payment
  + refund flow.

Direct contact: mdmdmd63@gmail.com / Moses Dor (founder).

— Moses Dor
   Founder, BizLegal AI
   bizlegal-ai.com
```

---

## C. Webhook test path (post-approval, before live)

```bash
# 1. Create $0.50 test product in LemonSqueezy dashboard.
# 2. Open https://bizlegal-ai.com/pricing.
# 3. Click Pro CTA → completes a $0.50 charge via your own card.
# 4. Verify webhook hits production:
curl -s https://bizlegal-ai.com/api/payments/lemonsqueezy/recent \
     -H "x-admin-key: <admin-key>" | jq '.[0]'
# Expect: { event: "subscription_created", status: "active", ... }

# 5. Check Supabase:
#   tracr_orders or subscriptions table — new row.
# 6. Resend dashboard:
#   confirmation email delivered.
# 7. Issue refund from LemonSqueezy dashboard.
# 8. Verify webhook fires the refund event:
curl -s https://bizlegal-ai.com/api/payments/lemonsqueezy/recent \
     -H "x-admin-key: <admin-key>" | jq '.[0]'
# Expect: { event: "subscription_refunded", status: "refunded", ... }
```

---

## D. If rejected again — what to ask

1. **Specific URL or product** they object to (so we can fix it).
2. **Specific marketing claim** that triggered the flag (so we can rewrite).
3. **Specific policy clause** of the AUP we're allegedly violating (so we can address by clause).
4. **Path to escalation** — supervisor / compliance team email.

Generic "doesn't fit our model" rejection → ask in writing for the specific clause. Often the rejection is template; a polite specific question gets a specific answer.

---

## E. Backup MoR options (if both reject)

> Pivot policy 2026-04-27: **NO Stripe / NO Coinbase Commerce until first revenue lands.** The fallbacks below are last-resort and carry their own MoR-or-not-MoR tradeoffs. Reaching this section means LS + Paddle both rejected — at that point, revisit the value prop before adopting one.

- **Polar.sh** — newer, dev-friendly, MoR-as-a-service, generally accepts info-products. Recommended first fallback.
- **Gumroad** — accepts most software products at 10% fee. Acts as MoR. Quick to onboard.
- **Stripe + JT Tax (Stripe Tax compliance addon)** — only after first revenue and only if Polar/Gumroad both reject. Stripe is NOT a MoR by default — Stripe Tax handles VAT, but you still bear merchant compliance.

Order to try if LS+Paddle both fail: **Polar → Gumroad → (revisit pivot before Stripe path)**.

---

## F. Status

- **2026-04-27 morning:** drafts ready (this file).
- **Send when:** Moses confirms LS test product is created + webhook secret is in Vercel env + $0.50 test transaction completed.
- **Expected response time:** LS 1-3 business days, Paddle 3-7 business days.
- **First-revenue gate:** approved MoR enables Pro subscription channel; Forge BOI Kit can use direct Stripe in the meantime as a fallback.
