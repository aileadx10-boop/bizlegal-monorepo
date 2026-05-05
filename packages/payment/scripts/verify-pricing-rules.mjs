#!/usr/bin/env node
/**
 * Sanity-check the rules in pricing-experiments.ts. Run from the
 * package root after `pnpm build`:
 *
 *   node scripts/verify-pricing-rules.mjs
 *
 * Exits 0 when every rule rejects the inputs it should reject. Exits 1
 * with the first failure otherwise.
 */
import { defineExperiment } from '../dist/pricing-experiments.js'

const cases = [
  {
    name: 'rejects price-raise',
    spec: {
      experiment_id: 'r-raise',
      product_id: 'forge_boi_kit',
      started_at: '2026-05-15T00:00:00Z',
      ends_at: '2026-05-22T00:00:00Z',
      original_amount_cents: 14900,
      experiment_amount_cents: 19900,
      drop_pct: -33.6,
      rationale: 'Trying to raise — should be rejected by the rule layer.',
      metric_before: { conversions: 5, visits: 200, rate_pct: 2.5 },
      metric_after: null,
    },
    expect: /price-raise forbidden/,
  },
  {
    name: 'rejects drop > 20%',
    spec: {
      experiment_id: 'r-too-deep',
      product_id: 'forge_boi_kit',
      started_at: '2026-05-15T00:00:00Z',
      ends_at: '2026-05-22T00:00:00Z',
      original_amount_cents: 14900,
      experiment_amount_cents: 9900,
      drop_pct: 33.6,
      rationale: 'Trying to drop too far — should be rejected.',
      metric_before: { conversions: 0, visits: 200, rate_pct: 0 },
      metric_after: null,
    },
    expect: /> max 20% authority/,
  },
  {
    name: 'rejects drop < 10%',
    spec: {
      experiment_id: 'r-too-shallow',
      product_id: 'forge_boi_kit',
      started_at: '2026-05-15T00:00:00Z',
      ends_at: '2026-05-22T00:00:00Z',
      original_amount_cents: 14900,
      experiment_amount_cents: 14000,
      drop_pct: 6.0,
      rationale: 'Trying to drop too shallowly — should be rejected.',
      metric_before: { conversions: 0, visits: 200, rate_pct: 0 },
      metric_after: null,
    },
    expect: /< min 10%/,
  },
  {
    name: 'rejects window > 14 days',
    spec: {
      experiment_id: 'r-too-long',
      product_id: 'forge_boi_kit',
      started_at: '2026-05-15T00:00:00Z',
      ends_at: '2026-06-30T00:00:00Z',
      original_amount_cents: 14900,
      experiment_amount_cents: 12900,
      drop_pct: 13.4,
      rationale: 'Trying a long window — should be rejected.',
      metric_before: { conversions: 0, visits: 200, rate_pct: 0 },
      metric_after: null,
    },
    expect: /> 14d max/,
  },
  {
    name: 'rejects empty rationale',
    spec: {
      experiment_id: 'r-no-rationale',
      product_id: 'forge_boi_kit',
      started_at: '2026-05-15T00:00:00Z',
      ends_at: '2026-05-22T00:00:00Z',
      original_amount_cents: 14900,
      experiment_amount_cents: 12900,
      drop_pct: 13.4,
      rationale: 'too short',
      metric_before: { conversions: 0, visits: 200, rate_pct: 0 },
      metric_after: null,
    },
    expect: /rationale must be ≥30 chars/,
  },
  {
    name: 'accepts a clean 13.4% drop',
    spec: {
      experiment_id: 'r-clean-13pct',
      product_id: 'forge_boi_kit',
      started_at: '2026-05-15T00:00:00Z',
      ends_at: '2026-05-22T00:00:00Z',
      original_amount_cents: 14900,
      experiment_amount_cents: 12900,
      drop_pct: 13.4,
      rationale: '14d at $149 yielded 0/200 conversions; testing demand at $129.',
      metric_before: { conversions: 0, visits: 200, rate_pct: 0 },
      metric_after: null,
    },
    expectAccept: true,
  },
]

let failures = 0
for (const { name, spec, expect, expectAccept } of cases) {
  try {
    defineExperiment(spec)
    if (expectAccept) {
      console.log(`  ok  ${name}`)
    } else {
      console.error(`  FAIL ${name} — expected throw matching ${expect}`)
      failures++
    }
  } catch (err) {
    if (expectAccept) {
      console.error(`  FAIL ${name} — unexpected throw: ${err.message}`)
      failures++
    } else if (expect && !expect.test(err.message)) {
      console.error(`  FAIL ${name} — wrong throw: ${err.message}`)
      failures++
    } else {
      console.log(`  ok  ${name} (rejected: ${err.message.slice(0, 60)}…)`)
    }
  }
}

process.exit(failures === 0 ? 0 : 1)
