import { assertToneSafe, toneSafeOrDefault } from '@/lib/tone'
import { predict } from '@/lib/predict'

export default function HomePage() {
  const headline = toneSafeOrDefault('Compliance rhythm, without the guilt.', 'Compliance rhythm tracker for law firms.')
  const demo = predict({ id: 'x1', obligationType: 'Trust recon', lastEventAt: new Date().toISOString(), intervalDays: 90, jurisdiction: 'US' }, new Date(Date.now() - 10 * 86_400_000).toISOString())
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 720, margin: '3rem auto', padding: '0 1rem' }}>
      <h1>{headline}</h1>
      <p>Days since your last obligation. Predicted due when it actually matters. Estimate — verify against jurisdiction rules.</p>
      <h2>Demo</h2>
      <p>Days since: {demo.daysSince}</p>
      <p>Predicted due: {demo.predictedDue ? new Date(demo.predictedDue).toDateString() : 'n/a'}</p>
      <p style={{ color: '#555', fontStyle: 'italic' }}>{demo.disclaimer}</p>
      <p style={{ fontSize: '0.8rem', color: '#888' }}>Not legal advice. No outcome guarantees.</p>
    </main>
  )
}
