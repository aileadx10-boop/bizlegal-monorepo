import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Contact', alternates: { canonical: '/contact' } }

export default function ContactPage() {
  return (
    <div className="bl-prose">
      <h1>Contact</h1>
      <p>
        BrainX is part of the BizLegal AI fleet. For support, billing questions, or a
        suppression/unsubscribe request, email <a href="mailto:team@bizlegal-ai.com">team@bizlegal-ai.com</a>.
      </p>
      <p>
        For BrainX&apos;s Radar + Build expert-review layer, written questions are answered
        asynchronously by Moses Dor, Adv. within the stated turnaround — this is not a
        booking link, and BrainX does not offer calls.
      </p>
    </div>
  )
}
