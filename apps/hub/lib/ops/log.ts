/**
 * Hub-local re-export shim for `@bizlegal/ops-log`.
 *
 * Phase Z1.D (2026-05-02): the canonical implementation lives at
 * `packages/ops-log/src/index.ts` and is shared across every app +
 * service in the monorepo. This shim keeps the historical 32 hub
 * import sites (`import { logEventAsync } from '@/lib/ops/log'`)
 * working without churn — they re-export through the workspace
 * package.
 *
 * Future code can import directly from '@bizlegal/ops-log' and
 * skip this shim. Don't add new logic here — edit the canonical
 * package instead. Discipline: this file should never grow beyond
 * the re-export.
 */

export {
  logEvent,
  logEventAsync,
  type OpsEventType,
  type LogEventInput,
} from '@bizlegal/ops-log'
