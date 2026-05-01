'use client'

import { useEffect, useState } from 'react'

interface ProbeResult {
  name: string
  source: string
  url: string
  status: number | null
  ok: boolean
  duration_ms: number
  error?: string
}

interface HmacSelfTest {
  attempted: boolean
  ok: boolean
  status: number | null
  reason?: string
  error?: string
}

interface EnvRow {
  name: string
  set: boolean
  critical: boolean
  reason: string
}

interface SubdomainEnvSnapshot {
  name: string
  reachable: boolean
  status: number | null
  error?: string
  envs: EnvRow[]
  critical_missing: string[]
}

interface HealthResponse {
  generated_at: string
  probes: ProbeResult[]
  hmac: HmacSelfTest
  envs: EnvRow[]
  subdomain_envs?: SubdomainEnvSnapshot[]
  summary: {
    subdomains_total: number
    subdomains_reachable: number
    subdomains_down: number
    envs_total: number
    critical_missing: string[]
    subdomain_envs_total?: number
    subdomain_envs_reachable?: number
    subdomain_critical_missing?: string[]
    chain_healthy: boolean
  }
}

const REFRESH_MS = 30_000

const cardStyle: React.CSSProperties = {
  background: 'var(--bl-surface)',
  border: '1px solid var(--bl-border)',
  borderRadius: 'var(--bl-radius-lg)',
  padding: 18,
}

const monoStyle: React.CSSProperties = {
  fontFamily: 'var(--bl-font-mono)',
  fontSize: 12,
}

export function OpsHealthClient({ cronSecretConfigured }: { cronSecretConfigured: boolean }) {
  const [data, setData] = useState<HealthResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [token, setToken] = useState<string>('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    setToken(params.get('t') ?? params.get('token') ?? '')
  }, [])

  useEffect(() => {
    if (!token) return
    let cancelled = false
    const fetchHealth = async () => {
      try {
        setError(null)
        const res = await fetch(`/api/ops/health?token=${encodeURIComponent(token)}`, {
          cache: 'no-store',
        })
        if (!res.ok) {
          if (!cancelled) setError(res.status === 404 ? 'token rejected' : `HTTP ${res.status}`)
          return
        }
        const json = (await res.json()) as HealthResponse
        if (!cancelled) setData(json)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'network error')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void fetchHealth()
    const id = setInterval(() => void fetchHealth(), REFRESH_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [token])

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', padding: 32, background: 'var(--bl-bg)', color: 'var(--bl-text)' }}>
        <div style={monoStyle}>Loading health…</div>
      </main>
    )
  }
  if (error || !data) {
    return (
      <main style={{ minHeight: '100vh', padding: 32, background: 'var(--bl-bg)', color: 'var(--bl-danger)' }}>
        <div style={monoStyle}>Failed: {error}</div>
      </main>
    )
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '32px clamp(16px, 4vw, 48px)',
        background: 'var(--bl-bg)',
        color: 'var(--bl-text)',
        fontFamily: 'var(--bl-font-sans)',
      }}
    >
      <header style={{ marginBottom: 24 }}>
        <div
          style={{
            ...monoStyle,
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--bl-accent)',
            marginBottom: 6,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: data.summary.chain_healthy ? 'var(--bl-success)' : 'var(--bl-warning)',
            }}
          />
          Ops Health · BizLegal AI
        </div>
        <h1
          style={{
            fontFamily: 'var(--bl-font-display)',
            fontSize: 'clamp(1.5rem, 1.25rem + 1vw, 2rem)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            margin: 0,
          }}
        >
          {data.summary.chain_healthy
            ? 'Chain healthy — every link green.'
            : 'Chain incomplete — see red rows below.'}
        </h1>
        <div style={{ ...monoStyle, color: 'var(--bl-text-subtle)', marginTop: 8 }}>
          {data.summary.subdomains_reachable}/{data.summary.subdomains_total} subdomains up ·{' '}
          {data.envs.filter((e) => e.set).length}/{data.envs.length} envs configured ·{' '}
          {data.summary.critical_missing.length === 0
            ? 'no critical gaps'
            : `${data.summary.critical_missing.length} critical missing`}
        </div>
      </header>

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))' }}>
        <section style={cardStyle}>
          <h3
            style={{
              fontFamily: 'var(--bl-font-display)',
              fontSize: '1rem',
              fontWeight: 700,
              margin: '0 0 12px',
            }}
          >
            Subdomain reachability
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {data.probes.map((p) => (
              <li
                key={p.name}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 0',
                  borderBottom: '1px solid var(--bl-divider)',
                  ...monoStyle,
                }}
              >
                <span>
                  <span
                    style={{
                      display: 'inline-block',
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: p.ok ? 'var(--bl-success)' : 'var(--bl-danger)',
                      marginRight: 8,
                    }}
                  />
                  <strong style={{ color: 'var(--bl-text)' }}>{p.name}</strong>
                </span>
                <span style={{ color: p.ok ? 'var(--bl-text-muted)' : 'var(--bl-danger)' }}>
                  {p.status === null ? p.error ?? 'unreachable' : `${p.status} · ${p.duration_ms}ms`}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section style={cardStyle}>
          <h3
            style={{
              fontFamily: 'var(--bl-font-display)',
              fontSize: '1rem',
              fontWeight: 700,
              margin: '0 0 12px',
            }}
          >
            HMAC chain self-test
          </h3>
          <div
            style={{
              padding: 12,
              background: data.hmac.ok
                ? 'color-mix(in oklab, var(--bl-success) 8%, transparent)'
                : 'color-mix(in oklab, var(--bl-warning) 8%, transparent)',
              border: `1px solid ${data.hmac.ok ? 'color-mix(in oklab, var(--bl-success) 30%, transparent)' : 'color-mix(in oklab, var(--bl-warning) 30%, transparent)'}`,
              borderRadius: 'var(--bl-radius-md)',
              ...monoStyle,
            }}
          >
            <div style={{ fontWeight: 700, color: data.hmac.ok ? 'var(--bl-success)' : 'var(--bl-warning)' }}>
              {data.hmac.attempted ? (data.hmac.ok ? '✓ self-loop OK' : '⚠ chain broken') : '⚠ secret unset'}
            </div>
            <div style={{ marginTop: 4, color: 'var(--bl-text-muted)' }}>
              {data.hmac.reason ?? data.hmac.error ?? 'no detail'}
            </div>
            {data.hmac.status !== null && (
              <div style={{ marginTop: 4, color: 'var(--bl-text-subtle)' }}>
                hub /api/ops/log → status {data.hmac.status}
              </div>
            )}
          </div>
          <div style={{ marginTop: 12, ...monoStyle, color: 'var(--bl-text-subtle)' }}>
            Cron secret on hub:{' '}
            <strong style={{ color: cronSecretConfigured ? 'var(--bl-success)' : 'var(--bl-danger)' }}>
              {cronSecretConfigured ? 'set' : 'missing'}
            </strong>
          </div>
        </section>

        <section style={{ ...cardStyle, gridColumn: '1 / -1' }}>
          <h3
            style={{
              fontFamily: 'var(--bl-font-display)',
              fontSize: '1rem',
              fontWeight: 700,
              margin: '0 0 12px',
            }}
          >
            Hub env audit
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 10,
            }}
          >
            {data.envs.map((e) => (
              <div
                key={e.name}
                style={{
                  padding: 10,
                  background:
                    e.set
                      ? 'color-mix(in oklab, var(--bl-success) 5%, transparent)'
                      : e.critical
                        ? 'color-mix(in oklab, var(--bl-danger) 8%, transparent)'
                        : 'color-mix(in oklab, var(--bl-text) 4%, transparent)',
                  border: `1px solid ${e.set ? 'color-mix(in oklab, var(--bl-success) 25%, transparent)' : e.critical ? 'color-mix(in oklab, var(--bl-danger) 30%, transparent)' : 'var(--bl-divider)'}`,
                  borderRadius: 'var(--bl-radius-md)',
                  ...monoStyle,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: 700,
                    color: e.set ? 'var(--bl-text)' : e.critical ? 'var(--bl-danger)' : 'var(--bl-text-muted)',
                  }}
                >
                  <span>{e.name}</span>
                  <span>{e.set ? '✓' : e.critical ? '✗' : '·'}</span>
                </div>
                <div style={{ marginTop: 4, fontSize: 11, color: 'var(--bl-text-subtle)' }}>{e.reason}</div>
              </div>
            ))}
          </div>
        </section>

        {data.subdomain_envs && data.subdomain_envs.length > 0 && (
          <section style={{ ...cardStyle, gridColumn: '1 / -1' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                gap: 12,
                marginBottom: 12,
                flexWrap: 'wrap',
              }}
            >
              <h3
                style={{
                  fontFamily: 'var(--bl-font-display)',
                  fontSize: '1rem',
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                Fleet env matrix · {data.summary.subdomain_envs_reachable ?? 0}/{data.subdomain_envs.length} subdomains reporting
              </h3>
              {(data.summary.subdomain_critical_missing ?? []).length > 0 && (
                <span
                  style={{
                    ...monoStyle,
                    fontSize: 11,
                    color: 'var(--bl-danger)',
                    fontWeight: 700,
                  }}
                >
                  {(data.summary.subdomain_critical_missing ?? []).length} subdomain critical gap
                  {(data.summary.subdomain_critical_missing ?? []).length === 1 ? '' : 's'}
                </span>
              )}
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 12,
              }}
            >
              {data.subdomain_envs.map((s) => (
                <div
                  key={s.name}
                  style={{
                    padding: 12,
                    background:
                      !s.reachable
                        ? 'color-mix(in oklab, var(--bl-text) 4%, transparent)'
                        : s.critical_missing.length > 0
                          ? 'color-mix(in oklab, var(--bl-danger) 6%, transparent)'
                          : 'color-mix(in oklab, var(--bl-success) 5%, transparent)',
                    border: `1px solid ${
                      !s.reachable
                        ? 'var(--bl-divider)'
                        : s.critical_missing.length > 0
                          ? 'color-mix(in oklab, var(--bl-danger) 30%, transparent)'
                          : 'color-mix(in oklab, var(--bl-success) 25%, transparent)'
                    }`,
                    borderRadius: 'var(--bl-radius-md)',
                    ...monoStyle,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 8,
                    }}
                  >
                    <strong
                      style={{
                        fontSize: 13,
                        color: 'var(--bl-text)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                      }}
                    >
                      {s.name}
                    </strong>
                    <span
                      style={{
                        fontSize: 10,
                        color: !s.reachable
                          ? 'var(--bl-text-subtle)'
                          : s.critical_missing.length > 0
                            ? 'var(--bl-danger)'
                            : 'var(--bl-success)',
                      }}
                    >
                      {!s.reachable
                        ? `unreachable${s.error ? ` (${s.error})` : ''}`
                        : s.critical_missing.length > 0
                          ? `${s.critical_missing.length} critical missing`
                          : 'all critical set'}
                    </span>
                  </div>
                  {s.reachable && s.envs.length > 0 ? (
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                      {s.envs.map((e) => (
                        <li
                          key={e.name}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '2px 0',
                            fontSize: 11,
                            color: e.set ? 'var(--bl-text-muted)' : e.critical ? 'var(--bl-danger)' : 'var(--bl-text-subtle)',
                          }}
                        >
                          <span>{e.name}</span>
                          <span>{e.set ? '✓' : e.critical ? '✗' : '·'}</span>
                        </li>
                      ))}
                    </ul>
                  ) : !s.reachable ? (
                    <div style={{ fontSize: 11, color: 'var(--bl-text-subtle)' }}>
                      Probe failed — likely Phase P alias not yet set, or this subdomain doesn&apos;t expose /api/ops/health yet.
                    </div>
                  ) : (
                    <div style={{ fontSize: 11, color: 'var(--bl-text-subtle)' }}>
                      No env list returned.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <footer style={{ marginTop: 32, ...monoStyle, color: 'var(--bl-text-subtle)' }}>
        Generated {new Date(data.generated_at).toLocaleTimeString()} · auto-refresh 30s ·{' '}
        <a href={`/ops?t=${encodeURIComponent(token)}`} style={{ color: 'var(--bl-accent)', textDecoration: 'none' }}>
          ← back to live ops
        </a>
      </footer>
    </main>
  )
}
