'use client'

interface Step {
  title: string
  description: string
}

interface StepProcessBarProps {
  steps: Step[]
  activeStep?: number
  className?: string
}

export function StepProcessBar({ steps, activeStep, className = '' }: StepProcessBarProps) {
  const current = activeStep ?? steps.length

  return (
    <div className={className} style={{ display: 'flex', alignItems: 'flex-start', gap: 0 }}>
      {steps.map((step, i) => {
        const isActive = i < current
        const isCurrent = i === current - 1

        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            {/* Connector line (except last) */}
            {i < steps.length - 1 && (
              <div
                style={{
                  position: 'absolute',
                  top: 18,
                  left: '50%',
                  width: '100%',
                  height: 2,
                  background: isActive && i + 1 < current
                    ? 'var(--gold)'
                    : 'rgba(255,255,255,0.06)',
                  zIndex: 0,
                }}
              />
            )}

            {/* Step circle */}
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                fontWeight: 600,
                zIndex: 1,
                position: 'relative',
                border: isCurrent
                  ? '2px solid var(--gold)'
                  : isActive
                    ? '2px solid var(--accent)'
                    : '2px solid rgba(255,255,255,0.1)',
                background: isCurrent
                  ? 'rgba(212,168,83,0.1)'
                  : isActive
                    ? 'rgba(0,255,148,0.08)'
                    : 'var(--bg-low)',
                color: isCurrent ? 'var(--gold)' : isActive ? 'var(--accent)' : 'var(--muted)',
                transition: 'all 0.3s ease',
              }}
            >
              {i + 1}
            </div>

            {/* Step content */}
            <div style={{ textAlign: 'center', marginTop: 16, maxWidth: 200 }}>
              <h4
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 17,
                  fontWeight: 400,
                  color: isCurrent ? 'var(--gold)' : isActive ? 'var(--white)' : 'var(--muted)',
                  marginBottom: 6,
                  transition: 'color 0.3s ease',
                }}
              >
                {step.title}
              </h4>
              <p
                style={{
                  fontSize: 13,
                  color: 'var(--muted)',
                  lineHeight: 1.6,
                }}
              >
                {step.description}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}