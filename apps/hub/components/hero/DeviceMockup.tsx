'use client'

/**
 * DeviceMockup — 3D-perspective phone/tablet frame with a simplified risk dashboard
 * CSS-only transforms for performance, no Three.js dependency
 */
export default function DeviceMockup() {
  return (
    <div className="device-mockup" style={{ animation: 'float 6s ease-in-out infinite' }}>
      <div
        className="device-mockup-inner"
        style={{
          width: 260,
          borderRadius: 20,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Phone frame */}
        <div
          className="device-screen"
          style={{
            padding: '20px 16px 16px',
            minHeight: 440,
            position: 'relative',
          }}
        >
          {/* Status bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: '0.1em' }}>
              09:41
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--accent)' }} />
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--muted)' }} />
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--muted)' }} />
            </div>
          </div>

          {/* App header */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--primary)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>
              Risk Dashboard
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--white)', letterSpacing: '-0.01em' }}>
              Compliance Score
            </div>
          </div>

          {/* Score ring */}
          <div style={{ display: 'flex', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="var(--outline-var)" strokeWidth="6" />
              <circle
                cx="60" cy="60" r="50" fill="none"
                stroke="var(--accent)" strokeWidth="6"
                strokeDasharray={`${2 * Math.PI * 50 * 0.82} ${2 * Math.PI * 50}`}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
              >
                <animate attributeName="stroke-dasharray" from={`0 ${2 * Math.PI * 50}`} to={`${2 * Math.PI * 50 * 0.82} ${2 * Math.PI * 50}`} dur="2s" fill="freeze" />
              </circle>
              <text x="60" y="55" textAnchor="middle" fill="var(--white)" fontFamily="var(--font-display)" fontSize="28">82</text>
              <text x="60" y="72" textAnchor="middle" fill="var(--muted)" fontFamily="var(--font-mono)" fontSize="8" letterSpacing="0.1em">OUT OF 100</text>
            </svg>
          </div>

          {/* Risk metrics */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'Regulatory', value: 'Low', color: 'var(--accent)' },
              { label: 'Financial', value: 'Medium', color: 'var(--warning)' },
              { label: 'Enforcement', value: 'Active', color: 'var(--danger)' },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 10px',
                  background: 'var(--bg-low)',
                  borderRadius: 8,
                  border: '0.5px solid var(--outline-var)',
                }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: '0.06em' }}>
                  {item.label}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: item.color, fontWeight: 700, letterSpacing: '0.06em' }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          {/* CTA button */}
          <div
            style={{
              marginTop: 16,
              textAlign: 'center',
              padding: '10px',
              background: 'linear-gradient(135deg, var(--primary) 0%, #818cf8 100%)',
              borderRadius: 8,
              fontFamily: 'var(--font-body)',
              fontSize: 12,
              fontWeight: 600,
              color: '#08080f',
            }}
          >
            Run Full Scan →
          </div>
        </div>
      </div>
    </div>
  )
}