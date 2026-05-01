import { NextResponse } from 'next/server'

export const revalidate = 0

interface CoinGeckoMarket {
  id: string
  symbol: string
  name: string
  current_price: number
  price_change_percentage_24h: number
  market_cap: number
  total_volume: number
}

interface MarketItem {
  id: string
  symbol: string
  name: string
  price: number
  change: number
  marketCap: number
  volume24h: number
  type: 'crypto' | 'stock'
}

async function getCrypto(extended = false): Promise<MarketItem[]> {
  // Top coins: BTC, ETH, SOL, BNB, XRP, ADA + extra for extended mode
  const ids = extended
    ? 'bitcoin,ethereum,solana,binancecoin,ripple,cardano,avalanche-2,polkadot,chainlink,matic-network'
    : 'bitcoin,ethereum,solana,binancecoin,ripple,cardano'

  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h`

  const res = await fetch(url, {
    next: { revalidate: 60 },
    headers: { 'Accept': 'application/json' },
  })

  if (!res.ok) {
    // Fallback to simple price API
    return getCryptoSimple(ids)
  }

  const data: CoinGeckoMarket[] = await res.json()

  return data.map(coin => ({
    id: coin.id,
    symbol: coin.symbol.toUpperCase(),
    name: coin.name,
    price: coin.current_price ?? 0,
    change: coin.price_change_percentage_24h ?? 0,
    marketCap: coin.market_cap ?? 0,
    volume24h: coin.total_volume ?? 0,
    type: 'crypto' as const,
  }))
}

async function getCryptoSimple(ids: string): Promise<MarketItem[]> {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`
  const res = await fetch(url, { next: { revalidate: 60 } })
  if (!res.ok) throw new Error('CoinGecko error')

  const data: Record<string, { usd: number; usd_24h_change: number; usd_market_cap: number; usd_24h_vol: number }> = await res.json()

  const map: Record<string, { symbol: string; name: string }> = {
    bitcoin:       { symbol: 'BTC',   name: 'Bitcoin' },
    ethereum:      { symbol: 'ETH',   name: 'Ethereum' },
    solana:        { symbol: 'SOL',   name: 'Solana' },
    binancecoin:   { symbol: 'BNB',   name: 'BNB' },
    ripple:        { symbol: 'XRP',   name: 'XRP' },
    cardano:       { symbol: 'ADA',   name: 'Cardano' },
    'avalanche-2': { symbol: 'AVAX',  name: 'Avalanche' },
    polkadot:      { symbol: 'DOT',   name: 'Polkadot' },
    chainlink:     { symbol: 'LINK',  name: 'Chainlink' },
    'matic-network': { symbol: 'MATIC', name: 'Polygon' },
  }

  return Object.entries(data).map(([id, v]) => ({
    id,
    symbol: map[id]?.symbol ?? id.toUpperCase(),
    name:   map[id]?.name ?? id,
    price:  v.usd ?? 0,
    change: v.usd_24h_change ?? 0,
    marketCap: v.usd_market_cap ?? 0,
    volume24h: v.usd_24h_vol ?? 0,
    type:   'crypto' as const,
  }))
}

async function getStock(ticker: string, name: string): Promise<MarketItem | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 60 },
    })
    if (!res.ok) return null
    const json = await res.json()
    const meta = json?.chart?.result?.[0]?.meta
    if (!meta) return null
    const price: number = meta.regularMarketPrice ?? 0
    const prev: number  = meta.chartPreviousClose ?? meta.previousClose ?? price
    const change = prev > 0 ? ((price - prev) / prev) * 100 : 0
    return { id: ticker, symbol: ticker, name, price, change, marketCap: 0, volume24h: 0, type: 'stock' }
  } catch {
    return null
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const extended = searchParams.get('extended') === 'true'

  try {
    const [crypto, sp500, nasdaq, apple, msft, tsla] = await Promise.allSettled([
      getCrypto(extended),
      getStock('SPY',  'S&P 500'),
      getStock('QQQ',  'Nasdaq'),
      getStock('AAPL', 'Apple'),
      getStock('MSFT', 'Microsoft'),
      getStock('TSLA', 'Tesla'),
    ])

    const stocks: MarketItem[] = [sp500, nasdaq, apple, msft, tsla]
      .filter(r => r.status === 'fulfilled' && r.value !== null)
      .map(r => (r as PromiseFulfilledResult<MarketItem>).value)

    const cryptoItems: MarketItem[] = crypto.status === 'fulfilled' ? crypto.value : []

    return NextResponse.json(
      { crypto: cryptoItems, stocks, updatedAt: Date.now() },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } }
    )
  } catch {
    return NextResponse.json({ crypto: [], stocks: [], updatedAt: Date.now() })
  }
}
