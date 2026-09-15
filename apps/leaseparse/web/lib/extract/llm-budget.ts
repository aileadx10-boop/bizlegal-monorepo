/**
 * The Claude cost cap, in code.
 *
 * The trio decision doc puts a $200/mo ceiling on the whole
 * PropSignal/LeaseParse/CloseFlow stack, of which LeaseParse's Claude spend is
 * budgeted at $80/mo. A comment saying so is not a cap, so this module is the
 * enforcement: every Claude call reserves its worst-case cost against a
 * database counter *before* the request is made, and the reservation is refused
 * once the month's total would cross MONTHLY_CAP_USD.
 *
 * Three properties that matter:
 *   1. Reserve-before-call. The increment happens first, so a burst of
 *      concurrent parses cannot each read "under cap" and all proceed.
 *      The atomicity lives in SQL (leaseparse_reserve_llm_spend, row-locked).
 *   2. Worst-case estimate. Input chars + max_tokens at the model's list price,
 *      so the reserved amount is never less than the invoice. Cheaper actual
 *      usage just means the cap is reached later than the counter thinks.
 *   3. Fail closed. An RPC error, a missing migration, an unrecognised model —
 *      all deny. An unreadable budget is not a budget, and the lesson from the
 *      2026-07-10 incident is that a switch which fails open is not a switch.
 *
 * Denied calls raise LlmBudgetExceededError; the ingest route catches it, parks
 * the lease as 'pending_budget' and returns 503 without touching the model.
 * The paid credit is NOT consumed, so the job is re-runnable next month.
 */

import type { SupabaseClient } from '@supabase/supabase-js'

/** LeaseParse's slice of the trio's $200/mo stack budget. */
export const MONTHLY_CAP_USD = 80

/** Fleet default (plan v3 §A1). Override per-deployment with ANTHROPIC_MODEL. */
export const DEFAULT_MODEL = 'claude-sonnet-5'

/** The cheap tier. Set ANTHROPIC_MODEL to this to stretch the same $80 further. */
export const CHEAP_MODEL = 'claude-haiku-4-5-20251001'

const RESERVE_RPC = 'leaseparse_reserve_llm_spend'

interface ModelPrice {
  /** USD per million input tokens. */
  readonly inputPerMTok: number
  /** USD per million output tokens. */
  readonly outputPerMTok: number
}

/** List prices. A model missing here is charged at FALLBACK_PRICE, not for free. */
const PRICES: Readonly<Record<string, ModelPrice>> = {
  'claude-sonnet-5': { inputPerMTok: 3, outputPerMTok: 15 },
  'claude-haiku-4-5-20251001': { inputPerMTok: 1, outputPerMTok: 5 },
}

/** Deliberately pessimistic: an unknown model id is priced at the top of the range. */
const FALLBACK_PRICE: ModelPrice = { inputPerMTok: 15, outputPerMTok: 75 }

/** Conservative for English legal prose (real ratio is nearer 4). */
const CHARS_PER_TOKEN = 3.5

/** `ANTHROPIC_MODEL ?? 'claude-sonnet-5'`, with an explicit argument winning. */
export function resolveModel(explicit?: string): string {
  const fromEnv = (process.env.ANTHROPIC_MODEL ?? '').trim()
  return explicit?.trim() || fromEnv || DEFAULT_MODEL
}

export function priceFor(model: string): ModelPrice {
  return PRICES[model] ?? FALLBACK_PRICE
}

/** UTC 'YYYY-MM' — the counter's key. */
export function monthKey(now: Date = new Date()): string {
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`
}

/**
 * Worst-case USD for one call: every input character billed, every output token
 * billed as if the model ran to max_tokens.
 */
export function estimateCostUsd(model: string, inputChars: number, maxOutputTokens: number): number {
  const price = priceFor(model)
  const inputTokens = Math.ceil(Math.max(0, inputChars) / CHARS_PER_TOKEN)
  const outputTokens = Math.max(0, maxOutputTokens)
  const usd =
    (inputTokens / 1_000_000) * price.inputPerMTok + (outputTokens / 1_000_000) * price.outputPerMTok
  // Round up to the cent so a long tail of sub-cent calls still moves the counter.
  return Math.ceil(usd * 100) / 100
}

export interface BudgetDecision {
  readonly allowed: boolean
  readonly spentUsd: number
  readonly capUsd: number
  readonly reason?: string
}

function toNumber(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return fallback
}

/** Narrow the untrusted jsonb the RPC returns. Anything unexpected denies. */
function coerceDecision(raw: unknown, capUsd: number): BudgetDecision {
  if (typeof raw !== 'object' || raw === null) {
    return { allowed: false, spentUsd: 0, capUsd, reason: 'budget_unreadable' }
  }
  const row = raw as Record<string, unknown>
  const allowed = row.allowed === true
  return {
    allowed,
    spentUsd: toNumber(row.spent_usd, 0),
    capUsd: toNumber(row.cap_usd, capUsd),
    reason: typeof row.reason === 'string' ? row.reason : allowed ? undefined : 'denied',
  }
}

export interface ReserveInput {
  readonly db: SupabaseClient
  readonly usd: number
  readonly month?: string
  readonly capUsd?: number
}

/** Atomically reserve `usd` against this month's counter. Denies on any error. */
export async function reserveLlmSpend({
  db,
  usd,
  month = monthKey(),
  capUsd = MONTHLY_CAP_USD,
}: ReserveInput): Promise<BudgetDecision> {
  try {
    const { data, error } = await db.rpc(RESERVE_RPC, {
      p_month: month,
      p_usd: usd,
      p_cap: capUsd,
    })
    if (error) {
      console.warn('[leaseparse/llm-budget] reserve failed', error.message)
      return { allowed: false, spentUsd: 0, capUsd, reason: 'budget_unreadable' }
    }
    return coerceDecision(data, capUsd)
  } catch (err) {
    console.warn('[leaseparse/llm-budget] reserve threw', err instanceof Error ? err.message : err)
    return { allowed: false, spentUsd: 0, capUsd, reason: 'budget_unreadable' }
  }
}

/** Thrown instead of calling the model when the reservation is refused. */
export class LlmBudgetExceededError extends Error {
  readonly spentUsd: number
  readonly capUsd: number
  readonly reason: string
  readonly model: string
  readonly estimateUsd: number

  constructor(decision: BudgetDecision, model: string, estimateUsd: number) {
    super(
      `llm_budget_exceeded: ${decision.reason ?? 'denied'} (spent $${decision.spentUsd} of $${decision.capUsd}, this call ~$${estimateUsd})`,
    )
    this.name = 'LlmBudgetExceededError'
    this.spentUsd = decision.spentUsd
    this.capUsd = decision.capUsd
    this.reason = decision.reason ?? 'denied'
    this.model = model
    this.estimateUsd = estimateUsd
  }
}

export function isBudgetExceeded(err: unknown): err is LlmBudgetExceededError {
  return err instanceof LlmBudgetExceededError
}
