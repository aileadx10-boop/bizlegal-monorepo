# SEO Fixes — Hub + Blog (2026-04-28)

**Owner split:** Claude (autonomous) ↔ Moses (dashboard auth)

This file documents what's wrong with our current SEO automation, what got fixed in `feat/i-sitemap-seo-fixes`, and what Moses still needs to do from his side (dashboards Claude can't reach).

---

## TL;DR — 3 highest-leverage fixes

1. **Cloudflare Pages deploy hook** — without `CF_PAGES_DEPLOY_HOOK` set as a GitHub Actions secret, the daily MDX commits from `seo-cron.yml` never trigger a blog rebuild. Auto-articles sit in `main` forever and Google never sees them.
2. **Hub sitemap completeness** — fixed in this PR. Previously missed `/agents`, `/risk-engine`, `/jurisdictions`, `/marketplace`, all 6 subdomain landing pages, and 7 vertical SEO landing pages. ~17 new URLs added.
3. **Google Search Console** — both `bizlegal-ai.com` and `blog.bizlegal-ai.com` need to be added as verified properties + sitemap submitted. Without this, Googlebot may eventually discover URLs but indexing latency is multiple weeks longer.

---

## What Claude fixed in this PR

### `app/sitemap.ts`

**Before:** 32 URLs, missing all the revenue-driving product surfaces.

**After:** 49 URLs. Added under three sections:

```text
// Hub product surfaces (revenue-driving)
- /agents
- /risk-engine
- /jurisdictions
- /marketplace

// Subdomain landing pages on the hub
- /tracr
- /brai
- /docai
- /lexaudit
- /leadforge
- /forge

// Vertical SEO landing pages
- /digital-asset-risk-analysis
- /digital-asset-regulatory-intelligence
- /cross-border-compliance
- /mica-regulation-2025
- /blockchain-report
- /calculators
- /methodology-library
```

`changeFrequency` and `priority` set per the existing convention. Verify after deploy via `curl -s https://bizlegal-ai.com/sitemap.xml | grep -c '<url>'` — should return ≥ 49.

---

## What Moses needs to do from his dashboards

### 1. Cloudflare Pages deploy hook (CRITICAL)

Without this, the daily MDX commits from `.github/workflows/seo-cron.yml` (Mon-Fri 09:00 UTC) never rebuild the blog. The commit lands in `main`, but Cloudflare Pages doesn't know to redeploy.

**Steps:**

1. Open Cloudflare dashboard → Pages → blog project → Settings → **Builds & deployments**
2. Scroll to **Deploy hooks** section → click **Add deploy hook**
3. Name: `seo-cron-trigger` · Branch: `main` → click **Save**
4. Copy the generated webhook URL (looks like `https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/<uuid>`)
5. In GitHub: `aileadx10-boop/bizlegal-ea` repo → Settings → Secrets and variables → **Actions** → **New repository secret**
6. Name: `CF_PAGES_DEPLOY_HOOK` · Value: paste the webhook URL → **Add secret**
7. Verify: trigger a manual run of `seo-cron.yml` from Actions tab. Expect to see `200 OK` from the curl-to-CF step.

**Verification command (on Moses's laptop after step 7):**

```bash
curl -sI "https://blog.bizlegal-ai.com" | head -3
# Should show 200 OK and Last-Modified within the last hour
```

### 2. Google Search Console (HIGH)

GSC accelerates indexing dramatically and gives you the only real diagnostic for "why isn't this URL showing up".

**Steps for `bizlegal-ai.com`:**

1. Open https://search.google.com/search-console
2. Click **Add property** → **URL prefix** → enter `https://bizlegal-ai.com`
3. Verify via DNS TXT record (preferred since DNS is on Namecheap) — copy the TXT value, paste into Namecheap → Advanced DNS → Add new record (type=TXT, host=@, value=google-site-verification=…)
4. Wait ~10 min, then click **Verify**
5. Once verified: left nav → Sitemaps → enter `sitemap.xml` → **Submit**
6. Hit the ping endpoint to nudge:
   ```bash
   curl 'https://www.google.com/ping?sitemap=https://bizlegal-ai.com/sitemap.xml'
   ```

**Steps for `blog.bizlegal-ai.com`:**

1. In GSC → **Add property** → **URL prefix** → `https://blog.bizlegal-ai.com`
2. Verify via DNS (same TXT pattern, but on the blog subdomain — host=`blog`)
3. Sitemaps → submit `sitemap.xml`
4. Ping:
   ```bash
   curl 'https://www.google.com/ping?sitemap=https://blog.bizlegal-ai.com/sitemap.xml'
   ```

### 3. Verify blog indexing actually happens

After steps 1+2, wait 48-72h then check:

```bash
# Should return some results within 7 days
google.com/search?q=site:blog.bizlegal-ai.com
google.com/search?q=site:bizlegal-ai.com
```

If still ZERO results after 7 days, escalate to Claude — there may be a robots.txt or structured-data issue I can debug.

---

## What I observed during the audit

- **Last meaningful blog content push:** 2026-04-13 (sitemap activity since then has been index-only touches, not new content)
- **`site:blog.bizlegal-ai.com` Google search returned ZERO results** as of 2026-04-28 — this is the strongest signal that GSC has never been set up for the blog property
- **`seo-cron.yml`** runs Mon-Fri 09:00 UTC, commits MDX to main, and conditionally calls the CF deploy hook only if `CF_PAGES_DEPLOY_HOOK` env is set — strongly suspect this env is missing
- **Hub `robots.txt`** — clean. Allows all crawlers, references the sitemap correctly. No fix needed there.

---

## Cadence after this is wired

- **Daily** (autonomous): seo-cron.yml commits new MDX → CF rebuilds → blog updates
- **Weekly** (Moses): glance at GSC Coverage tab; if any "Crawled but not indexed" URLs appear, surface them to Claude for review
- **Monthly** (joint): review which articles ranked, kill duplicates, update high-rank pages

---

## Risk register

| Risk | Mitigation |
|------|------------|
| GSC verification fails on Namecheap DNS | Use the meta-tag verification fallback — paste `<meta name="google-site-verification" content="…">` into hub `app/layout.tsx` head |
| CF deploy hook leaks (it's a public-ish URL) | Rotate via CF Pages → Settings → Deploy hooks → Delete → recreate, then update the GitHub secret |
| seo-cron writes break the build | The workflow already has a build-verify step before commit. If it ever flakes, disable the cron in GitHub → Actions → seo-cron → Disable workflow |
| Moses loses access to GSC property | Add a second verified user (`mdmdmd63@gmail.com` + a backup Google account) under GSC → Settings → Users and permissions |

---

## File touched

- `app/sitemap.ts` — added 17 new URLs

## Next file to write (Phase J)

`AGENTS_BRAINSTORM.md` — 9-12 new agent ideas + recommended top 3 to ship next.
