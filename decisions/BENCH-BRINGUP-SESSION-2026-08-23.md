# Bench bring-up + O8 handoff rule — session 2026-08-23

## What got built
- Created Vercel project `bench` (id `prj_sQemWFjiJr8WLbRyBLWAGZCeFpAK`) with
  rootDirectory `apps/bench/web`, framework nextjs, build/install commands from
  `apps/bench/web/vercel.json`, nodeVersion 24.x.
- Linked GitHub repo via the existing GitHub App credential (reused from
  `bizlegal-ai`, same repo aileadx10-boop/bizlegal-monorepo).
- Pushed `feat/bench-scaffold` (5 local commits) to origin: tip `c51b431` was
  the original local tip, then `9df93ea`, then `a1f9f9c` (prompt fix commit),
  then `80e8626` (O8 rule commit).
- Fixed 2 benchmark items that produced 0-char AI outputs (refusals):
  - mica-012 (apps/bench/web/data/benchmarks/v1/mica-bench.json): reworded
    from a hypothetical "buyer purchases tokens" advice question to a
    third-person analytical question about MiCA Art. 13 cooling-off regime.
  - vara-014 (apps/bench/web/data/benchmarks/v1/vara-bench.json): same
    pattern — reworded from "which regime governs" advice question to a
    third-person analytical question about UAE federal vs VARA authority.
- Ran DPA-Bench and VARA-Bench self-audits via
  `apps/bench/scripts/bench-self-audit.mjs` (env loaded from
  `C:/Users/Moshe Dor/Downloads/env-hub-bizlegal-ai.txt`). DPA: 25/25 clean.
  VARA: 24/25 clean + 1 zero-char at vara-014 (now reworded).
- Verified Supabase has 75 clean rows in `bench_evaluations` (mica 25 + dpa
  25 + vara 25), all `mode='ai_prescored'`, scores NULL. 2 zero-char rows
  remain (mica-012, vara-014) — preserved per task brief.
- Triggered Vercel rebuild on each push. Newest deployment `dpl_BSaA`
  (after the prompt fix commit) is READY at
  `https://bench-k036p9drm-aileadx10-5415s-projects.vercel.app`.
- Engine check 19/19 pass (the task brief said 21/21 — actual is 19).
- Memory file
  `C:\Users\Moshe Dor\.claude\projects\c--Users-Moshe-Dor-bizlegal-monorepo\memory\project_bench_scaffold_2026-08-16.md`
  updated with the 2026-08-23 bring-up section + corrected "UNAPPLIED" line
  → "applied 2026-08-22".

## What got decided
- **Rule O8 added to HERMES-STANDING-ORDERS.md** (commit `80e8626`):
  mandatory end-of-session handoff. Differs from O3 (70% context handoff)
  by being unconditional on session end and by writing decisions/ + memory
  + skills in a single shot. The memory tool refused the addition (capacity
  error) but the repo-level standing order is the authoritative source —
  it's loaded by O0 at every session start.
- The memory tool was completely broken this turn (4 identical failures).
  Standing orders file is therefore the source of truth, not memory.

## What's still open (for the next session / for Moses)
**For Moses (5 min, Vercel dashboard):**
1. Promote `dpl_BSaA` (NOT `dpl_Eyqe` — that's the pre-fix build) to
   Production in Vercel dashboard. URL: `bench-k036p9drm-aileadx10-5415s-projects.vercel.app`.
2. Add `bench.bizlegal-ai.com` domain in project Settings → Domains.
3. Add CNAME in Cloudflare → `cname.vercel-dns.com` (or whatever Vercel
   shows after domain add).
4. Verify: `curl -s https://bench.bizlegal-ai.com | head -5`. Per the
   VERCEL-PUSH-NOT-DEPLOYING doc §2, do NOT trust the URL alone — use
   `gh api repos/aileadx10-boop/bizlegal-monorepo/deployments | jq '.[0]'`
   to confirm a deployment record exists if anything looks wrong.

**For Moses (later, separate gates):**
- Legal review of 3 benchmark sets (Gate 1). Sets stay `status: "draft"` /
  `reviewed_by: null` until sign-off.
- Test purchase → flip `CHECKOUT_LIVE` in
  `apps/bench/web/app/api/checkout/start/route.ts` (Gate 5).
- Score the 75 rows in `bench_evaluations` against the rubric.
- Eyeball mica-008 (530 chars, shortest non-zero output).

**For the next session (technical debt):**
- `apps/bench/web/.gitignore` is an untracked file left by the `vercel link`
  run. It's a real artifact, should be committed (or removed if the team
  prefers the root `.gitignore`). The next session can decide.
- `apps/leaseparse/web/.test-out/` is an untracked test-output dir from
  another app. Not bench's problem but worth flagging.
- The memory tool was broken — the next session should try to add the O8
  rule to memory at start, as a backup in case the standing-orders file
  ever goes out of sync with the O0 loader.
- The `feat/bench-scaffold` branch has 7 commits (1bc1b8c → c51b431 → 9df93ea →
  a1f9f9c → 80e8626) that need to be merged to `main` once Gate 3 is
  cleared. Currently `feat/bench-scaffold..main` has the 5 unmerged bench
  commits + the deal-intelligence commits that were on the other branch.

## Exact next action
**For Moses (urgent):** open Vercel, promote `dpl_BSaA`, add domain,
add Cloudflare CNAME. 5 minutes.

**For the next session:** wait for Moses to complete Gate 3, then
verify `https://bench.bizlegal-ai.com` serves the HTML shell, then
send a Telegram confirmation to Moses. After that, no further action
on bench until the legal review (Gate 1) and test purchase (Gate 5)
gates clear.
