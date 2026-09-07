# @bizlegal/closing-engine

> First read the monorepo root [`CLAUDE.md`](../../CLAUDE.md).

Deterministic closing-deadline maths: a pluggable working-week calendar, task templates, alert tiers. Pure — no LLM, no network, no ambient clock except where a date is passed in. A deadline a client acts on must be reproducible and explainable, so it may never come from a sampled token.

## Why it exists

The engine lived in `apps/closeflow/web/lib/` and had already been copied verbatim into `apps/leaseparse/web/lib/closing/`. DEAL44 would have been the third copy. It is one package now; the two apps keep their own copies until the shims land (see "Not done yet").

## The bug it fixes

`isWeekend` hardcoded `day === 0 || day === 6` — Sat/Sun. Israel works **Sun–Thu**, weekend **Fri–Sat**, so the old rule was wrong in both directions: it treated Sunday as a weekend and Friday as a working day. The weekend is now a `Calendar` parameter.

## Files

| File | Role |
|---|---|
| `src/calendar.ts` | `Calendar` interface, `MON_FRI`, `FRI_SAT`, `addBusinessDays`, `addCalendarDays`, `rollForwardToWorkingDay`, `daysUntil`, `coversDate` |
| `src/tasks.ts` | `TaskSpec` / `TaskTemplate` / `materialiseTasks` — templates are JSON-serialisable data so WORKFLOW44 stays a UI over rows |
| `src/alerts.ts` | `tierFor` — 30/7/1/0 + overdue, generalised from the LeaseParse 90/60/30/7 tiers |
| `src/holidays/{index,il}.ts` | `withHolidays`, `IL_WORKING_WEEK`, `israelCalendar` |
| `src/templates/il-residential.ts` | Israeli purchase template — **`reviewed: false`** |
| `src/us/*.ts` | The moved US engine: 4 transaction types, 44 checklist tasks |

## Invariants

1. **`dayType` is load-bearing.** Statutory clocks (Israeli purchase-tax and שבח declarations; US 1031 45/180) run on **calendar** days. Routing one through `addBusinessDays` silently buys the client days they do not have.
2. **Never invent a date.** A missing anchor yields `dueDate: null` plus a `missing_anchor:` warning. A blank is safe; a guess is not.
3. **`reviewed: false` means refuse.** `materialiseTasks` is pure and ungated on purpose; the 409 belongs at the app boundary, exactly as `apps/hub/lib/deal-audit/audit.ts` refuses the unreviewed Dubai pack.
4. **Holidays are empty on purpose.** A stale hardcoded Hebrew-calendar list produces confidently wrong deadlines. `coversDate` reports uncovered years and `materialiseTasks` emits `holidays_not_configured`, which the room must show. Same argument as `holidays: []` in the Dubai pack.
5. **`MON_FRI` is the default everywhere**, so the US move is behaviour-identical. `tests/engine.test.mjs` snapshots that.

## Test

```bash
node packages/closing-engine/tests/run.cjs   # builds, then 27 tests
```

Use the runner, not `node --test tests/` — pointing `--test` at a directory reports a phantom failing suite on Windows.

## Not done yet

`apps/closeflow` and `apps/leaseparse` still carry their own copies. Replacing them with `export * from '@bizlegal/closing-engine/us/...'` shims is week-3 work and needs a `pnpm install` to link the workspace dep. Do not move `apps/leaseparse/web/lib/extract/date-engine.ts`: its test runner compiles TS to CommonJS and cannot see workspace-package sources, so the move would break its 22 tests.

Canonical plan: `decisions/DEAL44-WORKFLOW44-2026-09-07.md`.
