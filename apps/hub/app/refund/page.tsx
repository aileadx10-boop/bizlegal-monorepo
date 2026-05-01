import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Refund Policy',
  description:
    'BizLegal AI refund policy: cancel subscriptions anytime; one-time intelligence reports are non-refundable once produced, except where the delivery is damaged or demonstrably defective.',
}

export default function RefundPage() {
  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '80px 32px 120px' }}>
      <div style={{ marginBottom: 56 }}>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--gold)',
            marginBottom: 20,
          }}
        >
          Legal — Refund Policy
        </div>
        <h1 className="quantum-h2" style={{ marginBottom: 16, color: 'var(--white)' }}>
          Refund &amp; Cancellation Policy
        </h1>
        <p style={{ fontSize: 15, color: 'var(--on-surface-var)', lineHeight: 1.7, marginBottom: 16 }}>
          BizLegal AI sells two product shapes: <strong style={{ color: 'var(--white)' }}>recurring intelligence
          subscriptions</strong> (monthly, yearly) and <strong style={{ color: 'var(--white)' }}>one-time
          intelligence deliveries</strong> (reports, certificates, scans, drafts). The policy below sets out how
          refunds work for each.
        </p>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--muted)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          Last updated: April 2026
        </div>
      </div>

      <div className="quantum-divider" style={{ marginBottom: 48 }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
        <section>
          <h2 style={sectionH}>
            1. Subscriptions — cancel anytime, access runs out the period
          </h2>
          <p style={sectionP}>
            You can cancel any recurring subscription at any time, for any reason. Cancellation stops <em>future</em>{' '}
            billing immediately. Access to the product remains active until the end of the period you have already
            paid for — we do not pro-rate or refund mid-period unless we are at fault for an outage that prevents
            you from using the product.
          </p>
          <p style={sectionP}>
            To cancel, email{' '}
            <a href="mailto:billing@bizlegal-ai.com" style={{ color: 'var(--primary)' }}>billing@bizlegal-ai.com</a>{' '}
            from the address on file with your order ID, or use the cancel link inside the most recent invoice
            email. We confirm cancellation within 1 business day. If your next renewal has already started
            processing on the day you ask to cancel, we honour the cancellation as if received the day before the
            renewal — you are not charged again.
          </p>
        </section>

        <section>
          <h2 style={sectionH}>2. One-time deliveries — non-refundable once produced</h2>
          <p style={sectionP}>
            Reports, scans, certificates, drafts, and other one-time intelligence outputs are{' '}
            <strong style={{ color: 'var(--white)' }}>non-refundable once we have produced and delivered the
            output</strong>. The work is bespoke; once analyst time and compute have been spent on your inputs, that
            cost cannot be returned to us.
          </p>
          <p style={sectionP}>
            Two exceptions apply, and we honour them in full:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
            {[
              'Damaged delivery — the file is corrupted, unreadable, or missing material content.',
              'Demonstrably defective output — the output deviates from what was specified at checkout (wrong jurisdiction, wrong framework, wrong entity), or contains a factual error that we confirm on review.',
            ].map((item) => (
              <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ color: 'var(--accent)', fontSize: 12, marginTop: 2, flexShrink: 0 }}>✓</span>
                <span style={{ fontSize: 14, color: 'var(--on-surface-var)', lineHeight: 1.65 }}>{item}</span>
              </div>
            ))}
          </div>
          <p style={{ ...sectionP, marginTop: 14 }}>
            In both cases we will first attempt to redeliver a corrected version. If the corrected output still
            fails to meet the specification, we issue a full refund.
          </p>
        </section>

        <section>
          <h2 style={sectionH}>3. Pre-delivery cancellations</h2>
          <p style={sectionP}>
            If we have not yet started production on your one-time order, you can cancel and receive a full refund.
            For most reports we begin work within 24 hours; once started, the order falls under section 2 above.
            Email us at{' '}
            <a href="mailto:billing@bizlegal-ai.com" style={{ color: 'var(--primary)' }}>billing@bizlegal-ai.com</a>{' '}
            with your order ID — we confirm whether work has started before treating the request as a cancellation.
          </p>
        </section>

        <section>
          <h2 style={sectionH}>4. What is never refunded</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              'Past billing periods on cancelled subscriptions (you keep access through the end of the paid period instead).',
              'One-time deliveries that have been produced and delivered, where the output meets the specification at checkout (subjective dissatisfaction is not a defect).',
              'Cryptocurrency transactions where the chain has finalised and the funds have been swept — we cannot reverse the chain. Where reversal is possible, we cooperate fully.',
              'Repeat-pattern refund requests across multiple orders may be declined as abuse of policy.',
            ].map((item) => (
              <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ color: 'var(--danger)', fontSize: 12, marginTop: 2, flexShrink: 0 }}>✕</span>
                <span style={{ fontSize: 14, color: 'var(--on-surface-var)', lineHeight: 1.65 }}>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 style={sectionH}>5. Disputes &amp; chargebacks</h2>
          <p style={sectionP}>
            Please contact us before opening a chargeback. We respond to billing queries within 2 business days and
            in our experience the issue is almost always resolvable directly. Chargebacks raised without first
            contacting us may result in account suspension while we work through the dispute with the card network.
          </p>
        </section>

        <section>
          <h2 style={sectionH}>6. Contact</h2>
          <p style={sectionP}>
            All refund and cancellation requests:{' '}
            <a href="mailto:billing@bizlegal-ai.com" style={{ color: 'var(--primary)' }}>
              billing@bizlegal-ai.com
            </a>
            . Please include your order ID and the email used for purchase.
          </p>
        </section>
      </div>

      <div className="quantum-divider" style={{ margin: '56px 0 32px' }} />
      <div style={{ display: 'flex', gap: 20 }}>
        <Link
          href="/terms"
          style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'none', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}
        >
          ← Terms of Use
        </Link>
        <Link
          href="/acceptable-use"
          style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'none', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}
        >
          Acceptable Use →
        </Link>
      </div>
    </main>
  )
}

const sectionH: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 22,
  color: 'var(--white)',
  marginBottom: 16,
  fontWeight: 400,
}

const sectionP: React.CSSProperties = {
  fontSize: 14,
  color: 'var(--on-surface-var)',
  lineHeight: 1.75,
  marginBottom: 12,
}
