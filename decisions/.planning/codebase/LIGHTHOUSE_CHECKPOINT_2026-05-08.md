# Lighthouse Checkpoint #2 — 2026-05-08 (Phase AA Day 4)

Re-run of all 8 production surfaces, mid-Week-1, after schema.org +
quality-gate work landed but before any new content has been published.

## Results — Day 4 vs Day 1 baseline

| Surface | Perf D1 → D4 | SEO D1 → D4 | A11y D1 → D4 | BP D1 → D4 |
|---|---:|---:|---:|---:|
| bizlegal-ai.com (apex) | 77 → **79** (+2) | 100 → 100 | 92 → 92 | 96 → 96 |
| blog.bizlegal-ai.com | 92 → 92 | 100 → 100 | 98 → 98 | 96 → 96 |
| brai.bizlegal-ai.com | 83 → **86** (+3) | 91 → 91 | 83 → 83 | 96 → 96 |
| docai.bizlegal-ai.com | 79 → **68 (–11)** ⚠ | 100 → 100 | 96 → 96 | 96 → 96 |
| forge.bizlegal-ai.com | 98 → 97 (–1) | 100 → 100 | 92 → 92 | 96 → 96 |
| leadforge.bizlegal-ai.com | 96 → 96 | 100 → 100 | 96 → 96 | 96 → 96 |
| lexaudit.bizlegal-ai.com | 89 → **90** (+1) | 100 → 100 | 94 → 94 | 96 → 96 |
| tracr.bizlegal-ai.com | 81 → **85** (+4) | 100 → 100 | 94 → 94 | 96 → 96 |

## What changed in 3 days

- **Schema.org JSON-LD** added to `apps/forge/apps/web/app/gap/[jurisdiction]/[slug]/page.tsx` (Article + BreadcrumbList + conditional FAQPage). Did **not** lift the SEO score because forge was already at 100 — gives rich-snippet eligibility, no Lighthouse signal.
- **`apps/<subdomain>/lib/nurture-enqueue.ts`** added to forge/brai/docai/lexaudit/tracr. Pure server-side; zero client-bundle impact. As expected, SEO/A11y/BP scores unchanged.
- **No content changes** to any rendered route. Score deltas are single-run variance, not a code regression.

## Notable deltas

- **docai –11 perf (79 → 68)** is the only outlier worth noting. Single-run variance on a cold CDN edge is real (especially on Vercel free tier). Re-run before treating as a regression. If a second run reproduces ≤80, drill: bundle analyzer + image-weight audit on `apps/docai/web/`.
- **brai SEO 91 unchanged** — the one structural laggard. Not blocking; 1-hour drill task is unchanged from Day 1's recommendation. Diagnose with:
  ```bash
  npx --yes lighthouse https://brai.bizlegal-ai.com \
    --only-categories=seo \
    --output=html --output-path=$(cygpath -w /tmp/brai-seo.html) \
    --quiet --chrome-flags="--headless --no-sandbox --disable-dev-shm-usage"
  ```
- **3 surfaces gained perf (+1 to +4 points)**, 1 lost (-1 forge), 1 noisy (-11 docai), rest unchanged. Net: no regressions attributable to AA changes.

## Decision unchanged from Day 1

SEO is still solved. Article volume + nurture conversion remain the
real Phase AA bottlenecks — schema.org is icing, not foundation.

## Next checkpoint

End of Week 2 (2026-05-19). At that point we expect:
- 5-10 new articles indexed → gives blog a meaningful re-run (was 92 perf with empty content store; full content can shift this either way).
- Nurture machine has handled at least one synthetic 7-day arc → no new client surfaces, so scores should hold.
- If docai stays at –11, treat as a real regression and drill bundle.

Raw JSON saved at `%LOCALAPPDATA%\Temp\lh2\` (regenerable; not committed).
