# SPEC — Compliance Health Snapshot ($9 one-time, $19/mo)

## Why this exists

THE MACHINE ships 8 agents that produce $97-$40K products. The pipeline between "free" and "$97" is empty — there is no impulse-buy product in the funnel. The Snapshot fills that gap at $9 (one-time) and $19/mo (unlimited). It reuses existing infrastructure (Supabase + Anthropic + Vercel) and requires zero new env vars in the vault.

## What it does

1. User pastes a privacy policy / vendor contract / terms of service (200-30000 chars).
2. Server calls Claude Haiku 4.5 with a strict JSON-output prompt.
3. Returns: score (0-100), grade (A-F), 3 specific risk flags, 1 recommended fix, frameworks checked.
4. The 2nd and 3rd flags are visually blurred until the user unlocks ($9) or subscribes ($19/mo).
5. Server persists ONLY the score, grade, flags metadata, and email — NEVER the document.

## The funnel

```
  Landing page (/compliance-snapshot)
    |
    v
  [free preview] score + grade + flag 1 + frameworks checked
    |
    v
  [blurred flags 2 & 3] ("unlock for $9" or "$19/mo unlimited")
    |
    v
  checkout (/api/compliance-snapshot/checkout)
    |
    v
  [unlocked] flags 2 & 3 + recommended fix + PDF emailed
    |
    v
  [nurture] 48h later: "ready for a $40K custom build? 15-min call"
```

## Stack

- Frontend: Next.js 14 App Router (apps/hub), Tailwind. Pure client component.
- API: Node.js runtime, /api/compliance-snapshot (POST + GET), /api/compliance-snapshot/checkout (POST).
- LLM: Anthropic Claude Haiku 4.5 via REST (no SDK dep).
- DB: Supabase `compliance_snapshots` table (new, privacy-by-default, RLS locked).
- Payments: NOWPayments/PayPal/LemonSqueezy (existing packages/payment) — wired when keys present. Today: free + email followup.

## What is intentionally NOT included

- No new env var references. Uses NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY, ANTHROPIC_API_KEY (all in vault).
- No new cron. Funnel is fully self-serve.
- No Stripe dependency for v1 — works without it.
- No document persistence (privacy + GDPR Art. 5(1)(c) data minimization).
- No agent cron wiring — Snapshot is a TOFU product, fed by organic + socials.

## Acceptance criteria

- [ ] POST /api/compliance-snapshot returns valid JSON in <10s for a 2000-char doc.
- [ ] Score, grade, and 3 flags are always present.
- [ ] 2nd + 3rd flags are visually blurred when `paid=false` in the client state.
- [ ] Email is the only PII persisted; document text never reaches the DB.
- [ ] Migration applies cleanly on a fresh Supabase project.
- [ ] Page loads at /compliance-snapshot with SEO meta + canonical URL.
- [ ] No new env var name is added to the repo (vault discipline).

## Future hooks (not in v1)

- Stripe: when STRIPE_SECRET_KEY is added, swap the checkout stub for a real session.
- Email: when MAIL is wired, auto-send the recommended fix as a PDF.
- Nurture: enqueue to lead_nurture_state for the 48h followup.
- Cross-sell: if score < 60, surface a "you're a $40K custom build candidate" CTA.
