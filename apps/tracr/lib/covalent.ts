/* ─── GoldRush / Covalent multi-chain blockchain data ─────────────────────── */

const BASE = 'https://api.covalenthq.com/v1'

const CHAIN_IDS: Record<string, number> = {
  ethereum: 1,
  bnb: 56,
  polygon: 137,
  avalanche: 43114,
  arbitrum: 42161,
  optimism: 10,
  base: 8453,
  bitcoin: 0, // handled separately
}

export interface Transaction {
  tx_hash: string
  from_address: string
  to_address: string
  value: string          // in wei
  block_signed_at: string
  successful: boolean
  gas_spent: number
  value_quote?: number   // USD value
}

export interface TokenBalance {
  contract_address: string
  contract_name: string
  contract_ticker_symbol: string
  balance: string
  quote: number
}

function authHeader() {
  return { Authorization: `Bearer ${process.env.GOLDRUSH_API_KEY}` }
}

export async function getTransactions(
  wallet: string,
  network = 'ethereum',
  pageSize = 500,
): Promise<Transaction[]> {
  // Bitcoin: use Blockchain.info (no auth needed)
  if (network === 'bitcoin') {
    return getBitcoinTransactions(wallet)
  }

  const chainId = CHAIN_IDS[network.toLowerCase()] ?? 1
  const url = `${BASE}/${chainId}/address/${wallet}/transactions_v2/?page-size=${pageSize}`

  if (!process.env.GOLDRUSH_API_KEY) {
    console.warn('[covalent] GOLDRUSH_API_KEY not set — falling back to Etherscan')
    return getTransactionsEtherscan(wallet)
  }

  try {
    const res = await fetch(url, { headers: authHeader() })
    if (!res.ok) {
      console.warn(`[covalent] ${res.status} for chain ${chainId}`)
      return getTransactionsEtherscan(wallet)  // fallback
    }
    const data = await res.json()
    return (data.data?.items ?? []).map((item: Record<string, unknown>) => ({
      tx_hash: item.tx_hash as string,
      from_address: item.from_address as string,
      to_address: item.to_address as string,
      value: String(item.value ?? '0'),
      block_signed_at: item.block_signed_at as string,
      successful: item.successful as boolean,
      gas_spent: Number(item.gas_spent ?? 0),
      value_quote: item.value_quote as number | undefined,
    }))
  } catch {
    return getTransactionsEtherscan(wallet)
  }
}

export async function getTokenBalances(
  wallet: string,
  network = 'ethereum',
): Promise<TokenBalance[]> {
  const chainId = CHAIN_IDS[network.toLowerCase()] ?? 1
  const url = `${BASE}/${chainId}/address/${wallet}/balances_v2/`

  try {
    const res = await fetch(url, { headers: authHeader() })
    if (!res.ok) return []
    const data = await res.json()
    return data.data?.items ?? []
  } catch {
    return []
  }
}

/* ─── Etherscan fallback ──────────────────────────────────────────────────── */
async function getTransactionsEtherscan(wallet: string): Promise<Transaction[]> {
  const key = process.env.ETHERSCAN_API_KEY
  if (!key) {
    console.warn('[covalent] ETHERSCAN_API_KEY not set — cannot fetch real blockchain data')
    return []
  }

  const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${wallet}&startblock=0&endblock=99999999&page=1&offset=500&sort=desc&apikey=${key}`

  try {
    const res = await fetch(url)
    const data = await res.json()
    if (data.status !== '1') return []

    return (data.result ?? []).map((tx: Record<string, string>) => ({
      tx_hash: tx.hash,
      from_address: tx.from,
      to_address: tx.to,
      value: tx.value,
      block_signed_at: new Date(Number(tx.timeStamp) * 1000).toISOString(),
      successful: tx.isError === '0',
      gas_spent: Number(tx.gasUsed ?? 0),
    }))
  } catch {
    return []
  }
}

/* ─── Bitcoin via Blockchain.info (no auth) ──────────────────────────────── */
async function getBitcoinTransactions(address: string): Promise<Transaction[]> {
  try {
    const res = await fetch(`https://blockchain.info/rawaddr/${address}?limit=100`)
    if (!res.ok) return []
    const data = await res.json()

    return (data.txs ?? []).map((tx: Record<string, unknown>) => ({
      tx_hash: tx.hash as string,
      from_address: address,
      to_address: address,
      value: String((tx.result as number) ?? 0),
      block_signed_at: new Date((tx.time as number) * 1000).toISOString(),
      successful: true,
      gas_spent: 0,
    }))
  } catch {
    return []
  }
}
