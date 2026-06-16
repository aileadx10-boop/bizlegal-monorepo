# GSD Morning Briefing — 2026-06-17

**Bottom line:** The engine works. Overnight autonomous fixes closed 9 of 10 surfaces' code-level blockers. Revenue is gated on 6 Vercel env clicks + PayPal creds refresh. First crypto payment can confirm today.

---

## 6 Actions That Unlock Revenue This Morning

**Do these in order. Total time: ~45 minutes.**

1. **Vercel: hub Root Directory = apps/hub** (2 min)
   Hub has been in build ERROR. One setting, auto-redeploy, all crons + checkout live.

2. **Vercel: docai NEXT_PUBLIC_SITE_URL = https://docai.bizlegal-ai.com** (2 min)
   IPN fires to a Vercel preview URL right now. Every crypto payment is paid but never confirmed. This is why $0 has ever been captured. Most important fix in the business.

3. **Verify NOWPAYMENTS_IPN_SECRET is set in hub Vercel env** (1 min)
   Without it, all payment webhooks return 500. Costs 30 seconds to check.

4. **Approve Telegram articles** (30 min, async)
   brain_run4 is processing 18 articles right now with the fixed pipeline. First real batch after weeks of 94% rejection rate. Approve what looks good — they'll publish to blog within hours.

5. **Merge PR #11 in bizlegal-ea + verify GSC** (20 min)
   Activates AdSense + intent CTAs on 209 live posts. Without GSC verify, Google doesn't index at scale.

6. **Vercel: tracr NEXT_PUBLIC_SITE_URL = https://tracr.bizlegal-ai.com + GOLDRUSH_API_KEY** (5 min)
   Unblocks TRACR checkout redirects and freemium wallet analysis.

---

## What Was Fixed Overnight (autonomous)

- Hub vercel.json build error fixed (installCommand no longer escapes file set)
- Hub checkout: PayPal removed, crypto-only with clear notice — eliminates 50% failure rate
- DocAI: payment config health check + SITE_URL assertion in logs
- LexAudit: $99/mo CTA now routes to checkout (was dead-ending on law-firm pricing page); subscription provisioning wired on payment
- Forge: BOI now charges $149 (was charging $97 scan price); card button no longer href='#'
- Blog: All 209 CTAs fixed from dead app.bizlegal-ai.com to live docai.bizlegal-ai.com
- Payment: Success page created (was 404); confirmation emails wired to NOWPayments webhook; webhook paths fixed for all 26 products
- OCI: Opt-out 404 fixed (CAN-SPAM compliance restored)
- BRAI/TRACR: PayPal false advertising removed; multi-currency crypto enabled

---

## 7-Day Revenue Target

Day 1: Test full crypto payment loop end-to-end ($1 test payment)
Day 2: Blog monetization live + PayPal card path restored
Day 3-5: First Reddit posts + cold email batch (10 leads)
Day 6-7: First $200-$500 captured

Week 2-4 target: $1K → $3K → $5K MRR

Full details: decisions/GSD_OVERNIGHT_REPORT_2026-06-17.md
