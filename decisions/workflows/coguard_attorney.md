# CoGuard Attorney Portal Workflow

**WAT layer:** Workflow (this SOP)
**Agent:** None — static read-only view
**Tools:** `/attorney/verify?code={access_code}` → `apps/coguard/app/attorney/[code]/page.tsx`

---

## Objective

Give the subscriber's attorney read-only, time-unlimited access to the subscriber's full message timeline without requiring attorney signup, payment, or subscriber re-authorization. Access code printed on every court binder cover.

---

## Access Code Generation

Access codes are generated ON DEMAND — not pre-assigned. When subscriber or attorney clicks the link from the binder cover:

```
GET /attorney/verify?code={access_code}

1. Try SELECT * FROM coguard_attorney_access WHERE access_code = $code
2. If not found → Insert new row:
     { attorney_email: null, subscriber_id: null, access_code: $code, created_at: now() }
     (The code is embedded in the URL from the PDF — no email needed yet)
   Actually: the access_code IS the code from the PDF. If row doesn't exist, this is
   the first access. If it does, log last_accessed_at = now().
3. Lookup subscriber_id from coguard_binders WHERE access_code = $code
   (access_code is generated per-binder and stored in coguard_binders)
4. SELECT * FROM coguard_messages WHERE subscriber_id ORDER BY received_at ASC
5. Render /attorney/[code] with full timeline (read-only, no interaction)
6. logEventAsync({ type: 'coguard.attorney.access', source: 'coguard', metadata: { code } })
```

---

## Binder-to-Attorney Link

At binder generation time, generate a unique access code per binder:
```python
import secrets
access_code = secrets.token_urlsafe(12)  # ~96 bits, URL-safe
```

Store in `coguard_binders.attorney_access_code` (add column in migration or as metadata).
Print on binder cover: `https://coguard.bizlegal-ai.com/attorney/verify?code={access_code}`

---

## Attorney Portal UI (`/attorney/[code]`)

```
CoGuard — Case Timeline
Attorney Read-Only Access
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Case reference: BL-XXXXXXXX
Period: [date_from] to [date_to]
Messages: N total | M flagged

[Timeline — chronological, newest-first option]
  [INCOMING] 2026-08-16 — hostility: 0.8 🔴 [threat, late_pickup]
  [OUTGOING] 2026-08-15 — hostility: 0.1 ✅ (BIFF sent)
  ...

[Download PDF Binder] (links to existing signed URL)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This is a read-only case timeline provided by CoGuard to the attorney
of record. All messages include SHA-256 integrity hashes verifiable
against the PDF court binder. This portal does not constitute legal
advice and does not create an attorney-client relationship with CoGuard.
```

---

## Security Model

- Access code is 96-bit random (URL-safe) — brute force infeasible
- No authentication required — this is a shared-link model (like Dropbox shared links)
- Portal shows subscriber's messages but NOT subscriber's personal details
- Attorney cannot reply, delete, or modify anything
- Supabase RLS: service_role only; portal uses service_role for SELECT only (read-only key pattern)

---

## Subscriber Control

- Subscriber can revoke attorney access by contacting support (manual process in MVP)
- Future: `/dashboard/settings` → "Manage Attorney Access" → revoke codes

---

## Edge Cases

| Scenario | Handling |
|---|---|
| Invalid code | "This access link is invalid or has expired. Ask your client for a new binder PDF." |
| Subscriber cancelled account | Messages still accessible if row not deleted (GDPR note: subscriber can request deletion) |
| Same attorney opens multiple binders | `last_accessed_at` updated on each view |
| Search engine crawls attorney URL | Blocked by `robots.txt` noindex + CSP headers |

---

## Verification

`/attorney/verify?code={access_code}` renders full timeline. `coguard_attorney_access` row has `last_accessed_at` updated. Ops log shows `coguard.attorney.access` event.
