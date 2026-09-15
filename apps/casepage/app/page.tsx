import { GALLERY_SEEDS } from '@/data/gallery'

export default function HomePage() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 720, margin: '3rem auto', padding: '0 1rem' }}>
      <h1>CasePage — client-facing matter pages for law firms</h1>
      <p>Spin up a beautiful, live matter-status page in minutes. Milestones, timeline, doc checklist, next-hearing countdown.</p>
      <h2>Pricing</h2>
      <ul>
        <li>Solo — $49/mo (10 pages, standard themes, milestone widget)</li>
        <li>Firm — $149/mo (unlimited pages, white-label, AI summaries with human approval gate, audio narration)</li>
        <li>Setup — $490 one-time (template pack + branding + widget install)</li>
        <li>Lifetime — $290 one-time (Firm plan, lifetime)</li>
      </ul>
      <p style={{ fontSize: '0.8rem', color: '#888' }}>Decision support — not legal advice. No outcome guarantees.</p>
      <h3>Waitlist</h3>
      <form action="/api/waitlist" method="post">
        <input name="email" type="email" placeholder="you@firm.com" required />
        <input name="firm_size" placeholder="Firm size" />
        <input name="current_tool" placeholder="Current tool" />
        <input name="why_now" placeholder="Why now?" />
        <button type="submit">Join waitlist</button>
      </form>
    </main>
  )
}
