export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">Privacy Policy</h1>
      <div className="prose prose-invert max-w-none space-y-6 text-forge-muted text-sm leading-relaxed">
        <p><strong>Last updated:</strong> April 2, 2026</p>

        <h2 className="text-xl font-bold text-white mt-8 mb-3">1. Information We Collect</h2>
        <p>We collect information you provide directly, including: company name, contact information, website URLs, entity details, and compliance-related data submitted through our forms.</p>

        <h2 className="text-xl font-bold text-white mt-8 mb-3">2. How We Use Information</h2>
        <p>Information is used solely to generate compliance reports, deliver them to you, and improve our Service. We do not sell, rent, or share your data with third parties except as required to process payments (NOWPayments, Payoneer) or deliver reports (email providers).</p>

        <h2 className="text-xl font-bold text-white mt-8 mb-3">3. Data Security</h2>
        <p>All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We use industry-standard security practices and regularly audit our systems.</p>

        <h2 className="text-xl font-bold text-white mt-8 mb-3">4. Data Retention</h2>
        <p>We retain your data for as long as necessary to provide the Service and comply with legal obligations. You may request deletion of your data at any time by contacting us.</p>

        <h2 className="text-xl font-bold text-white mt-8 mb-3">5. Your Rights</h2>
        <p>You have the right to access, correct, or delete your personal data. Contact us at <a href="mailto:support@bizlegal-ai.com" className="text-forge-accent">support@bizlegal-ai.com</a> to exercise these rights.</p>

        <h2 className="text-xl font-bold text-white mt-8 mb-3">6. Third-Party Services</h2>
        <p>We use the following third-party services: NOWPayments (crypto payments), Payoneer (card payments), Resend (email delivery), Supabase (database), and Anthropic (AI analysis). Each has their own privacy policies.</p>

        <h2 className="text-xl font-bold text-white mt-8 mb-3">7. Cookies</h2>
        <p>We use essential cookies for Service functionality. We do not use tracking or advertising cookies.</p>

        <h2 className="text-xl font-bold text-white mt-8 mb-3">8. Children&apos;s Privacy</h2>
        <p>The Service is not intended for individuals under 18. We do not knowingly collect data from children.</p>

        <h2 className="text-xl font-bold text-white mt-8 mb-3">9. Changes</h2>
        <p>We may update this Privacy Policy. We will notify you of material changes via email or prominent notice on the Service.</p>

        <h2 className="text-xl font-bold text-white mt-8 mb-3">10. Contact</h2>
        <p>Privacy questions: <a href="mailto:support@bizlegal-ai.com" className="text-forge-accent">support@bizlegal-ai.com</a></p>
      </div>
    </div>
  )
}
