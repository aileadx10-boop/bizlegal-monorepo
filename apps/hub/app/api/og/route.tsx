import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get('title') || 'BizLegal AI'
  const tag = searchParams.get('tag') || 'COMPLIANCE INTELLIGENCE'
  const score = searchParams.get('score')
  const severity = searchParams.get('severity')

  const severityColor = severity === 'CRITICAL' ? '#f87171' : severity === 'MODERATE' ? '#e9c349' : '#10B981'

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: '#0e1322',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 80px',
          fontFamily: 'Georgia, serif',
          borderLeft: '8px solid #2563eb',
        }}
      >
        {/* Tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.18em', color: '#e9c349', textTransform: 'uppercase', fontFamily: 'sans-serif' }}>
            {tag}
          </span>
        </div>

        {/* Title */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <h1 style={{ fontSize: Math.min(64, Math.max(40, Math.floor(1800 / title.length))), fontWeight: 700, color: '#dee1f7', lineHeight: 1.1, margin: 0 }}>
            {title}
          </h1>
        </div>

        {/* Bottom row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 24, fontWeight: 700, color: '#dee1f7' }}>BizLegal</span>
            <span style={{ width: 8, height: 8, background: '#e9c349', display: 'inline-block' }} />
            <span style={{ fontSize: 24, fontWeight: 700, color: '#dee1f7' }}>AI</span>
          </div>
          {score && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 64, fontWeight: 700, color: severityColor, lineHeight: 1 }}>{score}</div>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.18em', color: severityColor, textTransform: 'uppercase', fontFamily: 'sans-serif' }}>
                {severity || 'Risk Score'}
              </div>
            </div>
          )}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
