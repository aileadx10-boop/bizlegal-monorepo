'use client'
import { useEffect, useRef } from 'react'

type Props = { score: number; severity: 'LOW' | 'MODERATE' | 'CRITICAL'; animate?: boolean }

export default function ScoreGauge({ score, severity, animate = true }: Props) {
  const needleRef = useRef<SVGLineElement>(null)

  const color = severity === 'CRITICAL' ? '#f87171' : severity === 'MODERATE' ? '#e9c349' : '#10B981'

  // Needle: 0 score = -90deg, 100 score = +90deg
  const angle = -90 + (score / 100) * 180

  useEffect(() => {
    if (!animate || !needleRef.current) return
    needleRef.current.style.transform = 'rotate(-90deg)'
    needleRef.current.style.transition = 'none'
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (needleRef.current) {
          needleRef.current.style.transition = 'transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
          needleRef.current.style.transform = `rotate(${angle}deg)`
        }
      }, 100)
    })
  }, [angle, animate])

  return (
    <div style={{ textAlign: 'center' }}>
      <svg viewBox="0 0 200 120" width="200" height="120" xmlns="http://www.w3.org/2000/svg">
        {/* Background arc */}
        <path d="M 20 100 A 80 80 0 0 1 180 100" stroke="var(--outline-var)" strokeWidth="12" fill="none" strokeLinecap="square" />
        {/* Green zone */}
        <path d="M 20 100 A 80 80 0 0 1 80 24" stroke="#10B981" strokeWidth="12" fill="none" strokeLinecap="square" opacity="0.7" />
        {/* Amber zone */}
        <path d="M 80 24 A 80 80 0 0 1 140 24" stroke="#e9c349" strokeWidth="12" fill="none" strokeLinecap="square" opacity="0.7" />
        {/* Red zone */}
        <path d="M 140 24 A 80 80 0 0 1 180 100" stroke="#f87171" strokeWidth="12" fill="none" strokeLinecap="square" opacity="0.7" />

        {/* Needle */}
        <g transform="translate(100, 100)">
          <line
            ref={needleRef}
            x1="0" y1="0" x2="0" y2="-72"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="square"
            style={{ transformOrigin: '0 0', transform: `rotate(${animate ? -90 : angle}deg)` }}
          />
          <circle cx="0" cy="0" r="5" fill={color} />
        </g>

        {/* Score */}
        <text x="100" y="92" textAnchor="middle" fill={color} fontFamily="Newsreader, serif" fontSize="20" fontWeight="700">{score}</text>
      </svg>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color, marginTop: 4 }}>{severity} Risk</div>
    </div>
  )
}
