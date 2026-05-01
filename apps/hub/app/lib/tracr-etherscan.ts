const ETHERSCAN_BASE = 'https://api.etherscan.io/api'
const POLYGONSCAN_BASE = 'https://api.polygonscan.com/api'
const BSCSCAN_BASE = 'https://api.bscscan.com/api'

const NETWORK_APIS: Record<string, string> = {
  ethereum: ETHERSCAN_BASE,
  polygon: POLYGONSCAN_BASE,
  bnb: BSCSCAN_BASE,
}

export interface Transaction {
  hash: string
  from: string
  to: string
  value: string
  timeStamp: string
  isError: string
  gasUsed: string
  gas: string
  gasPrice: string
  blockNumber: string
  contractAddress?: string
  tokenName?: string
  tokenSymbol?: string
}

export interface WalletSummary {
  transactions: Transaction[]
  tokenTransfers: Transaction[]
  balance: string
  network: string
}

async function etherscanFetch(
  base: string,
  params: Record<string, string>
): Promise<any> {
  const key = process.env.ETHERSCAN_API_KEY || ''
  const url = new URL(base)
  Object.entries({ ...params, apikey: key }).forEach(([k, v]) =>
    url.searchParams.set(k, v)
  )
  const res = await fetch(url.toString(), { next: { revalidate: 0 } })
  if (!res.ok) throw new Error(`Etherscan error ${res.status}`)
  const data = await res.json()
  if (data.status === '0' && data.message !== 'No transactions found') {
    // Not a hard error — empty results are ok
  }
  return data.result || []
}

export async function getWalletData(
  wallet: string,
  network = 'ethereum'
): Promise<WalletSummary> {
  const base = NETWORK_APIS[network.toLowerCase()] || ETHERSCAN_BASE

  const [txList, tokenList, balanceResult] = await Promise.allSettled([
    etherscanFetch(base, {
      module: 'account',
      action: 'txlist',
      address: wallet,
      startblock: '0',
      endblock: '99999999',
      sort: 'desc',
      offset: '200',
      page: '1',
    }),
    etherscanFetch(base, {
      module: 'account',
      action: 'tokentx',
      address: wallet,
      startblock: '0',
      endblock: '99999999',
      sort: 'desc',
      offset: '100',
      page: '1',
    }),
    etherscanFetch(base, {
      module: 'account',
      action: 'balance',
      address: wallet,
      tag: 'latest',
    }),
  ])

  return {
    transactions: txList.status === 'fulfilled' && Array.isArray(txList.value) ? txList.value : [],
    tokenTransfers: tokenList.status === 'fulfilled' && Array.isArray(tokenList.value) ? tokenList.value : [],
    balance: balanceResult.status === 'fulfilled' ? String(balanceResult.value) : '0',
    network,
  }
}

export function weiToEth(wei: string): number {
  return parseFloat(wei) / 1e18 || 0
}
