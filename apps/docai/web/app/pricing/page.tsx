import type { Metadata } from "next";
import Link from "next/link";
import { PricingTierCard, type PricingTierData } from "../components/ui-v2/PricingTierCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pricing — DocAI by BizLegal AI",
  description:
    "Contract intelligence + Security Questionnaire Auto-fill (SQA). Free tier for one-off review; Starter $29/mo for solo founders; Team $69/mo for B2B SaaS sales; Firm $99/mo for compliance + GC teams.",
  alternates: { canonical: "https://docai.bizlegal-ai.com/pricing" },
};

function url(name: string): string | undefined {
  const v = (process.env as Record<string, string | undefined>)[name];
  return v && v.length > 4 ? v : undefined;
}

const STARTER_TIER: PricingTierData = {
  name: "Starter",
  description:
    "For solo founders + small ops teams. Includes 10 contract analyses or 5 SQA drafts per month.",
  prices: {
    oneTime: { amount: 29, currency: "USD", label: "one analysis pack" },
    monthly: { amount: 29, currency: "USD" },
    yearly: { amount: 290, currency: "USD", saveLabel: "save 2 mo" },
  },
  features: [
    "10 contract analyses / mo",
    "5 SQA drafts / mo (SOC 2 / CAIQ / SIG-Lite)",
    "Public KB access",
    "PDF export",
    "Email support",
  ],
  excludes: ["KB uploads", "API access"],
  checkoutUrls: {
    oneTime: {
      crypto: url("NEXT_PUBLIC_NOWPAYMENTS_DOCAI_STARTER_ONETIME_URL"),
      card: url("NEXT_PUBLIC_PAYPAL_DOCAI_STARTER_ONETIME_URL"),
    },
    monthly: {
      crypto: url("NEXT_PUBLIC_NOWPAYMENTS_DOCAI_STARTER_MONTHLY_URL"),
      card: url("NEXT_PUBLIC_PAYPAL_DOCAI_STARTER_MONTHLY_URL"),
    },
    yearly: {
      crypto: url("NEXT_PUBLIC_NOWPAYMENTS_DOCAI_STARTER_YEARLY_URL"),
      card: url("NEXT_PUBLIC_PAYPAL_DOCAI_STARTER_YEARLY_URL"),
    },
  },
};

const TEAM_TIER: PricingTierData = {
  name: "Team",
  badge: "Most popular",
  description:
    "For B2B SaaS sales + revops teams answering vendor security questionnaires daily. 50 SQA drafts + drafting + review.",
  prices: {
    oneTime: { amount: 69, currency: "USD", label: "one team pack" },
    monthly: { amount: 69, currency: "USD" },
    yearly: { amount: 690, currency: "USD", saveLabel: "save 2 mo" },
  },
  features: [
    "50 contract analyses / mo",
    "50 SQA drafts / mo",
    "DPA Negotiator (GDPR / CCPA / HIPAA) included",
    "AI drafting (clauses + redlines)",
    "Vendor questionnaire library (SOC 2, CAIQ, SIG-Lite, SIG, NIST)",
    "Custom prompt overrides",
    "Priority support",
  ],
  excludes: ["KB uploads", "Dedicated onboarding"],
  checkoutUrls: {
    oneTime: {
      crypto: url("NEXT_PUBLIC_NOWPAYMENTS_DOCAI_TEAM_ONETIME_URL"),
      card: url("NEXT_PUBLIC_PAYPAL_DOCAI_TEAM_ONETIME_URL"),
    },
    monthly: {
      crypto: url("NEXT_PUBLIC_NOWPAYMENTS_DOCAI_TEAM_MONTHLY_URL"),
      card: url("NEXT_PUBLIC_PAYPAL_DOCAI_TEAM_MONTHLY_URL"),
    },
    yearly: {
      crypto: url("NEXT_PUBLIC_NOWPAYMENTS_DOCAI_TEAM_YEARLY_URL"),
      card: url("NEXT_PUBLIC_PAYPAL_DOCAI_TEAM_YEARLY_URL"),
    },
  },
  highlighted: true,
};

const FIRM_TIER: PricingTierData = {
  name: "Firm",
  description:
    "For compliance teams + general counsel. 150 SQAs/mo, KB upload of your firm's playbook, API access, dedicated onboarding.",
  prices: {
    oneTime: { amount: 99, currency: "USD", label: "one firm pack" },
    monthly: { amount: 99, currency: "USD" },
    yearly: { amount: 990, currency: "USD", saveLabel: "save 2 mo" },
  },
  features: [
    "150 contract analyses / mo",
    "150 SQA drafts / mo",
    "Everything in Team (incl. DPA Negotiator)",
    "KB upload of your firm's playbook (manage at /sqa/kb)",
    "API access (1k calls/mo)",
    "Custom clause library",
    "Dedicated onboarding",
    "99.9% SLA",
  ],
  checkoutUrls: {
    oneTime: {
      crypto: url("NEXT_PUBLIC_NOWPAYMENTS_DOCAI_FIRM_ONETIME_URL"),
      card: url("NEXT_PUBLIC_PAYPAL_DOCAI_FIRM_ONETIME_URL"),
    },
    monthly: {
      crypto: url("NEXT_PUBLIC_NOWPAYMENTS_DOCAI_FIRM_MONTHLY_URL"),
      card: url("NEXT_PUBLIC_PAYPAL_DOCAI_FIRM_MONTHLY_URL"),
    },
    yearly: {
      crypto: url("NEXT_PUBLIC_NOWPAYMENTS_DOCAI_FIRM_YEARLY_URL"),
      card: url("NEXT_PUBLIC_PAYPAL_DOCAI_FIRM_YEARLY_URL"),
    },
  },
};

export default function DocAIPricingPage() {
  return (
    <>
      <section
        className="bl-hero-bg"
        style={{
          paddingTop: "clamp(4rem, 2rem + 4vw, 6rem)",
          paddingBottom: "clamp(2rem, 1.5rem + 2vw, 3rem)",
        }}
      >
        <div className="bl-container" style={{ textAlign: "center", maxWidth: 800, margin: "0 auto" }}>
          <span className="bl-tag" style={{ marginBottom: "1rem" }}>
            Contract review + SQA auto-fill
          </span>
          <h1
            style={{
              fontFamily: "var(--bl-font-display)",
              fontSize: "var(--bl-text-h1)",
              fontWeight: 800,
              letterSpacing: "-0.025em",
              lineHeight: 1.05,
              color: "var(--bl-text)",
              margin: "1.5rem 0 1rem",
            }}
          >
            Stop staring at <span className="bl-grad-text">vendor questionnaires.</span>
          </h1>
          <p
            style={{
              fontSize: "clamp(1.05rem, 0.95rem + 0.4vw, 1.2rem)",
              color: "var(--bl-text-muted)",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            DocAI drafts your SOC 2 / CAIQ / SIG-Lite responses, redlines
            contracts, and audits clauses. Free tier for one-off review;
            paid tiers for B2B SaaS teams who need this daily. Crypto via
            NOWPayments, card via PayPal. Cancel anytime; one-time
            deliveries non-refundable once produced unless damaged or defective.
          </p>
        </div>
      </section>

      <section className="bl-section" style={{ paddingTop: "clamp(2rem, 1rem + 2vw, 4rem)" }}>
        <div className="bl-container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "clamp(1rem, 0.75rem + 1vw, 1.5rem)",
              alignItems: "stretch",
            }}
          >
            <div
              className="bl-card"
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div>
                <h3
                  style={{
                    fontFamily: "var(--bl-font-display)",
                    fontSize: "1.5rem",
                    fontWeight: 800,
                    color: "var(--bl-text)",
                    margin: 0,
                    marginBottom: 4,
                  }}
                >
                  Free
                </h3>
                <p
                  style={{
                    fontFamily: "var(--bl-font-body)",
                    fontSize: "var(--bl-text-small)",
                    color: "var(--bl-text-muted)",
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  Try one SQA draft + one contract review on us. No card.
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span
                  style={{
                    fontFamily: "var(--bl-font-display)",
                    fontSize: "clamp(2rem, 1.5rem + 1.5vw, 3rem)",
                    fontWeight: 800,
                    color: "var(--bl-text)",
                    letterSpacing: "-0.02em",
                    lineHeight: 1,
                  }}
                >
                  $0
                </span>
                <span
                  style={{
                    fontFamily: "var(--bl-font-body)",
                    fontSize: "var(--bl-text-small)",
                    color: "var(--bl-text-muted)",
                  }}
                >
                  forever
                </span>
              </div>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "grid",
                  gap: 8,
                  flex: 1,
                }}
              >
                {[
                  "1 SQA draft (free trial)",
                  "1 contract analysis",
                  "Public KB access",
                  "Standard PDF export",
                  "Community support",
                ].map((f) => (
                  <li
                    key={f}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      fontFamily: "var(--bl-font-body)",
                      fontSize: "var(--bl-text-small)",
                      color: "var(--bl-text)",
                      lineHeight: 1.5,
                    }}
                  >
                    <span aria-hidden="true" style={{ color: "var(--bl-accent)", fontWeight: 700, flexShrink: 0 }}>
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/sqa"
                className="bl-btn-ghost"
                style={{ width: "100%", justifyContent: "center" }}
              >
                Try a free SQA →
              </Link>
            </div>

            <PricingTierCard {...STARTER_TIER} defaultInterval="monthly" />
            <PricingTierCard {...TEAM_TIER} defaultInterval="monthly" />
            <PricingTierCard {...FIRM_TIER} defaultInterval="yearly" />
          </div>
        </div>
      </section>

      <section
        className="bl-section"
        style={{ background: "var(--bl-accent-soft)", borderTop: "1px solid var(--bl-divider)" }}
      >
        <div className="bl-container-narrow" style={{ textAlign: "center" }}>
          <h2
            style={{
              fontFamily: "var(--bl-font-display)",
              fontSize: "var(--bl-text-h2)",
              fontWeight: 800,
              letterSpacing: "-0.025em",
              color: "var(--bl-text)",
              margin: 0,
              marginBottom: "1rem",
            }}
          >
            Got a SOC 2 questionnaire <span className="bl-grad-text">due Friday?</span>
          </h2>
          <p
            style={{
              fontSize: "var(--bl-text-body)",
              color: "var(--bl-text-muted)",
              lineHeight: 1.6,
              margin: 0,
              marginBottom: "1.5rem",
            }}
          >
            Upload it now. Free first draft in 60 seconds. No card.
          </p>
          <Link href="/sqa" className="bl-btn-primary">
            Try a free SQA draft
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </>
  );
}
