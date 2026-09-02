/* ─── Battery runner — engines × prompts with bounded concurrency ────────── */

import { EngineAdapter, EngineId, EngineProbeResult } from './types'
import { chatgptEngine } from './openai'
import { claudeEngine } from './anthropic'
import { perplexityEngine } from './perplexity'
import { googleAioEngine } from './serpapi'

export const ENGINES: readonly EngineAdapter[] = [
  chatgptEngine,
  claudeEngine,
  perplexityEngine,
  googleAioEngine,
]

export const ENGINE_IDS: readonly EngineId[] = ENGINES.map((e) => e.id)

export function engineStatusMatrix(): Array<{ id: EngineId; name: string; configured: boolean }> {
  return ENGINES.map((e) => ({ id: e.id, name: e.displayName, configured: e.isConfigured() }))
}

export interface BatteryItem extends EngineProbeResult {
  prompt: string
  seq: number
}

const CONCURRENCY = 6

/**
 * Run every prompt against every engine. Engines without a configured API
 * key resolve immediately to status 'unavailable' — they never throw and
 * never fail the battery. Returns one item per (prompt, engine) pair with
 * a scan-wide sequence number (drives the evidence hash + ordering).
 */
export async function runBattery(prompts: readonly string[], entity: string): Promise<BatteryItem[]> {
  const jobs: Array<{ engine: EngineAdapter; prompt: string; seq: number }> = []
  let seq = 0
  for (const prompt of prompts) {
    for (const engine of ENGINES) {
      jobs.push({ engine, prompt, seq: seq++ })
    }
  }

  const results: BatteryItem[] = new Array(jobs.length)
  let cursor = 0

  async function worker(): Promise<void> {
    while (cursor < jobs.length) {
      const job = jobs[cursor++]
      const base = await job.engine.probe({ prompt: job.prompt, entity })
      results[job.seq] = { ...base, prompt: job.prompt, seq: job.seq }
    }
  }

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, jobs.length) }, () => worker()))
  return results
}
