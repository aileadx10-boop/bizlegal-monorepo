# BizLegal-AI — Financial model

**Last updated:** 2026-04-27
**Horizon:** 12 months (May 2026 → April 2027)
**Frame:** Monthly OpEx vs. expected revenue. Conservative-leaning. Real numbers, not aspirational ones.

---

## 1. Monthly expenses (committed + variable)

### Committed (every month, regardless of traffic)
| Line | Provider | Plan | Monthly | Notes |
|---|---|---|---|---|
| BRAI backend | Render | Starter | $7 | Migrate to Workers post-revenue, kills this line |
| Hetzner box | Hetzner | CX32 Falkenstein | ~$8 | Runs n8n + Marimo + curator |
| Domain | (registrar) | bizlegal-ai.com | ~$1 | Amortized $12/yr |
| **Subtotal committed** | | | **$16** | Floor cost |

### Variable (scales with traffic / API use)
| Line | Provider | Free tier | Likely | Heavy | Trigger to upgrade |
|---|---|---|---|---|---|
| Vercel | Vercel | Hobby (free) | $0 | $20 (Pro) | Commercial use → must upgrade to Pro |
| Cloudflare Workers | CF | 100K req/day free | $0 | $5 | Exceed 100K req/day |
| Cloudflare Pages | CF | 500 builds/mo free | $0 | $0 | Rarely exceed |
| Cloudflare KV | CF | 100K reads/day free | $0 | $5 | Exceed reads |
| Supabase | Supabase | 500MB / 50K MAU free | $0 | $25 (Pro) | Exceed DB size or MAU |
| Resend email | Resend | 3K emails/mo free | $0 | $20 | Exceed email volume |
| Anthropic API | Anthropic | pay-per-use | $20 | $80 | Haiku ~$0.001/lead, Sonnet ~$0.01 |
| OpenAI image-gen | OpenAI | pay-per-use | $5 | $25 | $0.04/blog hero, ~50/mo |
| Oracle OCI | Oracle | Always-Free tier | $0 | $0 | Stay on free shape |
| LemonSqueezy fees | LS | 5% + $0.50/txn | (revenue-side) | | Counted in net revenue |
| **Subtotal variable** | | | **$25** | **$180** | |

### Pre-revenue MoR fees (one-off)
- LemonSqueezy account: $0 setup
- Paddle account: $0 setup
- DUNS number (if needed for some MoRs): $0 (free in IL)
- **One-off:** $0

### Total monthly OpEx
- **P10 (very low traffic):** **$16 / mo** — committed only, no API usage
- **P50 (current trajectory):** **$41 / mo** — $16 committed + $25 variable
- **P90 (heavy usage post-revenue):** **$196 / mo** — $16 committed + $180 variable
- **Vercel commercial-use ceiling:** ~$216 / mo — kicks in if MoR reapply succeeds and team is paid

**Burn floor:** $16/mo. **Burn at scale:** $200-250/mo. Both trivially payable from any reasonable revenue.

---

## 2. Revenue model (per channel)

### Forge BOI Kit — $149 one-off scan
- **Audience:** US LLC owners post-CTA-2024 reporting requirements; estate attorneys; small fintech founders.
- **Conversion floor:** 0.5% of landing-page visitors → 200 visitors → 1 sale.
- **Refund risk:** low (one-time, instant delivery, clear scope).
- **Per-sale economics:** $149 gross − $7.95 LS fee (5%+$0.50) = **~$141 net**.

### Pro tier subscription — $149/mo recurring
- **Audience:** compliance officers, multi-jurisdiction founders, DAO/foundation operators.
- **Conversion floor:** 1% of pricing-page visitors → 100 visitors → 1 sub.
- **Refund risk:** moderate (14-day window, recurring).
- **Per-sub economics:** $149 gross − $7.95 LS fee = **~$141 net** monthly. LTV at 6mo retention ≈ $846.

### TRACR forensic report — $149 / $249 / $500 tiers
- **Audience:** crypto investigators, lawyers preparing litigation, recovery firms.
- **Conversion floor:** higher-intent traffic; 2-5% of /tracr visitors who reach checkout.
- **Per-sale economics:** $149-500 gross − ~$8-25 fee = **$141-475 net**.

### OCI Deal Router referral fees — variable, $5K-80K per close
- **Audience:** UAE DIFC SPV property buyers, US Reg D 506(c) syndicators, family offices.
- **Conversion lag:** 6-9 months from first contact to close.
- **Per-close economics:** finder fee bands 1-25% of underlying; conservative case $5K, realistic $15K-30K, big case $80K+.
- **Cadence:** 1 close per quarter is plausible; 1 close per month is best-case.

### LeadForge / LexAudit / DocAI — secondary surfaces
- Likely paid product launches in months 3-6, not first month.
- Treat as $0 in the May 2026 model.

---

## 3. Revenue projection — May 2026

| Channel | P10 | P50 | P90 |
|---|---|---|---|
| Forge BOI Kit | 0 sales × $141 = **$0** | 8 × $141 = **$1,128** | 25 × $141 = **$3,525** |
| Pro subscription | 0 × $141 = **$0** | 2 × $141 = **$282** | 8 × $141 = **$1,128** |
| TRACR reports | 0 × $200 = **$0** | 3 × $200 = **$600** | 10 × $250 = **$2,500** |
| OCI router (realistic 0 in M1) | $0 | $0 | $5,000 (lucky early close) |
| LeadForge / LexAudit / DocAI | $0 | $0 | $0 |
| **Gross** | **$0** | **$2,010** | **$12,153** |
| OpEx (P50) | -$41 | -$41 | -$41 |
| **Net** | **−$41** | **+$1,969** | **+$12,112** |

### Key drivers
- **P10** = no traffic / no marketing / pure word-of-mouth. Trivial loss.
- **P50** = posting weekly to LinkedIn + 2-3 niche communities + 1-2 blog posts/week with SEO-aimed titles. Realistic if Moses dedicates 4-6 hrs/wk to content.
- **P90** = above + 1 bounded ad spend test (~$200) + outreach to 50 warm contacts.

---

## 4. Twelve-month projection (P50 path)

| Month | Forge | Pro | TRACR | OCI | Gross | OpEx | Net cumulative |
|---|---|---|---|---|---|---|---|
| May 2026 | $1,128 | $282 | $600 | $0 | $2,010 | $41 | $1,969 |
| Jun 2026 | $1,500 | $564 | $700 | $0 | $2,764 | $50 | $4,683 |
| Jul 2026 | $2,000 | $846 | $800 | $0 | $3,646 | $60 | $8,269 |
| Aug 2026 | $2,500 | $1,128 | $900 | $0 | $4,528 | $70 | $12,727 |
| Sep 2026 | $3,000 | $1,410 | $1,000 | $5,000 | $10,410 | $80 | $23,057 |
| Oct 2026 | $3,500 | $1,692 | $1,100 | $0 | $6,292 | $90 | $29,259 |
| Nov 2026 | $4,000 | $1,974 | $1,200 | $0 | $7,174 | $100 | $36,333 |
| Dec 2026 | $4,500 | $2,256 | $1,300 | $15,000 | $23,056 | $110 | $59,279 |
| Jan 2027 | $5,000 | $2,538 | $1,400 | $0 | $8,938 | $120 | $68,097 |
| Feb 2027 | $5,500 | $2,820 | $1,500 | $0 | $9,820 | $130 | $77,787 |
| Mar 2027 | $6,000 | $3,102 | $1,600 | $25,000 | $35,702 | $140 | $113,349 |
| Apr 2027 | $6,500 | $3,384 | $1,700 | $0 | $11,584 | $150 | $124,783 |
| **Year 1** | **$45,128** | **$21,996** | **$13,800** | **$45,000** | **$125,924** | **$1,141** | **+$124,783** |

**Assumptions baked in:**
- Forge BOI Kit grows by ~$500/mo (compounding word-of-mouth + organic SEO from blog factory).
- Pro subscriptions add 2/mo net (after churn).
- TRACR adds $100/mo (slow ramp, niche product).
- OCI: 1 close in Sep 2026 ($5K), 1 close in Dec 2026 ($15K), 1 close in Mar 2027 ($25K). Conservative for a referral pipeline that's just opening.

**Sensitivity:**
- Halve Forge growth → year 1 net ~$80K.
- Zero OCI closes in Y1 → year 1 net ~$80K.
- Both halved → year 1 net ~$45K, still profitable.
- Forge fails to launch (no traffic) → year 1 net ~$0, but OpEx is so low Moses doesn't burn out.

---

## 5. Break-even math

- **Break-even monthly:** $41 OpEx → 1 Forge sale per month. Achievable from week 1 with any organic post that hits 200 visits.
- **Lifestyle-business floor (cover bare living costs at $3K/mo):** ~21 Forge sales/mo or 22 Pro subs ramp. Reachable in months 3-6 of P50.
- **Profit zone:** $5K+/mo net. Reachable in months 5-7 of P50.

---

## 6. Cash-flow drivers, ranked by leverage

1. **Traffic to Forge BOI Kit** — every visitor at 0.5% conversion = $0.71 expected revenue. Top-of-funnel scrapers + niche community posts + LinkedIn cadence.
2. **MoR approval** — gates Pro subscription revenue. $0 if not approved; $282-3K/mo if approved.
3. **OCI partner contracts** — gates referral fee path. $0 partners signed = $0 OCI revenue. Even 2 signed contracts opens the channel.
4. **Hetzner blog factory output** — 2-3 posts/week, each indexed by Google in 2-6 weeks, each contributing 5-50 organic visits/mo at peak. Compounding asset.
5. **TRACR product depth** — currently a single-shot tool. Add re-engagement (monitoring) to convert one-time buyers into recurring ones.

---

## 7. Cost-cutting moves available

- **Migrate BRAI to Cloudflare Workers** → save $7/mo (compounds to $84/yr). 3-5 day port; do AFTER first revenue.
- **Stay on Vercel Hobby** as long as possible (Hobby allows commercial use up to thresholds in 2024+; check current limits before reapply). Save $20/mo.
- **Use Anthropic prompt caching** for the prompts that run on every request (router prompt, scout prompt) → 90% cost reduction on cached tokens. Already implemented in OCI router; replicate for BRAI/LexAudit/etc.
- **Skip OpenAI image-gen** — use Gemini 2.5 Flash Image which has a free tier. Save $5-20/mo.

Total savings if all applied: **~$30-50/mo**. Material at the burn-floor scale, irrelevant at $5K+/mo revenue scale.

---

## 8. The single number that matters this month

**Monthly recurring net + one-off net, May 2026 — target: ≥ $500.**

That's:
- 4 Forge BOI Kit sales, OR
- 4 Pro subs, OR
- 1 lucky OCI partner close, OR
- 2 TRACR reports + 2 Forge sales

Below $500: marketing isn't working — re-think top-of-funnel.
Above $500: working — double down on the channel that produced it.
