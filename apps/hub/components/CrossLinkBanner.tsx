// /components/CrossLinkBanner.tsx
// A pinned banner that goes at the top of every subdomain page.
// Drives traffic to the AIA retainer landing on hub.
import Link from 'next/link'

export function CrossLinkBanner({
  from,
  message,
  cta,
}: {
  from: string
  message?: string
  cta?: string
}) {
  const default_msg = `${from} is part of BizLegal. Need 24/7 compliance ops? £2,500/mo, managed.`
  const default_cta = 'See the offer →'
  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 9999,
      background: 'linear-gradient(90deg, #0ea5e9 0%, #8b5cf6 100%)',
      color: 'white',
      padding: '8px 16px',
      fontSize: 14,
      textAlign: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
    }}>
      <span style={{ marginRight: 12 }}>{message ?? default_msg}</span>
      <Link
        href="https://hub.bizlegal-ai.com/services/compliance-ops"
        style={{
          color: 'white',
          fontWeight: 600,
          textDecoration: 'underline',
          textUnderlineOffset: 2,
        }}
      >
        {cta ?? default_cta}
      </Link>
    </div>
  )
}
