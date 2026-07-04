/**
 * /deal/[token] — private deal room (custom-build ladder).
 *
 * Server component. Room data comes from GET /api/deal/[token], which owns
 * the 404 / 410 / first-view (viewed_at + Telegram, standing-order O3)
 * logic — this page only renders. The token stays in the URL and the API
 * call; it is never logged or sent to ops_events from here.
 *
 * Checkout:
 *   - "Pay by bank wire" — inline server action POSTs the exact
 *     /api/payments/wire/start body (product/tier/interval/amount_cents/
 *     email/currency) and redirects back with ?wire=sent.
 *   - "Pay by card / crypto" — links to /checkout with the matching
 *     @bizlegal/payment product id (custom_build_pilot / custom_build_build /
 *     custom_build_flagship).
 */
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Private Deal Room | BizLegal AI',
  robots: { index: false, follow: false },
}

interface DealRoom {
  email: string
  offer_tier: 'pilot' | 'build' | 'flagship'
  price_usd: number
  scope_md: string | null
  status: string
  expires_at: string
  created_at: string
}

const TIER_LABELS: Record<DealRoom['offer_tier'], string> = {
  pilot: 'Pilot',
  build: 'Build',
  flagship: 'Flagship',
}

const FAQ: ReadonlyArray<{ q: string; a: string }> = [
  {
    q: 'Why is there no call?',
    a: 'BizLegal AI runs fully async — scoping, delivery, and support all arrive in text. It keeps the price a fraction of agency rates and gives you a written record of everything. If a live call is a dealbreaker, no hard feelings.',
  },
  {
    q: 'The scope is close but not quite right — what do I do?',
    a: 'Reply to the email that delivered this link with what you would change. Moses reviews every deal room personally and sends back an adjusted scope before you pay a cent.',
  },
  {
    q: 'What happens after I pay?',
    a: 'You get a kickoff email within one business day with the delivery plan and the first working checkpoint. Pilots typically ship in about two weeks; larger builds are milestone-based.',
  },
  {
    q: 'Is this legal advice?',
    a: 'No. BizLegal AI is software and research operated by DOR INNOVATIONS — not a law firm. Deliverables are compliance intelligence and automation, not legal opinions.',
  },
]

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bizlegal-ai.com'
}

async function getRoom(token: string): Promise<{ status: number; room: DealRoom | null }> {
  try {
    const res = await fetch(`${siteUrl()}/api/deal/${token}`, { cache: 'no-store' })
    if (res.status === 404 || res.status === 400) return { status: 404, room: null }
    if (res.status === 410) return { status: 410, room: null }
    if (!res.ok) return { status: res.status, room: null }
    return { status: 200, room: (await res.json()) as DealRoom }
  } catch {
    return { status: 500, room: null }
  }
}

export default async function DealRoomPage({
  params,
  searchParams,
}: {
  params: { token: string }
  searchParams?: { wire?: string }
}) {
  const token = params.token
  const { status, room } = await getRoom(token)

  if (status === 404) notFound()

  if (status === 410 || !room) {
    return (
      <main style={{ maxWidth: 640, margin: '0 auto', padding: '4rem 1.5rem' }}>
        <div className="bl-label" style={{ marginBottom: '1rem' }}>
          — Private Deal Room
        </div>
        <h1
          style={{
            fontFamily: 'var(--bl-font-display)',
            fontSize: 'clamp(1.5rem, 1rem + 1.5vw, 2rem)',
            fontWeight: 800,
            color: 'var(--bl-text)',
            margin: '0 0 1rem',
          }}
        >
          {status === 410 ? 'This deal room has closed.' : 'This deal room is unavailable.'}
        </h1>
        <p style={{ color: 'var(--bl-text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          {status === 410
            ? 'Custom-build offers are held for 14 days so the scope and pricing stay honest. The good news: re-qualifying takes about five minutes.'
            : 'We could not load this room right now. Try again in a minute, or reach us directly.'}
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/#qualifier" className="bl-btn-primary">
            Restart the conversation
          </Link>
          <a href="mailto:team@bizlegal-ai.com?subject=Deal room reopening" className="bl-btn-ghost">
            Email us instead
          </a>
        </div>
      </main>
    )
  }

  const tierLabel = TIER_LABELS[room.offer_tier]
  const productId = `custom_build_${room.offer_tier}` // matches @bizlegal/payment products.ts SKUs
  const amountCents = room.price_usd * 100
  const priceLabel = `$${room.price_usd.toLocaleString('en-US')}`
  const expiresDate = new Date(room.expires_at)
  const daysLeft = Math.max(0, Math.ceil((expiresDate.getTime() - Date.now()) / 86_400_000))
  const expiresLabel = expiresDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const scopeBullets = (room.scope_md ?? '')
    .split('\n')
    .map((line) => line.replace(/^[-*]\s+/, '').trim())
    .filter(Boolean)
  const checkoutHref = `/checkout?product=${productId}&tier=${room.offer_tier}&interval=one-time&amount=${amountCents}&name=${encodeURIComponent(`Custom Build — ${tierLabel}`)}`
  const wireState = searchParams?.wire

  async function payByWire() {
    'use server'
    // redirect() throws internally, so keep it outside the try/catch.
    let ok = false
    try {
      const res = await fetch(`${siteUrl()}/api/payments/wire/start`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          product: productId,
          tier: room?.offer_tier,
          interval: 'one-time',
          amount_cents: amountCents,
          email: room?.email,
          currency: 'USD',
          source: 'deal_room',
        }),
        cache: 'no-store',
      })
      ok = res.ok
    } catch {
      ok = false
    }
    redirect(`/deal/${token}?wire=${ok ? 'sent' : 'error'}`)
  }

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: 'clamp(2rem, 4vw, 4rem) 1.5rem' }}>
      <div className="bl-label" style={{ marginBottom: '1rem' }}>
        — Private Deal Room · Prepared for {room.email}
      </div>
      <h1
        style={{
          fontFamily: 'var(--bl-font-display)',
          fontSize: 'clamp(1.75rem, 1.25rem + 2vw, 2.5rem)',
          fontWeight: 800,
          letterSpacing: '-0.02em',
          color: 'var(--bl-text)',
          margin: '0 0 0.5rem',
        }}
      >
        Custom Build — <span className="bl-grad-text">{tierLabel}</span>
      </h1>
      <p style={{ fontSize: '1.15rem', color: 'var(--bl-text-muted)', margin: '0 0 0.5rem' }}>
        <strong style={{ color: 'var(--bl-text)', fontSize: '1.4rem' }}>{priceLabel}</strong> USD ·
        one-time · fixed price
      </p>
      <p
        style={{
          fontFamily: 'var(--bl-font-mono)',
          fontSize: 12,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: daysLeft <= 3 ? 'var(--bl-danger, #f87171)' : 'var(--bl-text-subtle)',
          margin: '0 0 2rem',
        }}
      >
        This offer expires {expiresLabel} — {daysLeft} day{daysLeft === 1 ? '' : 's'} left
      </p>

      {/* Scope */}
      <section
        style={{
          border: '1px solid var(--bl-border)',
          borderRadius: 'var(--bl-radius-lg)',
          background: 'var(--bl-surface)',
          padding: 'clamp(1.25rem, 2vw, 2rem)',
          marginBottom: '2rem',
        }}
      >
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--bl-text)', margin: '0 0 1rem' }}>
          Scope of work
        </h2>
        {scopeBullets.length > 0 ? (
          <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'grid', gap: 10 }}>
            {scopeBullets.map((bullet) => (
              <li key={bullet} style={{ color: 'var(--bl-text-muted)', lineHeight: 1.55, fontSize: 14 }}>
                {bullet}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: 'var(--bl-text-muted)', margin: 0, fontSize: 14, lineHeight: 1.6 }}>
            Your detailed scope is being finalised — it will appear here shortly. The tier and
            price above are locked in the meantime.
          </p>
        )}
      </section>

      {/* Payment */}
      <section style={{ marginBottom: '2.5rem' }}>
        {wireState === 'sent' && (
          <div
            style={{
              padding: '14px 16px',
              border: '2px solid var(--bl-accent)',
              borderRadius: 'var(--bl-radius-md)',
              background: 'var(--bl-surface-soft, var(--bl-surface))',
              marginBottom: '1rem',
              fontSize: 14,
              color: 'var(--bl-text)',
              lineHeight: 1.55,
            }}
          >
            Wire instructions are on their way to <strong>{room.email}</strong>. Put the reference
            code from that email in the wire memo — the room stays open until the wire lands.
          </div>
        )}
        {wireState === 'error' && (
          <div
            role="alert"
            style={{
              padding: '14px 16px',
              border: '1px solid var(--bl-danger, #b00)',
              borderRadius: 'var(--bl-radius-md)',
              color: 'var(--bl-danger, #b00)',
              marginBottom: '1rem',
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            Wire setup failed — please use card / crypto below, or email{' '}
            <a href="mailto:team@bizlegal-ai.com">team@bizlegal-ai.com</a>.
          </div>
        )}
        <div style={{ display: 'grid', gap: 12 }}>
          <form action={payByWire} style={{ display: 'contents' }}>
            <button
              type="submit"
              className="bl-btn-primary"
              disabled={wireState === 'sent'}
              style={{
                width: '100%',
                padding: '14px 20px',
                fontSize: '1rem',
                fontWeight: 600,
                justifyContent: 'center',
                opacity: wireState === 'sent' ? 0.5 : 1,
              }}
            >
              Pay {priceLabel} by bank wire — instructions to {room.email}
            </button>
          </form>
          <Link
            href={checkoutHref}
            className="bl-btn-ghost"
            style={{
              width: '100%',
              padding: '14px 20px',
              fontSize: '1rem',
              fontWeight: 600,
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            Pay {priceLabel} by card / crypto
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--bl-text)', margin: '0 0 1rem' }}>
          Questions you might have
        </h2>
        <div style={{ display: 'grid', gap: 14 }}>
          {FAQ.map((item) => (
            <div key={item.q}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--bl-text)', marginBottom: 4 }}>
                {item.q}
              </div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--bl-text-muted)' }}>
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Ask anything */}
      <section
        style={{
          borderTop: '1px solid var(--bl-divider)',
          paddingTop: '1.5rem',
          fontSize: 14,
          color: 'var(--bl-text-subtle)',
          lineHeight: 1.6,
        }}
      >
        Ask anything before deciding:{' '}
        <a href={`mailto:team@bizlegal-ai.com?subject=${encodeURIComponent(`Deal room question — Custom Build (${tierLabel})`)}`}>
          email the team
        </a>{' '}
        or <Link href="/#qualifier">continue the conversation with the async consultant</Link>. Moses
        reviews every thread personally.
      </section>
    </main>
  )
}
