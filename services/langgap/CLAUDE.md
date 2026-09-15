# services/langgap

O-028 LangGap scanner (Phase A/C, coverage-over-rankings growth engine): a Python scanner that crawls sitemaps for the fleet's own domain plus named competitors, scores English pages by section weight + recency, diffs runs for NEW DE/ES localization gaps, and stages the top-N own-site gaps to a pending-review CSV. Zero paid APIs at scan time (`requests` + stdlib only); it never auto-publishes a translation.

## Envs
None required for scan/queue. Optional: `BIZLEGAL_INBOUND_SECRET` / `OPS_LOG_URL` (ops-log HMAC), `GSC_VERIFIED` / `PLAUSIBLE_CREATED` / `ANTHROPIC_CREDITS_NONZERO` (baseline measurement-readiness flags). Anthropic credits are only needed for draft generation, not scanning.

## Run / Deploy
`python -m services.langgap.scanner --config services/langgap/config.json --run --diff --max-pages 500 --workers 6 --outdir langgap_out --stage-top 10`, then `python -m services.langgap.baseline --outdir langgap_out`. Weekly cron: `workflows/langgap-weekly-cron.md`. Output in `langgap_out/` (gitignored); staged review files land in `decisions/langgap-staged-review/`.

## Rules
YMYL review gate is hard: every staged output is `status: pending-review`; localization must swap regulators (FinCEN → BaFin DE / CNMV ES), add hreflang cluster links, keep the expert byline + review block. Only Moses's async batch approval publishes.

## See
`C:/Users/Moshe Dor/orders/O-028-coverage-over-rankings-growth-engine.md`, `decisions/O-028-GROWTH-ENGINE-FILING-2026-09-15.md`
