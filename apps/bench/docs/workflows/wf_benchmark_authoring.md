# wf_benchmark_authoring — draft or extend a benchmark version

**Objective:** produce benchmark items whose gold standards a practising lawyer will sign, versioned so results stay comparable.

**Inputs:** coverage gap (practice area / jurisdiction / difficulty band) or new-jurisdiction decision; current set version.

**Tools (in order):**
1. Claude drafts items to the JSON schema (`web/data/benchmarks/`): prompt, gold_standard, authority_refs, probes, difficulty. Grounding rules: no invented cases, no fabricated statistics, statute-level precision only where certain (learn_course_authoring discipline applies).
2. Authority check: verify every cited instrument exists and stands for the stated proposition (FirmCited-assisted where available; manual lookup otherwise).
3. `node apps/bench/scripts/bench-engine-check.mjs` — structural validation must pass.
4. **Moses legal-review gate:** he reviews every item's gold standard. Set stays `"status": "draft"`, `"reviewed_by": null` until his sign-off — draft sets are never used in paid engagements.
5. On sign-off: set `status: "reviewed"`, `reviewed_by`, bump version (semver: new items = minor, corrections = patch), commit. Versions are immutable after release; never edit a released item in place.
6. Choose `released: true` for ≤5 items per set (format demonstration); everything else stays held out. Released items are excluded from paid measurement.

**Outputs:** new benchmark version in git (the moat's spine), updated registry pages (automatic — pages read the JSON).

**Edge cases:**
- **Law changes under a released version:** do NOT edit; ship a new version with the corrected item and note the change in the decision doc. Old reports stay tied to their measured version.
- **Moses rejects an item:** fix or delete; a thin set beats a wrong set.
- **Contamination suspicion (client seems trained on our items):** rotate the client to unused held-out items; flag the set for accelerated versioning.
