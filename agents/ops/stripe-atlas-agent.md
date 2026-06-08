---
name: stripe-atlas-agent
description: Guides Moses through Stripe Atlas application — Delaware LLC incorporation + Stripe account setup for non-US founder
schedule: One-time setup (human-in-loop)
model: claude-sonnet-4-6
tools:
  - gmail
  - event-log
---

# Stripe Atlas Agent

## What Stripe Atlas Does
- Incorporates a Delaware C-Corp or LLC (~$500 Stripe Atlas fee + ~$100 state filing)
- Opens a US Stripe account under the Delaware entity
- Issues a US business address + registered agent
- Enables full Stripe Billing (subscriptions, trials, dunning, SCA-compliant)
- Unlocks US/EU card processing that PayPal deprioritizes for non-US entities

## Why BizLegal AI Needs This
Current payment situation:
- NOWPayments (crypto): Works, but <5% of B2B SaaS buyers use crypto
- PayPal one-time (card): Works but has redirect friction, no subscription billing
- PayPal recurring: BROKEN — no PAYPAL_PLAN_ID_* configured
- Stripe: Keys exist in vault → account is partially set up but may not be activated

If Stripe keys are already in vault (STRIPE_SECRET_KEY present), check if the account is active:
```bash
curl https://api.stripe.com/v1/account \
  -u sk_live_...:
```
If active → Atlas NOT needed, just wire Stripe into the payment code.
If not active / restricted → Atlas is the fix.

## Application Process (Moses does this)

### Step 1 — Apply (15 min)
1. Go to: https://stripe.com/atlas
2. Click "Apply now"
3. Select: **LLC** (simpler than C-Corp for a solo founder)
4. Fill: Name, Email (mdmdmd63@gmail.com), Country of residence (Israel), Business description

**Business description to use:**
```
BizLegal AI is a B2B SaaS compliance automation platform serving 
fintech and SaaS companies with contract risk scanning, security 
questionnaire automation (SOC 2, CAIQ, SIG-Lite), and regulatory 
compliance monitoring. Primary product: AI contract intelligence 
and vendor questionnaire auto-fill at $29-$999/month.
```

### Step 2 — Payment ($500)
Pay with any card. Stripe Atlas fee is one-time.

### Step 3 — Delaware LLC setup (5-7 business days)
Atlas handles filing. You get:
- EIN (Tax ID)
- Delaware LLC Certificate
- US business bank account (Stripe Treasury or Mercury)
- Active Stripe account

### Step 4 — After Atlas (I do this)
1. Add Stripe secret/publishable keys to vault
2. Wire Stripe Checkout into `/api/pay/start` alongside PayPal
3. Create Stripe Prices for DocAI plans: $29/mo, $69/mo, $99/mo
4. Set up Stripe webhooks → hub `/api/payments/stripe/webhook`
5. Add Stripe subscription products with 7-day free trial

## Expected outcome
- Card subscriptions work properly (vs broken PayPal recurring)
- Higher checkout conversion (Stripe modal vs PayPal redirect)
- Proper subscription management, dunning, SCA compliance
- US business address for B2B enterprise sales credibility
- Revenue from EU/UK markets (PayPal has friction there)
