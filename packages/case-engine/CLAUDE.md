# case-engine — CLAUDE.md

**Purpose:** case-document analysis engine (pure JS, no LLM): `ingest/` (document intake), `extract/` (field/paragraph extraction), `analysis/` (comparison against expected outputs), `__tests__/`. Consumed by `apps/caseaudit` (the UI/API shell).

**Status:** dist + sources present; no `package.json` at the package root as of 2026-09-09 — treat as in-flux; check before importing into new apps.

**Envs:** none referenced directly (library package — callers hold envs).

**Deploy:** published/consumed workspace-internally; no standalone deploy.
