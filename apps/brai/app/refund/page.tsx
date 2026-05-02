import type { Metadata } from "next"
import LegalPage from "@/components/layout/LegalPage"

export const metadata: Metadata = {
  title: "Refunds — BRAI",
  description:
    "BRAI refund policy. Subscriptions cancellable anytime; one-time reports non-refundable once produced unless damaged or demonstrably defective.",
  alternates: { canonical: "/refund" },
}

export default function RefundPage() {
  return (
    <LegalPage
      title="Refunds & cancellation."
      intro="BRAI sells two product shapes: per-report intelligence (one-time) and monthly retainers (recurring). The policy below sets out how each is refunded."
    >
      <section>
        <h2 className="lp-h2">1. Subscriptions — cancel anytime.</h2>
        <p>
          Recurring monthly or yearly retainers can be cancelled at any time. Cancellation stops future billing
          immediately. Access to the retainer benefits remains active until the end of the period you have already
          paid for. We do not pro-rate or refund mid-period unless we are at fault for an outage that prevented you
          from using the product.
        </p>
      </section>

      <section>
        <h2 className="lp-h2">2. One-time reports — non-refundable once produced.</h2>
        <p>
          Per-report intelligence outputs (Standard, Priority 12h, Extended Sanctions) are non-refundable once we
          have produced and delivered the report. The work is bespoke; once analyst time has been spent on your
          inputs, that cost cannot be returned.
        </p>
        <p>
          Two exceptions apply, and we honour them in full:
        </p>
        <ul>
          <li>
            <strong>Damaged delivery</strong> — file is corrupted, unreadable, or missing material content.
          </li>
          <li>
            <strong>Demonstrably defective output</strong> — wrong subject (token, entity, jurisdiction), wrong
            framework, or factual error that the human reviewer who signed off can confirm against the cited
            sources.
          </li>
        </ul>
        <p>
          We attempt redelivery first. If the corrected output still fails specification, we issue a full refund.
        </p>
      </section>

      <section>
        <h2 className="lp-h2">3. Pre-delivery cancellation.</h2>
        <p>
          If we have not yet started production on your one-time order, you can cancel and receive a full refund.
          Standard reports begin production within 24 hours; Priority 12h within 1 hour. Once started, the order
          falls under section 2.
        </p>
      </section>

      <section>
        <h2 className="lp-h2">4. How to request.</h2>
        <p>
          Email support with the report ID or subscription email and a brief description of the issue. The human
          reviewer who signed off on your report investigates first; if confirmed, redelivery or refund follows
          within 10 business days.
        </p>
      </section>

      <section>
        <h2 className="lp-h2">5. Crypto + chargebacks.</h2>
        <p>
          NOWPayments transactions that have already finalised on-chain cannot be reversed. Where a refund is
          approved, we issue it in the original cryptocurrency at the prevailing rate or as a credit against future
          BRAI work. Please contact us before opening a chargeback — we resolve almost all disputes directly.
        </p>
      </section>
    </LegalPage>
  )
}
