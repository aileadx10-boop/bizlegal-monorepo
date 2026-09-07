/**
 * Re-export shim. The implementation moved to @bizlegal/closing-engine.
 *
 * This file used to hold the engine, and an identical copy lived in
 * apps/closeflow/web/lib/. DEAL44 would have made a third. One package now owns it, and the
 * behaviour is unchanged: every function defaults to the MON_FRI calendar,
 * which is exactly the Sat/Sun weekend this file used to hardcode. A snapshot
 * test in packages/closing-engine/tests/engine.test.mjs asserts that.
 *
 * Import from '@bizlegal/closing-engine' directly in new code.
 */

export * from '@bizlegal/closing-engine/us/date-calculator'
