# wf_self_benchmark — measure our own stack, publish the anonymized snapshot

**Objective:** produce credibility the rule-7-clean way: measured data about our own AI surfaces, published aggregated/anonymized ("we measured our own legal AI").

**Inputs:** a reviewed benchmark set (or draft, for internal-only runs), target surface (base model / DocAI / hub classifier), ANTHROPIC_API_KEY + Supabase env.

**Tools (in order):**
1. `node apps/bench/scripts/bench-self-audit.mjs --set <slug> [--dry-run]` → outputs stored as `ai_prescored` rows (or local JSONL).
2. Score: Moses (or an admitted expert) scores against the rubric — self-benchmark scoring is the standing calibration exercise, so double-score at least 5 items and record inter-rater.
3. `web/lib/rubric-engine.ts` metrics → update `/sample` page dataset (replace the illustrative rows; drop the "illustrative" chips, state target class + date + version honestly).
4. Publish: anonymized/aggregated findings → blog post via existing content engine + LinkedIn drafts for Moses. Named targets only when the target is OUR OWN product, disclosed as such.
5. Update `/methodology` inter-rater readout with the computed number.

**Outputs:** honest `/sample` data, first calibration stat, one publishable research artifact, `legal.cite_audit` + `report.generated` ops events.

**Edge cases:**
- **Results are embarrassing for our own product:** publish anyway (with the fix list) — "we measured ourselves and fixed it" is the brand; burying it would rot the lab's honesty.
- **API budget zero (known Anthropic-credit failure mode):** harness aborts cleanly; never fabricate outputs.
- **Draft-set run:** internal only; nothing publishes until the set passes the Moses review gate.
- **Cadence:** quarterly, plus before any launch/pricing change.
