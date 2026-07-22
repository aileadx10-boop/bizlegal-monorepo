'use client'
import { useState } from 'react'
import Link from 'next/link'

const QUESTIONS = [
  { id: 'q1', text: 'Does the token reference the value of one or more other assets, currencies, or commodities?' },
  { id: 'q2', text: 'Does the token reference a single official currency only (e.g. EUR, USD)?' },
  { id: 'q3', text: 'Is the token used primarily as a means of exchange within a limited network?' },
  { id: 'q4', text: 'Is the token freely transferable to third parties outside the issuing ecosystem?' },
  { id: 'q5', text: 'Does the token grant rights to future services or platform access?' },
  { id: 'q6', text: 'Was the token issued by a credit institution or regulated e-money institution?' },
  { id: 'q7', text: 'Does the token derive its value from decentralised consensus with no identifiable issuer?' },
  { id: 'q8', text: 'Is the token unique and non-fungible (NFT) with no identical counterparts?' },
]

type Answers = Record<string, boolean>

function classify(a: Answers): { type: string; desc: string; color: string } {
  if (a.q8) return { type: 'Outside MiCA Scope — NFT', desc: 'Unique and non-fungible tokens are generally excluded from MiCA scope per Recital 10. If issued in large fungible series or fractionalized, re-assess. Engage legal counsel to confirm.', color: '#10B981' }
  if (a.q7) return { type: 'Outside MiCA Scope — Decentralised', desc: 'Fully decentralised crypto-assets with no identifiable issuer may fall outside MiCA. ESMA has confirmed case-by-case analysis is required. Obtain formal legal opinion before offering to EU investors.', color: '#10B981' }
  if (a.q2 && !a.q1) return { type: 'E-Money Token (EMT)', desc: 'Tokens referencing a single official currency qualify as EMTs under MiCA Title IV. Issuers must be authorised credit institutions or e-money institutions. Whitepaper required; no advance NCA approval needed.', color: '#b4c5ff' }
  if (a.q1 && !a.q2) return { type: 'Asset-Referenced Token (ART)', desc: 'Tokens referencing multiple assets qualify as ARTs under MiCA Title III. ARTs require NCA prior authorisation, reserve asset requirements, and strict governance. The most stringent MiCA category.', color: '#f87171' }
  if (!a.q4 || (a.q5 && !a.q1 && !a.q2)) return { type: 'Utility Token — Art. 4(3) Exemption', desc: 'Tokens with limited transferability or providing access rights may qualify for the Article 4(3) utility token exemption. A simplified whitepaper notification is still required. Verify limited network criteria carefully.', color: '#e9c349' }
  return { type: 'Other Crypto-Asset (MiCA Title II)', desc: 'This token falls within MiCA as an "other crypto-asset" under Title II. A whitepaper must be notified to the NCA and published at least 20 working days before the public offering. No advance NCA approval required.', color: '#b4c5ff' }
}

export default function MicaAssetClassifier() {
  const [answers, setAnswers] = useState<Answers>({})
  const [step, setStep] = useState(0)

  const currentQ = QUESTIONS[step]
  const allAnswered = step >= QUESTIONS.length
  const result = allAnswered ? classify(answers) : null

  const answer = (val: boolean) => {
    const newAnswers = { ...answers, [currentQ.id]: val }
    setAnswers(newAnswers)
    setStep(s => s + 1)
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '48px 32px' }}>
      <span className="section-label">MiCA · Tool</span>
      <h1 style={{ marginBottom: 8, fontSize: 'clamp(28px,5vw,48px)' }}>MiCA Asset Classifier</h1>
      <p style={{ color: 'var(--on-surface-var)', marginBottom: 40 }}>
        8-question decision tree to classify your token under Regulation (EU) 2023/1114 — Markets in Crypto-Assets.
      </p>

      <div className="progress-track" style={{ marginBottom: 32 }}>
        <div className="progress-fill" style={{ width: `${(Math.min(step, QUESTIONS.length) / QUESTIONS.length) * 100}%` }} />
      </div>

      {!allAnswered ? (
        <div>
          <div style={{ fontSize: 11, color: 'var(--outline)', marginBottom: 12 }}>Question {step + 1} of {QUESTIONS.length}</div>
          <div style={{ fontFamily: 'Newsreader, serif', fontSize: 20, color: 'var(--on-surface)', marginBottom: 32, lineHeight: 1.45 }}>
            {currentQ.text}
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => answer(true)} className="btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: 14, padding: '12px' }}>Yes</button>
            <button onClick={() => answer(false)} className="btn-ghost" style={{ flex: 1, justifyContent: 'center', fontSize: 14, padding: '12px' }}>No</button>
          </div>
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} style={{ marginTop: 16, background: 'none', border: 'none', fontSize: 12, color: 'var(--outline)', cursor: 'pointer', fontFamily: 'Manrope, sans-serif' }}>
              ← Back
            </button>
          )}
        </div>
      ) : result ? (
        <div>
          <div className="card" style={{ padding: '28px', background: 'var(--bg-mid)', borderLeft: `3px solid ${result.color}`, marginBottom: 24 }}>
            <span className="tag" style={{ color: result.color, display: 'block', marginBottom: 8 }}>MiCA Classification</span>
            <div style={{ fontFamily: 'Newsreader, serif', fontSize: 28, fontWeight: 700, color: result.color, marginBottom: 16, lineHeight: 1.2 }}>
              {result.type}
            </div>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7 }}>{result.desc}</p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
            <button onClick={() => { setAnswers({}); setStep(0) }} className="btn-ghost">Start Over</button>
            <Link href="/regulations/mica" className="btn-primary" style={{ fontSize: 13 }}>Read MiCA Hub →</Link>
          </div>
          <div style={{ padding: '24px', background: 'var(--bg-mid)', border: '1px solid var(--outline-var)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--outline)', marginBottom: 6 }}>MiCA CASP licensing + ongoing regulatory monitoring</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>BRAI Regulatory Risk Reports — from $149</div>
              <div style={{ fontSize: 12, color: 'var(--on-surface-var)', lineHeight: 1.6 }}>Counterparty risk assessment + MiCA, VARA, and GDPR compliance scoring for crypto companies.</div>
            </div>
            <a href="https://brai.bizlegal-ai.com" style={{ display: 'inline-block', background: 'var(--primary)', color: '#fff', padding: '10px 22px', borderRadius: '8px', fontWeight: 700, fontSize: '13px', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>Get a Risk Report →</a>
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Link href="/guides/mica-regulation-crypto-compliance" style={{ fontSize: 12, color: 'var(--primary)' }}>MiCA Compliance Guide →</Link>
            <Link href="/guides/vara-licensing-guide" style={{ fontSize: 12, color: 'var(--primary)' }}>VARA Licensing Guide →</Link>
            <Link href="/guides" style={{ fontSize: 12, color: 'var(--primary)' }}>All Guides →</Link>
          </div>
        </div>
      ) : null}
    </div>
  )
}
