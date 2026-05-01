# MONOREPO_AGENT_PROMPT — Phased prompts for the BizLegal-AI monorepo migration

**Audience:** a future Claude Code agent session (you, but starting fresh).
**Estimated total time:** 3-5 days of agent work + ~30 min Moses ops (Vercel Root Directory setting per project).
**Prereqs:** Phase A from `decisions/MOSES_OPS_HANDOFF.md` is complete (chain green) AND first paying customer has landed (per the Phase U gate in `decisions/concurrent-bouncing-kitten.md`).

---

## Master prompt — paste this first into a fresh agent session

```
You are taking over the bizlegal-ai pivot at the monorepo-consolidation
milestone. Phase O+P+Q+R+S+T+V0+V1+V2 is DONE — 23 PRs merged across 8 repos
(see decisions/concurrent-bouncing-kitten.md for the prior plan). The user
is Moses, founder of BizLegal AI, building compliance-as-a-service.

Your job over the next 3-5 days: consolidate 9 source repos into a single
pnpm + Turborepo monorepo at C:/Users/Moshe Dor/bizlegal-monorepo/, while
preserving git history per app and zero downtime on Vercel deploys.

Source repos (current state):
1. bizlegal-ai          → apps/hub/
2. trcr                 → apps/tracr/
3. BRAI/frontend-next   → apps/brai/
4. lexaudit             → apps/lexaudit/
5. docai-monorepo/web   → apps/docai/
6. leadforge-ai/frontend → apps/leadforge/
7. BIZLEGAL PROJECTS/forge/apps/web → apps/forge/
8. (optional, if exists) bizlegal-seo-site → apps/blog/
9. executive-assistant workspace, three sub-projects:
   - projects/oci-deal-router → services/oci/
   - projects/hetzner-curator → services/hetzner/
   - projects/bizlegal-lead-intake → services/worker/

Target shape:
  bizlegal-monorepo/
  ├── apps/
  │   ├── hub/ tracr/ brai/ lexaudit/ docai/ leadforge/ forge/ [blog/]
  ├── services/
  │   ├── oci/ hetzner/ worker/
  ├── packages/
  │   ├── ops-log/         # @bizlegal/ops-log (TS + Python sibling)
  │   ├── firecrawl/       # @bizlegal/firecrawl (already 2 copies in lexaudit + hub)
  │   ├── safe/            # @bizlegal/safe (PII redaction, from lexaudit)
  │   ├── ui-v2/           # @bizlegal/ui-v2 (PricingTierCard, AgentCheckoutButton, NumberedStep)
  │   ├── theme/           # CSS tokens
  │   └── policy-refresh/  # @bizlegal/policy-refresh frameworks
  ├── agents/              # New agent metadata + prompt seeds (V3-V7 candidate specs)
  ├── decisions/           # All planning + ops docs (move from bizlegal-ai/decisions/)
  ├── infrastructure/      # Caddyfile, docker-compose, systemd, Hetzner setup, OCI Terraform
  ├── supabase/            # Consolidated migrations
  ├── package.json         # pnpm workspaces root
  ├── pnpm-workspace.yaml
  ├── turbo.json
  └── tsconfig.base.json

Hard constraints (read these BEFORE planning):

1. **Enter plan mode immediately.** Do not modify any file before
   producing a plan and getting user approval via ExitPlanMode.

2. **Preserve git history.** Use `git subtree add --prefix=apps/<name>
   https://github.com/aileadx10-boop/<repo>.git main` to import each
   repo. Do NOT use git submodules.

3. **DO NOT touch payment-gateway code.** Per decisions/PAYMENT_URLS_VAULT.md,
   you SHALL NOT modify any app/api/payments/*, app/api/<x>/create-order,
   app/api/<x>/webhook, or any consumer of NEXT_PUBLIC_NOWPAYMENTS_* /
   NEXT_PUBLIC_PAYPAL_* env vars. Pricing-tier amounts in
   app/agents/*/page.tsx PricingTierCard prices blocks are immutable
   for this migration. Payment-gateway consolidation is a SEPARATE phase
   that runs AFTER monorepo is verified (do not start it).

4. **DO NOT change Vercel domain aliases.** The 7 production domains
   (bizlegal-ai.com, tracr/brai/lexaudit/docai/leadforge/forge.bizlegal-ai.com)
   stay attached to their existing Vercel projects throughout the
   migration. The migration only changes "Root Directory" in each
   Vercel project's settings — Moses owns those clicks.

5. **DO NOT delete source repos.** They stay live during the entire
   migration. Only after Moses verifies all 7 apps deploy from the
   monorepo for 7 consecutive days do we plan deletion (separate task).

6. **No production rollouts.** The migration ships everything to feature
   branches per phase. Each phase's verification gate must pass before
   the next phase starts. Production rollouts happen ONLY when Moses
   flips the Vercel project's Root Directory to point at the monorepo
   path.

7. **No new features.** This migration only moves code. New features /
   bug fixes from this period get queued and applied AFTER the new
   monorepo Vercel deploy is live. The risk of mixing migration-moves
   with feature-changes is too high.

8. **Phase U is the wave 3 trigger** per decisions/concurrent-bouncing-kitten.md.
   Confirm Wave 3 prerequisites with the user before starting:
   (a) first paying customer landed,
   (b) Phase P/A fully done (chain green per /api/ops/health),
   (c) at least 14 days of /ops traffic data captured.

9. **Use git-subtree, not subtree-merge.** The history-preservation
   tool is `git subtree add --prefix=apps/<name> <remote> <branch>`.
   You do this from the empty monorepo, fetching each source. Do NOT
   use `git merge --allow-unrelated-histories` (creates ugly merge
   commits in the history).

10. **Reference docs (READ FIRST):**
    - decisions/PARAMETERS_RUNBOOK.md → which envs each app needs
    - decisions/PAYMENT_URLS_VAULT.md → 14+ NEXT_PUBLIC_* names that
      MUST be preserved verbatim
    - decisions/MOSES_OPS_HANDOFF.md → status of Phase A / V-gate
    - decisions/concurrent-bouncing-kitten.md → Phase U section
      (this is the canonical plan, monorepo agent's source of truth)

11. **Verification gate per phase:** each of the 4 phase sub-prompts
    below has a "stop and verify" block. Do NOT proceed to the next
    phase if the verification check fails. Pause and ask Moses what
    to do.

12. **Tooling: pnpm + Turborepo + TypeScript 5+.** Python services
    use the existing requirements.txt; add pyproject.toml only if a
    Python sibling package is extracted.

Your starting actions:
  1. Read the 4 reference docs.
  2. Survey the 9 source repos (verify git remote, branch state,
     .vercel/project.json presence, presence of node_modules vs
     committed lockfile).
  3. Enter plan mode and propose the phased migration plan.
  4. Present via ExitPlanMode for Moses approval.
  5. After approval, execute Phase A only. Pause at the verification
     gate. Ask before Phase B.

The 4 phase sub-prompts below are reference material for you — paste
each in turn after the prior phase verifies.
```

---

## Phase A sub-prompt — Scaffold + extract @bizlegal/ops-log (~4-6h)

```
Execute Phase A of the bizlegal-monorepo migration.

Goal: empty monorepo scaffold + first shared package extracted.

Steps:
1. Create C:/Users/Moshe Dor/bizlegal-monorepo/ as a fresh git repo.
2. Add root files:
   - package.json with `"workspaces": ["apps/*", "services/*", "packages/*"]`,
     pnpm engines: { node: ">=20" }
   - pnpm-workspace.yaml (mirror)
   - turbo.json with build / dev / lint / test / typecheck pipelines
   - tsconfig.base.json (strict, NodeNext, ES2023)
   - .gitignore (node_modules, .turbo, .next, dist, .env)
   - README.md with the layout map + "see decisions/ for plans"
3. Create empty placeholder dirs with .gitkeep: apps/, services/,
   packages/, agents/, decisions/, infrastructure/, supabase/.
4. Move decisions/*.md from bizlegal-ai/decisions/ into the monorepo
   decisions/ via git subtree (preserves history) OR git mv (loses
   bizlegal-ai history but cleaner — ASK Moses which he prefers).
5. Extract @bizlegal/ops-log:
   - packages/ops-log/package.json: name "@bizlegal/ops-log", main
     "dist/index.js", types "dist/index.d.ts"
   - packages/ops-log/src/index.ts: copy from bizlegal-ai/lib/ops/log.ts
     verbatim. Re-export OpsEventType, LogEventInput, logEvent,
     logEventAsync, getClient.
   - packages/ops-log/python/ops_log.py: copy from
     executive-assistant/projects/hetzner-curator/ops_log.py.
     This is the Python sibling — both Hetzner curator and OCI
     deal-router will import from packages/ops-log/python via
     sys.path or pyproject.toml.
   - packages/ops-log/tsconfig.json extending root.
   - Build: `pnpm -F @bizlegal/ops-log build` produces dist/.
6. Verify pnpm install works at root, turbo build dry-run for
   ops-log produces no error.

Verification gate (DO NOT PROCEED until all green):
  - `pnpm install` clean, no lockfile errors
  - `pnpm -F @bizlegal/ops-log build` produces dist/index.{js,d.ts}
  - `pnpm typecheck` clean across the (empty so far) workspace
  - git status clean OR PR ready for Moses review
  - decisions/ contents migrated (verify by `ls monorepo/decisions/`)

Report to Moses with: tree output of monorepo, build artifacts, any
git history concerns, and confirmation that no source repo was modified.

DO NOT proceed to Phase B without explicit user approval.
```

---

## Phase B sub-prompt — Migrate apps/ via git subtree (~1-2 days)

```
Execute Phase B of the bizlegal-monorepo migration.

Goal: 7 (or 8) apps live under apps/<name>/ with preserved git history,
sharing @bizlegal/ops-log + @bizlegal/firecrawl + @bizlegal/ui-v2.

Order (revenue-priority — DO NOT change):
  1. hub      (apps/hub/)        — bizlegal-ai
  2. forge    (apps/forge/)      — only currently live revenue subdomain
  3. docai    (apps/docai/)      — V1 spear product surface
  4. lexaudit (apps/lexaudit/)
  5. tracr    (apps/tracr/)
  6. brai     (apps/brai/)
  7. leadforge (apps/leadforge/)
  8. blog (apps/blog/) — IF bizlegal-seo-site is a separate Vercel project

Per-app procedure:
  1. From monorepo root: `git subtree add --prefix=apps/<name>
     https://github.com/aileadx10-boop/<repo>.git main`
     (preserves history under apps/<name>/)
  2. Inside apps/<name>/, adjust:
     - package.json name → "@bizlegal/<name>"
     - package.json devDependencies: hoist common deps to root
     - tsconfig.json extends "../../tsconfig.base.json"
     - next.config.js paths: experimental.outputFileTracingRoot
       set to "../../"
     - vercel.json: keep as-is (Vercel will read root from project's
       Root Directory setting, not from vercel.json)
  3. Replace local copies with shared packages:
     - hub: lib/ops/log.ts → import from @bizlegal/ops-log
            lib/firecrawl/scrape.ts → import from @bizlegal/firecrawl
     - lexaudit: same swap
     - all apps with PricingTierCard / AgentCheckoutButton: import
       from @bizlegal/ui-v2 instead of local app/components/ui-v2/
     - DELETE the duplicated files (lib/ops/log.ts, lib/firecrawl/,
       app/components/ui-v2/) once import-replaced
  4. Run `pnpm install` from monorepo root → adds the new app to
     workspace lockfile.
  5. Run `pnpm -F @bizlegal/<name> build` → must succeed before
     proceeding to next app.
  6. Commit per-app PR: "feat(monorepo-B<n>): migrate <name>"

After all 7 apps migrated:
  - Run full `pnpm turbo run build` from root → ALL apps build green.
  - Run `pnpm turbo run lint` + `pnpm turbo run typecheck` → all green.
  - Verify no app references local lib/ops/log.ts (grep should return 0).

CRITICAL preservation checks:
  - Every NEXT_PUBLIC_NOWPAYMENTS_* / NEXT_PUBLIC_PAYPAL_* env name in
    decisions/PAYMENT_URLS_VAULT.md still appears in the new monorepo
    code (grep across apps/ confirms).
  - No app/api/payments/* file modified during migration (git diff
    should show only import-path changes, not body changes).
  - Pricing-tier prices in app/agents/*/page.tsx unchanged.

Verification gate:
  - `pnpm turbo run build lint typecheck` all green
  - All 8 PRs merged to monorepo main (one per app)
  - Source repos unchanged (read-only verification: ls -la each repo's
    .git/HEAD vs prior recorded commit)
  - decisions/PAYMENT_URLS_VAULT.md grep verification passes

Report to Moses with: per-app build output, total LOC moved, count of
@bizlegal/ops-log import sites (replaces 7 local copies). Provide
exact `vercel project setting` commands per app for the Root Directory
update. Moses runs those.

DO NOT proceed to Phase C without explicit user approval. After
approval, Moses also runs the Vercel "Root Directory" rewires per
app — wait for him to confirm production deploys still work before
Phase C.
```

---

## Phase C sub-prompt — Migrate services/ (~1 day)

```
Execute Phase C of the bizlegal-monorepo migration.

Goal: 3 service projects (OCI Python / Hetzner Python / Cloudflare Worker
TS) under services/, sharing @bizlegal/ops-log via the Python sibling
package + the TS package.

Per-service procedure:

services/oci/ — from executive-assistant/projects/oci-deal-router/
  1. `git subtree add --prefix=services/oci
     https://github.com/aileadx10-boop/bizlegal-ea.git main`
     (subtree fetches the whole bizlegal-ea repo; we only want the
     oci-deal-router subdir — see Phase D cleanup)
  2. Update services/oci/router/ Python imports:
     - from ops_log import log_event
       → from packages.ops_log.python.ops_log import log_event
     OR add packages/ops-log/python to PYTHONPATH via pyproject.toml
  3. Delete services/oci/router/ops_log.py (now provided by
     packages/ops-log/python)
  4. Update services/oci/Dockerfile to ADD the packages/ dir + set
     PYTHONPATH=/app:/app/packages/ops-log/python
  5. Verify `python -m py_compile services/oci/router/*.py` clean
  6. Update systemd unit paths: docker exec deal-router python
     /app/payout_reconciler.py still works (Dockerfile mounts the
     subtree path correctly)

services/hetzner/ — from executive-assistant/projects/hetzner-curator/
  1. `git subtree add --prefix=services/hetzner
     https://github.com/aileadx10-boop/bizlegal-ea.git main`
     (NOTE: this subtree-adds the SAME bizlegal-ea remote — handle
     conflict by importing once at apps/blog level if blog is in
     bizlegal-ea, then carving services/hetzner from it via path
     filter. ASK Moses if uncertain.)
  2. Update Python imports in scout.py / brain.py / publisher.py / bot.py:
     - from ops_log import log_event
       → from packages.ops_log.python.ops_log import log_event
     - from firecrawl_enrich import ...
       → from packages.firecrawl_enrich.python import ... (if extracted)
  3. Delete services/hetzner/ops_log.py
  4. systemd units in services/hetzner/systemd/ get updated paths:
     WorkingDirectory=/opt/bizlegal-monorepo/services/hetzner
     EnvironmentFile=/opt/bizlegal-monorepo/services/hetzner/.env
  5. Verify `python -m py_compile` clean

services/worker/ — from executive-assistant/projects/bizlegal-lead-intake/
  1. `git subtree add --prefix=services/worker
     https://github.com/aileadx10-boop/bizlegal-ea.git main`
     (same subtree-conflict caveat as above)
  2. Update src/ops-log.ts:
     - import the @bizlegal/ops-log types where compatible
     - Worker still ships its own crypto.subtle HMAC implementation
       (Cloudflare Worker runtime != Node runtime — keep the divergent
       implementation but type-share)
  3. wrangler.toml stays under services/worker/, not at monorepo root
  4. Verify `pnpm -F @bizlegal/worker typecheck` clean (or wrangler
     deploy --dry-run if available)

After all 3 services migrated:
  - Run `pnpm install` (worker pulls @bizlegal/ops-log via workspace dep)
  - Run `python -m py_compile` across services/oci/router/*.py +
    services/hetzner/*.py — all clean
  - `pnpm -F @bizlegal/worker typecheck` clean

Verification gate:
  - 3 service subtrees in monorepo with preserved history
  - All Python compiles clean
  - Worker typecheck clean
  - Hetzner systemd units have updated paths
  - OCI Dockerfile builds successfully (`docker build services/oci/`)

Report to Moses with: services tree, Python module paths, deploy
script changes needed (Hetzner /opt/bizlegal-monorepo/, OCI Docker
mount, Worker wrangler).

Phase D follows after Moses confirms Phase C verification.
```

---

## Phase D sub-prompt — Cleanup + verify (~half day)

```
Execute Phase D of the bizlegal-monorepo migration.

Goal: monorepo is a SINGLE source of truth for all 8 apps + 3 services +
6 packages. Old per-repo locations are archived (read-only). Verification
matrix passes end-to-end.

Steps:
1. Consolidate supabase/migrations/ into monorepo supabase/migrations/:
   - Copy from bizlegal-ai/supabase/migrations/, lexaudit/supabase/
     migrations/, hetzner-curator/supabase/, oci-deal-router/supabase/
   - Rename with chronological prefix (YYYYMMDD_<app>_<feature>.sql)
   - Update each app's reference docs to point at the consolidated path

2. Move OUTREACH_KIT.md, AGENTS_BRAINSTORM_V2.md, MRR_30K_PATH.md,
   PARAMETERS_RUNBOOK.md, PAYMENT_URLS_VAULT.md, MOSES_OPS_HANDOFF.md,
   concurrent-bouncing-kitten.md (if it lives in plans/) into
   monorepo/decisions/. Single canonical location.

3. Add monorepo CODEOWNERS file:
   /apps/hub/        @aileadx10-boop
   /apps/tracr/      @aileadx10-boop
   /services/oci/    @aileadx10-boop
   ... etc
   /packages/        @aileadx10-boop  (always require Moses review)
   /supabase/        @aileadx10-boop

4. Add monorepo .github/workflows/ci.yml that runs on every PR:
   - pnpm install
   - pnpm turbo run lint typecheck build test
   - per-app smoke check (curl /api/digest after preview deploy)

5. Archive old repos via README.md update at the root of each old repo:
   "This repository has been consolidated into bizlegal-monorepo.
    See aileadx10-boop/bizlegal-monorepo for the canonical source.
    This repo remains read-only for git history reference."
   DO NOT delete the old repos — just mark archived in GitHub UI.

6. Per-app Vercel "Root Directory" rewiring (Moses task — give him a
   ready-to-copy table):
   | Vercel project | Old Root Dir | New Root Dir |
   |---|---|---|
   | bizlegal-ai | / | apps/hub |
   | tracr | / | apps/tracr |
   | brai | frontend-next | apps/brai |
   | lexaudit | / | apps/lexaudit |
   | docai | web | apps/docai |
   | leadforge | frontend | apps/leadforge |
   | forge | apps/web | apps/forge |
   Moses sets these in Vercel UI per project. The Vercel Production
   deploy then pulls from the monorepo path.

7. Per-service deploy update (Moses task):
   - Hetzner: ssh hetzner; sudo systemctl stop curator-*;
     git clone bizlegal-monorepo /opt/bizlegal-monorepo;
     sudo systemctl start curator-* (with new WorkingDirectory paths)
   - OCI: similar pattern, update docker-compose path
   - Worker: cd services/worker; wrangler deploy

8. Verification matrix:
   curl -s "https://bizlegal-ai.com/api/ops/health?t=$OPS_DASHBOARD_TOKEN" \
     | jq '.summary.chain_healthy'   # → true
   for app in hub tracr brai lexaudit docai leadforge forge; do
     echo "$app: $(curl -sk -o /dev/null -w '%{http_code}' https://${app/hub/bizlegal-ai}.bizlegal-ai.com)"
   done   # → all 200
   curl -s "https://bizlegal-ai.com/api/ops/feed?token=$OPS_DASHBOARD_TOKEN" \
     | jq '.events | map(select(.event_type == "heartbeat" and .ref_id |
                          startswith("curator/"))) | length'
     # → > 0 within 10 min of Hetzner restart
   curl -X POST https://router.bizlegal-ai.com/lead -H 'X-Admin-Secret: $OCI_ADMIN_SECRET' \
     -d '{"jurisdiction":"AE","intent":"smoke test"}' | jq '.ok'
     # → true + referral.received event on /ops

Verification gate (FINAL):
  - All 8 apps return 200 from production URL
  - HMAC chain green on /api/ops/health
  - Heartbeats arriving from services
  - At least 1 successful production deploy from monorepo per app
  - Old repos marked archived in GitHub UI
  - decisions/PAYMENT_URLS_VAULT.md grep verification passes
    (every var name still in code)
  - 7 days observed with no regression on /ops feed

Report to Moses with: final tree, deploy URLs, archive status,
verification matrix output. After 7 days observed clean, propose
deletion plan for old repos as a follow-up task (Moses approval
required — Phase U does not delete; that's Phase Z optional).

End of Phase D. Hand back to Moses.
```

---

## After Phase D — separate phases (do NOT bundle)

These are intentionally listed AFTER the migration sub-prompts to make clear they are NOT part of the migration. Each is a separate agent prompt / PR.

### Post-1: Payment-gateway consolidation
- Audit env-pinned URLs vs dynamic generation
- Extract `packages/payment/` (NOWPayments + PayPal SDK)
- Migrate hub from env-pinned to dynamic (when LemonSqueezy / Paddle approved)

### Post-2: V3-V6 V-gate-triggered ships
- V3 Lawyer AI Hallucination Audit
- V4 Stripe Connect Marketplace
- V5 MiCA Auditor (doc-first)
- V6 OFAC SDN Sweeper

### Post-3: V0 follow-ups parked in Phase V plan
- OCI partner portal (Phase W consideration)
- Subdomain domain alias to `apps/<name>` if Vercel UX gets confusing post-merge

### Post-4: Old repo deletion (after 7 days clean monorepo deploy)
- Delete via gh CLI: `gh repo delete <owner/repo> --confirm`
- Update CNAME / DNS records if any pointed at old project URLs

---

## How to use this doc

1. Wait until the monorepo trigger fires (first paying customer landed + Phase A green + 14d traffic data).
2. Open a fresh Claude Code session. Paste the **master prompt** at the top of this doc.
3. The agent enters plan mode, reads the 4 reference docs, surveys the source repos, proposes a phased plan.
4. After approval, paste **Phase A sub-prompt** to start the migration.
5. After Phase A verification gate passes, paste **Phase B sub-prompt**.
6. Repeat through Phase D.
7. Each phase ends with a verification gate — DO NOT skip them. Pause and ask the user if anything fails.

The master prompt + 4 sub-prompts are deliberately scoped so each fits comfortably in a Claude Code session's context window. The agent loses context between sessions, but the verification gates make recovery straightforward.

If a future agent revision requires updates: edit this doc in a follow-up PR. Do NOT mutate the prompts mid-migration.
