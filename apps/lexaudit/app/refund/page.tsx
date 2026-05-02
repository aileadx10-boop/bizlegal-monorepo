import type { Metadata } from "next"
import LegalPage from "@/components/layout/LegalPage"

export const metadata: Metadata = {
  title: "Refunds — LexAudit",
  description:
    "LexAudit refund policy. Subscriptions cancellable anytime; one-time certificates non-refundable once produced unless damaged or demonstrably defective.",
  alternates: { canonical: "/refund" },
}

export default function RefundPage() {
  return (
    <LegalPage
      title="Refunds & cancellation."
      intro="LexAudit sells two product shapes: monthly compliance subscriptions (Solo, Boutique, Mid-Market) and one-time Compliance Health Score certificates. The policy below sets out how each is refunded."
    >
      <section>
        <h2 className="lp-h2">1. Subscriptions — cancel anytime.</h2>
        <p>
          You can cancel any LexAudit subscription at any time. Cancellation stops future billing immediately.
          Access to matters, certificates, and the firm dashboard remains active until the end of the period you
          have already paid for. We do not pro-rate or refund mid-period unless we are at fault for an outage that
          prevented you from using the product.
        </p>
      </section>

      <section>
        <h2 className="lp-h2">2. One-time certificates — non-refundable once produced.</h2>
        <p>
          Compliance Health Score certificates are non-refundable once we have produced and delivered the
          tamper-evident snapshot. Once analyst time and reviewer signoff have been spent on your matter, that cost
          cannot be returned.
        </p>
        <p>
          Two exceptions apply, and we honour them in full:
        </p>
        <ul>
          <li>
            <strong>Damaged delivery</strong> — certificate file is corrupted, unreadable, or missing material
            content (signal scoreboard, reviewer name, SHA-256 hash).
          </li>
          <li>
            <strong>Demonstrably defective output</strong> — wrong matter, wrong framework selection, wrong reviewer,
            or factual error in the rationale that the named human reviewer can confirm.
          </li>
        </ul>
        <p>
          We attempt redelivery first. If the corrected certificate still fails specification, we issue a full
          refund.
        </p>
      </section>

      <section>
        <h2 className="lp-h2">3. Pre-delivery cancellation.</h2>
        <p>
          If we have not yet started production on your one-time certificate, you can cancel and receive a full
          refund. Certificates begin production within 24 hours of payment confirmation; once started, the order
          falls under section 2.
        </p>
      </section>

      <section>
        <h2 className="lp-h2">4. How to request.</h2>
        <p>
          Email support with the certificate ID or subscription email and a brief description of the issue. The
          human reviewer who signed off investigates first; if confirmed, redelivery or refund follows within 10
          business days.
        </p>
      </section>

      <section>
        <h2 className="lp-h2">5. Crypto + chargebacks.</h2>
        <p>
          NOWPayments transactions that have already finalised on-chain cannot be reversed. Where a refund is
          approved, we issue it in the original cryptocurrency at the prevailing rate or as a credit toward future
          LexAudit work. Please contact us before opening a chargeback — we resolve almost all disputes directly.
        </p>
      </section>
    </LegalPage>
  )
}
