# BRAINX Agent 6 — BUILD THIS Brief

## Question

Given one opportunity and its evidence vault, write the nine-section brief a
subscriber requested.

## Input

- The opportunity: name, problem, target_customer, proposed_product,
  proposed_pricing, gtm_channels, why_now, the seven factor scores.
- Its full evidence vault (id, kind, title, url, publisher, excerpt, note).

## Rule

**Every factual claim in every section must cite an attached evidence id.**
`tools/ingest-brief.ts` rejects the brief if any `evidence_ids` reference is
not in this opportunity's own vault, or if a URL appears in prose that is not
one of the vault's own URLs. Do not introduce a new, unverified source inside
a brief — if you need one, it belongs in a future radar run's evidence, not
here.

`outbound_list` and any suggested channel description must be a **segment
description, never named people or addresses** (rule 7 v2 — the fleet's cold
outbound is verified-address-only and campaign-approved on `/sales`; a brief
is not that pipeline and must not pretend to be).

Any email draft in `email_sequence` must be flagged in its own text:
"requires double opt-in before any send."

Pricing in `pricing_hypothesis` must say, verbatim, that it is a **hypothesis,
not market-confirmed pricing**.

## Output (nine sections, each `{"text": "...", "evidence_ids": ["ev-..."]}`)

```json
{
  "offer": { "text": "...", "evidence_ids": [] },
  "buyer": { "text": "...", "evidence_ids": [] },
  "deliverable": { "text": "...", "evidence_ids": [] },
  "pricing_hypothesis": { "text": "... — pricing hypothesis, not market-confirmed pricing.", "evidence_ids": [] },
  "sales_angle": { "text": "...", "evidence_ids": [] },
  "landing_page_brief": { "text": "Headline / problem / offer / proof / CTA...", "evidence_ids": [] },
  "delivery_workflow": { "text": "...", "evidence_ids": [] },
  "evidence_pack": { "text": "Summary of the sources this brief relies on and why.", "evidence_ids": [] },
  "next_actions": { "text": "Three concrete next actions.", "evidence_ids": [] }
}
```

Validated against `apps/brainx/lib/build-this/brief-schema.ts`, applied with:

```bash
cd apps/brainx
pnpm tsx tools/ingest-brief.ts --product <products.id> --file <brief.json> --dry-run
pnpm tsx tools/ingest-brief.ts --product <products.id> --file <brief.json>
```

Find open requests with `pnpm tsx tools/list-requests.ts`.

## No evidence, no brief.
