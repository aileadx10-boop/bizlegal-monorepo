# caseaudit — CLAUDE.md

**Status:** SCAFFOLD, mid-flight (untracked in git at 2026-09-09 — lands with its first commit). Only `fixtures/` (expected-output corpora: `en-out/`, `es-out/`) exists so far.

**Purpose:** case-document audit surface (per-dir naming convention; analysis/extraction against expected outputs). Shared engine lives in `packages/case-engine` — this app is the UI/API shell over it.

**Envs:** TBD as the app is built; follow O5 (vault the name before referencing it in code).

**Deploy target:** Vercel (`apps/caseaudit`), same pattern as the other product surfaces.

**Next action:** first real commit carries the app skeleton + this book entry together (pre-commit hook requires both).
