import type { Metadata } from 'next'
import Link from 'next/link'
import { PricingTierCard, type PricingTierData } from '../components/ui-v2/PricingTierCard'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Pricing — LexAudit',
  description:
    'Compliance Health Scores for solo, boutique and mid-market law firms. PII-redacted, RLS-isolated, source-cited. Solo $49/mo, Boutique $199/mo, Mid-Market $599/mo.',
  alternates: { canonical: 'https://lexaudit.bizlegal-ai.com/pricing' },
}


function apexCheckout(
  product: string,
  tier: string,
  interval: 'one-time' | 'monthly' | 'yearly',
  amountCents: number,
  name: string,
): string {
  const params = new URLSearchParams({
    product,
    tier,
    interval,
    amount: String(amountCents),
    name,
  })
  return `https://bizlegal-ai.com/checkout?${params.toString()}`
}

const SOLO_TIER: PricingTierData = {
  name: 'Solo',
  description:
    'For sole practitioners or single-lawyer shops. 20 matters/month with versioned audit trail and PII-redacted AI usage logs.',
  prices: {
    oneTime: { amount: 49, currency: 'USD', label: 'one matter pack' },
    monthly: { amount: 49, currency: 'USD' },
    yearly: { amount: 490, currency: 'USD', saveLabel: 'save 2 mo' },
  },
  features: [
    '1 lawyer · 20 matters / mo',
    'Compliance Health Scores',
    'AI usage logs (PII-redacted)',
    'PDF export',
    'Email support',
    'GDPR-ready data export',
  ],
  excludes: ['Partner review workflow', 'API access'],
  checkoutUrls: {
    oneTime: { checkout: apexCheckout('lexaudit', 'solo', 'one-time', 4900, 'LEXAUDIT solo one-time') },
    monthly: { checkout: apexCheckout('lexaudit', 'solo', 'monthly', 4900, 'LEXAUDIT solo monthly') },
    yearly: { checkout: apexCheckout('lexaudit', 'solo', 'yearly', 49000, 'LEXAUDIT solo yearly') },
  },
}

const BOUTIQUE_TIER: PricingTierData = {
  name: 'Boutique',
  badge: 'Most popular',
  description:
    'For boutique firms up to 10 lawyers. Unlimited matters, partner review workflow, custom firm branding on every certificate.',
  prices: {
    oneTime: { amount: 199, currency: 'USD', label: 'one boutique pack' },
    monthly: { amount: 199, currency: 'USD' },
    yearly: { amount: 1990, currency: 'USD', saveLabel: 'save 2 mo' },
  },
  features: [
    'Up to 10 lawyers · unlimited matters',
    'Everything in Solo',
    'Partner review workflow',
    'Full audit-ready export',
    'Custom firm branding on certificates',
    'Priority support',
  ],
  excludes: ['API access'],
  checkoutUrls: {
    oneTime: { checkout: apexCheckout('lexaudit', 'boutique', 'one-time', 19900, 'LEXAUDIT boutique one-time') },
    monthly: { checkout: apexCheckout('lexaudit', 'boutique', 'monthly', 19900, 'LEXAUDIT boutique monthly') },
    yearly: { checkout: apexCheckout('lexaudit', 'boutique', 'yearly', 199000, 'LEXAUDIT boutique yearly') },
  },
  highlighted: true,
}

const MIDMARKET_TIER: PricingTierData = {
  name: 'Mid-Market',
  description:
    'For firms up to 50 lawyers. API access, custom signal templates, dedicated onboarding, defined SLA.',
  prices: {
    oneTime: { amount: 599, currency: 'USD', label: 'one firm pack' },
    monthly: { amount: 599, currency: 'USD' },
    yearly: { amount: 5990, currency: 'USD', saveLabel: 'save 2 mo' },
  },
  features: [
    'Up to 50 lawyers · unlimited matters',
    'Everything in Boutique',
    'API integration (1k calls/mo)',
    'Custom signal templates',
    'Dedicated onboarding',
    'Defined service-level commitment',
  ],
  checkoutUrls: {
    oneTime: { checkout: apexCheckout('lexaudit', 'midmarket', 'one-time', 59900, 'LEXAUDIT midmarket one-time') },
    monthly: { checkout: apexCheckout('lexaudit', 'midmarket', 'monthly', 59900, 'LEXAUDIT midmarket monthly') },
    yearly: { checkout: apexCheckout('lexaudit', 'midmarket', 'yearly', 599000, 'LEXAUDIT midmarket yearly') },
  },
}

export default function LexAuditPricingPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#050509', color: '#e2e8f0', fontFamily: "'DM Sans', sans-serif" }}>
      <nav style={{ borderBottom: '1px solid #0f172a', padding: '0 40px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <div style={{ width: '26px', height: '26px', background: 'linear-gradient(135deg,#c9a84c,#7a5c20)', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>⚖</div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '17px', color: '#e2e8f0' }}>LexAudit</span>
        </Link>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Link href="/security" style={{ color: '#94a3b8', fontSize: '13px', textDecoration: 'none' }}>Privacy & Security</Link>
          <Link href="/login" style={{ background: 'linear-gradient(135deg,#c9a84c,#a07830)', color: '#0a0a0f', borderRadius: '8px', padding: '9px 20px', fontWeight: 700, fontSize: '13px', textDecoration: 'none' }}>Get Started Free</Link>
        </div>
      </nav>

      <section style={{ padding: '80px 40px 32px', textAlign: 'center', maxWidth: '880px', margin: '0 auto' }}>
        <p style={{ color: '#c9a84c', fontSize: '11px', letterSpacing: '4px', marginBottom: '12px' }}>PRICING</p>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2.4rem, 1.5rem + 3vw, 3.6rem)', fontWeight: 900, marginBottom: '16px', color: '#f1f5f9', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          Versioned compliance. <span style={{ color: '#c9a84c' }}>Below the partner-vote threshold.</span>
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '17px', maxWidth: '640px', margin: '0 auto 16px', lineHeight: 1.6 }}>
          Source-cited Compliance Health Scores reviewed by a named analyst. PII-redacted, RLS-isolated.
          Cancel anytime; certificates non-refundable once produced unless damaged or defective. Crypto via NOWPayments, card via PayPal.
        </p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#0f0f0a', border: '1px solid #2a2010', borderRadius: '100px', padding: '6px 14px' }}>
          <span style={{ color: '#c9a84c', fontSize: '12px' }}>✦ Beta: 3 months free on any plan</span>
        </div>
      </section>

      <section style={{ padding: '24px 24px 64px', maxWidth: '1200px', margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'clamp(1rem, 0.75rem + 1vw, 1.5rem)',
            alignItems: 'stretch',
          }}
        >
          <PricingTierCard {...SOLO_TIER} defaultInterval="monthly" />
          <PricingTierCard {...BOUTIQUE_TIER} defaultInterval="monthly" />
          <PricingTierCard {...MIDMARKET_TIER} defaultInterval="yearly" />
        </div>

        <div style={{ textAlign: 'center', marginTop: '32px', color: '#475569', fontSize: '13px' }}>
          All plans include: Supabase-backed storage · SHA-256 snapshot hashing · GDPR-ready data export · Cancel anytime
        </div>
      </section>

      <section
        style={{
          padding: '64px 40px',
          background: 'linear-gradient(135deg, #0a0a0f 0%, #100a05 100%)',
          borderTop: '1px solid #2a2010',
          borderBottom: '1px solid #2a2010',
        }}
      >
        <div style={{ maxWidth: '880px', margin: '0 auto' }}>
          <p style={{ color: '#c9a84c', fontSize: '11px', letterSpacing: '4px', marginBottom: '12px' }}>LEXAUDIT SAFE</p>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(1.8rem, 1.3rem + 2vw, 2.6rem)',
              fontWeight: 800,
              color: '#f1f5f9',
              margin: '0 0 16px',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            Your client data <span style={{ color: '#c9a84c' }}>never leaves the firm sandbox.</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginTop: '24px' }}>
            <SafeBullet
              title="Zero document content stored"
              body="Matter content is processed in memory only. Metadata + redacted prompts retained, source documents never persisted server-side."
            />
            <SafeBullet
              title="Microsoft Presidio PII redaction"
              body="Names, addresses, IDs and case numbers stripped before any AI call. Redaction map kept client-side under your firm's RLS row."
            />
            <SafeBullet
              title="Per-firm RLS isolation"
              body="Supabase row-level security enforces firm boundaries at the database layer. Cross-firm reads are not possible — verified by policy."
            />
            <SafeBullet
              title="Source-cited audit trail"
              body="Every health-score signal links to a specific regulator publication or court filing. SHA-256 hashed snapshots are tamper-evident."
            />
          </div>
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <Link
              href="/security"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'transparent',
                color: '#c9a84c',
                border: '1px solid #c9a84c',
                borderRadius: '8px',
                padding: '12px 24px',
                fontWeight: 700,
                fontSize: '14px',
                textDecoration: 'none',
              }}
            >
              Read the full Safe whitepaper <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section style={{ padding: '64px 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(1.6rem, 1.2rem + 1.5vw, 2.2rem)',
              fontWeight: 800,
              color: '#f1f5f9',
              margin: '0 0 16px',
            }}
          >
            Got a partner review next month?
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: 1.6, margin: '0 0 24px' }}>
            Start a 3-month free beta. No card required. Cancel anytime.
          </p>
          <Link
            href="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg,#c9a84c,#a07830)',
              color: '#0a0a0f',
              borderRadius: '8px',
              padding: '14px 28px',
              fontWeight: 700,
              fontSize: '15px',
              textDecoration: 'none',
            }}
          >
            Start Free Beta <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </div>
  )
}

function SafeBullet({ title, body }: { title: string; body: string }) {
  return (
    <div style={{ background: '#080810', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <span style={{ color: '#22c55e', fontSize: '14px' }}>✓</span>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '15px', fontWeight: 700, color: '#f1f5f9' }}>{title}</span>
      </div>
      <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>{body}</p>
    </div>
  )
}
