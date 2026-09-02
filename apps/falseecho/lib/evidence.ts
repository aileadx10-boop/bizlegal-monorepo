/* ─── SHA-256 evidence anchoring ───────────────────────────────────────────
   Every captured engine response is hash-anchored (spec §3 criterion 2):
   SHA-256 over the canonical JSON of the evidence fields + UTC timestamp +
   scan sequence. Recomputing the hash from the stored row must reproduce
   the stored value — that is the tamper-evidence property. */

import crypto from 'node:crypto'

export function sha256Hex(input: string): string {
  return crypto.createHash('sha256').update(input, 'utf8').digest('hex')
}

export interface EvidenceHashFields {
  scanId: string
  engine: string
  seq: number
  prompt: string
  response: string
  scannedAt: string // ISO 8601 UTC
}

/**
 * Canonical evidence hash. Field order is fixed; JSON.stringify of an
 * object literal built in this order is the canonical form.
 */
export function evidenceHash(f: EvidenceHashFields): string {
  return sha256Hex(
    JSON.stringify({
      scan_id: f.scanId,
      engine: f.engine,
      seq: f.seq,
      prompt: f.prompt,
      response: f.response,
      scanned_at: f.scannedAt,
    })
  )
}

/**
 * Hash of the submitted content itself (entity + optional URL + optional
 * pasted text), anchored to the scan reference + creation time. Surfaced
 * on the report page as the submission anchor.
 */
export function submissionHash(f: {
  entity: string
  url?: string | null
  content?: string | null
  scanRef: string
  createdAt: string
}): string {
  return sha256Hex(
    JSON.stringify({
      entity: f.entity,
      url: f.url ?? null,
      content: f.content ?? null,
      scan_ref: f.scanRef,
      created_at: f.createdAt,
    })
  )
}

/** Scan-level anchor: hash of the concatenated per-evidence hashes. */
export function scanHash(evidenceHashes: string[]): string {
  return sha256Hex(evidenceHashes.join('|'))
}
