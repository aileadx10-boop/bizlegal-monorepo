import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * Programmatic SEO (spec §4): /seo/[engine]/[entity]/[hash]
 *
 * One indexable page per detected falsehood. Keyed by the evidence row's
 * SHA-256 — the hash IS the address, so the page cannot show content that
 * doesn't match the captured record. Public-safe: engine, entity, prompt,
 * flag status, capture timestamp, and the hash itself. Full responses stay
 * behind the paid report.
 */

interface Props {
  params: { engine: string; entity: string; hash: string }
}

const ENGINE_NAMES: Record<string, string> = {
  chatgpt: 'ChatGPT (OpenAI)',
  claude: 'Claude (Anthropic)',
  perplexity: 'Perplexity',
  google_aio: 'Google AI Overviews',
}

interface SeoEvidence {
  entity: string
  engine: string
  prompt: string
  flagged: boolean
  confidence: string | null
  narrative: string | null
  sha256: string
  seq: number
  scanned_at: string
}

async function loadEvidence(hash: string): Promise<SeoEvidence | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('falseecho_evidence')
      .select('entity, engine, prompt, flagged, confidence, narrative, sha256, seq, scanned_at')
      .eq('sha256', hash)
      .eq('flagged', true)
      .maybeSingle()
    if (error || !data) return null
    return data as SeoEvidence
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const entity = decodeURIComponent(params.entity)
  const engine = ENGINE_NAMES[params.engine] ?? params.engine
  return {
    title: `Suspected AI falsehood: ${entity} on ${engine} — FalseEcho evidence`,
    description: `Hash-anchored evidence record of a suspected false claim about ${entity} returned by ${engine}, captured by FalseEcho with SHA-256 anchoring and UTC timestamp.`,
    alternates: { canonical: `https://falseecho.bizlegal-ai.com/seo/${params.engine}/${params.entity}/${params.hash}` },
  }
}

export default async function SeoEvidencePage({ params }: Props) {
  const evidence = await loadEvidence(params.hash)
  if (!evidence || evidence.engine !== params.engine) notFound()

  const engineName = ENGINE_NAMES[evidence.engine] ?? evidence.engine
  const capturedAt = new Date(evidence.scanned_at).toUTCString()

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `Suspected AI falsehood about ${evidence.entity} — ${engineName}`,
    datePublished: evidence.scanned_at,
    author: { '@type': 'Organization', name: 'FalseEcho', url: 'https://falseecho.bizlegal-ai.com' },
    about: { '@type': 'Thing', name: evidence.entity },
  }

  return (
    <section className="bl-section" style={{ paddingTop: 'clamp(3rem, 2rem + 3vw, 5rem)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <div className="bl-container-narrow">
        <span className="bl-tag" style={{ marginBottom: '1rem' }}>
          Hash-anchored evidence record
        </span>
        <h1
          style={{
            fontFamily: 'var(--bl-font-display)',
            fontSize: 'var(--bl-text-h2)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: 'var(--bl-text)',
            margin: '1rem 0',
          }}
        >
          Suspected AI falsehood: {evidence.entity}
        </h1>
        <p style={{ color: 'var(--bl-text-muted)', fontSize: 'var(--bl-text-body)', lineHeight: 1.7 }}>
          {engineName} returned an answer about <strong>{evidence.entity}</strong> that
          FalseEcho&apos;s triage flagged as a suspected falsehood
          {evidence.confidence ? ` (graded confidence: ${evidence.confidence})` : ''}.
        </p>

        <div className="bl-card" style={{ marginTop: '2rem' }}>
          <dl style={{ margin: 0, display: 'grid', gap: '1rem' }}>
            <div>
              <dt className="bl-label">Engine</dt>
              <dd style={{ margin: '4px 0 0', color: 'var(--bl-text)' }}>{engineName}</dd>
            </div>
            <div>
              <dt className="bl-label">Probe question</dt>
              <dd style={{ margin: '4px 0 0', color: 'var(--bl-text)' }}>{evidence.prompt}</dd>
            </div>
            {evidence.narrative && (
              <div>
                <dt className="bl-label">Analyst note</dt>
                <dd style={{ margin: '4px 0 0', color: 'var(--bl-text)', fontStyle: 'italic' }}>{evidence.narrative}</dd>
              </div>
            )}
            <div>
              <dt className="bl-label">Captured (UTC)</dt>
              <dd style={{ margin: '4px 0 0', color: 'var(--bl-text)', fontFamily: 'var(--bl-font-mono)' }}>{capturedAt}</dd>
            </div>
            <div>
              <dt className="bl-label">SHA-256 evidence anchor</dt>
              <dd style={{ margin: '4px 0 0', color: 'var(--bl-text)', fontFamily: 'var(--bl-font-mono)', fontSize: '0.85rem', wordBreak: 'break-all' }}>
                {evidence.sha256}
              </dd>
            </div>
          </dl>
        </div>

        <p style={{ marginTop: '2rem', color: 'var(--bl-text-subtle)', fontSize: 'var(--bl-text-small)', lineHeight: 1.7 }}>
          We publish signals, you decide. This record states what an AI answer
          engine returned at capture time — it is not legal advice and makes
          no defamation determination. Engines change answers constantly; the
          hash above anchors exactly what was captured.{' '}
          <a href="/scan" style={{ color: 'var(--bl-accent)' }}>Run your own exposure check →</a>
        </p>
      </div>
    </section>
  )
}
