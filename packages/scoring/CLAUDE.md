# scoring — CLAUDE.md

**Purpose:** `@bizlegal/scoring` — the single source of truth for the
BrainX Decision Score, TS + Python parity (`src/index.ts` and the Python
mirror at `services/highintelligence-api/app/pipeline/scoring.py`, which is
PARKED — trust the TS version, it's the one `apps/brainx` actually imports).

**Exports:** `FactorScores` (demand, pain, wtp, competition, legal,
automation, acquisition), `WEIGHTS` (0.20/0.20/0.20/0.15/0.10/0.08/0.07,
sums to 1.00), `SCORING_VERSION = 'v1'`, `weightedScore(factors)`,
`statusFor(score)` (build ≥80, validate ≥65, watch ≥50, else ignore),
`factorsEqual`.

**Load-bearing detail:** `weightedScore` is plain arithmetic — a missing
factor (`undefined`) produces `NaN`, and `statusFor(NaN)` returns `'ignore'`
because every `>=` comparison against `NaN` is false. This is not a bug to
guard against; it is the actual mechanism `apps/brainx` relies on to make
"all seven dimensions are scored on every opportunity" true rather than
aspirational — see `apps/brainx/lib/radar/map.ts::buildScore`, which throws
if any factor isn't a finite number before it ever reaches `weightedScore`.

**Consumers:** `apps/brainx` (`lib/radar/map.ts`, `tools/ingest-radar.ts`,
`app/components/marketing/ScoreExplainer.tsx`). No envs.

**Build/test:** `pnpm test` (`tsx --test src/scoring.test.ts`).
