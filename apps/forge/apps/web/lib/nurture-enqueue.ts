/**
 * Backwards-compatible re-export. The implementation lives in
 * @bizlegal/nurture-enqueue (Phase AA D8 — INTEGRATION-V3 F-9 lift).
 * Existing call sites importing `@/lib/nurture-enqueue` keep working.
 */
export type {
  NurtureVertical,
  EnqueueArgs,
  SubdomainEnqueueArgs,
} from '@bizlegal/nurture-enqueue'
export { enqueueNurture } from '@bizlegal/nurture-enqueue'
