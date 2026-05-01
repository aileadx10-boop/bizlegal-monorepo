import { NextResponse } from 'next/server'
import { CRYPTO_IDS, CRYPTO_SYMBOLS, STOCK_SYMBOLS, type MarketData, getCachedMarketData, setCachedMarketData } from '@/lib/marketConfig'

export const revalidate = 60

async function fetchCrypto() {
  const ids = CRYPTO_IDS.join(',')
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
  const res = await fetch(url, { next: { revalidate: 60 } })
  if (!res.ok) throw new Error('CoinGecko failed')
  const data = await res.json()
  return CRYPTO_IDS.map(id => ({
    id,
    symbol: CRYPTO_SYMBOLS[id],
    price: data[id]?.usd ?? 0,
    change24h: data[id]?.usd_24h_change ?? 0,
  }))
}

async function fetchStocks() {
  const key = process.env.ALPHA_VANTAGE_API_KEY
  if (!key) return []
  const results = await Promise.allSettled(
    STOCK_SYMBOLS.map(async symbol => {
      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${key}`
      const res = await fetch(url, { next: { revalidate: 60 } })
      const json = await res.json()
      const q = json['Global Quote']
      return {
        symbol,
        price: parseFloat(q['05. price'] || '0'),
        change: parseFloat(q['09. change'] || '0'),
        changePercent: parseFloat((q['10. change percent'] || '0%').replace('%', '')),
      }
    })
  )
  return results
    .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
    .map(r => r.value)
    .filter(s => s.price > 0)
}

export async function GET() {
  try {
    const [crypto, stocks] = await Promise.allSettled([fetchCrypto(), fetchStocks()])
    const data: MarketData = {
      crypto: crypto.status === 'fulfilled' ? crypto.value : [],
      stocks: stocks.status === 'fulfilled' ? stocks.value : [],
      timestamp: Date.now(),
    }
    if (data.crypto.length > 0) setCachedMarketData(data)
    return NextResponse.json(data)
  } catch {
    const cached = getCachedMarketData()
    if (cached) return NextResponse.json(cached)
    return NextResponse.json({ crypto: [], stocks: [], timestamp: Date.now() })
  }
}
