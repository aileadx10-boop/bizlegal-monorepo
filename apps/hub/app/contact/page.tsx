import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact | BizLegal AI',
  description: 'Contact BizLegal AI for enterprise inquiries, expert review requests, compliance questions, or support.',
  alternates: { canonical: 'https://bizlegal-ai.com/contact' },
}

export default function ContactPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <section style={{ padding: '80px 32px 48px', maxWidth: 800, margin: '0 auto' }}>
        <span className="section-label">Get in Touch</span>
        <h1 style={{ marginBottom: 20 }}>Contact BizLegal AI</h1>
        <p style={{ fontSize: 16, lineHeight: 1.8, maxWidth: 560 }}>
          Use the form below or email us directly at{' '}
          <a href="mailto:team@bizlegal-ai.com" style={{ color: 'var(--primary)' }}>team@bizlegal-ai.com</a>.
          We respond within one business day.
        </p>
      </section>

      <section style={{ maxWidth: 800, margin: '0 auto', padding: '0 32px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'start' }}>
          {/* Form — W4.1: posts to /api/contact which fan-outs to the
              OCI deal-router (HMAC-signed) AND to Formspree, then
              redirects to /contact/thank-you. The classifier on the
              router-side decides if this becomes a partner referral. */}
          <form
            action="/api/contact"
            method="POST"
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--secondary)', display: 'block', marginBottom: 6 }}>Name</label>
              <input name="name" required placeholder="Your name" className="input" />
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--secondary)', display: 'block', marginBottom: 6 }}>Email</label>
              <input name="email" type="email" required placeholder="you@company.com" className="input" />
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--secondary)', display: 'block', marginBottom: 6 }}>Subject</label>
              <select name="subject" className="input" style={{ cursor: 'pointer', appearance: 'none' }}>
                <option value="">Select topic</option>
                <option value="partnership">Partnership &amp; bulk</option>
                <option value="expert-review">Expert review request</option>
                <option value="compliance">Compliance question</option>
                <option value="support">Product support</option>
                <option value="enterprise">Enterprise inquiry</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--secondary)', display: 'block', marginBottom: 6 }}>Message</label>
              <textarea name="message" required placeholder="Describe your question or request" rows={5} className="input" style={{ resize: 'vertical' }} />
            </div>
            <button type="submit" className="btn-cta" style={{ justifyContent: 'center' }}>
              Send Message →
            </button>
          </form>

          {/* Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <div className="section-label">Direct Email</div>
              <a href="mailto:team@bizlegal-ai.com" style={{ fontSize: 15, color: 'var(--on-surface)', fontWeight: 600 }}>team@bizlegal-ai.com</a>
            </div>
            <div>
              <div className="section-label">Response Time</div>
              <p style={{ fontSize: 14 }}>One business day for standard inquiries. Expert review requests are acknowledged within 4 hours.</p>
            </div>
            <div>
              <div className="section-label">Partnerships</div>
              <p style={{ fontSize: 14 }}>Custom pricing, white-label licensing, and API access available for teams. Email us with your requirements.</p>
            </div>
            <div>
              <div className="section-label">Support Hours</div>
              <p style={{ fontSize: 14 }}>Monday to Friday, 9am to 6pm CET. Emergency support for active litigation clients on request.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
