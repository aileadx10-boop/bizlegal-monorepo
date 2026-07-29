# Vercel stopped deploying on push — 2026-07-29

**Status:** unresolved. Needs one Moses action (§4).
**Impact:** `bizlegal-ai.com` is serving commit `175e87b`. Two later commits are on
GitHub and invisible in production.

---

## 0 — The one-line lesson

**A push is not a deploy.** `git status -sb` showing `## main...origin/main`
proves GitHub has the commit and nothing more. Polling the live URL cannot tell
you "not deployed yet" apart from "deployed and broken" — it returns the old
page either way. Always verify against the deployment list.

This cost most of a session. It is the same class of failure as the `/guides`
redirect bug: green locally, absent in production, invisible unless you look at
the right place.

---

## 1 — What happened

| Commit | On GitHub | Vercel deployment | In production |
|---|---|---|---|
| `175e87b` fix hub RSC event handlers | yes | READY 21:14:54Z | **yes** |
| `de0d387` stop 308ing 66 guides + blog | yes | **none** | no |
| `1888962` `/learn` two-track layer | yes | **none** | no |

`git ls-remote origin refs/heads/main` → `188896266b4b…` — GitHub holds the tip.
Local `main` matches. The push side is clean.

## 2 — How it was root-caused (repeat this, do not re-derive it)

The decisive evidence is the **GitHub Deployments API**, not the Vercel list and
definitely not curling the site. Vercel creates a GitHub deployment record the
moment it accepts a push:

```bash
gh api "repos/aileadx10-boop/bizlegal-monorepo/deployments?per_page=10" \
  --jq '.[] | "\(.sha[0:7])  \(.created_at)  env=\(.environment)"'
```

Result:

```
175e87b  2026-07-29T21:18:44Z  env=Production – bizlegal-ai
175e87b  2026-07-29T21:17:19Z  env=Production – lexaudit
175e87b  2026-07-29T21:16:45Z  env=Production – trcr
175e87b  2026-07-29T21:16:08Z  env=Production – brai
175e87b  2026-07-29T21:15:39Z  env=Production – docai-frontend
175e87b  2026-07-29T21:15:35Z  env=Production – forge
175e87b  2026-07-29T21:15:29Z  env=Production – leadforge-ai
fe5b3d3  2026-07-25T23:02:58Z  env=Production – bizlegal-ai
```

`175e87b` fanned out to **all 7** projects. `de0d387` and `1888962` produced
**zero** records on **any** project.

**That scope is the finding.** Seven projects stopping at the same instant is not
seven broken webhooks and not a project setting — it is account-level: either the
Vercel GitHub App connection or a plan/usage gate.

### Ruled out, with the evidence

- **Not a rate limit.** 20 deployments across 16 days on `bizlegal-ai`.
- **Not the stray `hub` project** (`prj_PumLYKKMLhWUb15G5v4C3SFPNQN0`, linked from
  `apps/hub/.vercel/`). Its last build was 2026-05. Pushes are not landing there.
- **Not a dead integration.** `175e87b` has `source: "git"` and
  `githubDeployment: "1"` — it worked 38 minutes before the failing pushes.
- **Not a build failure.** A failed build still creates a deployment record with
  state ERROR. There is no record at all.

### A trap in the tooling

`list_deployments` with a `since` timestamp in the **future** returns
`count: 0` and looks exactly like "nothing deployed". Verify the epoch before
trusting an empty result. Prefer no `since` and read the newest entry.

## 3 — Two project-link files, pointing at different projects

```
.vercel/project.json           → prj_vHUtI3FMPRIs2Qhih9Znh8j5a98v  "bizlegal-ai"  ← production, holds bizlegal-ai.com
apps/hub/.vercel/project.json  → prj_PumLYKKMLhWUb15G5v4C3SFPNQN0  "hub"          ← stray, no domain, dead since May
```

Deploy the hub **from the repo root**, never from `apps/hub`. The root link
targets the real project, whose own Root Directory setting (`apps/hub`) then
applies. Running `vercel` inside `apps/hub` ships to the stray project and
silently changes nothing on the live domain.

## 4 — The fix (Moses-only)

An agent in auto mode cannot run a production deploy — correctly, it is a live,
outward-facing action. Run from the repo root:

```bash
cd "c:/Users/Moshe Dor/bizlegal-monorepo"
vercel --prod
```

Then confirm — **against the deployment list, not the URL**:

```bash
vercel ls bizlegal-ai | head -3
```

Only once a new deployment reads READY, check the pages the two commits fix:

- `/guides` and any one of the 66 guide pages → expect 200, previously 308
- `/blog` → 200
- `/learn`, `/learn/real-estate`, `/learn/founders`, and one free lesson → 200

If pushes still do not auto-deploy afterwards, reconnect the integration in the
Vercel dashboard: **Project → Settings → Git → disconnect, then reconnect
`aileadx10-boop/bizlegal-monorepo`**, and check **Account → Usage** for a
plan limit. Both are dashboard-only.

## 5 — Why this mattered more than it looks

`de0d387` is the commit that un-breaks 66 guide pages and the blog index. Those
pages were built, routed, and sitemapped, and 308-redirected off-site for roughly
three months because the deployment that introduced them (`24b9519`) sits inside
a long unbroken ERROR run. Search engines have been offered 66 URLs that
redirect. Until a deployment lands, that is still true.

`1888962` is the `/learn` demand test. It cannot start collecting signal — the
thing it exists to measure — while it is undeployed.
