/**
 * The reconciliation engine. Pure, deterministic, no LLM.
 *
 * This is the moat. "What does this document say" is commoditising fast;
 * "your contract and your closing statement disagree about the closing date,
 * here is each one with its page" is not, and it is the thing a lawyer cannot
 * get from a chatbot.
 *
 * Deliberately LLM-free. The model's job ended at extraction; deciding whether
 * two values conflict is arithmetic and string comparison, and must be
 * reproducible, explainable, and unit-testable. A conflict a customer acts on
 * cannot come from a sampled token.
 */

import { normaliseFact, comparisonKey } from './normalise.js'

export type FindingKind =
  | 'conflict'
  | 'missing'
  | 'expired'
  | 'upcoming'
  | 'insufficient_evidence'

export type Severity = 'critical' | 'high' | 'medium' | 'low'

export interface DealFact {
  readonly id: string
  readonly fact_key: string
  readonly raw_value: string | null
  readonly unit?: string | null
  readonly source_document_id: string
  readonly page?: number | null
  readonly quote: string
  readonly confidence?: number | null
}

export interface DealDocument {
  readonly id: string
  readonly doc_type?: string | null
  readonly filename: string
  readonly expires_at?: string | null   // ISO date
  readonly supersedes?: string | null
}

export interface Finding {
  readonly kind: FindingKind
  readonly fact_key: string | null
  readonly severity: Severity
  readonly summary: string
  readonly claimant_document_ids: readonly string[]
  readonly fact_ids: readonly string[]
}

/** A fact_key the pack requires, and how badly it matters. */
export interface RequiredFact {
  readonly fact_key: string
  readonly severity: Severity
  readonly label: string
}

export interface ReconcileInput {
  readonly facts: readonly DealFact[]
  readonly documents: readonly DealDocument[]
  readonly required: readonly RequiredFact[]
  /** Closing date (ISO) — a document expiring before it is a real problem. */
  readonly closingDate?: string | null
}

/**
 * Documents superseded by an amendment are excluded before comparison.
 * A contract and its own addendum SHOULD say different things; reporting that
 * as a conflict would be noise, and noise is how a findings report dies.
 */
function activeDocumentIds(documents: readonly DealDocument[]): Set<string> {
  const superseded = new Set(
    documents.map((d) => d.supersedes).filter((v): v is string => Boolean(v)),
  )
  return new Set(documents.filter((d) => !superseded.has(d.id)).map((d) => d.id))
}

export function reconcile(input: ReconcileInput): Finding[] {
  const findings: Finding[] = []
  const active = activeDocumentIds(input.documents)
  const liveFacts = input.facts.filter((f) => active.has(f.source_document_id))

  const byKey = new Map<string, DealFact[]>()
  for (const f of liveFacts) {
    const list = byKey.get(f.fact_key)
    if (list) list.push(f)
    else byKey.set(f.fact_key, [f])
  }

  const severityFor = (key: string): Severity =>
    input.required.find((r) => r.fact_key === key)?.severity ?? 'medium'
  const labelFor = (key: string): string =>
    input.required.find((r) => r.fact_key === key)?.label ?? key

  // ── Conflicts ─────────────────────────────────────────────────────────────
  for (const [factKey, facts] of byKey) {
    const buckets = new Map<string, DealFact[]>()
    const unnormalisable: DealFact[] = []

    for (const f of facts) {
      const n = f.raw_value ? normaliseFact(factKey, f.raw_value, f.unit ?? undefined) : null
      if (!n) { unnormalisable.push(f); continue }
      const k = comparisonKey(n)
      const b = buckets.get(k)
      if (b) b.push(f)
      else buckets.set(k, [f])
    }

    if (buckets.size > 1) {
      const all = [...buckets.values()].flat()
      const values = [...buckets.values()]
        .map((b) => b[0]?.raw_value ?? '')
        .filter(Boolean)
      findings.push({
        kind: 'conflict',
        fact_key: factKey,
        severity: severityFor(factKey),
        summary: `${labelFor(factKey)} differs across documents: ${values.join(' vs ')}.`,
        claimant_document_ids: [...new Set(all.map((f) => f.source_document_id))],
        fact_ids: all.map((f) => f.id),
      })
    }

    // A value we could not canonicalise is never silently treated as agreeing.
    // Ambiguous numeric dates land here — the honest answer is "check this",
    // not a guess about whether 09/10 is September or October.
    if (unnormalisable.length > 0) {
      findings.push({
        kind: 'insufficient_evidence',
        fact_key: factKey,
        severity: severityFor(factKey),
        summary:
          `${labelFor(factKey)} could not be read unambiguously ` +
          `(${unnormalisable.map((f) => f.raw_value).filter(Boolean).join(', ')}). Verify manually.`,
        claimant_document_ids: [...new Set(unnormalisable.map((f) => f.source_document_id))],
        fact_ids: unnormalisable.map((f) => f.id),
      })
    }
  }

  // ── Missing ───────────────────────────────────────────────────────────────
  // Required by the pack, asserted by nothing. Distinct from a conflict: no
  // document is wrong, one is simply absent.
  for (const req of input.required) {
    if (!byKey.has(req.fact_key)) {
      findings.push({
        kind: 'missing',
        fact_key: req.fact_key,
        severity: req.severity,
        summary: `${req.label} was not found in any uploaded document.`,
        claimant_document_ids: [],
        fact_ids: [],
      })
    }
  }

  // ── Expired ───────────────────────────────────────────────────────────────
  if (input.closingDate) {
    for (const doc of input.documents) {
      if (!active.has(doc.id) || !doc.expires_at) continue
      if (doc.expires_at < input.closingDate) {
        findings.push({
          kind: 'expired',
          fact_key: null,
          severity: 'high',
          summary:
            `${doc.filename} expires ${doc.expires_at}, before the closing date ` +
            `${input.closingDate}.`,
          claimant_document_ids: [doc.id],
          fact_ids: [],
        })
      }
    }
  }

  return findings
}

const SEVERITY_ORDER: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 }
const KIND_ORDER: Record<FindingKind, number> = {
  conflict: 0, missing: 1, expired: 2, upcoming: 3, insufficient_evidence: 4,
}

/** Most actionable first: severity, then kind. */
export function sortFindings(findings: readonly Finding[]): Finding[] {
  return [...findings].sort(
    (a, b) =>
      SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] ||
      KIND_ORDER[a.kind] - KIND_ORDER[b.kind],
  )
}
