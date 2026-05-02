import type { Metadata } from "next"
import LegalPage from "@/components/layout/LegalPage"
import { PricingTierCard, type PricingTierData } from "../components/ui-v2/PricingTierCard"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Pricing — BRAI",
  description:
    "Per-report pricing or a monthly retainer for high-volume desks. Standard $149, Priority 12h $249, Extended Sanctions $500. Crypto via NOWPayments, card via PayPal.",
  alternates: { canonical: "/pricing" },
}

function url(name: string): string | undefined {
  const v = (process.env as Record<string, string | undefined>)[name]
  return v && v.length > 4 ? v : undefined
}

const STANDARD_TIER: PricingTierData = {
  name: "Standard",
  description:
    "Blockchain regulatory-posture report. Token classification, jurisdictional flag matrix, sanctions screening. 5-day delivery.",
  prices: {
    oneTime: { amount: 149, currency: "USD", label: "single report" },
    monthly: { amount: 599, currency: "USD", label: "5 reports / mo retainer" },
    yearly: { amount: 5990, currency: "USD", saveLabel: "save 2 mo" },
  },
  features: [
    "Single Standard report (5-day SLA)",
    "Token Howey-test classification",
    "Jurisdictional flag matrix",
    "OFAC + UN + EU sanctions check",
    "Human analyst review",
    "PDF + JSON export",
  ],
  excludes: ["Priority 12h delivery", "Extended sanctions deep-dive"],
  checkoutUrls: {
    oneTime: {
      crypto: url("NEXT_PUBLIC_NOWPAYMENTS_BRAI_STANDARD_ONETIME_URL"),
      card: url("NEXT_PUBLIC_PAYPAL_BRAI_STANDARD_ONETIME_URL"),
    },
    monthly: {
      crypto: url("NEXT_PUBLIC_NOWPAYMENTS_BRAI_STANDARD_MONTHLY_URL"),
      card: url("NEXT_PUBLIC_PAYPAL_BRAI_STANDARD_MONTHLY_URL"),
    },
    yearly: {
      crypto: url("NEXT_PUBLIC_NOWPAYMENTS_BRAI_STANDARD_YEARLY_URL"),
      card: url("NEXT_PUBLIC_PAYPAL_BRAI_STANDARD_YEARLY_URL"),
    },
  },
}

const PRIORITY_TIER: PricingTierData = {
  name: "Priority 12h",
  badge: "Most popular",
  description:
    "Same Standard report, delivered in under 12 hours. For deal-room timelines and inbound capital requests.",
  prices: {
    oneTime: { amount: 249, currency: "USD", label: "single 12h report" },
    monthly: { amount: 999, currency: "USD", label: "5 reports / mo retainer" },
    yearly: { amount: 9990, currency: "USD", saveLabel: "save 2 mo" },
  },
  features: [
    "Everything in Standard",
    "12h SLA (vs 5 days)",
    "Direct analyst escalation channel",
    "Same-day clarifying-question turnaround",
    "Up to 3 stakeholder distribution",
  ],
  excludes: ["Extended sanctions deep-dive"],
  checkoutUrls: {
    oneTime: {
      crypto: url("NEXT_PUBLIC_NOWPAYMENTS_BRAI_PRIORITY_ONETIME_URL"),
      card: url("NEXT_PUBLIC_PAYPAL_BRAI_PRIORITY_ONETIME_URL"),
    },
    monthly: {
      crypto: url("NEXT_PUBLIC_NOWPAYMENTS_BRAI_PRIORITY_MONTHLY_URL"),
      card: url("NEXT_PUBLIC_PAYPAL_BRAI_PRIORITY_MONTHLY_URL"),
    },
    yearly: {
      crypto: url("NEXT_PUBLIC_NOWPAYMENTS_BRAI_PRIORITY_YEARLY_URL"),
      card: url("NEXT_PUBLIC_PAYPAL_BRAI_PRIORITY_YEARLY_URL"),
    },
  },
  highlighted: true,
}

const EXTENDED_TIER: PricingTierData = {
  name: "Extended Sanctions",
  description:
    "OFAC + UN + EU + UK + UAE + SG + cross-chain heuristics. For OFAC-sensitive flows: cross-border treasury, custody, exchange listings.",
  prices: {
    oneTime: { amount: 500, currency: "USD", label: "single deep report" },
    monthly: { amount: 1999, currency: "USD", label: "4 reports / mo retainer" },
    yearly: { amount: 19990, currency: "USD", saveLabel: "save 2 mo" },
  },
  features: [
    "Everything in Priority",
    "OFAC SDN + UN + EU + UK + UAE + SG screening",
    "Cross-chain wallet heuristic clustering",
    "Counterparty exposure timeline (24mo)",
    "Litigation + enforcement search",
    "Director / beneficial-owner trace",
    "Notarised PDF for audit committees",
  ],
  checkoutUrls: {
    oneTime: {
      crypto: url("NEXT_PUBLIC_NOWPAYMENTS_BRAI_EXTENDED_ONETIME_URL"),
      card: url("NEXT_PUBLIC_PAYPAL_BRAI_EXTENDED_ONETIME_URL"),
    },
    monthly: {
      crypto: url("NEXT_PUBLIC_NOWPAYMENTS_BRAI_EXTENDED_MONTHLY_URL"),
      card: url("NEXT_PUBLIC_PAYPAL_BRAI_EXTENDED_MONTHLY_URL"),
    },
    yearly: {
      crypto: url("NEXT_PUBLIC_NOWPAYMENTS_BRAI_EXTENDED_YEARLY_URL"),
      card: url("NEXT_PUBLIC_PAYPAL_BRAI_EXTENDED_YEARLY_URL"),
    },
  },
}

export default function PricingPage() {
  return (
    <LegalPage
      title="Pricing."
      intro="Per-report pricing or a monthly retainer for high-volume desks. Every report is reviewed by a named human analyst before delivery. Crypto via NOWPayments, card via PayPal. Cancel retainers anytime; one-time reports non-refundable once produced unless damaged or defective."
    >
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "clamp(1rem, 0.75rem + 1vw, 1.5rem)",
          alignItems: "stretch",
          marginTop: 24,
        }}
      >
        <PricingTierCard {...STANDARD_TIER} defaultInterval="one-time" />
        <PricingTierCard {...PRIORITY_TIER} defaultInterval="one-time" />
        <PricingTierCard {...EXTENDED_TIER} defaultInterval="one-time" />
      </section>

      <section
        style={{
          marginTop: 48,
          padding: 28,
          border: "1px solid var(--outline-var)",
          borderRadius: 12,
          background: "var(--bg-low, var(--bg-2))",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-mono, ui-monospace)",
            fontSize: 11,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--accent, var(--gold))",
            margin: 0,
          }}
        >
          Verified Intelligence Network
        </p>
        <p style={{ marginTop: 4, fontSize: 13, color: "var(--on-surface-var, var(--muted))" }}>
          Contact Us · Intro fee from $5,000 · Analyst retainers negotiated directly
        </p>
        <p style={{ marginTop: 16, fontSize: 14, lineHeight: 1.7 }}>
          For hedge funds, family offices, and corporate treasury desks requiring
          human-verified intelligence at enterprise scale. We introduce you to vetted
          third-party analysts, investigators, and compliance counsel drawn from our
          partner network. BizLegal does not perform the work or guarantee outcomes —
          we match, we introduce, we step back.
        </p>
        <div style={{ marginTop: 20 }}>
          <a
            href="/network"
            style={{
              display: "inline-block",
              padding: "10px 18px",
              background: "var(--accent, var(--gold))",
              color: "#fff",
              textDecoration: "none",
              fontWeight: 600,
              borderRadius: 8,
            }}
          >
            Request an Introduction →
          </a>
        </div>
      </section>

      <p style={{ marginTop: 32, fontSize: 13, color: "var(--outline, var(--muted))" }}>
        Fleet-wide pricing comparison:{" "}
        <a href="https://bizlegal-ai.com/pricing/all">bizlegal-ai.com/pricing/all</a>
      </p>
    </LegalPage>
  )
}
