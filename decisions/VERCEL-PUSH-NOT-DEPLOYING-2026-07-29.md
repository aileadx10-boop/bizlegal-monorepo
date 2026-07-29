# Vercel stopped deploying on push — 2026-07-29

**Status:** self-resolved. **No Moses action needed** — see §4.
**Impact while it lasted:** `bizlegal-ai.com` served `175e87b` for ~45 minutes
while two later commits sat on GitHub with no deployment. The next push
(`c40ea14`) deployed normally and carried both of them, because it is their
descendant.

> **Read §4 before acting on §1–§3.** Those sections record the investigation as
> it stood mid-incident, when the evidence pointed at a permanent account-level
> block. That conclusion was wrong. The diagnostic method in §2 is the part worth
> keeping.

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

## 4 — What actually fixed it: the next push

No dashboard work, no manual deploy. Pushing `c40ea14` (this document) triggered
a normal production deployment, and because it descends from both stalled
commits, that one build shipped all three.

| Commit | Deployment |
|---|---|
| `175e87b` | READY 21:14:54Z |
| `de0d387` | none — skipped |
| `1888962` | none — skipped |
| `c40ea14` | QUEUED 22:00:04Z → carries `de0d387` + `1888962` |

**So the §2 conclusion was wrong.** Seven projects going quiet at once looked
account-level, and it was not: it was a transient gap that swallowed exactly two
pushes over 45 minutes, inside a single UTC day. Things it was *not*, checked:

- Not a daily quota reset — `c40ea14` deployed at 22:00Z, two hours before UTC
  midnight, not after it.
- Not a Root Directory file filter — `c40ea14` touches only `CLAUDE.md` and
  `decisions/`, both *outside* `apps/hub`, and it deployed anyway. Meanwhile the
  two skipped commits both touch `apps/hub`. The filter theory fails in both
  directions.
- Not an auto-cancel — cancellation leaves a record with state `CANCELED`
  (`ed60c653` has one). There was no record at all.

The proximate cause is unverifiable from here: Vercel connects via a GitHub App,
so its webhook delivery log is not readable through `gh api` without owning the
app. Treat it as a transient drop in Vercel's git ingestion.

### The operational rule this leaves behind

**When a push produces no deployment, push again before touching any settings.**
An empty commit is enough:

```bash
git commit --allow-empty -m "chore: retrigger deploy" && git push origin main
```

Then confirm — **against the deployment list, not the URL** (§2 explains why the
URL cannot tell you):

```bash
gh api "repos/aileadx10-boop/bizlegal-monorepo/deployments?per_page=5" \
  --jq '.[] | "\(.sha[0:7])  \(.created_at)  env=\(.environment)"'
```

Only escalate to the dashboard — **Project → Settings → Git**, reconnect, and
**Account → Usage** for a plan limit — if a *second* push also produces nothing.
Do not disconnect the integration on the strength of one missed push; that risks
breaking a working setup to fix something that has already healed.

## 5 — Why this mattered more than it looks

`de0d387` is the commit that un-breaks 66 guide pages and the blog index. Those
pages were built, routed, and sitemapped, and 308-redirected off-site for roughly
three months because the deployment that introduced them (`24b9519`) sits inside
a long unbroken ERROR run. Search engines have been offered 66 URLs that
redirect. Until a deployment lands, that is still true.

`1888962` is the `/learn` demand test. It cannot start collecting signal — the
thing it exists to measure — while it is undeployed.

## 6 — Post-deploy checks (run these once `c40ea14` reads READY)

- `/guides` and any one of the 66 guide pages → expect 200, previously 308
- `/blog` → 200
- `/learn`, `/learn/real-estate`, `/learn/founders`, one free lesson → 200
- one gated lesson → 200 with headings only, no body
