import type { Transaction } from './covalent'

/* ─── Types ─────────────────────────────────────────────────────────────── */
export interface RiskResult {
  score: number
  level: 'Low' | 'Moderate' | 'High' | 'Critical'
  flags: RiskFlag[]
  metrics: WalletMetrics
}

export interface RiskFlag {
  severity: 'critical' | 'high' | 'medium' | 'informational'
  title: string
  description: string
  weight: number
}

export interface WalletMetrics {
  totalTransactions: number
  totalVolumeETH: number
  uniqueCounterparties: number
  maxTxPerDay: number
  firstSeen: string
  lastSeen: string
  avgTxValue: string
}

/* ─── Known high-risk address sets ──────────────────────────────────────── */
const KNOWN_RISKY = new Set([
  '0xd882cfc20f52f2599d84b8e8d58c7fb62cfe344b', // known mixer
  '0x8576acc5c05d6ce88f4e49bf65bdf0c62f91353c', // sanctioned
  '0x7f367cc41522ce07553e823bf3be79a889debe1b', // OFAC SDN
  '0xd882cfc20f52f2599d84b8e8d58c7fb62cfe344b',
])

/* ─── Main scoring function ──────────────────────────────────────────────── */
export function calculateRisk(txs: Transaction[]): RiskResult {
  if (txs.length === 0) {
    return {
      score: 0, level: 'Low',
      flags: [{ severity: 'informational', weight: 0, title: 'No Transaction History', description: 'No recorded transactions found for this address.' }],
      metrics: { totalTransactions: 0, totalVolumeETH: 0, uniqueCounterparties: 0, maxTxPerDay: 0, firstSeen: 'N/A', lastSeen: 'N/A', avgTxValue: '0' },
    }
  }

  let score = 0
  const flags: RiskFlag[] = []

  /* ── Metrics ──────────────────────────────────────────────────────────── */
  const counterparties = new Set<string>()
  txs.forEach(tx => {
    if (tx.to_address)   counterparties.add(tx.to_address.toLowerCase())
    if (tx.from_address) counterparties.add(tx.from_address.toLowerCase())
  })

  const txsByDay: Record<string, number> = {}
  txs.forEach(tx => {
    const day = tx.block_signed_at?.split('T')[0] ?? 'unknown'
    txsByDay[day] = (txsByDay[day] ?? 0) + 1
  })
  const maxTxPerDay = Math.max(...Object.values(txsByDay), 0)

  const totalValue = txs.reduce((sum, tx) => sum + parseFloat(tx.value ?? '0'), 0)

  const sorted = [...txs].sort(
    (a, b) => new Date(a.block_signed_at ?? 0).getTime() - new Date(b.block_signed_at ?? 0).getTime()
  )

  const metrics: WalletMetrics = {
    totalTransactions: txs.length,
    totalVolumeETH: totalValue / 1e18,
    uniqueCounterparties: counterparties.size,
    maxTxPerDay,
    firstSeen: sorted[0]?.block_signed_at ?? 'Unknown',
    lastSeen: sorted[sorted.length - 1]?.block_signed_at ?? 'Unknown',
    avgTxValue: (totalValue / txs.length / 1e18).toFixed(4),
  }

  /* ── Heuristics ───────────────────────────────────────────────────────── */

  // 1. Transaction volume
  if (txs.length > 500) {
    score += 20
    flags.push({ severity: 'high', weight: 20, title: 'Extremely High Transaction Volume', description: `${txs.length} transactions — significantly above baseline for retail wallets.` })
  } else if (txs.length > 100) {
    score += 10
    flags.push({ severity: 'medium', weight: 10, title: 'Elevated Transaction Volume', description: `${txs.length} transactions indicates high-frequency activity.` })
  }

  // 2. Rapid bursting (fund layering)
  if (maxTxPerDay > 30) {
    score += 30
    flags.push({ severity: 'high', weight: 30, title: 'Rapid Transaction Bursts', description: `${maxTxPerDay} transactions in a single day — consistent with fund layering patterns.` })
  } else if (maxTxPerDay > 15) {
    score += 15
    flags.push({ severity: 'medium', weight: 15, title: 'Moderate Transaction Bursting', description: `${maxTxPerDay} transactions in one day observed, warranting review.` })
  }

  // 3. Known high-risk interaction
  const riskyTx = txs.find(tx =>
    KNOWN_RISKY.has(tx.to_address?.toLowerCase() ?? '') ||
    KNOWN_RISKY.has(tx.from_address?.toLowerCase() ?? '')
  )
  if (riskyTx) {
    score += 40
    flags.push({ severity: 'critical', weight: 40, title: 'Interaction with Flagged Address', description: 'Direct transaction to/from a flagged high-risk entity.' })
  }

  // 4. Large single transaction (>10 ETH)
  const largeTx = txs.find(tx => parseFloat(tx.value ?? '0') > 10e18)
  if (largeTx) {
    score += 20
    flags.push({ severity: 'medium', weight: 20, title: 'Large Value Movement', description: 'Transaction(s) exceeding 10 ETH — source-of-funds verification recommended.' })
  }

  // 5. New wallet high activity
  const ageDays = (Date.now() - new Date(sorted[0]?.block_signed_at ?? 0).getTime()) / 86400000
  if (ageDays < 30 && txs.length > 50) {
    score += 25
    flags.push({ severity: 'high', weight: 25, title: 'New Wallet, High Activity', description: `Wallet < 30 days old with ${txs.length} transactions — pattern associated with throwaway wallets.` })
  }

  // 6. High counterparty diversity (structuring)
  if (counterparties.size > 100 && txs.length > 200) {
    score += 15
    flags.push({ severity: 'medium', weight: 15, title: 'High Counterparty Diversity', description: `${counterparties.size} unique addresses — may indicate deliberate fund dispersal.` })
  }

  // 7. Failed transactions spike
  const failedCount = txs.filter(tx => !tx.successful).length
  if (failedCount > 10 && failedCount / txs.length > 0.1) {
    score += 10
    flags.push({ severity: 'medium', weight: 10, title: 'Elevated Failed Transactions', description: `${failedCount} failed transactions (${Math.round(failedCount / txs.length * 100)}%) may indicate probing behavior.` })
  }

  // Baseline
  flags.push({ severity: 'informational', weight: 0, title: 'Analysis Scope', description: `Report covers ${txs.length} transactions across ${counterparties.size} unique counterparties.` })

  const finalScore = Math.min(score, 100)
  let level: RiskResult['level'] = 'Low'
  if (finalScore >= 75)      level = 'Critical'
  else if (finalScore >= 50) level = 'High'
  else if (finalScore >= 25) level = 'Moderate'

  return { score: finalScore, level, flags, metrics }
}
