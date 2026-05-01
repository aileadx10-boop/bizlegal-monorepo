'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const EU_DPAS = [
  { country: 'Austria', authority: 'Datenschutzbehörde (DSB)', url: 'https://www.dsb.gv.at' },
  { country: 'Belgium', authority: 'Autorité de protection des données', url: 'https://www.autoriteprotectiondonnees.be' },
  { country: 'Bulgaria', authority: 'Commission for Personal Data Protection', url: 'https://www.cpdp.bg' },
  { country: 'Croatia', authority: 'Agencija za zaštitu osobnih podataka', url: 'https://azop.hr' },
  { country: 'Cyprus', authority: 'Office of the Commissioner for Personal Data Protection', url: 'https://www.dataprotection.gov.cy' },
  { country: 'Czech Republic', authority: 'Úřad pro ochranu osobních údajů', url: 'https://www.uoou.cz' },
  { country: 'Denmark', authority: 'Datatilsynet', url: 'https://www.datatilsynet.dk' },
  { country: 'Estonia', authority: 'Andmekaitse Inspektsioon', url: 'https://www.aki.ee' },
  { country: 'Finland', authority: 'Tietosuojavaltuutetun toimisto', url: 'https://tietosuoja.fi' },
  { country: 'France', authority: 'Commission Nationale de l\'Informatique (CNIL)', url: 'https://www.cnil.fr' },
  { country: 'Germany', authority: 'Bundesbeauftragte für den Datenschutz (BfDI)', url: 'https://www.bfdi.bund.de' },
  { country: 'Greece', authority: 'Hellenic Data Protection Authority', url: 'https://www.dpa.gr' },
  { country: 'Hungary', authority: 'Nemzeti Adatvédelmi Hatóság (NAIH)', url: 'https://www.naih.hu' },
  { country: 'Ireland', authority: 'Data Protection Commission (DPC)', url: 'https://www.dataprotection.ie' },
  { country: 'Italy', authority: 'Garante per la protezione dei dati personali', url: 'https://www.garanteprivacy.it' },
  { country: 'Latvia', authority: 'Datu valsts inspekcija (DVI)', url: 'https://www.dvi.gov.lv' },
  { country: 'Lithuania', authority: 'Valstybinė duomenų apsaugos inspekcija', url: 'https://vdai.lrv.lt' },
  { country: 'Luxembourg', authority: 'Commission nationale pour la protection des données', url: 'https://cnpd.public.lu' },
  { country: 'Malta', authority: 'Information and Data Protection Commissioner', url: 'https://idpc.org.mt' },
  { country: 'Netherlands', authority: 'Autoriteit Persoonsgegevens', url: 'https://www.autoriteitpersoonsgegevens.nl' },
  { country: 'Poland', authority: 'Urząd Ochrony Danych Osobowych (UODO)', url: 'https://uodo.gov.pl' },
  { country: 'Portugal', authority: 'Comissão Nacional de Proteção de Dados', url: 'https://www.cnpd.pt' },
  { country: 'Romania', authority: 'Autoritatea Naţională de Supraveghere (ANSPDCP)', url: 'https://www.dataprotection.ro' },
  { country: 'Slovakia', authority: 'Úrad na ochranu osobných údajov SR', url: 'https://dataprotection.gov.sk' },
  { country: 'Slovenia', authority: 'Informacijski pooblaščenec', url: 'https://www.ip-rs.si' },
  { country: 'Spain', authority: 'Agencia Española de Protección de Datos (AEPD)', url: 'https://www.aepd.es' },
  { country: 'Sweden', authority: 'Integritetsskyddsmyndigheten (IMY)', url: 'https://www.imy.se' },
]

function pad(n: number) { return String(n).padStart(2, '0') }

export default function GdprBreachTimer() {
  const [discoveryDate, setDiscoveryDate] = useState('')
  const [discoveryTime, setDiscoveryTime] = useState('09:00')
  const [countdown, setCountdown] = useState<{ hours: number; minutes: number; seconds: number; total: number } | null>(null)

  useEffect(() => {
    if (!discoveryDate) return
    const deadline = new Date(`${discoveryDate}T${discoveryTime}:00`).getTime() + 72 * 3_600_000
    const tick = () => {
      const remaining = deadline - Date.now()
      if (remaining <= 0) { setCountdown({ hours: 0, minutes: 0, seconds: 0, total: 0 }); return }
      setCountdown({
        hours: Math.floor(remaining / 3_600_000),
        minutes: Math.floor((remaining % 3_600_000) / 60_000),
        seconds: Math.floor((remaining % 60_000) / 1000),
        total: remaining,
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [discoveryDate, discoveryTime])

  const isUrgent = countdown && countdown.total > 0 && countdown.total < 12 * 3_600_000
  const isExpired = countdown && countdown.total <= 0

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 32px' }}>
      <span className="section-label">GDPR · Tool</span>
      <h1 style={{ marginBottom: 8, fontSize: 'clamp(28px,5vw,48px)' }}>GDPR Breach Notification Timer</h1>
      <p style={{ color: 'var(--on-surface-var)', marginBottom: 40 }}>
        Article 33 GDPR requires notification to the competent supervisory authority within 72 hours of becoming aware of a personal data breach.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--outline)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Discovery Date</label>
          <input type="date" value={discoveryDate} onChange={e => setDiscoveryDate(e.target.value)}
            style={{ width: '100%', background: 'var(--bg-mid)', border: '0.5px solid var(--outline-var)', padding: '10px 12px', color: 'var(--on-surface)', fontSize: 14, fontFamily: 'Manrope, sans-serif', outline: 'none' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--outline)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Discovery Time</label>
          <input type="time" value={discoveryTime} onChange={e => setDiscoveryTime(e.target.value)}
            style={{ width: '100%', background: 'var(--bg-mid)', border: '0.5px solid var(--outline-var)', padding: '10px 12px', color: 'var(--on-surface)', fontSize: 14, fontFamily: 'Manrope, sans-serif', outline: 'none' }} />
        </div>
      </div>

      {countdown && (
        <div style={{ textAlign: 'center', marginBottom: 40, padding: '28px',
          background: isExpired ? 'rgba(248,113,113,0.1)' : isUrgent ? 'rgba(233,195,73,0.08)' : 'var(--bg-low)',
          border: `0.5px solid ${isExpired ? 'rgba(248,113,113,0.3)' : isUrgent ? 'rgba(233,195,73,0.3)' : 'var(--outline-var)'}` }}>
          {isExpired ? (
            <div style={{ fontFamily: 'Newsreader, serif', fontSize: 28, color: '#f87171', fontWeight: 700 }}>DEADLINE PASSED — NOTIFY DPA IMMEDIATELY</div>
          ) : (
            <>
              <div style={{ fontSize: 10, fontWeight: 700, color: isUrgent ? '#e9c349' : 'var(--outline)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 16 }}>
                {isUrgent ? 'URGENT — ' : ''}Time Remaining to Notify Supervisory Authority
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 32 }}>
                {([['HOURS', countdown.hours], ['MINUTES', countdown.minutes], ['SECONDS', countdown.seconds]] as [string, number][]).map(([label, val]) => (
                  <div key={label} style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Newsreader, serif', fontSize: 56, fontWeight: 700, color: isUrgent ? '#e9c349' : 'var(--primary)', lineHeight: 1 }}>{pad(val)}</div>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', color: 'var(--outline)' }}>{label}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <div>
        <span className="section-label">All 27 EU Supervisory Authorities</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 1, marginTop: 8 }}>
          {EU_DPAS.map(dpa => (
            <div key={dpa.country} className="card" style={{ padding: '10px 12px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--on-surface)', marginBottom: 2 }}>{dpa.country}</div>
              <div style={{ fontSize: 10, color: 'var(--outline)', marginBottom: 4, lineHeight: 1.4 }}>{dpa.authority}</div>
              <a href={dpa.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, color: 'var(--primary)' }}>{dpa.url.replace('https://', '')} →</a>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 32 }}>
        <Link href="/regulations/gdpr" style={{ fontSize: 12, color: 'var(--primary)' }}>Read the GDPR Compliance Hub →</Link>
      </div>
    </div>
  )
}
