# @bizlegal/deal-engine

> First read the monorepo root [`CLAUDE.md`](../../CLAUDE.md).

The transaction reconciliation core for **Deal Intelligence**. One engine, jurisdiction packs — the engine never changes between Dubai, London and Florida; only the ontology in `src/packs/` does.

## The product question

Not "what does this document say" — that is commoditising fast. It is **"what is wrong with this deal?"**: the same fact asserted by different documents, compared.

## Why it is LLM-free

The model's job ends at extraction. Deciding whether two values conflict is arithmetic and string comparison, and must be reproducible, explainable and unit-testable. A conflict a lawyer acts on cannot come from a sampled token.

Everything exported is pure and deterministic: no network, no clock read except dates passed in explicitly.

## The three rules that matter

1. **Compare only normalised values.** "AED 2,500,000" and "2500000.00" are the same number; comparing raw strings would report a conflict, and a report full of false conflicts teaches the reader to ignore it.
2. **Never guess.** `normaliseDate('09/10/2026')` returns `null` — that is 9 October in Dubai and 10 September in the US, and this product spans both. A null becomes `insufficient_evidence` ("verify this"), never a silent pass and never a conflict.
3. **Missing ≠ conflict.** A required fact no document asserts is `missing`. No document is wrong; one is absent. This mirrors `apps/lexaudit/lib/health-score/weights.ts`, where `insufficient_evidence` scores `null` and is excluded from the denominator rather than silently penalised.

Amendments supersede originals (`deal_documents.supersedes`), so a contract and its own addendum are not reported as disagreeing.

## Files

| File | Role |
|---|---|
| `src/normalise.ts` | Dates → ISO-8601, money → integer minor units + currency, areas → sqm, party names → suffix-stripped key |
| `src/reconcile.ts` | Groups facts by `fact_key`, emits `conflict` / `missing` / `expired` / `insufficient_evidence` findings with every claimant document id |
| `src/packs/ae-dubai-residential.ts` | The first jurisdiction pack — DLD/RERA document set, required facts, **Fri–Sat weekend** |

Backed by `deals` / `deal_documents` / `deal_facts` / `deal_findings` (migration `20260823_deal_intelligence.sql`). `deal_facts.source_document_id` and `quote` are NOT NULL by design: a fact with no provenance cannot be shown to a customer, so it must not be storable.

## ⚠️ The Dubai pack is UNREVIEWED

`AE_DUBAI_RESIDENTIAL.reviewed === false`. The document set and freshness windows are assembled from public description of the DLD process and are **placeholders**. Any surface consuming this must refuse to present pack-derived findings while `reviewed` is false. Only a practising Dubai practitioner can flip it.

`holidays` is deliberately empty — Islamic holidays follow the Hijri calendar and shift each Gregorian year, and a stale hardcoded list produces confidently wrong deadlines.

## Test

```bash
node packages/deal-engine/tests/run.cjs   # 17 tests
```

Use the runner, not `node --test tests/` — pointing `--test` at a directory reports a phantom failing suite on Windows.
