'use client'
import { useEffect, useState, useRef } from 'react'

interface MarketItem {
  symbol: string
  name: string
  price: number
  change: number
  type: 'crypto' | 'stock'
}

function fmt(price: number, type: 'crypto' | 'stock'): string {
  if (price >= 10000) return '$' + price.toLocaleString('en-US', { maximumFractionDigits: 0 })
  if (price >= 100) return '$' + price.toLocaleString('en-US', { maximumFractionDigits: 2 })
  if (price >= 1) return '$' + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return '$' + price.toFixed(4)
}

const COINGECKO_IDS: Record<string, string> = {
  BTC: 'bitcoin', ETH: 'ethereum', SOL: 'solana', BNB: 'binancecoin',
  XRP: 'ripple', ADA: 'cardano', AVAX: 'avalanche-2', DOT: 'polkadot',
  LINK: 'chainlink', MATIC: 'matic-network',
}

const COINBASE_NAMES: Record<string, string> = {
  BTC: 'bitcoin', ETH: 'ethereum', SOL: 'solana', BNB: 'bnb',
  XRP: 'xrp', ADA: 'cardano', AVAX: 'avalanche', DOT: 'polkadot',
}

function TickerItem({ item }: { item: MarketItem }) {
  const pos = item.change >= 0
  const cgId = COINGECKO_IDS[item.symbol]
  const cbName = COINBASE_NAMES[item.symbol]
  const inner = (
    <span className="ticker-item">
      <span className="ticker-type">{item.type === 'crypto' ? '◆' : '▲'}</span>
      <span className="ticker-sym">{item.symbol}</span>
      <span className="ticker-price">{fmt(item.price, item.type)}</span>
      <span className={pos ? 'ticker-up' : 'ticker-dn'}>
        {pos ? '▲' : '▼'} {Math.abs(item.change).toFixed(2)}%
      </span>
      {item.type === 'crypto' && cbName && (
        <a
          href={`https://www.coinbase.com/price/${cbName}`}
          target="_blank"
          rel="noopener noreferrer"
          className="ticker-buy"
          onClick={e => e.stopPropagation()}
        >
          Buy
        </a>
      )}
    </span>
  )
  if (item.type === 'crypto' && cgId) {
    return (
      <a
        href={`https://www.coingecko.com/en/coins/${cgId}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: 'none', color: 'inherit' }}
        title={`View ${item.name} on CoinGecko`}
      >
        {inner}
      </a>
    )
  }
  return inner
}

export default function MarketTicker() {
  const [data, setData] = useState<{ crypto: MarketItem[]; stocks: MarketItem[] } | null>(null)
  const [error, setError] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  async function load() {
    try {
      const res = await fetch('/api/markets')
      if (!res.ok) throw new Error('Failed')
      const json = await res.json()
      setData(json)
      setError(false)
    } catch {
      setError(true)
    }
  }

  useEffect(() => {
    load()
    intervalRef.current = setInterval(load, 60_000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  const items = data ? [...(data.stocks ?? []), ...(data.crypto ?? [])] : []

  if (error && !data) return null

  return (
    <div className="market-ticker" aria-label="Live market prices">
      <span className="ticker-label">
        <span className="ticker-live-dot" />
        LIVE
      </span>
      <div className="ticker-track-wrap">
        <div className="ticker-track">
          {[...items, ...items].map((item, i) => (
            <TickerItem key={`${item.symbol}-${i}`} item={item} />
          ))}
        </div>
      </div>
      <span className="ticker-delay">15m delay</span>
    </div>
  )
}
