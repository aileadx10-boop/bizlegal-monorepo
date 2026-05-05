# Codebase Concerns — Phase AA Day-1 Baseline

**Analysis Date:** 2026-05-03
**Scope:** services/hetzner, services/oci, services/worker, apps/forge, apps/hub, packages/payment
**Severity:** BLOCKER (will break in <2 weeks) / WARNING (will bite within 4 weeks) / INFO (monitor)

---

## BLOCKER — schema mismatch will crash brain.py mid-batch

**File:** `services/hetzner/brain.py:440-446` writes `status='rejected_quality'`, `rejection_gate`, `rejection_reasons`, `rejected_at` to `daily_gaps`.
**Schema reality:** `services/hetzner/supabase/migration-daily-gaps-curator.sql:14-18` — the CHECK constraint only allows `'pending_pick','picked','archived','skipped','drafted','published','rejected'`. None of the rejection_* columns exist.
**Why it matters now:** The first time *any* of the three new gates fires (factual_review, factual_review_crash, quality_gate), Postgres returns a CHECK violation. The row stays as `picked`, the next cron pass picks it up again, infinite retry loop. Telegram nudges go out but DB never reflects state.
**Fix (<50 words):** Add migration: extend CHECK to include `'rejected_quality','rejected_factual'`, ADD COLUMN `rejection_gate text`, `rejection_reasons jsonb`, `rejected_at timestamptz`. Run before next brain.py cron tick.

---

## BLOCKER — `orders` table is publicly readable AND missing lead linkage

**File:** `apps/hub/supabase/migrations/20260410_orders.sql:38-39` — `CREATE POLICY "public_read" ON orders FOR SELECT USING (true)`.
**Why it matters now:** `payment_url`, `email`, `payment_id` are world-readable via the anon key. Any visitor with the Supabase URL + anon key (which ships in NEXT_PUBLIC vars to the browser) can list every checkout in the system. Tomorrow when 30 checkouts/month start flowing, that's a public ledger of who's buying what.
**Fix (<50 words):** Drop `public_read`. Replace with `service_role_only` policy (or auth.uid()=user_id once leads carry a user_id). Also add `lead_id uuid REFERENCES leads(id)` and `provider_invoice_id text` columns — without those, you cannot wire payment.confirmed → lead_nurture_state.

---

## BLOCKER — humanize.py length-swing bug rejects legitimate Haiku rewrites

**File:** `services/hetzner/humanize.py:138-142`. The check `abs(new_words - orig_words) / orig_words > 0.25` raises `HumanizeError` when length swings >25%. But `brain.py:344-355` catches HumanizeError and continues with original draft — *good*. However the prompt at `humanize.py:55-56` instructs Haiku "within 10% of original word count", and the sanity check is 25%. If Haiku returns a body 30% longer (chatty rewrite), it blows the sanity check and the post is silently de-humanized — quality_gate then catches the un-humanized AI tells and rejects.
**Why it matters now:** Combined with the schema mismatch above, this is the most likely cause of "every article gets rejected" once the pipeline lights up. End-to-end failure mode looks like Haiku working fine, then quality_gate blocks because banned phrases survived.
**Fix (<50 words):** Either tighten Haiku temperature from 0.4 → 0.2 and tighten prompt to ≤10% swing as a hard rule, or relax the sanity check to ±35%. Pick one source of truth. Recommend tightening prompt + dropping temp.

---

## BLOCKER — quality_gate `_check_internal_links` regex doesn't match production domains

**File:** `services/hetzner/quality_gate.py:210` — pattern `(?:blog|forge|bizlegal-ai)\.bizlegal-ai\.com` matches `bizlegal-ai.bizlegal-ai.com` (which doesn't exist), but won't match the canonical `bizlegal-ai.com` (apex without subdomain) where most internal links go.
**Why it matters now:** This is currently WARN-only so it doesn't block. But you'll add it to the BLOCK gate the moment you have ≥3 sibling articles, and at that point real internal links will fail to match, blocking real articles.
**Fix (<50 words):** Change to `(?:https?://(?:(?:blog|forge)\.)?bizlegal-ai\.com|/(?:blog|gap|agents))/`. Test against the actual /blog/, /agents/*, and apex /[slug] URL shapes the brain emits.

---

## WARNING — factual_review.py JSON parse will crash on Sonnet's chatty preamble

**File:** `services/hetzner/factual_review.py:196-198`. The cleanup strips ```json fences but doesn't handle the case where Sonnet emits prose before the JSON ("Here's my analysis: { ... }"). At `temperature=0.0` this is rare but not impossible — Anthropic's models occasionally narrate.
**Why it matters now:** When it happens, `json.loads()` raises, `_call_sonnet` re-raises, `review()` raises `RuntimeError` (not `FactualReviewError`!) — and `brain.py:369-375` does catch `Exception` and rejects the draft, so the row gets stuck on `rejected_quality` (which itself is broken — see BLOCKER #1). Compound failure.
**Fix (<50 words):** Extract first `{...}` substring with greedy regex before `json.loads`: `m = re.search(r'\{.*\}', cleaned, re.DOTALL); cleaned = m.group(0) if m else cleaned`. Same pattern needed in `humanize.py:172-174`.

---

## WARNING — gate ordering wastes Sonnet $$ on draft that fails structural gate

**File:** `services/hetzner/brain.py:341-383`. Order today: humanize (Haiku ~$0.10) → factual_review (Sonnet ~$0.30) → quality_gate (free Python). At 30 articles/month and ~20% rejection rate, you're spending $0.40 × 6 rejected drafts = $2.40/month on drafts that fail structural checks Python could've caught for free.
**Why it matters now:** Not catastrophic at 30/month. But the moment scout/brain volume scales (you mentioned 5x in flight), you'll burn $50-100/month on Sonnet calls validating drafts that fail `_check_word_count` or `_check_visuals`. Plus the latency cost — quality_gate is ~50ms, factual_review is ~10s.
**Fix (<50 words):** Reorder: quality_gate first (fail fast on structure) → humanize → quality_gate again (catch banned phrases post-humanize) → factual_review last (most expensive, only on structurally-clean drafts).

---

## WARNING — missing `lead_nurture_state` table; design implications for upcoming worker state machine

**Files searched:** `apps/hub/supabase/migrations/*.sql`, `services/hetzner/supabase/*.sql`, `services/worker/src/*.ts`. Zero references. The `leads` table (`apps/hub/supabase/migrations/006_leads_expand.sql` + 003) has no state column.
**Why it matters now:** You're about to add nurture state machine to the Worker. Without a transactional state table, you'll either (a) shove state into `leads.metadata` JSONB (race conditions on concurrent payment.confirmed events) or (b) use Cloudflare Durable Objects (lock-in, harder to audit from Supabase).
**Fix (<50 words):** Create `lead_nurture_state` with: `lead_id uuid PK FK leads(id)`, `state text NOT NULL CHECK (state IN ('new','warmed','priced','intent','paid','dunning','lost'))`, `state_entered_at timestamptz`, `next_action_at timestamptz`, `attempt_count int`, `last_event jsonb`, `updated_at timestamptz`. Add unique-index on `(lead_id)` and partial index on `next_action_at WHERE state NOT IN ('paid','lost')` for the cron picker.

---

## WARNING — payment package: no rate limit on /api/pay/start

**File:** `apps/hub/app/api/pay/start/route.ts:51`. POST handler has no rate limiting, no Turnstile, no auth. Plus `packages/payment/src/index.ts:316-326` — card-first chain calls LemonSqueezy + Paddle + PayPal sequentially. PayPal token endpoint has aggressive rate limits (~50 req/min per IP from clientside).
**Why it matters now:** At 30 articles/month → 30+ checkout flows, you're fine. But this endpoint is publicly callable with arbitrary `user_email`. A bot scripting `POST /api/pay/start` 1000x with throwaway emails will (a) burn PayPal OAuth tokens, (b) trigger PayPal anti-fraud lockout, (c) pollute `payment.intent` ops events. Once nurture goes live and emails contain checkout links, expect this to be probed.
**Fix (<50 words):** Add IP-based rate limit (10/min/IP) using middleware.ts and Upstash or in-memory LRU. Add Turnstile token validation (mirror `services/worker/src/turnstile.ts`). PayPal token caching (good for ~9 hours) — currently fetched fresh on every checkout, will hit 429 under modest load.

---

## WARNING — `makeOrderId` minute-rounded determinism leaks across users

**File:** `packages/payment/src/index.ts:56-61`. `makeOrderId` returns `bz_${productId}_${safeEmail}_${minute}`. Two users buying the same product in the same minute get different IDs (good — email differs). One user double-clicking gets the same ID (good — dedupe). BUT: if a user changes email casing or trims whitespace differently between clicks ("Foo@bar.com" vs "foo@bar.com" — line 92 lowercases at the route, so OK there), order_id collisions are possible across the boundary if any caller bypasses the route. Lower priority.
**Why it matters now:** Currently safe because route normalizes. But `startCheckout` is exported — Forge or any future caller invoking it directly bypasses the lowercase. Then NOWPayments dedup keys diverge.
**Fix (<50 words):** Move email normalization into `makeOrderId` itself: `email.toLowerCase().trim().replace(...)`. Defense-in-depth — single source of truth for order_id derivation.

---

## INFO — Worker has no Cloudflare KV / Durable Object configured for nurture state

**File:** `services/worker/wrangler.toml` (not loaded but referenced from `index.ts`). `index.ts` uses `ctx.waitUntil` for fire-and-forget but has no persistent state.
**Why it matters now:** When you add nurture state machine, the natural place is the Worker (close to /intake, close to /report endpoints). But no DO/KV today means every state read is a Supabase round-trip from edge. At 30/mo it's fine; at 300/mo the latency stacks up and you'll regret not having KV cache.
**Fix (<50 words):** Add `[[kv_namespaces]] binding = "NURTURE_CACHE"` to wrangler.toml when state machine lands. Use Supabase as source of truth, KV as 60s read cache for `lead_nurture_state` rows. Skip Durable Objects unless you need transactional cross-Worker locking.

---

## INFO — `factual_review.py` PRIMARY_DOMAINS substring match is over-permissive

**File:** `services/hetzner/factual_review.py:58-65, 201-209`. `".gov" in "abc.govfake.com"` returns True. Substring match misses dot-prefix anchoring.
**Why it matters now:** Edge case. Sonnet does the real classification; this is just a backstop counter for `primary_source_count`. If a malicious source URL is shaped `evil.govlookalike.com`, the count is inflated by 1 — but the body still has to cite real claims, and Sonnet flags the URL as non-primary anyway. Low impact, easy fix.
**Fix (<50 words):** Use `urllib.parse.urlparse` + `host.endswith(d) or host == d.lstrip('.')`. Or precompile a tuple of fully-qualified suffixes and test with `host.endswith()`. ~3 lines.

---

*Audit ran on 2026-05-03 against branch `claude/standardize-bizlegal-subdomains-YekYM`. Re-run after schema migration #1 lands and after pay/start rate-limiting ships.*
