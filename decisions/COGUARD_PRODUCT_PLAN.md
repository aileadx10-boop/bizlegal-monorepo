# CoGuard — Co-Parenting Communication & Legal Evidentiary Engine

**Status:** Scaffold in progress — 2026-08-16
**Branch:** feature/coguard-scaffold
**Domain:** coguard.bizlegal-ai.com
**Decision:** Zero-liability subscriber-forwarding architecture

---

## Problem

High-conflict co-parenting generates communication that is simultaneously evidence and fuel for escalation. Parents need:
1. Professionally neutralized outgoing replies (BIFF: Brief, Informative, Friendly, Firm)
2. An immutable, SHA-256-anchored log of every message
3. On-demand court binder with Bates numbering and chain-of-custody certificate
4. Read-only attorney portal accessible via a code printed on every binder cover

## Two-Channel Architecture

### Channel A — Outgoing (Zero Liability)
Subscriber drafts a reply in the CoGuard dashboard. CoGuard:
1. Classifies tone (Claude Haiku 4.5) → `{hostility_score, biff_needed, issues[]}`
2. BIFF-transforms if hostile (Claude Sonnet 4.6)
3. Shows side-by-side (original vs BIFF) for subscriber approval
4. Sends via Resend from `subscriber-name@reply.coguard.bizlegal-ai.com` + BCC subscriber
5. SHA-256 of sent body → append-only `coguard_messages` row

Legal basis: standard CRM send-on-behalf. Identical to HubSpot, Mailchimp.

### Channel B — Incoming (Zero Liability After One-Time Setup)
Subscriber sets a Gmail/Outlook filter once:
> From: [ex@email.com] → Forward to {uuid}@inbox.coguard.bizlegal-ai.com

After that, fully automatic:
1. Ex sends email to subscriber's real inbox (intended recipient — no interception)
2. Subscriber's Gmail auto-forwards a copy to CoGuard
3. CF Email Routing → `services/coguard-worker/` CF Worker
4. Worker POSTs to OCI `/coguard/process` (HMAC-signed)
5. OCI: dedup → classify → SHA-256 → log → notify subscriber

Legal basis: we receive mail forwarded FROM the subscriber's account. Same category as Zapier Email Parser, Make.com, Superhuman AI.

### Viral Hook (Inbound Only — Hard Rule #7 Compliant)
Every outgoing CoGuard-sent BIFF reply footer:
```
[Sent via CoGuard • Professional Co-Parenting Communication • ref:#BL-XXXXXXX]
```
Ex-partner sees this on every reply → discovers CoGuard → inbound acquisition. Zero cold outreach.

---

## Pricing

| Plan | Monthly | Yearly | Message Cap | Features |
|---|---|---|---|---|
| Solo Shield | $14.99/mo | $129/yr | 100 msgs/mo | BIFF drafts + binder + basic portal |
| Litigation | $29.99/mo | $249/yr | Unlimited | + attorney portal + priority + multi-thread |

Break-even: 7 paying subscribers (covers all marginal API costs).

Unit economics at 1,000 subscribers:
- Revenue ($18.99 blended avg) = $18,990/mo
- Anthropic API (Haiku + Sonnet) ≈ $600
- Resend ≈ $50
- Net ≈ $17,530 (92.3% margin)

---

## Stack — All Existing Infrastructure

| Layer | Location | Note |
|---|---|---|
| Next.js 14 app | `apps/coguard/` | Clone docai pattern |
| CF Worker (email) | `services/coguard-worker/` | CF Email Routing handler |
| OCI AI routes | `services/oci/router/coguard.py` | classify + BIFF + process |
| Hetzner PDF | `services/hetzner/coguard_binder.py` | ReportLab + Bates |
| Outgoing email | `@bizlegal/email` (Resend) | existing package |
| Payments | NOWPayments + PayPal Subscriptions | no Stripe (unavailable) |
| Database | Supabase (5 new tables) | see migrations |
| Ops events | `@bizlegal/ops-log` (7 new types) | source: 'coguard' |

---

## Supabase Schema (5 Tables)

- `coguard_subscribers` — plan, status, inbox_alias, reply_address
- `coguard_messages` — append-only log, body_sha256, scores, flags
- `coguard_drafts` — outgoing drafts with BIFF result and approval status
- `coguard_binders` — PDF binder jobs (pending → generating → ready)
- `coguard_attorney_access` — access_code → (attorney_email, subscriber_id)

Migrations: `supabase/migrations/20260816_coguard_*.sql`

---

## Env Additions (vault: C:/Users/Moshe Dor/Downloads/env-hub-bizlegal-ai.txt)

| Name | Purpose |
|---|---|
| `COGUARD_INTERNAL_SECRET=` | x-internal-secret for /api/provision + Hetzner binder |
| `CF_COGUARD_ROUTING_TOKEN=` | CF Email Routing shared secret for Worker auth |
| `CF_COGUARD_KV_NAMESPACE_ID=` | CF KV namespace: alias → subscriber_id map |
| `NEXT_PUBLIC_COGUARD_SITE_URL=https://coguard.bizlegal-ai.com` | IPN base URL |
| `PAYPAL_PLAN_ID_COGUARD_SOLO_MONTHLY=` | Moses creates in PayPal dashboard |
| `PAYPAL_PLAN_ID_COGUARD_LITIGATION_MONTHLY=` | Moses creates in PayPal dashboard |

---

## OpsLog Event Types (7 New)

```
coguard.message.received       incoming email forwarded and processed
coguard.message.sent           outgoing BIFF message sent via Resend
coguard.draft.classified       outgoing draft tone-checked
coguard.binder.requested       subscriber triggered court binder
coguard.binder.generated       PDF ready for download
coguard.subscriber.provisioned aliases assigned post-payment
coguard.attorney.access        attorney viewed portal
```

Source: `'coguard'` — added to both `@bizlegal/ops-log` and hub `ALLOWED_SOURCES`.

---

## Product IDs (packages/payment/src/products.ts)

```
coguard_solo_monthly       $14.99/mo   monthly subscription
coguard_solo_yearly        $129/yr     yearly subscription (save ~$50)
coguard_litigation_monthly $29.99/mo   monthly subscription
coguard_litigation_yearly  $249/yr     yearly subscription (save ~$110)
```

---

## Build Sequence

1. **Foundation** (this session): decision docs + migrations + packages + hub updates
2. **App scaffold**: apps/coguard/ Next.js app (layout, landing, pricing, auth, payments)
3. **Message infrastructure**: CF Worker + OCI routes + provision flow + IPN → provision
4. **Dashboard + Binder**: compose UI, message feed, PDF generator, attorney portal
5. **SEO**: 20-30 programmatic comparison pages (/vs/ourfamilywizard, /vs/talkingparents, etc.)

---

## Moses-Only Actions After Scaffold

1. Generate `COGUARD_INTERNAL_SECRET` via `openssl rand -hex 32`, add to vault
2. Create CF Email Routing route: `*@inbox.coguard.bizlegal-ai.com → coguard-worker`
3. Create KV namespace `COGUARD_ALIASES` in CF dashboard, copy binding ID to vault
4. Create PayPal subscription plans for Solo + Litigation, add plan IDs to vault
5. Add `coguard` to Vercel (Root Directory: apps/coguard), set all envs
6. Apply 5 Supabase migrations
7. Do $14.99 test purchase to verify provision → aliases → inbox → binder flow

---

## Verification Gates (All Binary)

| Gate | Test |
|---|---|
| Schema | `list_tables` shows 5 `coguard_*` tables |
| Payment→provision | $14.99 test buy → `coguard_subscribers.status='active'` + aliases set |
| Outgoing BIFF | POST hostile draft → BIFF response with scores |
| Outgoing send | Approve → Resend delivery + `coguard_messages` row with `body_sha256` |
| Incoming forward | Forward test email to alias → `coguard_messages` row logged |
| Court binder | Request → PDF with Bates numbers + chain-of-custody page |
| Attorney portal | `/attorney/[code]` renders read-only timeline |
| Ops chain | All 7 event types visible in hub `/ops/feed` |

---

## Why Zero Legal Liability

1. **Outgoing**: We process content the subscriber wrote and approved. Standard email service.
2. **Incoming**: We receive mail forwarded by the subscriber from their own inbox. Zapier-equivalent.
3. **Court binder**: Format and export the subscriber's own logged data. Document formatter.
4. **No legal advice**: Communication drafting and documentation tool only.
5. **Disclaimer on binder**: "Have your attorney verify admissibility in your jurisdiction."
