export default function SettingsPage() {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: 'clamp(2rem, 4vw, 3rem) 1.5rem' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Settings</h1>

      {/* Incoming email setup */}
      <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 6px' }}>📥 Set up incoming mail logging</h2>
        <p style={{ color: '#6b7280', fontSize: 14, margin: '0 0 20px', lineHeight: 1.65 }}>
          Set up a Gmail filter to automatically forward your co-parent&apos;s emails to CoGuard for logging. You only need to do this once. Your inbox alias is shown below — copy it for the filter.
        </p>

        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 600, margin: '0 0 8px', color: '#374151' }}>Your CoGuard inbox address</p>
          <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>Go to Settings → Subscription → Inbox Alias to see your personalized forwarding address.</p>
        </div>

        <ol style={{ padding: '0 0 0 20px', margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            'In Gmail, go to Settings (gear icon) → See all settings → Filters and Blocked Addresses',
            'Click "Create a new filter"',
            'In the "From" field, enter your co-parent\'s email address',
            'Click "Create filter"',
            'Check "Forward it to" and enter your CoGuard inbox address',
            'Click "Create filter" — done. All future emails from them will be auto-forwarded to CoGuard',
          ].map((step, i) => (
            <li key={i} style={{ fontSize: 14, color: '#374151', lineHeight: 1.6 }}>{step}</li>
          ))}
        </ol>
      </section>

      {/* Disclaimer */}
      <section style={{ border: '1px solid #fef3c7', background: '#fffbeb', borderRadius: 10, padding: 20 }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 700, color: '#92400e' }}>Privacy & legal note</h3>
        <p style={{ margin: 0, fontSize: 13, color: '#78350f', lineHeight: 1.65 }}>
          CoGuard receives mail that you forward from your own inbox — the same way services like Zapier or email automation tools work. The co-parent&apos;s message reaches your inbox first (its intended destination), and you then auto-forward a copy to CoGuard for documentation. Always consult a licensed attorney about admissibility requirements in your jurisdiction.
        </p>
      </section>
    </main>
  )
}
