# @bizlegal/email

> First read the monorepo root [`CLAUDE.md`](../../CLAUDE.md), especially hard rule 7.

The single outbound email path for the fleet. Replaces 22 separate senders and ~25 inline `fetch('api.resend.com')` call sites.

## Why the gate is in here

Consent used to be enforced by callers. It was enforced in one of 22 of them. A caller that forgets to check is indistinguishable from a caller that decided not to, so the check moved inside the only function that can actually send.

```ts
import { sendEmail } from '@bizlegal/email'

// Marketing is the DEFAULT — omitting `kind` gets you the strict path.
await sendEmail({ to, subject, html })                        // requires double_optin_confirmed
await sendEmail({ to, subject, html, kind: 'transactional' }) // receipt/confirmation: consent not required
```

## The two kinds

| kind | Suppression checked | Opt-in required | Use for |
|---|---|---|---|
| `marketing` (default) | yes | **yes** | nurture, digests, newsletter, upsells |
| `transactional` | yes | no | payment receipts, report delivery, the double-opt-in confirmation itself, password resets |

`transactional` is not a loophole. Requiring opt-in before sending an opt-in confirmation would be circular, and withholding a receipt from someone who just paid is worse than useless. It is for replies to something the person just did — nothing else.

## Failure direction is deliberate

`isSuppressed()` returns **true** when the suppression store is unreachable. If we cannot prove an address is safe to mail, we do not mail it.

This is the opposite of the `fc_flags` kill-switch that was deleted on 2026-08-16: that one queried a table with no migration, so the lookup errored, the flag read as `undefined`, and the check **failed open** — cold email would have flowed. Which way a failed check falls is a safety decision, not an implementation detail.

## Runtime

Raw `fetch` only — no Resend SDK, no `supabase-js`. It therefore runs unchanged on Node, Next.js route handlers, and Cloudflare Workers. `services/worker` previously had to hand-roll its own ops-log client because the shared package pulled in `supabase-js`, which does not run on Workers; this package avoids repeating that.

## Env (names only; values in the canonical vault)

`RESEND_API_KEY` · `RESEND_FROM` · `RESEND_REPLY_TO` · `NEXT_PUBLIC_SUPABASE_URL` (or `SUPABASE_URL`) · `SUPABASE_SERVICE_KEY`

Config can also be passed explicitly as the second argument, which is how Workers pass their `env` bindings.

## What NOT to do

- Don't add a `skipConsent` flag. If a send needs to reach someone who hasn't opted in and isn't replying to their own action, that send should not exist.
- Don't call `api.resend.com` directly from an app or a script. Import this.
- Don't catch `not_confirmed` and retry as `transactional`.

## Third kind: outbound (rule 7 v2, 2026-09-07)

`sendOutbound()` in `src/outbound.ts` is the only way a cold message leaves the fleet, and `/api/cron/outbound-dispatch` on the hub is its only caller (pre-commit check `outbound-kind`). It refuses unless every invariant holds: provider-verified address (no role inboxes, no blocked domains), lawful basis + source_url (v1: US only), fail-closed suppression lookup, campaign approved + running + `OUTBOUND_AUTOSEND=1`, caps (hard 50/mailbox/day here), real postal address, unsubscribe, sender domain, and no bounce/complaint breach in the trailing window. The CAN-SPAM footer is assembled here, never by a template. Transport is the Instantly adapter in `src/senders/instantly.ts` on a dedicated warmed domain; Resend is never used for it (its acceptable-use policy forbids cold mail). Tests: `src/outbound.test.ts` (one refusing test per invariant). Decision: `decisions/OUTBOUND-V2-RULE-7-AMENDED-2026-09-07.md`.
