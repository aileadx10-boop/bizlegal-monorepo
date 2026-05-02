export default function RefundPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@300;400;500&family=Playfair+Display:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #0b1326; color: #dae2fd; }
        .prose h2 { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: #dae2fd; margin: 32px 0 12px; }
        .prose p, .prose li { font-size: 15px; color: rgba(218,226,253,0.7); line-height: 1.8; margin-bottom: 12px; }
        .prose ul { padding-left: 20px; }
        .prose a { color: #b3c5ff; }
      `}</style>

      <nav style={{
        position: 'fixed', top: 0, width: '100%', zIndex: 50,
        background: 'rgba(11,19,38,0.9)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(218,226,253,0.08)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 32px', height: 64,
      }}>
        <a href="/" style={{
          fontFamily: 'Playfair Display, serif', fontWeight: 800, fontSize: 18,
          background: 'linear-gradient(135deg, #b3c5ff, #6288ff)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>DocAI Hub</a>
        <a href="https://bizlegal-ai.com" style={{ fontSize: 13, fontWeight: 600, color: 'rgba(218,226,253,0.55)' }}>← Back to BizLegal AI</a>
      </nav>

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '96px 32px 80px' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 36, fontWeight: 800, marginBottom: 8 }}>Refund Policy</h1>
        <p style={{ fontSize: 13, color: 'rgba(218,226,253,0.4)', marginBottom: 40 }}>Last updated: April 2026</p>

        <div className="prose">
          <h2>1. Subscriptions — cancel anytime</h2>
          <p>
            DocAI subscriptions (Starter, Team, Firm) can be cancelled at any time. Cancellation stops future
            billing immediately. Access to scans, drafts, and SQA generation continues until the end of the period
            you have already paid for. We do not pro-rate or refund mid-period unless we are at fault for an outage
            that prevented you from using the product.
          </p>

          <h2>2. One-time deliveries — non-refundable once produced</h2>
          <p>
            Document scans, contract drafts, redlines, SQA responses, and other one-time intelligence outputs are
            non-refundable once we have produced and delivered the file. Once analyst time and compute have been
            spent on your inputs, that cost cannot be returned to us.
          </p>
          <p>Two exceptions apply, and we honour them in full:</p>
          <ul>
            <li>
              <strong>Damaged delivery</strong> — file is corrupted, unreadable, or missing material content.
            </li>
            <li>
              <strong>Demonstrably defective output</strong> — wrong document analysed, wrong framework selected
              (SOC 2 vs CAIQ vs SIG-Lite), or factual error confirmed against the cited sources.
            </li>
          </ul>
          <p>
            We attempt redelivery first. If the corrected output still fails specification, we issue a full refund.
          </p>

          <h2>3. Pre-delivery cancellation</h2>
          <p>
            If we have not yet started production on your one-time order, you can cancel and receive a full refund.
            Most DocAI deliveries begin within minutes of payment confirmation; once started, the order falls under
            section 2.
          </p>

          <h2>4. Free tier</h2>
          <p>
            Free SQA drafts and free contract scans are provided at no cost; no refund applies.
          </p>

          <h2>5. Crypto + chargebacks</h2>
          <p>
            NOWPayments transactions that have already finalised on-chain cannot be reversed. Where a refund is
            approved, we issue it in the original cryptocurrency at the prevailing rate or as a credit toward future
            DocAI work. Please contact us before opening a chargeback — we resolve almost all disputes directly.
          </p>

          <h2>6. How to request</h2>
          <p>
            Email <a href="mailto:team@bizlegal-ai.com">team@bizlegal-ai.com</a> with your order ID and a brief
            description of the issue. Refunds approved under sections 2 or 3 are processed within 5 business days
            to the original payment method.
          </p>

          <h2>Contact</h2>
          <p>
            BizLegal AI<br />
            Email: <a href="mailto:team@bizlegal-ai.com">team@bizlegal-ai.com</a>
          </p>
        </div>

        <div style={{ borderTop: '1px solid rgba(218,226,253,0.08)', marginTop: 40, paddingTop: 20, display: 'flex', justifyContent: 'space-between' }}>
          <a href="/privacy" style={{ color: '#b3c5ff', fontSize: 14, textDecoration: 'none' }}>← Privacy Policy</a>
          <a href="/acceptable-use" style={{ color: '#b3c5ff', fontSize: 14, textDecoration: 'none' }}>Acceptable Use →</a>
        </div>
      </main>

      <footer style={{
        borderTop: '1px solid rgba(68,70,80,0.3)',
        background: 'rgba(6,14,32,0.8)', padding: '24px 32px', textAlign: 'center',
      }}>
        <div style={{ fontSize: 13, color: 'rgba(218,226,253,0.4)', display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' as const }}>
          <a href="/" style={{ color: 'inherit' }}>DocAI Hub</a>
          <a href="/terms" style={{ color: 'inherit' }}>Terms of Service</a>
          <a href="/privacy" style={{ color: 'inherit' }}>Privacy Policy</a>
          <a href="/disclaimer" style={{ color: 'inherit' }}>Disclaimer</a>
          <a href="/acceptable-use" style={{ color: 'inherit' }}>Acceptable Use</a>
        </div>
      </footer>
    </>
  )
}