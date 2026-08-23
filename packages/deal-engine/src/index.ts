/**
 * @bizlegal/deal-engine — the transaction reconciliation core.
 *
 * One engine, jurisdiction packs. The engine never changes between Dubai,
 * London and Florida; only the ontology in packs/ does.
 *
 * Everything exported here is pure and deterministic. No LLM call, no network,
 * no clock read except where a date is passed in explicitly — so a finding a
 * customer acts on can always be reproduced and explained.
 */

export * from './normalise.js'
export * from './reconcile.js'
export * from './packs/ae-dubai-residential.js'
