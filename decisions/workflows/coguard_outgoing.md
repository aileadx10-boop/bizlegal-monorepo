# CoGuard Outgoing Message Workflow

**WAT layer:** Workflow (this SOP)
**Agent:** Claude Haiku 4.5 (classifier) + Claude Sonnet 4.6 (BIFF transformer)
**Tools:** `/api/messages/draft` → OCI `/coguard/classify` → OCI `/coguard/biff` → `/api/messages/send` → Resend

---

## Objective

Transform a subscriber's raw reply draft into a BIFF-compliant message, get one-click approval, send it via Resend with a SHA-256 audit log, and display a viral footer on every sent message.

---

## Pipeline

```
Subscriber types reply in /dashboard
  → POST /api/messages/draft { subscriber_id, raw_draft, thread_context? }
  → Auth check: subscriber owns this session
  → OCI POST /coguard/classify (HMAC-signed)
      Claude Haiku 4.5:
        system: "Score this co-parenting message 0-1 on hostility, urgency, logistics.
                 Return JSON: {hostility_score, urgency_score, logistics_score, biff_needed, issues[]}.
                 Issues: ['threat','profanity','custody_violation','financial_dispute','vague_accusation']"
        → {hostility_score, urgency_score, logistics_score, biff_needed, issues[]}
  → If biff_needed=true: OCI POST /coguard/biff
      Claude Sonnet 4.6:
        system: "Rewrite using BIFF: Brief (≤3 sentences), Informative (only logistics facts),
                 Friendly (no emotional language), Firm (clear ask). Remove accusations, threats,
                 personal attacks. Preserve all logistics facts (dates, times, places).
                 Return JSON: {biff_text, changes_summary}"
  → INSERT coguard_drafts {raw_draft, biff_text, tone_score=hostility_score, biff_needed, changes_summary, status='pending_approval'}
  → Return {draft_id, raw_draft, biff_text, scores, changes_summary}
```

```
Subscriber clicks Approve
  → POST /api/messages/send { draft_id }
  → Auth check: subscriber owns draft_id
  → Verify draft status = 'pending_approval'
  → Compute body_sha256 = SHA-256(biff_text + COGUARD_FOOTER)
  → INSERT coguard_messages {channel:'outgoing', body_sha256, received_at=now(), status:'sending'}
  → Resend API: send from subscriber_reply_address to thread recipient
      BCC: subscriber's own email
      Body: biff_text + COGUARD_FOOTER
  → UPDATE coguard_drafts SET status='sent', sent_at=now()
  → UPDATE coguard_messages SET status='sent', processed_at=now()
  → logEventAsync({ type: 'coguard.message.sent', source: 'coguard', email: subscriber_email })
  → Return {message_id, sent_at}
```

---

## COGUARD_FOOTER

```
──────────────────────────────────────
Sent via CoGuard • Professional Co-Parenting Communication
Reference: #BL-{subscriber_short}-{bates_counter}
coguard.bizlegal-ai.com
──────────────────────────────────────
```

`subscriber_short` = first 8 chars of subscriber_id UUID.
`bates_counter` = 7-digit zero-padded count from `coguard_messages` WHERE subscriber_id.

---

## Score Interpretation

| hostility_score | Action |
|---|---|
| 0.0 – 0.3 | Show "Your message looks calm. Sending as-is is fine." with BIFF optional |
| 0.3 – 0.6 | Show BIFF side-by-side with soft recommendation |
| 0.6 – 1.0 | Show BIFF prominently; "We strongly recommend this version" |

`biff_needed = hostility_score > 0.3`

---

## Edge Cases

| Scenario | Handling |
|---|---|
| Resend delivery failure | Mark `coguard_messages.status='failed'`; return error to subscriber; do NOT retry automatically |
| Draft already sent | Return 409 "This draft was already sent" |
| OCI classify timeout | Return 503; subscriber sees "AI is busy, try again in 30s" |
| biff_text identical to raw_draft | `biff_needed=false`; show only one pane |

---

## Verification

`coguard_messages` row with `channel='outgoing'`, non-null `body_sha256`, `status='sent'`. `coguard_drafts` row with `status='sent'`. Resend delivery confirmed via event. BCC received at subscriber's inbox.
