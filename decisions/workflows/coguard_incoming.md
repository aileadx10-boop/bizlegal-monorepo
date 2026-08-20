# CoGuard Incoming Message Workflow

**WAT layer:** Workflow (this SOP)
**Agent:** Claude Haiku 4.5 (classifier)
**Tools:** CF Email Routing → `services/coguard-worker/` → OCI `/coguard/process` → Supabase insert → Resend notification

---

## Objective

Automatically process incoming forwarded emails from ex-partner (forwarded by the subscriber from their own Gmail) with zero manual intervention: classify hostility/urgency, log immutably with SHA-256, notify subscriber with a clean summary.

---

## One-Time Subscriber Setup

Subscriber does this ONCE in Gmail:
1. Settings → Filters and Blocked Addresses → Create a new filter
2. From: `[ex@email.com]`
3. Action: Forward to `{inbox_alias_uuid}@inbox.coguard.bizlegal-ai.com`

After this, everything is fully automatic.

---

## Automatic Pipeline

```
Ex sends email → arrives at subscriber's own Gmail inbox (intended recipient)
Gmail filter fires → auto-forwards copy to {uuid}@inbox.coguard.bizlegal-ai.com

CF Email Routing (routing rule: *@inbox.coguard.bizlegal-ai.com → HTTP endpoint)
  → POST multipart/form-data to services/coguard-worker/ CF Worker
    Body includes: raw email, envelope data, recipient address

CF Worker (services/coguard-worker/src/index.ts):
  1. Verify x-cf-email-routing-token == CF_COGUARD_ROUTING_TOKEN
  2. Parse recipient alias UUID from To: header
  3. CF KV lookup: COGUARD_ALIASES.get(alias_uuid) → subscriber_id
     If not found: return 200 (silently drop — not our subscriber)
  4. Extract: original_sender (From: header), subject, message_id, date_header, text body
  5. ctx.waitUntil():
     POST https://oci.bizlegal-ai.com/coguard/process (HMAC-signed)
     { subscriber_id, sender, subject, message_id, raw_text, received_at }
  6. Return 200 immediately (CF Email Routing expects fast response)

OCI /coguard/process:
  1. Redis dedup: SET dedupe:coguard:{message_id} 1 EX 172800 NX → if 0, skip
  2. SHA-256 of raw_text body
  3. Claude Haiku 4.5 classify:
     system: "Score this co-parenting message 0-1: hostility_score, urgency_score,
              logistics_score. flags: ['threat','profanity','custody_violation',
              'financial_dispute','late_pickup','refusal','court_order_mentioned']
              Return JSON: {hostility_score, urgency_score, logistics_score, flags[]}"
  4. INSERT coguard_messages {
       subscriber_id, channel='incoming', sender_id=original_sender,
       subject, raw_body=raw_text, body_sha256, hostility_score, urgency_score,
       logistics_score, flags, received_at=date_header, processed_at=now()
     }
  5. Lookup subscriber's email from coguard_subscribers
  6. sendEmail transactional (via @bizlegal/email or Resend):
     To: subscriber_email
     Subject: "CoGuard: New message logged [score indicators]"
     Body: {
       flags summary if any,
       hostility indicator,
       "View in dashboard: coguard.bizlegal-ai.com/dashboard",
       reference: #BL-{subscriber_short}-{message_id_counter}
     }
  7. logEventAsync({ type: 'coguard.message.received', source: 'coguard', email: subscriber_email,
       metadata: { hostility_score, flags_count: flags.length, message_id } })
```

---

## Email Routing Architecture

```
coguard.bizlegal-ai.com DNS:
  MX: route1.mx.cloudflare.net (CF Email Routing)

CF Dashboard Email Routing:
  Rule: *@inbox.coguard.bizlegal-ai.com → Worker: coguard-worker
  (Custom address routing, not catch-all — only @inbox subdomain)
```

---

## CF KV Schema

KV namespace: `COGUARD_ALIASES`
- Key: `{inbox_alias_uuid}` (the UUID part before @inbox.coguard...)
- Value: `{subscriber_id}` (UUID from coguard_subscribers.id)
- Set by: `/api/provision` via CF KV REST API

---

## Edge Cases

| Scenario | Handling |
|---|---|
| Ex sends email without subscriber forwarding setup | Email never reaches CoGuard. No action. |
| Duplicate forward (Gmail sometimes double-fires) | Redis dedup on message_id prevents double logging |
| OCI takes >30s | CF Worker used ctx.waitUntil() → returns 200 instantly; OCI processes async |
| Classify confidence low | Log anyway with flags=['low_confidence']; subscriber sees it in dashboard |
| Subscriber cancelled | KV still has alias until Moses cleans up; INSERT fails on FK constraint → log error, return 200 |

---

## What We Are NOT Doing

- We do NOT intercept messages in transit
- We do NOT receive messages before they reach the subscriber's inbox
- We do NOT read messages without the subscriber explicitly setting up forwarding
- We ARE a downstream processor for the subscriber's own forwarded mail

---

## Verification

Subscriber sets up Gmail filter → sends test email from ex's address to their own Gmail → CoGuard receives forwarded copy → `coguard_messages` row with `channel='incoming'`, `body_sha256`, scores → notification email delivered to subscriber.
