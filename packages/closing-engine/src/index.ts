/**
 * @bizlegal/closing-engine — deterministic closing-deadline maths.
 *
 * Pure: no LLM, no network, no ambient clock except where a date is passed in.
 * A deadline a client acts on must be reproducible and explainable, so none of
 * it may come from a sampled token.
 *
 * The engine lived in apps/closeflow and was copied verbatim into
 * apps/leaseparse. DEAL44 would have been the third copy. It is one package now.
 */

export * from './calendar.js'
export * from './tasks.js'
export * from './alerts.js'
export * from './holidays/index.js'
export * from './holidays/il.js'
export * from './templates/il-residential.js'
export * from './us/date-calculator.js'
export * from './us/checklist-templates.js'
