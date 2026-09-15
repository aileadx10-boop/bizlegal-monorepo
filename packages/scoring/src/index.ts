export interface FactorScores {
  demand: number
  pain: number
  wtp: number
  competition: number
  legal: number
  automation: number
  acquisition: number
}

export const SCORING_VERSION = 'v1'

export const WEIGHTS: FactorScores = {
  demand: 0.2,
  pain: 0.2,
  wtp: 0.2,
  competition: 0.15,
  legal: 0.1,
  automation: 0.08,
  acquisition: 0.07,
}

export type OpportunityStatus = 'watch' | 'validate' | 'validated' | 'build' | 'building' | 'built' | 'killed' | 'ignore'

export function weightedScore(f: FactorScores): number {
  const total =
    f.demand * WEIGHTS.demand +
    f.pain * WEIGHTS.pain +
    f.wtp * WEIGHTS.wtp +
    f.competition * WEIGHTS.competition +
    f.legal * WEIGHTS.legal +
    f.automation * WEIGHTS.automation +
    f.acquisition * WEIGHTS.acquisition
  return Math.round((total + Number.EPSILON) * 100) / 100
}

export function statusFor(score: number): OpportunityStatus {
  if (score >= 80) return 'build'
  if (score >= 65) return 'validate'
  if (score >= 50) return 'watch'
  return 'ignore'
}

export function factorsEqual(a: FactorScores, b: FactorScores): boolean {
  const keys = Object.keys(a) as (keyof FactorScores)[]
  return keys.every((k) => Math.abs(a[k] - b[k]) < 0.005)
}
