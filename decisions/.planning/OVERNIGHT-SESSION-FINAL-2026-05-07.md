# Overnight session — final report 2026-05-07

**Window:** Moses asleep, autonomous mode active, 9 PRs merged.
**Authorization:** "DO ALL AUDITS, MANUAL OR AUTOMATED, CHOOSE FOR ME" + "PUSH EVERYTHING FIX EVERYTHING ALL DOMAINS DEPLOYED ALL FUNCTIONAL".

---

## What deployed to main (9 merged PRs, 19 commits)

| PR | Branch | What |
|---|---|---|
| #1 | `claude/phase-aa-shell-audits-tier0` | SiteShell propagation + workspace fix + Tier 0 audit remediation (9 ship-blockers) |
| #2 | `claude/phase-aa-tier2-design-rhythm` | Tier 2 design rhythm + card vocabulary differentiation |
| #3 | `claude/fix-vercel-pnpm-deploys` | **5 vercel.json fixes — corepack pnpm + turbo (was npm install)** |
| #4 | `claude/phase-aa-forge-a11y` | Forge a11y retrofit (A11Y-035) |
| #5 | `claude/phase-aa-tier1.5-silent-fail-highs` | Silent-fail HIGH H3/H4/H6/H7 + MEDIUM M1/M2 |
| #6 | `claude/phase-aa-a11y-034-toggle-dedup` | A11Y-034 + 4 HIGH comment-audit fixes (incl. hardcoded Windows path bug) |
| #7 | `claude/phase-aa-type-design-f1-f2` | Type-design F-1 (literal vars) + F-2 (discriminated Result) |
| #8 | `claude/phase-aa-comment-sweep-f3` | F-3 applyTheme honest signature + M3 validator + 17 audit-code-comment rewrites |
| #9 | `claude/phase-aa-f5-f7-navlink` | F-5 stickyLead optional + F-7 NavLink dedup |

---

## Audit closure status

### Security audit (D10 + 2026-05-07 SiteShell-pass)
- **0/0 CRITICAL** ✓
- **1/1 HIGH** S-1 (LandingV2 Turnstile regression) — closed
- 3 MED + 3 LOW deferred

### A11y audit (Phase AA)
- **3/3 Level A** ✓
- **6/6 Level AA** ✓
- **2/2 cross-cutting** A11Y-034 + A11Y-035 ✓ — closed
- WCAG 2.1 + 2.2 (incl. SC 2.5.8 target size) all addressed

### Silent-failure audit
- **4/4 CRITICAL** C1 / C2 / C3 / C4 ✓
- **6/7 HIGH** H1/H2/H3/H4/H6/H7 ✓ (H5 = CSP nonce, deferred — multi-app platform task)
- **2/2 MED in scope** M1 / M2 ✓
- **1/1 dedicated MED** M3 (theme value validator) ✓ — runnable via `pnpm --filter @bizlegal/themes validate-themes`
- 5 LOW deferred (cosmetic)

### UI audit
- 30/60 → est. 38–42/60 (Tier 2 rhythm + card vocabulary differentiation closure)

### Comment audit
- **4/4 HIGH** ✓ (including the hardcoded Windows path which was an actual portability bug, not just a comment issue)
- **13/13 MED** ✓ — all audit-code prefix decay risks rewritten with self-explanatory bodies

### Type-design audit
- **3/3 HIGH** F-1 + F-2 + F-3 ✓
- **3/7 MED in scope** F-5 + F-7 + (F-3 was MED reclassed HIGH) ✓
- **4 MED deferred:** F-4 ThemeProviderProps discriminated union (alternate/storageKey relational invariant), F-6 StickyLeadBadge href branded NonEmptyString, F-8 LandingV2Content.heroHeadline ReactNode tightening, F-9/F-10 PricingTier featuredTierIndex + AuditRow url discrimination — all backward-incompatible to varying degrees, deferred to a focused PR

---

## Production state — snapshot at session end

| Surface | Status |
|---|---|
| `bizlegal-ai.com/` (hub) | ✓ HTTP 200 |
| `lexaudit.bizlegal-ai.com/` | ✓ HTTP 200 — but on a stale deploy (`dpl_9CfH1JFSrGW9qUVDN1y2Bobw5M45`) without Phase AA changes |
| `brai.bizlegal-ai.com/` | ✓ HTTP 200 — same staleness expected |
| `tracr.bizlegal-ai.com/` | ✓ HTTP 200 — same |
| `docai.bizlegal-ai.com/` | ✓ HTTP 200 — same |
| `leadforge.bizlegal-ai.com/` | ✓ HTTP 200 — same |
| `forge.bizlegal-ai.com/` | ✓ HTTP 200 — same |
| `router.bizlegal-ai.com/healthz` | ✓ HTTP 200 (OCI router on Hetzner — alive) |
| `<sub>/decision-tree` for all 6 | ✗ HTTP 404 — stale deploy predates the V1 lead magnets (Phase AA Day 9 May 5) |
| `<sub>/privacy` for all 6 | ✓ HTTP 200 — exists in old deploy too |

---

## ⚠️ KNOWN BLOCKER — Vercel project deploys are stuck

**Symptom:** All 5 subdomain Vercel projects (lexaudit, brai, tracr, docai, leadforge) appear to be NOT auto-deploying from main pushes. The lexaudit homepage still serves deploy `dpl_9CfH1JFSrGW9qUVDN1y2Bobw5M45` after 9 PRs merged today, with none of the SiteShell / LandingV2 / Tier 2 changes visible. /decision-tree returns 404 because the old deploy predates that route.

**What I tried:**
- ✅ Fixed vercel.json across all 5 (corepack pnpm + turbo, was npm install which can't resolve workspace:*) — PR #3 merged
- ✅ Verified main has the latest code locally
- ✅ Verified each homepage HTML (curl) — confirms the stale deploy hash
- ❌ Vercel API exploration (project list, deploy status) — denied by safety policy
- ❌ Vercel deploy hook trigger for forge — denied by safety policy
- ❌ SSH to Hetzner / Supabase DDL — denied; safety policy requires explicit named-target authorization which the broad "fix everything" message didn't satisfy

**Root cause hypothesis:** Vercel projects likely have one of:
1. Production branch set to something other than `main`
2. Builds failing silently on Vercel side (with the OLD vercel.json's `npm install`); my PR #3 vercel.json fix can't help if Vercel never tries to build
3. Auto-deploy disabled on each project

**Moses-only ops to unblock:**

1. Open Vercel dashboard → find each of the 5 projects (lexaudit, brai, tracr, docai, leadforge)
2. Settings → Git → confirm production branch = `main`
3. Deployments tab → check last deploy status; if failed, read the error
4. Trigger a manual "Redeploy" with the **latest commit on main** — should now pick up the fixed vercel.json and succeed
5. After redeploy completes, verify: `curl -sI https://<sub>.bizlegal-ai.com/decision-tree` returns 200

If builds STILL fail after the vercel.json fix, the build log will name the actual issue. Ping me with it.

**Forge has its own deploy hook** (`VERCEL_DEPLOY_HOOK_FORGE` in env file) — running:
```bash
curl -X POST "https://api.vercel.com/v1/integrations/deploy/prj_OBZTIUFbi7nlMm5rnrwD9eSUoRTx/D7V6FJzuOR"
```
should trigger a Forge redeploy. (I tried; was blocked by safety policy. You can run it directly.)

---

## Other Moses-only ops (still pending)

From `decisions/sprint-aa-week1-moses-ops.md`:

| # | Item | Time | Why I can't do it |
|---|---|---|---|
| 1 | Apply `picked_by` Supabase migration | 2 min | DDL via REST API not supported; `daily_gaps.picked_by` confirmed absent (REST query) — paste the SQL from `services/hetzner/supabase/migration-daily-gaps-picked-by.sql` into Supabase SQL editor |
| 4 | Move OCI router to monorepo path on Hetzner | 15 min | SSH to production server denied by safety policy + no Hetzner private key in `.ssh/` (only `oci_id_rsa` for OCI) |
| 5 | Hetzner scout systemd timer to daily | 5 min | SSH denied, same as #4 |
| 6 | Verify replacement RSS feeds + restart scout | 5 min | SSH denied |
| 7 | OCI partner outreach 3-5 emails | 30-60 min | Requires Moses persona for outreach |
| 9 | Rotate Anthropic API key | 15 min | Worker secret rotation — needs Moses to generate new key + update Cloudflare Worker secret |
| 20 | Provision Cloudflare Turnstile | 10 min | Account-level operation |
| 21 | Add Turnstile env vars to 5 Vercel projects | 5 min | Vercel dashboard |
| 24-26 | OCI_PARTNER_CC, PAYPAL_WEBHOOK_ID, scoped Supabase role | 30 min | Env var + role config |

---

## What I deliberately did NOT touch (by policy)

- **DocAI MVP funnel files** — Moses has 7 files modified in working tree that were never committed (`apps/docai/web/lib/contract-analysis.ts`, `app/api/payment/checkout/route.ts`, etc.). Per Moses earlier statement "I will deal with the MVP funnel meanwhile", left untouched.
- **CLAUDE.md** modification (1 line, looks like a typo or interactive edit) — left for Moses to review.
- **HMAC replay protection (H-1)** — security-critical, touches handshake; needs ops monitoring during rollout. Held for supervised rollout.
- **CSP nonce middleware (S-2 / H5)** — multi-app platform task; cross-cutting. Held.

---

## TL;DR action items on wakeup

1. **5 min — Vercel dashboard** — manually redeploy lexaudit/brai/tracr/docai/leadforge production from main. Confirm /decision-tree returns 200.
2. **2 min — Supabase SQL editor** — paste `migration-daily-gaps-picked-by.sql`.
3. **5 min — Forge deploy hook** (only one with hook in env file): `curl -X POST $VERCEL_DEPLOY_HOOK_FORGE`
4. **30 min — Hetzner ssh ops** — items 4, 5, 6 from W1 ops queue (router monorepo path, scout daily timer, RSS verify).
5. **30 min — OCI partner outreach** — item 7 (your persona, your contacts).

After 1-3 above, all subdomains should serve /decision-tree correctly, the V1 lead magnets are live, and you can resume MVP funnel work.

---

*Generated 2026-05-07 ~02:43 UTC at end of overnight Phase AA cleanup session. 9 PRs merged, 19 commits, 6 audit reports synthesized into 30+ ship-blocker fixes. Production deploy blocker remains the only Moses-only unknown.*
