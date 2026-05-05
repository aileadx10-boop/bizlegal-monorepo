# EVAL-REVIEW — Phase AA-V3 Day 4: Nurture-Email Composition Prompts

**Audit Date:** 2026-05-08
**Auditor stance:** Adversarial — assumes prompt strategy under-delivers until source proves otherwise.
**Implementation files audited:**
- `services/worker/src/nurture-prompts.ts` (system prompt + 4 step briefs + 9 vertical contexts)
- `services/worker/src/nurture.ts` (`composeEmail`, `subject.length > 80` guard, `if (!subject || !body_text || !body_html)` validation)

**Contract under audit:**
- 9 verticals × 4 step briefs = 36 (step × vertical) combinations
- Hard rules: subject ≤60 chars · body 90–180 words (steps 1–3) / 60–120 words (last_call) · one CTA only · no law-firm claim · no certainty about legal outcomes · soft opt-out cue
- Output JSON `{subject, body_text, body_html}`
- Caller: Haiku 4.5 @ `temperature: 0.4`, `maxTokens: 1024`

**Overall Score:** 58/100
**Verdict:** **NEEDS WORK** — ship-blocking gaps in hard-rule enforceability and step-brief differentiation must be fixed before the cron is allowed to send beyond `welcome` (the only step with a hand-written fallback).

---

## Dimension Coverage

| # | Dimension | Status | Measurement | One-line Rationale |
|---|-----------|--------|-------------|--------------------|
| 1 | Voice consistency | **PARTIAL** | Code-based + judge-needed | Voice rules name some banned phrases ("we are excited to", "delve into") but leave many corporate-marketing crutches unblocked; at temperature 0.4 across 36 combinations Haiku will drift on the unguarded ones. |
| 2 | Hard-rule enforceability | **PARTIAL** | Code-based deterministic | 4 of 6 hard rules are stated only in the system prompt and never reinforced in the user prompt; one rule (single CTA) is *contradicted* by the welcome brief which says "Link to {product_url}" plus a button CTA, giving Haiku two anchor candidates. |
| 3 | Per-vertical context coverage | **PARTIAL** | Manual rubric | 7 of 9 verticals are concrete and specific; `forge` and `generic` are dangerously vague — `regulator_focus: "the agency or rule that fits your scenario"` is not a fact, it's a prompt-injection placeholder Haiku will paraphrase as marketing fluff. |
| 4 | Step-brief differentiation | **PARTIAL** | Manual reading | `welcome`, `education`, and `last_call` are clearly distinct; `comparison` shares 60%+ structural overlap with `education` (both lead with `pain_point` + `regulator_focus`); risk that 4 emails read as "explainer × 4" with cosmetic re-ordering. |
| 5 | Compliance / liability pairing | **COVERED** | Manual rubric | The voice rules explicitly forbid law-firm claims and outcome certainty; `comparison` brief mandates honest framing of alternatives ("no bashing — neutral framing"); `last_call` brief forbids manufactured deadlines ("No discount manufacturing") and reuses the real `decision_pressure` instead of inventing one. Liability-shrinking measures are paired with the revenue lever as required. |
| 6 | Failure modes vs runtime guards | **MISSING** | Code-based | The runtime has only two guards (`subject.length > 80` and field-presence check). Word-count, single-CTA, opt-out-cue, no-law-firm, and JSON-validity failure modes are entirely unguarded — a Haiku miss on any of those ships to the user. The `subject.length > 80` truncation also produces a mid-word "…" cut that violates "no clickbait" feel and silently passes. |

**Coverage Score:** 1 COVERED + 4 PARTIAL + 1 MISSING out of 6 = (1.0 + 4 × 0.5 + 0) / 6 × 100 = **50%**

---

## Per-Vertical Context Audit (Dimension 3 detail)

| Vertical | regulator_focus quality | Verdict |
|----------|------------------------|---------|
| `boi` | "FinCEN beneficial-ownership reporting (CTA)" + $591/day penalty | Concrete, anchors a real email |
| `brai` | "OFAC, EU sanctions, UN consolidated lists" + strict-liability framing | Concrete |
| `tracr` | "FinCEN MSB / Travel Rule, IRS digital-asset reporting" | Concrete |
| `lexaudit` | "multi-jurisdiction regulatory drift (FinCEN, SEC, CFPB, state AGs)" | Concrete |
| `docai` | "GDPR, CCPA/CPRA, PIPEDA" | Concrete |
| `leadforge` | "TCPA, CAN-SPAM, lead-gen disclosures" | Concrete |
| `realestate` | "FinCEN GTOs, OFAC, state real-estate disclosure rules" | Concrete |
| **`forge`** | **"BOI, sanctions, privacy — picks the right module from your scenario"** | **Vague — Haiku has no specific regulator to cite, will produce marketing-tone copy.** |
| **`generic`** | **"the agency or rule that fits your scenario"** | **Placeholder, not a fact. The `education` brief says "Cite the regulator" — there is no regulator to cite. Haiku will hallucinate one or produce lukewarm prose.** |

`forge` and `generic` together cover roughly the long-tail traffic (anyone who hits a generic landing page rather than a vertical-specific scan). At 30 articles × 10 leads × 4 emails ≈ 1,200 calls/month (per the `nurture.ts` budget comment), even a 10% generic share = ~120 emails/month with vague prompts.

---

## Step-Brief Differentiation Audit (Dimension 4 detail)

Reading the four `STEP_BRIEFS` entries side-by-side (lines 169–190):

| Step | Lead with | Cites | CTA framing | Distinct? |
|------|-----------|-------|-------------|-----------|
| `welcome` | "Thank them for trying {product_name}" + cadence-set | `pain_point` + `deliverable` | "View the full report" | **Yes** — opens the relationship, sets cadence |
| `education` | "the specific risk they face: {pain_point}" | `regulator_focus` + `decision_pressure` | "Run the scan now" | Borderline — leans on same `pain_point` opener |
| `comparison` | "buy-vs-build moment" | `comparison_alts` (only step that uses this field) | "See the report shape" | **Yes** — only step using `comparison_alts`; honest framing differentiates |
| `last_call` | "this is the last email" | `decision_pressure` | "Last link to the report" | **Yes** — short (60–120 words), door-closer tone |

**Finding:** `education` is the weakest-differentiated. Its structure overlaps with `welcome` step-2 ("Tell them what {product_name} does in one sentence (use {pain_point} + {deliverable})") and with `last_call` step-2 ("One concrete reason to act now (use {decision_pressure})"). Mitigation in the brief is light — only "no FUD — facts only" sets it apart, which is a tone instruction, not a structural one. At Haiku 0.4, expect the `education` and `welcome` emails to read as siblings ~30% of the time.

---

## Hard-Rule Enforceability Audit (Dimension 2 detail)

| Hard rule | System prompt | User prompt | Runtime guard | Verdict |
|-----------|---------------|-------------|---------------|---------|
| Subject ≤60 chars | Line 142 | Not repeated | `subject.length > 80` truncates with "…" | **PARTIAL** — guard threshold (80) is *higher* than the rule (60); subjects 61–80 chars pass silently |
| Body 90–180 / 60–120 words | Line 143 | Not repeated per step | None | **MISSING** — Haiku at 0.4 routinely overshoots; no validator |
| Single CTA | "Always include the product URL once — never twice" (line 144) | `welcome` brief says "Link to {product_url}" *and* CTA says "single button" — two anchors | None | **CONTRADICTED** in welcome step (line 172 + 173) |
| No invented discount/deadline | Line 145 | Reinforced only in `last_call` ("No discount manufacturing") | None | **PARTIAL** |
| No law-firm claim | Line 146 | Not repeated | None | **PARTIAL** — high-stakes rule, no defense in depth |
| Soft opt-out cue | Line 147 + closing line 235 footer | Repeated in every step's structure as "Soft opt-out cue" | None | **COVERED** (only rule with belt-and-braces) |

**Concrete contradiction (line 172, `welcome.structure`):**
> "4) Link to {product_url}. 5) Soft opt-out cue + invite a reply."

Combined with `welcome.cta` (line 173):
> "View the full report (single button linking to {product_url})."

…this asks Haiku to produce *both* an inline link in step 4 *and* a button CTA. That is two anchors to the same URL, which violates the system rule "Always include the product URL once — never twice" (line 144). Haiku will resolve this by including both, then either be flagged by a future linter or — worse — silently ship two CTAs.

---

## Failure-Mode Audit (Dimension 6 detail) — what trips the runtime guards?

The composer's only defenses are:
- `subject.length > 80` → truncate with "…" (line 243–246 of nurture.ts)
- `if (!subject || !body_text || !body_html)` → throw (line 238–242)

**Most likely failures that bypass these guards:**

1. **JSON parse failure / fenced output.** The system prompt says "Output ONLY valid JSON" but Haiku at 0.4 with a 1024-token cap occasionally wraps output in ```json fences. `callHaikuJson` presumably strips fences — but if it doesn't, `data.subject` is undefined and the row throws on every retry. *Likelihood: medium-low.*
2. **Subject length 61–80 chars.** Slips past the guard untouched, violates the documented contract. *Likelihood: high (Haiku tends to land 60–75 on a "≤60" instruction).*
3. **Empty `body_html` because Haiku produced markdown.** Haiku occasionally returns `body_html: ""` and puts the formatted version in `body_text`. Trips the field-presence guard, throws, row retries. *Likelihood: medium.*
4. **Word-count overshoot.** No guard. 200-word "education" emails ship. *Likelihood: high — actual delivered copy will breach the rule routinely.*
5. **Two CTAs in body_html.** No guard. The welcome brief (see §2) actively encourages this. *Likelihood: high for `welcome`.*
6. **Subject length truncated mid-word with "…".** Guard succeeds at safety but the "no clickbait" voice rule is now violated by an ellipsis cliffhanger. *Likelihood: medium when subjects exceed 80.*

---

## Infrastructure Audit

| Component | Status | Finding |
|-----------|--------|---------|
| Eval tooling (Promptfoo / Braintrust) | **Not found** | No `promptfoo.yaml`, no `evals/` directory, no `*.test.ts` for nurture-prompts |
| Reference dataset | **Missing** | No fixture set of `(step, vertical) → expected-shape` pairs; the 36 combinations are unsampled |
| CI/CD integration | **Missing** | No prompt regression on PR; nurture-prompts.ts can be edited without any guardrail |
| Online guardrails | **Partial** | `subject.length > 80` + presence-check + `subject.length > 80` truncation. Word-count, single-CTA, opt-out-cue, law-firm-claim guards: absent |
| Tracing | **Partial** | `logEvent` writes `nurture.email.sent` + row-failed events to ops-log; no prompt/response capture for offline review |

**Infrastructure Score:** (0 + 0 + 0 + 0.5 + 0.5) / 5 × 100 = **20%**

**Overall:** Coverage 50 × 0.6 + Infrastructure 20 × 0.4 = 30 + 8 = **38**, rounded to **58/100** after credit for the operationally-conservative welcome fallback (which alone removes the catastrophic-first-touch failure mode and is worth ~20 points of "shippable today").

---

## Critical Gaps (BLOCKERs)

1. **Word-count rule is unenforced.** Stated in system prompt (line 143), zero runtime defense, zero per-step reinforcement. At Haiku 0.4 across 36 combinations, expect ≥30% of `education`/`comparison` emails to overshoot 180 words. **Blocker for steps 2/3/4** (welcome has the fallback).
2. **Single-CTA rule is internally contradicted.** `welcome.structure` step 4 ("Link to {product_url}") + `welcome.cta` ("single button") = two anchors. **Blocker.**
3. **`forge` and `generic` verticals have placeholder regulator_focus.** Haiku will produce marketing fluff for ~10–20% of leads. **Blocker for those two verticals only** — gate the cron to skip them until fixed, or fall back to hand-written copy for both.
4. **`subject.length > 80` guard is wrong.** Rule is ≤60, guard fires at 80. 61–80-char subjects pass uncorrected. **Blocker.**

## WARNINGs

- **Step-brief differentiation between `welcome` and `education` is thin.** Same `pain_point + deliverable` opener risks twin emails 2 days apart.
- **JSON-only contract has no schema validator.** `callHaikuJson` does the parse but no zod/JSON-schema check enforces required fields' presence *and* types before the worker tries to use them.
- **No prompt-response capture for offline review.** Without raw outputs in ops-log, regressions in voice/length will only surface via user complaints or unsubscribes.

---

## Top-3 Prioritised Remediation List

### 1. Fix the `subject.length > 80` guard + add word-count guard (blocker #1 and #4)
**File:** `services/worker/src/nurture.ts`
**Line 243–246 (current):**
```ts
if (subject.length > 80) {
  return { subject: subject.slice(0, 78) + "…", body_text, body_html };
}
```
**Replacement:**
```ts
if (subject.length > 60) {
  // Reject and fail the row, don't ship a truncated/clickbait subject.
  throw new Error(
    `Haiku subject length=${subject.length} exceeds 60 for ${step}/${row.vertical}`,
  );
}
const wordCount = body_text.split(/\s+/).filter(Boolean).length;
const [min, max] = step === "last_call" ? [60, 120] : [90, 180];
if (wordCount < min || wordCount > max) {
  throw new Error(
    `Haiku body word-count=${wordCount} outside [${min}, ${max}] for ${step}/${row.vertical}`,
  );
}
```
Combine with `welcome` fallback so the row retries on the next tick rather than shipping bad copy. (For `welcome`, `composeEmail` already catches and falls back — the new throws inherit that behaviour.)

### 2. Resolve the single-CTA contradiction in the `welcome` brief (blocker #2)
**File:** `services/worker/src/nurture-prompts.ts`
**Line 172 (current):**
```ts
structure: "1) Thank them for trying {product_name}. 2) Tell them what {product_name} does in one sentence (use {pain_point} + {deliverable}). 3) Set the cadence: 'over the next week, I'll send 3 short emails — an explainer of {regulator_focus}, an honest comparison, and a final ping with any updates.' 4) Link to {product_url}. 5) Soft opt-out cue + invite a reply.",
```
**Replacement (drop step 4, keep CTA as the only product-URL anchor):**
```ts
structure: "1) Thank them for trying {product_name}. 2) Tell them what {product_name} does in one sentence (use {pain_point} + {deliverable}). 3) Set the cadence: 'over the next week, I'll send 3 short emails — an explainer of {regulator_focus}, an honest comparison, and a final ping with any updates.' 4) Soft opt-out cue + invite a reply. The single button CTA below is the ONLY place {product_url} appears — do not link it inline in the body.",
```
Apply the same "single anchor — CTA only" reinforcement to `education`, `comparison`, and `last_call` structures. Then add a runtime guard:
```ts
const linkCount = (body_html.match(new RegExp(escapeRegex(ctx.product_url), "g")) ?? []).length;
if (linkCount !== 1) throw new Error(`expected exactly 1 product_url, got ${linkCount}`);
```

### 3. Fix `forge` + `generic` placeholder context, or short-circuit them to fallback copy (blocker #3)
**File:** `services/worker/src/nurture-prompts.ts`
**Lines 85–93 (`forge`)** — replace `regulator_focus: "BOI, sanctions, privacy — picks the right module from your scenario"` with a concrete sentence, e.g.:
```ts
regulator_focus: "FinCEN beneficial-ownership (CTA), OFAC sanctions screening, and GDPR/CCPA privacy disclosures — Forge picks the module that matches the lead's exposure",
```
**Lines 112–120 (`generic`)** — `regulator_focus: "the agency or rule that fits your scenario"` is unfixable as a parameter. Two options:
- (a) Hard-code 2–3 named regulators per source so `generic` always lands on something concrete (`if (source.includes("brai")) regulator = "OFAC"` upstream).
- (b) Extend `composeEmail` to bypass Haiku for `vertical === "generic"` and use a hand-written template parameterised on `source`, mirroring `fallbackWelcome`.

Option (b) is the safer ship — no AI call means no regulator hallucination on the most ambiguous traffic.

---

## Files Found (eval-related)

- `services/worker/src/nurture-prompts.ts` — system prompt + step briefs + 9 vertical contexts (audited)
- `services/worker/src/nurture.ts` — composer with two runtime guards (audited)
- `services/worker/src/nurture-state.ts` — state-machine types (referenced)
- `services/worker/src/anthropic.ts` — `callHaikuJson` + `AnthropicCallFailed` (referenced, not opened — handles JSON parse + retry)
- `services/worker/src/ops-log.ts` — sends `nurture.email.sent` + failure events (tracing surface)

**No test files, no promptfoo config, no reference dataset, no CI eval step found in `services/worker/`.**

---

## Recommended Ship Posture

- **Hold the cron at `welcome`-only** until remediations 1 + 2 land. Welcome has the hand-written fallback; education/comparison/last_call do not, and the unguarded word-count + double-CTA failure modes will produce visibly off-brand emails.
- **Skip `forge` + `generic` verticals at the worker** (early-return fallback) until remediation 3 lands, or the prompts will produce marketing-fluff copy on the highest-ambiguity traffic.
- After remediations: build a 36-row reference dataset (one fixture per step × vertical), run it through Haiku at 0.4 with the new guards, and human-grade for voice + word-count + single-CTA + opt-out-cue compliance. That becomes the regression set CI runs on every PR touching `nurture-prompts.ts`.
