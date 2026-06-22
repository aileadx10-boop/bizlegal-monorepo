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
    oneTime: { checkout: apexCheckout('brai', 'standard', 'one-time', 14900, 'BRAI standard one-time') },
    monthly: { checkout: apexCheckout('brai', 'standard', 'monthly', 59900, 'BRAI standard monthly') },
    yearly: { checkout: apexCheckout('brai', 'standard', 'yearly', 599000, 'BRAI standard yearly') },
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
    oneTime: { checkout: apexCheckout('brai', 'priority', 'one-time', 24900, 'BRAI priority one-time') },
    monthly: { checkout: apexCheckout('brai', 'priority', 'monthly', 99900, 'BRAI priority monthly') },
    yearly: { checkout: apexCheckout('brai', 'priority', 'yearly', 999000, 'BRAI priority yearly') },
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
    oneTime: { checkout: apexCheckout('brai', 'extended', 'one-time', 50000, 'BRAI extended one-time') },
    monthly: { checkout: apexCheckout('brai', 'extended', 'monthly', 199900, 'BRAI extended monthly') },
    yearly: { checkout: apexCheckout('brai', 'extended', 'yearly', 1999000, 'BRAI extended yearly') },
  },
}

export default function PricingPage() {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What does a BRAI regulatory risk report include?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Each report covers the regulatory status of a named entity or wallet across 50+ jurisdictions, with a risk score, a source-cited evidence ledger, a list of pending enforcement actions, and a forward-looking outlook from a named human analyst.",
        },
      },
      {
        "@type": "Question",
        "name": "Who is BRAI for?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Compliance teams at crypto exchanges, neobanks, PSPs, and law firms who need defensible, source-cited risk assessments on counterparties before onboarding or periodically during the relationship.",
        },
      },
      {
        "@type": "Question",
        "name": "How is BRAI different from Chainalysis or TRM Labs?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "BRAI focuses on regulatory and legal risk (sanctions, enforcement actions, license status) with a human analyst reviewing every report. Chainalysis and TRM are transaction-graph-first. BRAI complements them; most clients use both.",
        },
      },
      {
        "@type": "Question",
        "name": "What payment methods are supported?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Crypto via NOWPayments (BTC, ETH, USDT), card via PayPal. Wire transfer for retainer clients.",
        },
      },
      {
        "@type": "Question",
        "name": "How fast is a single report delivered?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Standard reports deliver in 24-48 hours. Expedited (4-hour) delivery available for an additional fee. Retainer clients get same-day turnaround.",
        },
      },
      {
        "@type": "Question",
        "name": "Can I cancel my monthly retainer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Retainers cancel any time. Already-produced reports are non-refundable once delivered.",
        },
      },
    ],
  }

  const productLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "BRAI",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "description":
      "Source-cited regulatory risk reports on crypto entities, exchanges, PSPs and wallets. Reviewed by a named human analyst before delivery.",
    "url": "https://brai.bizlegal-ai.com/pricing",
    "image": "https://brai.bizlegal-ai.com/og.png",
    "offers": [
      { "@type": "Offer", "name": "Single Report", "price": "249", "priceCurrency": "USD",
        "category": "one-time", "url": "https://brai.bizlegal-ai.com/pricing" },
      { "@type": "Offer", "name": "Monthly Retainer (10 reports)", "price": "1990", "priceCurrency": "USD",
        "category": "subscription", "url": "https://brai.bizlegal-ai.com/pricing" },
      { "@type": "Offer", "name": "Monitor (unlimited alerts)", "price": "99", "priceCurrency": "USD",
        "category": "subscription", "url": "https://brai.bizlegal-ai.com/pricing" },
    ],
    "brand": { "@type": "Brand", "name": "BRAI" },
    "provider": {
      "@type": "Organization",
      "name": "BizLegal AI",
      "url": "https://bizlegal-ai.com",
    },
  }

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://bizlegal-ai.com" },
      { "@type": "ListItem", "position": 2, "name": "BRAI", "item": "https://brai.bizlegal-ai.com" },
      { "@type": "ListItem", "position": 3, "name": "Pricing", "item": "https://brai.bizlegal-ai.com/pricing" },
    ],
  }

  return (
    <LegalPage
      title="Pricing."
      intro="Per-report pricing or a monthly retainer for high-volume desks. Every report is reviewed by a named human analyst before delivery. Crypto via NOWPayments, card via PayPal. Cancel retainers anytime; one-time reports non-refundable once produced unless damaged or defective."
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
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
