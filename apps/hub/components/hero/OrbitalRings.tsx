'use client'

/**
 * OrbitalRings — 3D CSS concentric rings with glowing nodes
 * Quantum Agency aesthetic: rotateX(75deg) perspective tilt for dramatic depth
 */
export default function OrbitalRings() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden" aria-hidden>
      <div className="orbit-container" style={{ width: 600, height: 600, position: 'relative' }}>
        {/* 3D tilt plane */}
        <div className="orbit-plane" style={{ position: 'absolute', inset: 0 }}>

          {/* Outer ring — 20s clockwise */}
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '1.5px solid var(--orbital-ring)',
            animation: 'orbit-spin-1 20s linear infinite',
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: 'var(--primary)',
              boxShadow: '0 0 20px var(--primary), 0 0 40px rgba(165,180,252,0.4)',
              animation: 'ping-slow 3s ease-in-out infinite',
            }} />
            <div style={{
              position: 'absolute',
              bottom: '5%',
              right: '8%',
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--gold)',
              boxShadow: '0 0 16px var(--gold)',
              animation: 'ping-slow 4s ease-in-out infinite 1s',
            }} />
          </div>

          {/* Middle ring — 25s counter-clockwise */}
          <div style={{
            position: 'absolute',
            inset: '10%',
            borderRadius: '50%',
            border: '1px solid rgba(165,180,252,0.09)',
            animation: 'orbit-spin-2 25s linear infinite',
          }}>
            <div style={{
              position: 'absolute',
              top: '15%',
              left: '5%',
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--primary)',
              boxShadow: '0 0 16px var(--primary)',
              animation: 'ping-slow 3.5s ease-in-out infinite 0.5s',
            }} />
            <div style={{
              position: 'absolute',
              bottom: '20%',
              right: '3%',
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: 'var(--gold)',
              boxShadow: '0 0 12px var(--gold)',
              animation: 'ping-slow 2.8s ease-in-out infinite 1.2s',
            }} />
          </div>

          {/* Inner ring — 30s clockwise */}
          <div style={{
            position: 'absolute',
            inset: '20%',
            borderRadius: '50%',
            border: '0.5px solid rgba(165,180,252,0.15)',
            animation: 'orbit-spin-1 30s linear infinite',
          }}>
            <div style={{
              position: 'absolute',
              top: '8%',
              left: '45%',
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: 'var(--accent)',
              boxShadow: '0 0 16px var(--accent)',
              animation: 'ping-slow 2.5s ease-in-out infinite 0.3s',
            }} />
          </div>
        </div>

        {/* Central glow — stays flat, not inside the 3D plane */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 140,
          height: 140,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, rgba(212,168,83,0.06) 40%, transparent 70%)',
          filter: 'blur(24px)',
          zIndex: 5,
        }} />
      </div>
    </div>
  )
}