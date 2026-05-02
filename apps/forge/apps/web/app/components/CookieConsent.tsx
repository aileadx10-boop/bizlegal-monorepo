'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) setVisible(true)
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    setVisible(false)
  }

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10000,
        background: '#0f172a',
        borderTop: '1px solid #1e293b',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        flexWrap: 'wrap',
        fontFamily: 'Inter, sans-serif',
        fontSize: '13px',
        color: '#94a3b8',
      }}
    >
      <span>
        We use cookies to improve your experience. By continuing, you agree to our{' '}
        <Link href="/privacy" style={{ color: '#4ade80', textDecoration: 'underline' }}>
          cookie policy
        </Link>.
      </span>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={handleAccept}
          style={{
            padding: '8px 20px',
            background: '#4ade80',
            color: '#0f172a',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Accept
        </button>
        <button
          onClick={handleDecline}
          style={{
            padding: '8px 20px',
            background: 'transparent',
            color: '#64748b',
            border: '1px solid #1e293b',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Decline
        </button>
      </div>
    </div>
  )
}
