# GSC Index Remediation — 2026-05-11

**Trigger:** Google Search Console Indexing Report showed **40 indexed / 398 not indexed** across `bizlegal-ai.com`. Moses surfaced it during the Week 5 Day 1 status review.

**TL;DR:** Two compounding sitemap bugs caused Google to deprioritize 393 pages. Fixed both today via PR #9 (bizlegal-ea blog repo) + PR #30 (this monorepo). Expect indexed count to climb to ~400 over 2-4 weeks as Google re-crawls.

---

## What GSC reported

| Reason | Pages | Source | Notes |
|---|---:|---|---|
| ✅ Indexed | 40 | — | Healthy baseline |
| Crawled, not currently indexed | 393 | Google decision | **The big problem.** Google crawled but decided not to index. |
| Page redirects to another URL | 3 | Sitemap | Sitemap entries that 308-redirect |
| Not found (404) | 1 | Sitemap | A URL in sitemap returns 404 |
| Blocked by robots.txt | 1 | Robots + sitemap | One URL is blocked AND in sitemap (contradiction) |

---

## Root cause (diagnosed via curl on every URL in every sitemap)

### Bug A — Blog sitemap trailing-slash mismatch (350 URLs)

The blog (`blog.bizlegal-ai.com`) is a Next.js export with `trailingSlash: true` in its `next.config.mjs` — every canonical URL ends in `/`. But the sitemap.ts at `bizlegal-ea/projects/bizlegal-seo-site/src/app/sitemap.ts` emitted URLs WITHOUT trailing slashes. Result:

- `<loc>https://blog.bizlegal-ai.com/blog/guides-uae-vara-license-guide-uae</loc>`
- → 308 redirect to `/blog/guides-uae-vara-license-guide-uae/`
- → Google follows once, decides the redirect chain isn't worth indexing
- → Page lands in "Crawled, not currently indexed"

**Curl smoke confirmed**: 350 of 351 blog sitemap URLs returned 308. Only `/` was clean.

### Bug B — Blog tag-page casing duplicates (4 URLs)

`/blog/tag/[tag]/page.tsx` generated static pages preserving the casing from `frontmatter.tags`. Posts with mixed-case tags (`['UAE', 'uae']` across different files) emitted BOTH `/blog/tag/UAE` AND `/blog/tag/uae` to the sitemap. On case-insensitive filesystems (Windows, sometimes macOS), the static export collided — only one casing ended up in the deployed `out/` directory. The other variant became a hard 404.

**Hard 404s found**: `/blog/tag/uae`, `/blog/tag/singapore`, `/blog/tag/vara`, `/blog/tag/dubai`, `/blog/tag/global`. Their uppercase equivalents were the 308 variants in Bug A.

### Bug C — Hub apex sitemap 308 redirects (7 URLs)

`apps/hub/app/sitemap.ts` listed 7 subdomain-landing routes that `apps/hub/next.config.js` redirects() block 308-redirects to the canonical subdomain origin:

- `/tracr`, `/brai`, `/docai`, `/lexaudit`, `/leadforge`, `/forge` → respective subdomain
- `/marketplace` → `leadforge.bizlegal-ai.com`

Same crawl-budget waste as Bug A, just on the apex side. The GSC report's "3 redirects" was a subset of these 7 (Google fetched some but not all).

---

## Fixes shipped

### PR #9 in `aileadx10-boop/bizlegal-ea` (blog repo) — MERGED + Cloudflare deploying

**File `src/app/sitemap.ts`:**
- New `withSlash()` helper applied to every `<loc>` value
- Tag emission normalised to lowercase + deduped via Map keyed on the lowercase form

**File `src/app/blog/tag/[tag]/page.tsx`:**
- `generateStaticParams` emits ONE entry per canonical lowercase tag (collapsed via Map)
- `postsForTag()` matches case-insensitively across `frontmatter.tags`, `regulation_tag`, AND `jurisdiction`
- `/blog/tag/uae/` now serves all posts whose frontmatter contains any casing of UAE in any of those fields

### PR #30 in `aileadx10-boop/bizlegal-monorepo` (hub repo) — MERGED + Vercel deploying

**File `apps/hub/app/sitemap.ts`:**
- Removed 7 subdomain-landing routes (each was a 308)
- Removed `/marketplace` (also 308)
- Comment block explains the rationale + records the curl evidence from today
- Sitemap drops from 46 → 39 entries, all expected 200

### Remaining issue (not fixed today)

- **1 URL blocked by robots.txt but in sitemap** — GSC didn't identify which one. Will inspect during next Z7 verification. Likely a `/ops` or `/api/*` path that slipped into the static sitemap.

---

## Expected outcome (2-4 week timeline)

GSC takes 2-4 weeks to re-crawl + re-evaluate index priority. As re-crawls happen:

| Week | Expected change |
|---|---|
| Week 1 | GSC begins re-fetching sitemap-index → child sitemaps → individual URLs. Initial spike of "Crawled, currently indexed" status appears. |
| Week 2 | The 4 hard 404s drop out of the index entirely (good — they were noise). Tag pages start re-indexing under their lowercase canonicals. |
| Week 3-4 | "Crawled, not indexed" backlog converts to "Crawled, currently indexed". Target: ≥350 indexed pages. |

**Manual nudge to accelerate:** in GSC → URL Inspection → submit 5-10 high-value pages for re-indexing (e.g. top blog posts + apex `/` + `/risk-engine`). Google fast-tracks manually-submitted URLs.

---

## Stale GSC errors (no action needed)

GSC flagged 4 subdomain sitemaps as "Cannot be fetched":
- `docai.bizlegal-ai.com/sitemap.xml`
- `lexaudit.bizlegal-ai.com/sitemap.xml`
- `brai.bizlegal-ai.com/sitemap.xml`
- `tracr.bizlegal-ai.com/sitemap.xml`

These were pre-PR #27 (which shipped sitemap.ts to all 5 subdomains). All 5 now return 200 with valid XML — confirmed via curl smoke today. GSC will re-evaluate on next crawl cycle (typically within 7 days) and the errors auto-resolve. No action required.

---

## Why the 393 pages were "Crawled, not indexed" (full picture)

Google's index decision is multi-factor. Beyond the redirect chain (which is now fixed), several signals likely contributed:

1. **Redirect chain** — fixed today ✓
2. **AI-generated content patterns** — the curator pipeline produces structurally similar regulatory briefs (TL;DR → What this requires → FAQ → Sources). Even with distinct content, structural similarity can flag near-duplicate
3. **Domain authority** — `bizlegal-ai.com` is newer; Google reserves index slots for higher-authority domains
4. **Internal linking** — most blog posts are only linked from the blog index + their tag/category page. No cross-post links, no apex → blog links beyond the navbar
5. **External backlinks** — the GSC Links report needs review to confirm; new domains with few backlinks index slowly

**Items 2-5 are Week 6+ improvements.** Today's fix addresses item 1 alone. Expect partial recovery (maybe 200-300 indexed in 2 weeks) before quality + authority signals catch up.

---

## Manual ops queue for Moses

1. ✅ PR #9 merged (blog repo) — Cloudflare auto-deploys → wait for green
2. ✅ PR #30 merged (hub repo) — Vercel auto-deploys → wait for green
3. **After both deploys complete (later today):**
   - GSC → Sitemaps → click "Refresh" or resubmit `https://bizlegal-ai.com/sitemap-index.xml`
   - GSC → URL Inspection → manually submit 5-10 high-value URLs for priority re-indexing:
     - `https://bizlegal-ai.com/`
     - `https://bizlegal-ai.com/risk-engine`
     - `https://bizlegal-ai.com/pricing`
     - `https://blog.bizlegal-ai.com/`
     - `https://blog.bizlegal-ai.com/blog/guides-uae-vara-license-application-process-dubai-2026/` (now canonical with `/`)
     - 5 more from the highest-traffic blog posts
4. **Week 6 (no rush):** review the GSC Links report. If external backlinks are <10, prioritize backlink acquisition (guest posts, regulatory news comments, partner exchanges).
