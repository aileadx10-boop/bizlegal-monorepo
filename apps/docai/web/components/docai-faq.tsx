/**
 * DocAI FAQ — user-facing questions, not the dev-architecture FAQ that
 * lived inside HomeExperience pre-pivot.
 *
 * Pinned at the bottom of the homepage above the SiteShell footer.
 * Answers tagged with the relevant legal-shield page where appropriate
 * so each Q&A pulls users into the supporting documentation.
 */

const FAQ: ReadonlyArray<{
  q: string
  a: string
  link?: { label: string; href: string }
}> = [
  {
    q: 'How accurate is DocAI compared to a human attorney?',
    a: 'DocAI is regulatory intelligence + drafting — not legal opinion. Every output is reviewed by a licensed attorney during our Friday practitioner-review pass and stamped with the citations behind every claim. For a binding opinion in your jurisdiction, escalate the result to your own counsel before signing.',
    link: { label: 'Read the methodology', href: '/methodology' },
  },
  {
    q: 'Do you store my contracts?',
    a: 'Scan rows are persisted to the BizLegal Supabase project so the gated report URL stays reachable and the payment unlock works reliably. Browser memory clears at the end of your session. No third-party training: your documents never leave our infrastructure for AI training.',
    link: { label: 'Trust + data handling', href: '/trust' },
  },
  {
    q: 'Which jurisdictions and frameworks does DocAI cover?',
    a: 'Contract generation is tuned for cross-border commercial work, primarily New York + DIFC + EU-MS, with a generic commercial fallback. Risk scans cite GDPR, CCPA-CPRA, US state privacy law, HIPAA, SOC 2, NIST, EU SCCs, and HIPAA. Our SQA + DPA agents speak SOC 2, CAIQ, SIG-Lite, NIST, GDPR Art 28, and EU SCC fluently.',
    link: { label: 'Full coverage list', href: '/about' },
  },
  {
    q: 'What does the gated report unlock vs the free preview?',
    a: 'Free preview: filename, contract type, risk score, top 2 red flags. Paid report: every flagged clause with severity + recommendation, every missing clause with suggested template language, compliance issues per framework, and the best-fit fix path (which DocAI template to remediate with).',
    link: { label: 'See pricing', href: '/pricing' },
  },
  {
    q: 'What if I need a refund?',
    a: 'Crypto payments via NOWPayments are non-reversible on-chain, but we honor full refunds within 7 days on the rare misclassification or empty-result case. Card payments via Payoneer link follow standard chargeback rules. The full policy lives at /refund.',
    link: { label: 'Refund policy', href: '/refund' },
  },
  {
    q: 'How is DocAI different from ChatGPT or generic AI drafting?',
    a: 'Three things ChatGPT does not do: (1) every citation in the output is grounded in a verified primary source — no fabricated case law; (2) a licensed attorney reviews the prompts + outputs weekly; (3) the gated report ties every red flag to a remediation template you can actually generate next, end-to-end.',
    link: { label: 'How DocAI works', href: '/methodology' },
  },
]

export function DocAIFaq() {
  return (
    <section id="faq" className="docai-faq" aria-label="Frequently asked questions">
      <div className="docai-faq__inner">
        <header className="docai-faq__header">
          <span className="docai-faq__pill">FAQ</span>
          <h2 className="docai-faq__title">Common questions, plain answers.</h2>
        </header>
        <ol className="docai-faq__list">
          {FAQ.map((item) => (
            <li key={item.q} className="docai-faq__item">
              <details className="docai-faq__details">
                <summary className="docai-faq__summary">{item.q}</summary>
                <div className="docai-faq__answer">
                  <p>{item.a}</p>
                  {item.link ? (
                    <a className="docai-faq__link" href={item.link.href}>
                      {item.link.label} →
                    </a>
                  ) : null}
                </div>
              </details>
            </li>
          ))}
        </ol>

        {/* Trust strip — the legal-shield link cluster, prominent on the page */}
        <nav className="docai-faq__trust" aria-label="Trust + legal">
          <p className="docai-faq__trust-label">Legal &amp; methodology</p>
          <ul className="docai-faq__trust-list">
            <li><a href="/methodology">Methodology</a></li>
            <li><a href="/trust">Trust &amp; data handling</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/disclaimer">Disclaimer</a></li>
            <li><a href="/privacy">Privacy</a></li>
            <li><a href="/terms">Terms</a></li>
            <li><a href="/refund">Refund</a></li>
            <li><a href="/acceptable-use">Acceptable use</a></li>
            <li><a href="/dpa">DPA Negotiator</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </nav>
      </div>

      <style>{`
        .docai-faq {
          background: var(--bg, #FBF9F4);
          color: var(--on-surface, #1A1530);
          padding: clamp(40px, 5vw, 72px) clamp(16px, 4vw, 32px);
          border-top: 1px solid var(--outline-var, rgba(26, 21, 48, 0.07));
          font-family: var(--font-body, 'Inter', system-ui, sans-serif);
        }
        .docai-faq__inner {
          max-width: 880px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: clamp(20px, 2vw, 28px);
        }
        .docai-faq__header {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .docai-faq__pill {
          align-self: flex-start;
          padding: 3px 10px;
          border-radius: 999px;
          font-family: var(--font-mono, 'JetBrains Mono', monospace);
          font-size: 10px;
          letter-spacing: 0.12em;
          color: var(--primary, #5B49E0);
          background: color-mix(in srgb, var(--primary, #5B49E0) 10%, transparent);
          text-transform: uppercase;
        }
        .docai-faq__title {
          margin: 4px 0 0;
          font-family: var(--font-display, 'Fraunces', serif);
          font-weight: 400;
          font-size: clamp(22px, 3vw, 32px);
          line-height: 1.15;
          letter-spacing: -0.02em;
        }
        .docai-faq__list {
          margin: 0;
          padding: 0;
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .docai-faq__item {
          border: 1px solid var(--outline, rgba(26, 21, 48, 0.10));
          border-radius: 12px;
          background: var(--bg-high, #FFFDF7);
          overflow: hidden;
          transition: border-color 0.15s;
        }
        .docai-faq__item:hover {
          border-color: var(--primary, #5B49E0);
        }
        .docai-faq__details summary::-webkit-details-marker { display: none; }
        .docai-faq__details summary::marker { content: ''; }
        .docai-faq__summary {
          padding: 14px 18px;
          font-size: 14.5px;
          font-weight: 600;
          color: var(--on-surface, #1A1530);
          cursor: pointer;
          list-style: none;
          position: relative;
          padding-right: 44px;
        }
        .docai-faq__summary::after {
          content: '+';
          position: absolute;
          right: 18px;
          top: 50%;
          transform: translateY(-50%);
          font-family: var(--font-mono, 'JetBrains Mono', monospace);
          font-size: 18px;
          color: var(--primary, #5B49E0);
          transition: transform 0.15s;
        }
        .docai-faq__details[open] .docai-faq__summary::after {
          content: '−';
        }
        .docai-faq__answer {
          padding: 0 18px 16px;
          font-size: 13.5px;
          line-height: 1.6;
          color: var(--on-surface-var, #5C5670);
        }
        .docai-faq__answer p {
          margin: 0 0 10px;
        }
        .docai-faq__link {
          display: inline-block;
          font-size: 13px;
          font-weight: 600;
          color: var(--primary, #5B49E0);
          text-decoration: none;
        }
        .docai-faq__link:hover {
          text-decoration: underline;
        }

        /* Trust strip — legal-shield link cluster */
        .docai-faq__trust {
          padding: clamp(16px, 2vw, 22px);
          background: var(--bg-low, #F2EEE5);
          border: 1px solid var(--outline-var, rgba(26, 21, 48, 0.07));
          border-radius: 12px;
        }
        .docai-faq__trust-label {
          margin: 0 0 12px;
          font-family: var(--font-mono, 'JetBrains Mono', monospace);
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--on-surface-var, #5C5670);
        }
        .docai-faq__trust-list {
          margin: 0;
          padding: 0;
          list-style: none;
          display: flex;
          flex-wrap: wrap;
          gap: 6px 14px;
          font-size: 13px;
        }
        .docai-faq__trust-list a {
          color: var(--on-surface, #1A1530);
          text-decoration: none;
          font-weight: 500;
          padding: 4px 0;
          border-bottom: 1px dotted var(--outline, rgba(26, 21, 48, 0.18));
          transition: color 0.15s, border-bottom-color 0.15s;
        }
        .docai-faq__trust-list a:hover {
          color: var(--primary, #5B49E0);
          border-bottom-color: var(--primary, #5B49E0);
        }
      `}</style>
    </section>
  )
}
