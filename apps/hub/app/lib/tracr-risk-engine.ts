import { Transaction, WalletSummary, weiToEth } from './tracr-etherscan'

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
  failedTxCount: number
  tokenTransferCount: number
  balanceETH: number
}

export interface RiskResult {
  score: number
  level: 'Low' | 'Moderate' | 'High' | 'Critical'
  flags: RiskFlag[]
  metrics: WalletMetrics
}

// Known sanctioned / mixer addresses (expand from OFAC SDN crypto list)
const FLAGGED_ADDRESSES = new Set([
  '0xd882cfc20f52f2599d84b8e8d58c7fb62cfe344b',
  '0x8576acc5c05d6ce88f4e49bf65bdf0c62f91353c',
  '0x72a5843cc08275c8171e582972aa4fda8c397b2a', // Tornado Cash
  '0xd90e2f925da726b50c4ed8d0fb90ad053324f31b',
  '0x910cbd523d972eb0a6f4cae4618ad62622b39dbf',
])

export function calculateRisk(summary: WalletSummary): RiskResult {
  const { transactions: txs, tokenTransfers, balance, network } = summary
  const allTxs = txs
  let score = 0
  const flags: RiskFlag[] = []

  if (allTxs.length === 0 && tokenTransfers.length === 0) {
    return {
      score: 0,
      level: 'Low',
      flags: [{ severity: 'informational', title: 'No transaction history', description: 'Wallet has no recorded transactions on this network.', weight: 0 }],
      metrics: {
        totalTransactions: 0, totalVolumeETH: 0, uniqueCounterparties: 0,
        maxTxPerDay: 0, firstSeen: 'N/A', lastSeen: 'N/A', avgTxValue: '0',
        failedTxCount: 0, tokenTransferCount: 0, balanceETH: 0,
      },
    }
  }

  // ── METRICS ──────────────────────────────────────────
  const counterparties = new Set<string>()
  allTxs.forEach(tx => {
    if (tx.to) counterparties.add(tx.to.toLowerCase())
    if (tx.from) counterparties.add(tx.from.toLowerCase())
  })

  const txsByDay: Record<string, number> = {}
  allTxs.forEach(tx => {
    const day = new Date(parseInt(tx.timeStamp) * 1000).toISOString().split('T')[0]
    txsByDay[day] = (txsByDay[day] || 0) + 1
  })
  const maxTxPerDay = Math.max(...Object.values(txsByDay), 0)

  const totalVolumeETH = allTxs.reduce((sum, tx) => sum + weiToEth(tx.value), 0)
  const avgTxValue = allTxs.length > 0 ? (totalVolumeETH / allTxs.length).toFixed(4) : '0'
  const failedTxCount = allTxs.filter(tx => tx.isError === '1').length

  const sorted = [...allTxs].sort((a, b) => parseInt(a.timeStamp) - parseInt(b.timeStamp))
  const firstSeen = sorted[0]
    ? new Date(parseInt(sorted[0].timeStamp) * 1000).toISOString()
    : 'N/A'
  const lastSeen = sorted[sorted.length - 1]
    ? new Date(parseInt(sorted[sorted.length - 1].timeStamp) * 1000).toISOString()
    : 'N/A'

  const balanceETH = weiToEth(balance)

  const metrics: WalletMetrics = {
    totalTransactions: allTxs.length,
    totalVolumeETH,
    uniqueCounterparties: counterparties.size,
    maxTxPerDay,
    firstSeen,
    lastSeen,
    avgTxValue,
    failedTxCount,
    tokenTransferCount: tokenTransfers.length,
    balanceETH,
  }

  // ── HEURISTICS ───────────────────────────────────────

  // 1. Volume
  if (allTxs.length > 500) {
    score += 20
    flags.push({ severity: 'high', weight: 20, title: 'Extremely High Transaction Volume', description: `${allTxs.length} transactions recorded — significantly above baseline for retail wallets.` })
  } else if (allTxs.length > 100) {
    score += 10
    flags.push({ severity: 'medium', weight: 10, title: 'Elevated Transaction Volume', description: `${allTxs.length} total transactions indicates high-frequency activity.` })
  }

  // 2. Transaction bursting
  if (maxTxPerDay > 30) {
    score += 30
    flags.push({ severity: 'high', weight: 30, title: 'Rapid Transaction Bursts Detected', description: `Up to ${maxTxPerDay} transactions in a single day — consistent with fund layering patterns.` })
  } else if (maxTxPerDay > 15) {
    score += 15
    flags.push({ severity: 'medium', weight: 15, title: 'Moderate Transaction Bursting', description: `${maxTxPerDay} transactions in one day observed, warranting further review.` })
  }

  // 3. Flagged address interaction
  const flaggedTx = allTxs.find(tx =>
    FLAGGED_ADDRESSES.has((tx.to || '').toLowerCase()) ||
    FLAGGED_ADDRESSES.has((tx.from || '').toLowerCase())
  )
  if (flaggedTx) {
    score += 45
    flags.push({ severity: 'critical', weight: 45, title: 'Interaction with Flagged Address', description: 'Direct transaction to/from a flagged high-risk entity. Immediate review recommended.' })
  }

  // 4. Large single transfer
  const largeTx = allTxs.find(tx => weiToEth(tx.value) > 10)
  if (largeTx) {
    score += 20
    flags.push({ severity: 'medium', weight: 20, title: 'Large Value Movement', description: `Transaction(s) exceeding 10 ETH detected. Large transfers may warrant source-of-funds verification.` })
  }

  // 5. New wallet, high activity
  const firstDate = sorted[0] ? new Date(parseInt(sorted[0].timeStamp) * 1000) : new Date()
  const ageDays = (Date.now() - firstDate.getTime()) / (1000 * 60 * 60 * 24)
  if (ageDays < 30 && allTxs.length > 50) {
    score += 25
    flags.push({ severity: 'high', weight: 25, title: 'New Wallet, High Activity', description: `Wallet is less than 30 days old with ${allTxs.length} transactions — pattern associated with throwaway wallets.` })
  }

  // 6. High failure rate
  if (failedTxCount > 0 && allTxs.length > 10) {
    const failRate = failedTxCount / allTxs.length
    if (failRate > 0.2) {
      score += 15
      flags.push({ severity: 'medium', weight: 15, title: 'High Failed Transaction Rate', description: `${failedTxCount} failed transactions (${(failRate * 100).toFixed(0)}%) — may indicate probing behavior or smart contract exploitation attempts.` })
    }
  }

  // 7. High counterparty diversity
  if (counterparties.size > 100 && allTxs.length > 200) {
    score += 15
    flags.push({ severity: 'medium', weight: 15, title: 'High Counterparty Diversity', description: `${counterparties.size} unique addresses — may indicate a commercial operation or deliberate fund dispersal.` })
  }

  // 8. Heavy token transfers
  if (tokenTransfers.length > 100) {
    score += 10
    flags.push({ severity: 'medium', weight: 10, title: 'Extensive Token Transfer Activity', description: `${tokenTransfers.length} ERC-20 token transfers detected. Complex token flows warrant AML review.` })
  }

  // Informational
  flags.push({
    severity: 'informational', weight: 0,
    title: 'Analysis Scope',
    description: `Report covers ${allTxs.length} transactions and ${tokenTransfers.length} token transfers involving ${counterparties.size} unique addresses on ${network}.`,
  })

  const finalScore = Math.min(score, 100)
  let level: RiskResult['level'] = 'Low'
  if (finalScore >= 75) level = 'Critical'
  else if (finalScore >= 50) level = 'High'
  else if (finalScore >= 25) level = 'Moderate'

  return { score: finalScore, level, flags, metrics }
}
