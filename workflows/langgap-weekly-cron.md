# Workflow: LangGap / O-028 Weekly Cron

## Purpose
Weekly coverage-over-rankings run: scan own + competitor gaps, generate own-site queue, stage top-N localized drafts to pending-review, write intel file + baseline. Stops at the review gate — never publishes.

## Command (local-first; cron entry below when authorized)
```bash
cd "C:/Users/Moshe Dor/bizlegal-monorepo"
python -m services.langgap.scanner --config services/langgap/config.json --run --diff --max-pages 500 --workers 6 --outdir langgap_out --stage-top 10
python -m services.langgap.baseline --outdir langgap_out
```

## Cron entry (when authorized)
```
0 17 * * 2 cd "C:/Users/Moshe Dor/bizlegal-monorepo" && python -m services.langgap.scanner --config services/langgap/config.json --run --diff --max-pages 500 --workers 6 --outdir langgap_out --stage-top 10 >> logs/langgap.log 2>&1 && python -m services.langgap.baseline --outdir langgap_out >> logs/langgap.log 2>&1
```

## Env / gates
- No paid APIs in scan path.
- Draft generation (if wired) needs Anthropic credits; if $0, stage queue without drafts and report honestly.
- GSC/Plausible numbers appear only after Moses verifies properties (~20 min, deferred).
- YMYL review gate mandatory: staged pending-review only, never auto-publish.

## Outputs
- langgap_out/<domain>_queue.csv / manifests / run_summary.json
- langgap_out/pending_review/<domain>_pending_review.csv
- langgap_out/baseline-week0.json
