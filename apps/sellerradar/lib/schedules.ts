/* ─── Fee schedule loader — curated JSON fixtures versioned in-repo ───────
   Spec §5: live scraping deferred (Amazon blocks + ToS); the admin refresh
   path is a new fixture file + bump of CURRENT_VERSION. The Supabase
   fee_schedules table exists (migration) for the v2 live path, but v1 reads
   fixtures only — deterministic, citable, and build-time checked. */

import type { FeeSchedule } from './fees'
import amazon2025 from '@/data/fee-schedules/amazon-2025.json'
import amazon2026 from '@/data/fee-schedules/amazon-2026.json'

const SCHEDULES: readonly FeeSchedule[] = [
  amazon2025 as unknown as FeeSchedule,
  amazon2026 as unknown as FeeSchedule,
]

export function getPreviousSchedule(): FeeSchedule {
  return SCHEDULES[SCHEDULES.length - 2]
}

export function getCurrentSchedule(): FeeSchedule {
  return SCHEDULES[SCHEDULES.length - 1]
}

export function listSchedules(): readonly FeeSchedule[] {
  return SCHEDULES
}
