import { crossSellFor } from '@bizlegal/nurture-enqueue/cross-sell'

export default function PassportSuccessPage() {
  return (
    <div className="max-w-lg mx-auto px-6 py-24">
      <div className="text-center">
        <div className="text-5xl mb-6">&#10003;</div>
        <h1 className="text-2xl font-bold text-white mb-3">Payment Confirmed</h1>
        <p className="text-forge-muted mb-6">
          Your Regulatory Passport is being generated. You will receive it by email
          within 24 hours.
        </p>
        <div className="card text-left space-y-3 text-sm text-forge-muted">
          <p className="font-semibold text-forge-text">What happens next:</p>
          <ol className="list-decimal list-inside space-y-2">
            <li>Forge analyzes your company profile against each target jurisdiction&apos;s regulatory requirements.</li>
            <li>A practitioner reviewer verifies sources and flags any uncertainty before release.</li>
            <li>Your full Regulatory Passport is delivered to the email you provided.</li>
          </ol>
        </div>

        {/* ─── Cross-sell: CTA-2024 BOI Tracker ──────────────────────── */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(91,33,182,0.12) 0%, rgba(236,72,153,0.08) 100%)',
            border: '1px solid rgba(91,33,182,0.4)',
            borderRadius: 16,
            padding: '24px 22px',
            marginTop: 32,
            textAlign: 'left',
          }}
        >
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: 11,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#c4b5fd',
              marginBottom: 10,
            }}
          >
            ⚡ Forming a US entity? Don&apos;t miss the BOI deadlines
          </div>
          <h2 className="text-lg font-medium mb-2" style={{ color: '#f1f5f9' }}>
            CTA-2024 BOI Tracker — $29/mo
          </h2>
          <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.6, marginBottom: 14 }}>
            Daily FinCEN monitoring + 30-day refile alerts. Penalty for missed filings is up to
            $500/day capped at $10K. We email you before that bites.
          </p>
          <a
            href="https://bizlegal-ai.com/agents/boi-tracker"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              padding: '10px 20px',
              background: '#5b21b6',
              color: '#fff',
              borderRadius: 8,
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            Add BOI Tracker → $29/mo
          </a>
        </div>

        {/* ─── Fleet cross-sell ─────────────────────────────────────── */}
        <div className="mt-8 text-left">
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: 11,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#94a3b8',
              marginBottom: 12,
              textAlign: 'center',
            }}
          >
            Also from the fleet
          </div>
          <div className="grid gap-3">
            {crossSellFor('forge_passport').map((offer) => (
              <a
                key={offer.url}
                href={offer.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card block"
                style={{ textDecoration: 'none', padding: '16px 18px' }}
              >
                <div className="text-sm font-medium mb-1" style={{ color: '#f1f5f9' }}>
                  {offer.headline}
                </div>
                <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.55, marginBottom: 8 }}>
                  {offer.blurb}
                </p>
                <div className="text-xs font-mono" style={{ color: '#c4b5fd' }}>
                  {offer.product} · {offer.price} &rarr;
                </div>
              </a>
            ))}
          </div>
        </div>

        <p className="text-xs text-forge-muted mt-8">
          Decision-support service. Not legal advice. For legal advice, consult a licensed attorney.
        </p>
      </div>
    </div>
  )
}
