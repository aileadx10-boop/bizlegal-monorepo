'use client'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

const CRYPTO_SEEDS = {
  BTC: [42000, 43100, 41800, 44200, 43500, 45100, 44800],
  ETH: [2400, 2450, 2380, 2510, 2490, 2560, 2540],
  SOL: [95, 98, 92, 102, 99, 105, 103],
  MATIC: [0.82, 0.85, 0.79, 0.88, 0.86, 0.91, 0.89],
}

function Sparkline({ symbol, change24h }: { symbol: string; change24h: number }) {
  const seed = CRYPTO_SEEDS[symbol as keyof typeof CRYPTO_SEEDS] || [50, 52, 48, 54, 51, 56, 53]
  const min = Math.min(...seed)
  const max = Math.max(...seed)
  const range = max - min || 1
  const w = 80, h = 32
  const pts = seed.map((v, i) => {
    const x = (i / (seed.length - 1)) * w
    const y = h - ((v - min) / range) * h
    return `${x},${y}`
  }).join(' ')
  const color = change24h >= 0 ? '#10B981' : '#f87171'
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  )
}

const FALLBACK = [
  { id: 'bitcoin', symbol: 'BTC', price: 67420, change24h: 2.14 },
  { id: 'ethereum', symbol: 'ETH', price: 3521, change24h: -0.87 },
  { id: 'solana', symbol: 'SOL', price: 142.3, change24h: 4.21 },
  { id: 'matic-network', symbol: 'MATIC', price: 0.891, change24h: -1.33 },
]

export default function CryptoGrid() {
  const { data } = useSWR('/api/market-data', fetcher, { refreshInterval: 60000 })
  const cryptos = data?.crypto || FALLBACK

  return (
    <section style={{ padding: '0 32px 64px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <span className="section-label">Live Markets</span>
        <h2 style={{ marginBottom: 24 }}>Crypto Market Watch</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 1 }}>
          {cryptos.map((c: any) => {
            const isPos = c.change24h >= 0
            const isHighVol = Math.abs(c.change24h) > 4
            return (
              <div key={c.id || c.symbol} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--outline)', letterSpacing: '0.08em', marginBottom: 4 }}>{c.symbol}</div>
                    <div style={{ fontFamily: 'Newsreader, serif', fontSize: 24, fontWeight: 700, color: 'var(--on-surface)' }}>
                      ${c.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: c.price > 10 ? 2 : 4 })}
                    </div>
                  </div>
                  <Sparkline symbol={c.symbol} change24h={c.change24h} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '2px 8px',
                    background: isPos ? 'rgba(16,185,129,0.12)' : 'rgba(248,113,113,0.12)',
                    color: isPos ? '#10B981' : '#f87171',
                    border: `0.5px solid ${isPos ? 'rgba(16,185,129,0.3)' : 'rgba(248,113,113,0.3)'}`,
                  }}>
                    {isPos ? '▲' : '▼'} {Math.abs(c.change24h).toFixed(2)}%
                  </span>
                  {isHighVol && (
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: '#f87171', textTransform: 'uppercase' }}>
                      High Volatility
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
