'use client'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

type TickerItem = { symbol: string; price: number; change: number; changePercent: number }

function TickerItem({ item }: { item: TickerItem }) {
  const isPos = item.changePercent >= 0
  const color = isPos ? '#10B981' : '#f87171'
  const arrow = isPos ? '▲' : '▼'
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0 28px', borderRight: '0.5px solid var(--outline-var)', whiteSpace: 'nowrap' }}>
      <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 11, fontWeight: 700, color: 'var(--outline)' }}>{item.symbol}</span>
      <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 11, fontWeight: 600, color: 'var(--on-surface)' }}>
        ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
      <span style={{ fontSize: 10, fontWeight: 700, color }}>
        {arrow} {Math.abs(item.changePercent).toFixed(2)}%
      </span>
    </span>
  )
}

const SKELETON_ITEMS = Array.from({ length: 8 }, (_, i) => i)

export default function TickerBar() {
  const { data, isLoading } = useSWR('/api/market-data', fetcher, { refreshInterval: 60000 })

  const allItems: TickerItem[] = data
    ? [...(data.crypto || []).map((c: any) => ({ symbol: c.symbol, price: c.price, change: 0, changePercent: c.change24h })),
       ...(data.stocks || []).map((s: any) => ({ symbol: s.symbol, price: s.price, change: s.change, changePercent: s.changePercent }))]
    : []

  return (
    <div
      style={{
        position: 'fixed',
        top: 56,
        left: 0,
        right: 0,
        zIndex: 99,
        height: 36,
        background: 'var(--bg-low)',
        borderBottom: '0.5px solid var(--outline-var)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
      }}
      className="no-print ticker-bar"
    >
      {isLoading ? (
        <div style={{ display: 'flex', gap: 24, padding: '0 16px' }}>
          {SKELETON_ITEMS.map(i => (
            <div key={i} className="skeleton" style={{ width: 100, height: 12 }} />
          ))}
        </div>
      ) : allItems.length > 0 ? (
        <div className="ticker-track">
          {[...allItems, ...allItems].map((item, i) => (
            <TickerItem key={i} item={item} />
          ))}
        </div>
      ) : (
        <div style={{ padding: '0 24px', fontSize: 11, color: 'var(--outline)' }}>MARKET DATA UNAVAILABLE</div>
      )}
    </div>
  )
}
