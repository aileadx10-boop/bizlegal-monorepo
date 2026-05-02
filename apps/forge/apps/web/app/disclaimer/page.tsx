export default function DisclaimerPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">Disclaimer</h1>
      <div className="prose prose-invert max-w-none space-y-6 text-forge-muted text-sm leading-relaxed">
        <p><strong>Last updated:</strong> April 2, 2026</p>

        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 mb-8">
          <p className="text-red-400 font-bold text-lg mb-2">⚠️ IMPORTANT: NOT LEGAL ADVICE</p>
          <p className="text-red-300">
            Forge Compliance Engine publishes <strong>regulatory intelligence</strong>, not legal advice.
            Reports are practitioner-reviewed analysis of publicly available regulatory information and are for
            <strong> informational purposes only</strong>.
          </p>
        </div>

        <h2 className="text-xl font-bold text-white mt-8 mb-3">1. No Attorney-Client Relationship</h2>
        <p>Use of this Service does not create an attorney-client relationship. We are not a law firm and do not provide legal services. For legal advice, consult a licensed attorney in your jurisdiction.</p>

        <h2 className="text-xl font-bold text-white mt-8 mb-3">2. Machine-Assisted, Practitioner-Reviewed Output</h2>
        <p>Our reports use machine-assisted analysis to summarize and interpret publicly available regulatory information. Every report passes a named practitioner reviewer before delivery, who verifies sources and flags uncertainty. Even with review, regulatory texts evolve and isolated errors or omissions are possible. Always verify critical compliance information with qualified legal counsel in your jurisdiction.</p>

        <h2 className="text-xl font-bold text-white mt-8 mb-3">3. No Regulatory Reliance</h2>
        <p>Reports should not be relied upon as the sole basis for compliance decisions. Regulatory frameworks change frequently. Our analysis reflects the regulatory landscape at the time of generation and may not account for recent changes.</p>

        <h2 className="text-xl font-bold text-white mt-8 mb-3">4. Limitation of Liability</h2>
        <p>Forge Compliance Engine and BizLegal AI shall not be liable for any damages, penalties, or losses arising from use of the Service, including but not limited to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Regulatory fines or penalties</li>
          <li>Legal costs or litigation expenses</li>
          <li>Business losses or reputational harm</li>
          <li>Data breaches or security incidents</li>
        </ul>

        <h2 className="text-xl font-bold text-white mt-8 mb-3">5. Accuracy of Information</h2>
        <p>While we make reasonable efforts to ensure accuracy, we make no warranties about the completeness, reliability, or suitability of the information provided. Regulatory requirements vary by jurisdiction and change over time.</p>

        <h2 className="text-xl font-bold text-white mt-8 mb-3">6. Third-Party Links</h2>
        <p>Reports may contain links to third-party websites or resources. We are not responsible for the content or practices of any third-party sites.</p>

        <h2 className="text-xl font-bold text-white mt-8 mb-3">7. Acceptable Use</h2>
        <p>You may not use the Service to: (a) evade regulatory obligations, (b) mislead regulators or third parties, (c) generate fraudulent compliance documentation, or (d) any unlawful purpose.</p>

        <h2 className="text-xl font-bold text-white mt-8 mb-3">8. Contact</h2>
        <p>Questions about this disclaimer: <a href="mailto:support@bizlegal-ai.com" className="text-forge-accent">support@bizlegal-ai.com</a></p>
      </div>
    </div>
  )
}
