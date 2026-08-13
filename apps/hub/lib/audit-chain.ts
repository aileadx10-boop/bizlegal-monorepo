import { createHash } from 'crypto'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Agent audit trail — hash-chained action log (O-013 / W4-11).
 *
 * Every `agent_runs` row carries:
 *   - payload_hash: SHA-256 of the row's own content (canonical JSON of the
 *     fields that define the action: agent_name, action, status, details,
 *     target_email, created_at).
 *   - prev_hash: the payload_hash of the previous row by created_at (null for
 *     the first chained row).
 *   - chain_status: 'chained' when written through writeAuditRun, 'chain_gap'
 *     for rows that predate the chain (honest backfill marker).
 *
 * Verification recomputes each row's payload_hash from its content and checks
 * the prev_hash links. Tampering with a row's content breaks its own hash;
 * tampering with a stored hash breaks the next row's link — either way the
 * chain reports invalid.
 *
 * This is tamper-EVIDENT, not tamper-proof: it proves the log was altered,
 * not that the outcome was correct. The dashboard copy says exactly that.
 */

export interface AuditRunInput {
  agent_name: string
  workflow_id?: string | null
  action: string
  status: 'success' | 'failed' | 'skipped' | string
  target_email?: string | null
  details?: Record<string, unknown> | null
  created_at?: string
}

export interface AuditChainRow extends AuditRunInput {
  id: string
  payload_hash: string | null
  prev_hash: string | null
  chain_status: string | null
}

/** Canonical JSON — stable key order so identical payloads hash identically. */
function canonicalJson(value: unknown): string {
  if (value === null || value === undefined) return 'null'
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>
    const keys = Object.keys(obj).sort()
    return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalJson(obj[k])}`).join(',')}}`
  }
  return JSON.stringify(value)
}

/** SHA-256 hex digest of a string. */
export function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex')
}

/** Hash of a single run's content — the fields that define the action. */
export function hashRunPayload(run: AuditRunInput): string {
  const payload = {
    agent_name: run.agent_name,
    workflow_id: run.workflow_id ?? null,
    action: run.action,
    status: run.status,
    target_email: run.target_email ?? null,
    details: run.details ?? null,
    created_at: run.created_at ?? null,
  }
  return sha256(canonicalJson(payload))
}

/**
 * Insert an agent run with its hash-chain fields. Fetches the latest chained
 * row's payload_hash to link against, then inserts with chain_status='chained'.
 * Returns the inserted row's payload_hash, or null on failure (never throws —
 * audit logging must not break the action being logged).
 */
export async function writeAuditRun(
  supabase: SupabaseClient,
  run: AuditRunInput
): Promise<string | null> {
  try {
    const { data: latest } = await supabase
      .from('agent_runs')
      .select('payload_hash')
      .eq('chain_status', 'chained')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const payloadHash = hashRunPayload(run)
    const prevHash = (latest?.payload_hash as string | null) ?? null

    const { error } = await supabase.from('agent_runs').insert({
      ...run,
      payload_hash: payloadHash,
      prev_hash: prevHash,
      chain_status: 'chained',
    })
    if (error) {
      console.warn('[audit-chain] insert failed', error.message)
      return null
    }
    return payloadHash
  } catch (err) {
    console.warn('[audit-chain] threw', err instanceof Error ? err.message : err)
    return null
  }
}

export interface ChainVerification {
  valid: boolean
  checked: number
  gaps: number
  /** Index (0-based, oldest-first) of the first row whose hash or link broke. */
  broken_at: number | null
  /** Human-readable reason for the first break. */
  reason: string | null
}

/**
 * Verify a hash chain over rows ordered oldest→newest. Rows with
 * chain_status='chain_gap' are counted as gaps and skipped (their link is
 * unknown, so they neither validate nor invalidate the chain).
 */
export function verifyChain(rows: AuditChainRow[]): ChainVerification {
  const ordered = [...rows].sort(
    (a, b) => new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime()
  )

  let gaps = 0
  let lastPayloadHash: string | null = null

  for (let i = 0; i < ordered.length; i++) {
    const row = ordered[i]!
    if (row.chain_status === 'chain_gap' || !row.payload_hash) {
      gaps++
      continue
    }

    const recomputed = hashRunPayload(row)
    if (recomputed !== row.payload_hash) {
      return {
        valid: false,
        checked: ordered.length,
        gaps,
        broken_at: i,
        reason: `row ${i} payload_hash mismatch (content altered)`,
      }
    }

    if (row.prev_hash !== lastPayloadHash) {
      return {
        valid: false,
        checked: ordered.length,
        gaps,
        broken_at: i,
        reason: `row ${i} prev_hash does not link to previous row`,
      }
    }

    lastPayloadHash = row.payload_hash
  }

  return { valid: true, checked: ordered.length, gaps, broken_at: null, reason: null }
}
