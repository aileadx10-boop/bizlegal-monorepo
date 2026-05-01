export const CRYPTO_IDS = ['bitcoin', 'ethereum', 'solana', 'matic-network'] as const
export const CRYPTO_SYMBOLS: Record<string, string> = {
  bitcoin: 'BTC',
  ethereum: 'ETH',
  solana: 'SOL',
  'matic-network': 'MATIC',
}

export const STOCK_SYMBOLS = ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'META'] as const

export type CryptoQuote = {
  id: string
  symbol: string
  price: number
  change24h: number
}

export type StockQuote = {
  symbol: string
  price: number
  change: number
  changePercent: number
}

export type MarketData = {
  crypto: CryptoQuote[]
  stocks: StockQuote[]
  timestamp: number
}

// Module-level cache as fallback
let lastMarketData: MarketData | null = null

export function getCachedMarketData() { return lastMarketData }
export function setCachedMarketData(data: MarketData) { lastMarketData = data }
