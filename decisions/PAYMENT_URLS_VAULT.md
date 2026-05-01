# PAYMENT_URLS_VAULT — NEXT_PUBLIC_* checkout URL inventory

**Purpose:** preserve the EXACT env var names + which Vercel project owns each + which pricing tier it backs, so the monorepo migration can re-paste values into the new structure without rewriting payment-gateway code.

**Rule:** NO actual URL values in this doc. Names + locations + tier mapping only. Real values live in:
- **`C:/Users/Moshe Dor/Downloads/env-hub-bizlegal-ai.txt`** (canonical local vault — read first)
- Vercel UI per project (live truth that must agree with the vault)
- NOWPayments dashboard per product (the source for the URLs themselves)
- PayPal subscription Plan IDs (the source for the PayPal URLs)
- Encrypted offsite copy (per `decisions/PARAMETERS_RUNBOOK.md` Section 9)

---

## How the monorepo migration uses this doc

When the monorepo agent runs Phase B (migrate `apps/`):

1. For each app, the agent re-points the Vercel project's "Root Directory" to `apps/<name>/` instead of the repo root.
2. **Vercel envs are NOT re-pasted by the agent.** They stay attached to the existing Vercel project. The migration only changes WHERE the build pulls source from.
3. After all apps deploy from the monorepo, the agent verifies each PricingTierCard renders (URLs flow from env to component).
4. If a NEW pricing tier is added during migration: that's deferred to a separate post-migration PR per the user-locked rule "code payment gateways AFTER monorepo is done."

---

## V1 — Live products (already coded, env URLs may not all be set yet)

### BOI Tracker (`/agents/boi-tracker` on hub)

| Env name | Vercel project | Tier | Amount | Mapping consumer |
|---|---|---|---|---|
| `NEXT_PUBLIC_NOWPAYMENTS_BOI_SOLO_MONTHLY_URL` | bizlegal-ai | Solo monthly | $29/mo | hub `app/agents/boi-tracker/page.tsx` SOLO_TIER |
| `NEXT_PUBLIC_NOWPAYMENTS_BOI_SOLO_YEARLY_URL` | bizlegal-ai | Solo yearly | $290/yr | same |
| `NEXT_PUBLIC_NOWPAYMENTS_BOI_FIRM_MONTHLY_URL` | bizlegal-ai | Firm monthly | $99/mo | hub FIRM_TIER |
| `NEXT_PUBLIC_NOWPAYMENTS_BOI_FIRM_YEARLY_URL` | bizlegal-ai | Firm yearly | $990/yr | same |
| `NEXT_PUBLIC_PAYPAL_BOI_SOLO_MONTHLY_URL` | bizlegal-ai | Solo monthly card | $29/mo | hub SOLO_TIER card path |
| `NEXT_PUBLIC_PAYPAL_BOI_SOLO_YEARLY_URL` | bizlegal-ai | Solo yearly card | $290/yr | same |
| `NEXT_PUBLIC_PAYPAL_BOI_FIRM_MONTHLY_URL` | bizlegal-ai | Firm monthly card | $99/mo | hub FIRM_TIER card path |
| `NEXT_PUBLIC_PAYPAL_BOI_FIRM_YEARLY_URL` | bizlegal-ai | Firm yearly card | $990/yr | same |

Total: 8 URLs.

### V1 AI-Act Risk Classifier (`/agents/ai-act` on hub)

| Env name | Vercel project | Tier | Amount | Mapping consumer |
|---|---|---|---|---|
| `NEXT_PUBLIC_NOWPAYMENTS_AI_ACT_ONETIME_URL` | bizlegal-ai | Full report | $99 one-time | hub `app/agents/ai-act/page.tsx` ONETIME_TIER |
| `NEXT_PUBLIC_NOWPAYMENTS_AI_ACT_MONTHLY_URL` | bizlegal-ai | Monitoring | $49/mo | hub MONITORING_TIER |
| `NEXT_PUBLIC_PAYPAL_AI_ACT_ONETIME_URL` | bizlegal-ai | Full report card | $99 one-time | hub ONETIME_TIER card path |
| `NEXT_PUBLIC_PAYPAL_AI_ACT_MONTHLY_URL` | bizlegal-ai | Monitoring card | $49/mo | hub MONITORING_TIER card path |

Total: 4 URLs.

### V2 Privacy Auto-Refresh (`/agents/policy-refresh` on hub)

| Env name | Vercel project | Tier | Amount | Mapping consumer |
|---|---|---|---|---|
| `NEXT_PUBLIC_NOWPAYMENTS_POLICY_REFRESH_URL` | bizlegal-ai | Monitoring | $29/mo | hub `app/agents/policy-refresh/page.tsx` MONITORING_TIER |
| `NEXT_PUBLIC_PAYPAL_POLICY_REFRESH_URL` | bizlegal-ai | Monitoring card | $29/mo | same card path |

Total: 2 URLs.

### Hub-grand total: **14 NEXT_PUBLIC_* payment URLs.**

---

## Subdomain payment surfaces (URLs vary per product, exhaustive lists below)

### TRACR (`tracr.bizlegal-ai.com`)

TRACR's checkout is dynamic — the hub `/api/tracr/create-order` and `/api/tracr/paypal-order` routes generate per-order checkout URLs server-side via NOWPayments + PayPal APIs (not env-pinned URLs). So no `NEXT_PUBLIC_*` URLs to preserve here. The dynamic generation needs `NOWPAYMENTS_API_KEY` + `PAYPAL_CLIENT_ID/SECRET` only.

Pricing tiers (in `app/api/tracr/create-order/route.ts` PRICES_USD):
- Bronze forensic report: $149
- Silver forensic report: $299

### BRAI (`brai.bizlegal-ai.com`)

BRAI full report = $49 one-time. Generated dynamically via `app/api/brai/invoice/route.ts` (NOWPayments) — no env-pinned URL.

### LexAudit (`lexaudit.bizlegal-ai.com`)

Compliance Monitor subscription URLs (if env-pinned, document here). Currently uses dynamic `app/api/payments/*` — verify on next deploy.

### DocAI (`docai.bizlegal-ai.com`)

DocAI Team ($69/mo) + Firm ($199/mo) — verify whether these use env-pinned URLs or dynamic generation. If env-pinned, expect names like `NEXT_PUBLIC_NOWPAYMENTS_DOCAI_TEAM_MONTHLY_URL`.

### Forge (`forge.bizlegal-ai.com`)

- BOI Compliance Report: $149 one-time
- Regulatory Passport: $297 one-time
- Wallet scan: $97 dynamic

These are likely dynamic-generation routes per Forge's existing pattern. To verify: grep `NEXT_PUBLIC_NOWPAYMENTS_` and `NEXT_PUBLIC_PAYPAL_` across `BIZLEGAL PROJECTS/forge/apps/web/`.

### LeadForge (`leadforge.bizlegal-ai.com`)

Currently no paid surfaces.

---

## Discovery commands (run BEFORE migration to capture current state)

If this doc gets stale, regenerate it from the live state:

```bash
# 1. Hub: list all NEXT_PUBLIC_NOWPAYMENTS_* and NEXT_PUBLIC_PAYPAL_* env names from /api/ops/health
curl -s "https://bizlegal-ai.com/api/ops/health?t=$OPS_DASHBOARD_TOKEN" \
  | jq '.envs[] | select(.name | startswith("NEXT_PUBLIC_NOWPAYMENTS_") or startswith("NEXT_PUBLIC_PAYPAL_")) | {name: .name, set: .set}'

# 2. Per-subdomain (after Phase A3 sets OPS_DASHBOARD_TOKEN on each):
for s in tracr brai lexaudit docai leadforge forge; do
  echo "=== $s ==="
  curl -s "https://${s}.bizlegal-ai.com/api/ops/health?t=$OPS_DASHBOARD_TOKEN" \
    | jq '.envs[] | select(.name | startswith("NEXT_PUBLIC_NOWPAYMENTS_") or startswith("NEXT_PUBLIC_PAYPAL_")) | {name: .name, set: .set}'
done

# 3. Code-level grep to find every consumer (in case some envs aren't set yet):
cd "C:/Users/Moshe Dor"
for d in bizlegal-ai trcr "BRAI/frontend-next" lexaudit "docai-monorepo/web" "leadforge-ai/frontend" "BIZLEGAL PROJECTS/forge/apps/web"; do
  echo "=== $d ==="
  grep -r "NEXT_PUBLIC_NOWPAYMENTS_\|NEXT_PUBLIC_PAYPAL_" "$d/app" --include="*.tsx" --include="*.ts" 2>/dev/null \
    | grep -oE "NEXT_PUBLIC_(NOWPAYMENTS|PAYPAL)_[A-Z_]+" | sort -u
done
```

The third command is your truth source — every var name referenced in code must end up in a Vercel env eventually.

---

## Local backup recipe (Moses, weekly)

```bash
# Pull all hub envs to encrypted file:
vercel env pull --environment=production .env.bizlegal-ai.production
gpg --symmetric --cipher-algo AES256 .env.bizlegal-ai.production
rm .env.bizlegal-ai.production
# Move .env.bizlegal-ai.production.gpg to encrypted offsite storage

# Repeat for each subdomain Vercel project:
for app in trcr "BRAI/frontend-next" lexaudit "docai-monorepo/web" "leadforge-ai/frontend" "BIZLEGAL PROJECTS/forge/apps/web"; do
  cd "C:/Users/Moshe Dor/$app"
  vercel env pull --environment=production .env.production
  gpg --symmetric --cipher-algo AES256 .env.production
  mv .env.production.gpg "C:/Users/Moshe Dor/.env-vault/$(basename $app).env.production.gpg"
  rm .env.production
done
```

After the monorepo migration completes (Phase U), this recipe collapses to a single `vercel env pull` per app under `monorepo/apps/<name>/` since each app is still a separate Vercel project.

---

## Monorepo migration contract (read by the migration agent)

**During the migration:**

1. The agent SHALL preserve every env var name in this doc verbatim.
2. The agent SHALL NOT modify any `app/api/payments/*` route, `app/api/<x>/create-order/route.ts`, `app/api/<x>/webhook/route.ts`, or any consumer of `NEXT_PUBLIC_NOWPAYMENTS_*` / `NEXT_PUBLIC_PAYPAL_*` env vars.
3. The agent SHALL NOT change any pricing-tier amounts in `app/agents/*/page.tsx` PricingTierCard `prices` blocks.
4. After migration, the agent SHALL run `grep -r "NEXT_PUBLIC_NOWPAYMENTS_\|NEXT_PUBLIC_PAYPAL_"` on the new monorepo and confirm every name in this doc still appears.

**After migration (separate phase, separate PR):**

1. Audit which env-pinned URLs are still needed vs which should switch to dynamic generation (TRACR / BRAI pattern).
2. Consolidate the payment SDK code into `packages/payment/` (NOWPayments client + PayPal client + idempotency keys).
3. Migrate hub from env-pinned URLs to dynamic generation if/when LemonSqueezy or Paddle approval lands (then we have one universal payment surface, not 14 env URLs).

---

## Sanity check matrix (post-migration verification)

```bash
# 1. PricingTierCard renders live checkout buttons (not "Checkout coming soon"):
curl -s https://bizlegal-ai.com/agents/boi-tracker | grep -o "nowpayments.io\|paypal.com" | sort -u
# Expect: nowpayments.io + paypal.com

# 2. Hub /api/ops/health shows 0 critical missing payment envs:
curl -s "https://bizlegal-ai.com/api/ops/health?t=$OPS_DASHBOARD_TOKEN" \
  | jq '.envs | map(select(.name | startswith("NEXT_PUBLIC_NOWPAYMENTS_") or startswith("NEXT_PUBLIC_PAYPAL_"))) | map(select(.set == false)) | length'
# Expect: 0 (or only the SKUs Moses hasn't created yet)

# 3. Test transaction (tiny):
# - Visit /agents/boi-tracker, click crypto checkout
# - Confirm NOWPayments invoice page loads (just verify URL routing, don't pay)
# - Click PayPal checkout, confirm PayPal page loads
```

If any of these fail post-migration, the env wasn't preserved — re-paste from the Vercel UI of the old project (Vercel keeps both projects until you delete the old one).
