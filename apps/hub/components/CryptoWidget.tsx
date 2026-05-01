'use client'
import { useEffect, useState } from 'react'

interface CoinData {
  id: string
  symbol: string
  name: string
  price: number
  change24h: number
  marketCap: number
  volume24h: number
  coingeckoUrl: string
  coinbaseUrl: string | null
}

interface WidgetData {
  coins: CoinData[]
  fearGreedValue: number
  fearGreedLabel: string
  updatedAt: number
}

const COINBASE_IDS: Record<string, string> = {
  BTC: 'BTC', ETH: 'ETH', SOL: 'SOL', BNB: 'BNB',
  XRP: 'XRP', ADA: 'ADA', AVAX: 'AVAX', DOT: 'DOT',
  LINK: 'LINK', MATIC: 'MATIC',
}

function fmt(n: number): string {
  if (n >= 1e12) return '$' + (n / 1e12).toFixed(2) + 'T'
  if (n >= 1e9)  return '$' + (n / 1e9).toFixed(1) + 'B'
  if (n >= 1e6)  return '$' + (n / 1e6).toFixed(1) + 'M'
  if (n >= 10000) return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 })
  if (n >= 1)    return '$' + n.toFixed(2)
  return '$' + n.toFixed(4)
}

function FearGreedGauge({ value, label }: { value: number; label: string }) {
  const color = value >= 75 ? '#22c55e' : value >= 55 ? '#84cc16' : value >= 45 ? '#f59e0b' : value >= 25 ? '#ef4444' : '#dc2626'
  const angle = (value / 100) * 180 - 90

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', width: 120, height: 66, margin: '0 auto' }}>
        <svg width="120" height="66" viewBox="0 0 120 66">
          {/* Background arc */}
          <path d="M10 60 A50 50 0 0 1 110 60" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" strokeLinecap="round" />
          {/* Color zones */}
          <path d="M10 60 A50 50 0 0 1 37 18" fill="none" stroke="#dc2626" strokeWidth="8" strokeLinecap="butt" opacity="0.6" />
          <path d="M37 18 A50 50 0 0 1 60 10" fill="none" stroke="#ef4444" strokeWidth="8" strokeLinecap="butt" opacity="0.6" />
          <path d="M60 10 A50 50 0 0 1 83 18" fill="none" stroke="#f59e0b" strokeWidth="8" strokeLinecap="butt" opacity="0.6" />
          <path d="M83 18 A50 50 0 0 1 110 60" fill="none" stroke="#22c55e" strokeWidth="8" strokeLinecap="butt" opacity="0.6" />
          {/* Needle */}
          <line
            x1="60" y1="60"
            x2={60 + 38 * Math.cos(((angle - 90) * Math.PI) / 180)}
            y2={60 + 38 * Math.sin(((angle - 90) * Math.PI) / 180)}
            stroke={color} strokeWidth="2.5" strokeLinecap="round"
          />
          <circle cx="60" cy="60" r="4" fill={color} />
        </svg>
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color, fontFamily: 'Geist Mono, monospace', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3, letterSpacing: '0.05em' }}>{label.toUpperCase()}</div>
      <div style={{ fontSize: 10, color: 'var(--dim)', marginTop: 2 }}>Fear & Greed</div>
    </div>
  )
}

export default function CryptoWidget() {
  const [data, setData] = useState<WidgetData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'prices' | 'defi'>('prices')

  async function load() {
    try {
      const [pricesRes, fgRes] = await Promise.allSettled([
        fetch('/api/markets?extended=true'),
        fetch('https://api.alternative.me/fng/?limit=1'),
      ])

      let coins: CoinData[] = []
      if (pricesRes.status === 'fulfilled' && pricesRes.value.ok) {
        const json = await pricesRes.value.json()
        coins = (json.crypto || []).map((c: any) => ({
          id: c.id,
          symbol: c.symbol,
          name: c.name,
          price: c.price,
          change24h: c.change,
          marketCap: c.marketCap ?? 0,
          volume24h: c.volume24h ?? 0,
          coingeckoUrl: `https://www.coingecko.com/en/coins/${c.id || c.symbol.toLowerCase()}`,
          coinbaseUrl: COINBASE_IDS[c.symbol] ? `https://www.coinbase.com/price/${c.name.toLowerCase().replace(/\s+/g, '-')}` : null,
        }))
      }

      let fearGreedValue = 50
      let fearGreedLabel = 'Neutral'
      if (fgRes.status === 'fulfilled' && fgRes.value.ok) {
        const fg = await fgRes.value.json()
        fearGreedValue = parseInt(fg?.data?.[0]?.value ?? '50')
        fearGreedLabel = fg?.data?.[0]?.value_classification ?? 'Neutral'
      }

      setData({ coins, fearGreedValue, fearGreedLabel, updatedAt: Date.now() })
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const id = setInterval(load, 60_000)
    return () => clearInterval(id)
  }, [])

  if (loading) return (
    <div className="crypto-widget-skeleton">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="cwsk-row" />
      ))}
    </div>
  )

  if (!data) return null

  const topCoins = data.coins.slice(0, 8)

  return (
    <div className="crypto-widget">
      <div className="cw-header">
        <div className="cw-title-row">
          <div>
            <div className="cw-title">
              <span className="cw-live-dot" /> Live Crypto Markets
            </div>
            <div className="cw-subtitle">
              via <a href="https://www.coingecko.com" target="_blank" rel="noopener noreferrer" className="cw-source-link">CoinGecko</a>
              {' · '}
              <a href="https://www.coinbase.com" target="_blank" rel="noopener noreferrer" className="cw-source-link">Coinbase</a>
              {' · '}
              <span style={{ fontSize: 10, color: 'var(--dim)' }}>
                Updated {new Date(data.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
          <FearGreedGauge value={data.fearGreedValue} label={data.fearGreedLabel} />
        </div>

        <div className="cw-tabs">
          <button className={`cw-tab ${tab === 'prices' ? 'active' : ''}`} onClick={() => setTab('prices')}>Top Coins</button>
          <button className={`cw-tab ${tab === 'defi' ? 'active' : ''}`} onClick={() => setTab('defi')}>DeFi Links</button>
        </div>
      </div>

      {tab === 'prices' && (
        <div className="cw-table">
          <div className="cw-thead">
            <span className="cwh cwh-name">Asset</span>
            <span className="cwh cwh-price">Price</span>
            <span className="cwh cwh-change">24h</span>
            <span className="cwh cwh-cap">Mkt Cap</span>
            <span className="cwh cwh-links">Trade</span>
          </div>
          {topCoins.map((coin) => (
            <div key={coin.symbol} className="cw-row">
              <div className="cwc cwc-name">
                <a href={coin.coingeckoUrl} target="_blank" rel="noopener noreferrer" className="coin-link">
                  <span className="coin-sym">{coin.symbol}</span>
                  <span className="coin-name">{coin.name}</span>
                </a>
              </div>
              <div className="cwc cwc-price">{fmt(coin.price)}</div>
              <div className={`cwc cwc-change ${coin.change24h >= 0 ? 'pos' : 'neg'}`}>
                {coin.change24h >= 0 ? '▲' : '▼'} {Math.abs(coin.change24h).toFixed(2)}%
              </div>
              <div className="cwc cwc-cap">{coin.marketCap > 0 ? fmt(coin.marketCap) : '—'}</div>
              <div className="cwc cwc-links">
                <a href={coin.coingeckoUrl} target="_blank" rel="noopener noreferrer" className="cw-btn cw-btn-cg" title="View on CoinGecko">
                  CG
                </a>
                {coin.coinbaseUrl && (
                  <a href={coin.coinbaseUrl} target="_blank" rel="noopener noreferrer" className="cw-btn cw-btn-cb" title="Buy on Coinbase">
                    Buy
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'defi' && (
        <div className="cw-defi">
          <div className="cw-defi-grid">
            {[
              { name: 'CoinGecko', desc: 'Live prices, charts & data for 10,000+ coins', href: 'https://www.coingecko.com', color: '#22c55e', icon: '📊' },
              { name: 'Coinbase', desc: 'Buy, sell and trade 200+ cryptocurrencies', href: 'https://www.coinbase.com', color: '#0052FF', icon: '🏦' },
              { name: 'CoinMarketCap', desc: 'Crypto market cap rankings and analytics', href: 'https://coinmarketcap.com', color: '#f59e0b', icon: '📈' },
              { name: 'DeFi Llama', desc: 'DeFi TVL, protocols and yield tracking', href: 'https://defillama.com', color: '#7dd3fc', icon: '🦙' },
              { name: 'Etherscan', desc: 'Ethereum blockchain explorer & analytics', href: 'https://etherscan.io', color: '#a5b4fc', icon: '🔍' },
              { name: 'Uniswap', desc: 'Decentralized exchange — swap any ERC-20', href: 'https://app.uniswap.org', color: '#f1006e', icon: '⚡' },
              { name: 'OpenSea', desc: 'World\'s largest NFT marketplace', href: 'https://opensea.io', color: '#2081e2', icon: '🌊' },
              { name: 'Dune Analytics', desc: 'On-chain data dashboards and queries', href: 'https://dune.com', color: '#e84142', icon: '📉' },
            ].map(link => (
              <a key={link.name} href={link.href} target="_blank" rel="noopener noreferrer" className="defi-link-card">
                <div className="dlc-icon">{link.icon}</div>
                <div>
                  <div className="dlc-name" style={{ color: link.color }}>{link.name}</div>
                  <div className="dlc-desc">{link.desc}</div>
                </div>
              </a>
            ))}
          </div>

          {/* Compliance CTA */}
          <div className="defi-compliance-cta">
            <span style={{ fontSize: 13 }}>🛡️</span>
            <span style={{ fontSize: 13, color: 'var(--text)' }}>
              Using DeFi? <strong style={{ color: '#fff' }}>Check your regulatory exposure</strong> with our free compliance scan
            </span>
            <a href="https://brai.bizlegal-ai.com" className="btn-primary" style={{ fontSize: 11, padding: '6px 14px' }}>
              Free Scan →
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
