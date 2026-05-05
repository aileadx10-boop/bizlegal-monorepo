# Lighthouse Baseline — 2026-05-05

Phase AA Day 1 SEO baseline across all live surfaces, before any optimization work.

## Results

| Surface | Performance | SEO | Accessibility | Best Practices |
|---|---:|---:|---:|---:|
| bizlegal-ai.com (apex) | 77 | **100** | 92 | 96 |
| blog.bizlegal-ai.com | 92 | **100** | 98 | 96 |
| brai.bizlegal-ai.com | 83 | 91 | 83 | 96 |
| docai.bizlegal-ai.com | 79 | **100** | 96 | 96 |
| forge.bizlegal-ai.com | 98 | **100** | 92 | 96 |
| leadforge.bizlegal-ai.com | 96 | **100** | 96 | 96 |
| lexaudit.bizlegal-ai.com | 89 | **100** | 94 | 96 |
| tracr.bizlegal-ai.com | 81 | **100** | 94 | 96 |

## Headline finding

**SEO is essentially solved.** Plan AA's stated Week-3 target was SEO ≥95. We're at or above that on **7 of 8 surfaces today**. The only laggard is brai at 91, which is still well above the panic line.

This means the schema.org JSON-LD I added to the forge gap renderer is icing, not foundational. The structured data unlocks rich-snippet eligibility (date + author cards in Google results) — useful, but the underlying SEO score isn't where the bottleneck lives.

## What this changes for Phase AA priority

The plan said "SEO 95+ on blog + forge by W3." That goal was sized against an assumed 70-80 starting point. The actual starting point is 100 / 100, so:

1. **Drop the SEO-optimization work from Week 3** as a priority block. (Schema.org for new articles still ships — it's a content-quality requirement, not a Lighthouse-score requirement.)
2. **Re-allocate Week 3** to focus on the actual bottleneck: article volume + conversion.
3. **brai is the one Lighthouse fix worth doing** — drilling its SEO 91 to find the gap is a 1-hour task whenever convenient, not urgent.
4. **Performance scores 77-98** vary by surface; bizlegal-ai.com (77), docai (79), tracr (81), brai (83) have room. Performance affects ranking modestly and conversion meaningfully. Worth a Week-3 perf sprint if revenue stalls, otherwise post-MoR.

## What's the actual bottleneck for Phase AA

Now that infrastructure SEO is green:

- **Article volume:** 0 full articles in `bizlegal-ea` blog repo currently → target 25-30 by Week 4. This is what drives organic traffic.
- **Conversion machine:** Lead → email-nurture → payment is the lever that turns traffic into revenue. None of the 6 lead-capture endpoints sends a welcome email today. V3 (the lead-to-payment machine) is now the highest-ROI build.
- **OCI partner activation:** Moses needs to seed 3-5 real referral partners. Without partners, the router is a dead-letter queue. Outreach gates the OCI revenue channel.

## brai-specific drill (when there's time)

To diagnose brai's SEO 91:
```bash
npx --yes lighthouse https://brai.bizlegal-ai.com \
  --only-categories=seo \
  --output=html --output-path=/tmp/brai-seo.html \
  --quiet --chrome-flags="--headless --no-sandbox --disable-dev-shm-usage"
```
Open the HTML report; the SEO category surfaces the failed audit IDs. Likely culprits in priority order: `meta-description`, `link-text`, `crawlable-anchors`, `tap-targets`. None blocking, all small fixes.

## Re-baseline cadence

Re-run this at end of W2 (2026-05-19) and W4 (2026-06-02). Compare to today. If any surface drops below SEO 90, that's a regression alert — Moses's design work or my content commits introduced something.

Raw Lighthouse JSON files saved at `%LOCALAPPDATA%\Temp\lh\` on Moses's Windows box (not committed; regenerable). Script that produced them is at `/tmp/lighthouse_baseline.sh` (also not committed; one-shot).
