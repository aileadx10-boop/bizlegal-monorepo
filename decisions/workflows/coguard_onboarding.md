# CoGuard Onboarding Workflow

**WAT layer:** Workflow (this SOP)
**Agent:** Payment IPN webhook + provision route
**Tools:** `apps/coguard/api/payments/nowpayments/webhook/route.ts` + `apps/coguard/api/provision/route.ts`

---

## Objective

Convert a paid subscriber (confirmed payment) into a fully provisioned CoGuard account with:
- A unique inbox alias (`{uuid}@inbox.coguard.bizlegal-ai.com`) registered in CF KV
- A unique reply address (`{slug}@reply.coguard.bizlegal-ai.com`) for Resend sending
- `coguard_subscribers.status = 'active'`
- A welcome email with Gmail filter setup instructions

---

## Trigger

NOWPayments IPN POST to `/api/payments/nowpayments/webhook` with `payment_status=finished` OR PayPal subscription webhook with `event_type=BILLING.SUBSCRIPTION.ACTIVATED`.

---

## Steps

### Step 1 — IPN Verification
- Verify NOWPAYMENTS_IPN_SECRET or PayPal webhook signature
- Reject and return 401 if invalid
- Return 200 immediately after queuing (never hold IPN open)

### Step 2 — Order Lookup
- Query `payment_orders` by `order_id` in IPN body
- If not found: log `coguard.subscriber.provisioned` with `status: 'failed'`, return 200 (idempotent)
- Extract: `subscriber_email`, `product_id`

### Step 3 — Upsert Subscriber
```sql
INSERT INTO coguard_subscribers (user_id, email, plan, status)
VALUES ($user_id, $email, $plan, 'active')
ON CONFLICT (user_id) DO UPDATE SET plan = $plan, status = 'active'
RETURNING id
```

### Step 4 — Fire Provision Route
POST to `/api/provision` with `x-internal-secret: COGUARD_INTERNAL_SECRET`:
```json
{ "subscriber_id": "uuid", "email": "user@example.com", "plan": "solo" }
```

### Step 5 — Provision (inside /api/provision)
1. Generate `inbox_alias_uuid` = `crypto.randomUUID()`
2. Derive `reply_slug` from subscriber email prefix (sanitized, max 20 chars, unique-suffixed)
3. CF KV PUT: `COGUARD_ALIASES.put(inbox_alias_uuid, subscriber_id)` via CF REST API
4. `UPDATE coguard_subscribers SET inbox_alias = $alias, reply_address = $reply WHERE id = $id`
5. Log `logEventAsync({ type: 'coguard.subscriber.provisioned', source: 'coguard', email })`

### Step 6 — Welcome Email
Send via `@bizlegal/email` with template `coguard_welcome`:
- Inbox alias: `inbox_alias_uuid@inbox.coguard.bizlegal-ai.com`
- Gmail filter setup instructions (Copy-pasteable)
- Link to dashboard: `https://coguard.bizlegal-ai.com/dashboard`

---

## Edge Cases

| Scenario | Handling |
|---|---|
| IPN fires twice for same order | `ON CONFLICT DO UPDATE` is idempotent; KV PUT is idempotent |
| CF KV write fails | Return 500 from /api/provision; IPN can retry or Moses re-triggers |
| Reply slug collision | Append 4-char hex suffix until unique |
| User has no auth.users row | Create anon subscriber row; OTP login creates the user row on first login |

---

## Verification

`coguard_subscribers` row has `status='active'`, non-null `inbox_alias` and `reply_address`. CF KV key `inbox_alias_uuid` maps to `subscriber_id`. Welcome email delivered.
