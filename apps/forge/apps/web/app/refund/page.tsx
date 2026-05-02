export default function RefundPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">Refund Policy</h1>
      <div className="prose prose-invert max-w-none space-y-6 text-forge-muted text-sm leading-relaxed">
        <p><strong>Last updated:</strong> April 2, 2026</p>

        <h2 className="text-xl font-bold text-white mt-8 mb-3">1. Refund Eligibility</h2>
        <p>You are eligible for a full refund within 7 days of purchase if:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Our scan found no compliance issues in your website or business</li>
          <li>You are unsatisfied with the quality or completeness of the report</li>
          <li>The report was not delivered within the promised 24-hour window</li>
          <li>You accidentally purchased the wrong product</li>
        </ul>

        <h2 className="text-xl font-bold text-white mt-8 mb-3">2. How to Request a Refund</h2>
        <p>Email us at <a href="mailto:support@bizlegal-ai.com" className="text-forge-accent">support@bizlegal-ai.com</a> with your order reference ID and reason for the refund. We will process refunds within 5 business days.</p>

        <h2 className="text-xl font-bold text-white mt-8 mb-3">3. Refund Method</h2>
        <p>Refunds are issued to the original payment method. For crypto payments, refunds are issued in the same cryptocurrency at the current exchange rate. For card payments, refunds are processed through Payoneer.</p>

        <h2 className="text-xl font-bold text-white mt-8 mb-3">4. Non-Refundable Items</h2>
        <p>The following are not eligible for refunds:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Free preview scans</li>
          <li>Reports that have already been delivered and meet the described scope</li>
          <li>Requests made more than 7 days after purchase</li>
        </ul>

        <h2 className="text-xl font-bold text-white mt-8 mb-3">5. Guarantee</h2>
        <p>We stand behind our work. If a report does not meet your expectations, we will either revise it at no additional cost or provide a full refund — your choice.</p>

        <h2 className="text-xl font-bold text-white mt-8 mb-3">6. Contact</h2>
        <p>Refund questions: <a href="mailto:support@bizlegal-ai.com" className="text-forge-accent">support@bizlegal-ai.com</a></p>
      </div>
    </div>
  )
}
