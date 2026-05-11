'use client'

/**
 * DocAI landing pre-experience — compact, mobile-first SaaS hero
 * rendered above the <HomeExperience /> scan flow.
 *
 * 2026-05-11 redesign goals (Moses brand audit):
 *   - Compress vertical spread (was a sparse 4-section block)
 *   - Mobile-first; everything collapses to a single 16px-padded column
 *     on phones; nothing requires horizontal scroll at 320px width
 *   - Surface DocAI's three product roles up-front (was just one CTA)
 *   - Daybreak palette only: warm cream paper, dark ink, violet primary
 *
 * Three roles surfaced (anchors / hrefs matched to the actual codebase):
 *   1. Contracts        — anchors to #scan (the <HomeExperience /> below)
 *   2. Privacy screen   — /decision-tree (the MVP funnel)
 *   3. Agents           — /sqa + /dpa (SQA Auto-fill + DPA Negotiator)
 *
 * Implementation: pure inline styles + a small block of <style jsx> for
 * the responsive media queries. No new dependencies. CSS variables
 * inherited from layout.tsx ThemeProvider (daybreak primary).
 */

import * as React from 'react'

const ROLES = [
  {
    key: 'contracts',
    href: '#scan',
    pill: '01 / Scan',
    title: 'Contracts',
    body: 'Drop a PDF or DOCX. Get a risk score, red-flag list, and suggested edits — citation-grounded across GDPR, CCPA, HIPAA, and US state privacy laws.',
    metaLeft: 'From $29',
    metaRight: 'NDAs · MSAs · DPAs',
  },
  {
    key: 'screen',
    href: '/decision-tree',
    pill: '02 / Screen',
    title: 'Privacy decision tree',
    body: '60-second exposure screen — answer six questions, get a preliminary verdict on DSARs, DPIAs, and sensitive-category triggers. Email-gated full breakdown.',
    metaLeft: 'Free',
    metaRight: 'GDPR · CCPA · US states',
  },
  {
    key: 'agents',
    href: '/sqa',
    pill: '03 / Agents',
    title: 'SQA + DPA agents',
    body: 'Drop a SOC 2 / CAIQ / SIG-Lite / NIST question and get a citation-grounded draft answer. Paste a customer DPA redline and get a 3-column compare with Art 28 + SCC + CCPA citations.',
    metaLeft: 'From $69 / mo',
    metaRight: 'SOC 2 · CAIQ · SIG · NIST',
  },
] as const

const HOW_STEPS = [
  { n: '1', title: 'Drop or screen', body: 'Drop a document, or run the 6-question privacy screen.' },
  { n: '2', title: 'AI drafts, attorney reviews', body: 'Practitioner-reviewed every Friday. No fabricated citations.' },
  { n: '3', title: 'Citation-grounded result', body: 'Verdict + sources + suggested edits, in minutes.' },
] as const

export function DocAILandingPreExperience(): React.ReactElement {
  return (
    <section className="docai-hero" aria-label="DocAI overview">
      <div className="docai-hero__inner">
        {/* Trust strip — single line on desktop, wraps on mobile */}
        <p className="docai-hero__trust">
          <span className="docai-dot" aria-hidden />
          Practitioner-reviewed
          <span className="docai-sep" aria-hidden>·</span>
          Citations on every claim
          <span className="docai-sep" aria-hidden>·</span>
          No data retention by default
        </p>

        {/* Headline + dual CTA */}
        <h1 className="docai-hero__h1">
          Compliance documents drafted by AI,
          <br className="docai-hero__br" />{' '}
          <span className="docai-hero__h1-accent">reviewed by attorneys.</span>
        </h1>
        <p className="docai-hero__sub">
          Scan contracts, answer questionnaires, negotiate DPAs — minutes, not weeks.
        </p>

        <div className="docai-hero__ctas">
          <a href="#scan" className="docai-cta docai-cta--primary">
            Scan a contract <span aria-hidden>→</span>
          </a>
          <a href="/decision-tree" className="docai-cta docai-cta--secondary">
            Free privacy screen
          </a>
        </div>

        {/* Role tiles — 3-col → 1-col mobile */}
        <div className="docai-roles" role="list">
          {ROLES.map((r) => (
            <a
              key={r.key}
              href={r.href}
              className="docai-role"
              role="listitem"
            >
              <span className="docai-role__pill">{r.pill}</span>
              <h2 className="docai-role__title">{r.title}</h2>
              <p className="docai-role__body">{r.body}</p>
              <div className="docai-role__meta">
                <span className="docai-role__meta-left">{r.metaLeft}</span>
                <span className="docai-role__meta-right">{r.metaRight}</span>
              </div>
            </a>
          ))}
        </div>

        {/* How it works — 3-step compact strip */}
        <div className="docai-how">
          <p className="docai-how__title">How it works</p>
          <ol className="docai-how__list">
            {HOW_STEPS.map((s) => (
              <li key={s.n} className="docai-how__item">
                <span className="docai-how__num">{s.n}</span>
                <div>
                  <p className="docai-how__step-title">{s.title}</p>
                  <p className="docai-how__step-body">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Disclaimer pinned to the bottom of the section */}
        <p className="docai-hero__disclaimer">
          DocAI is regulatory intelligence + drafting — not legal advice. Final approval rests with
          a licensed attorney in your jurisdiction.
        </p>
      </div>

      <style jsx>{`
        .docai-hero {
          background: var(--bg, #FBF9F4);
          color: var(--on-surface, #1A1530);
          padding: clamp(24px, 4vw, 56px) clamp(16px, 4vw, 32px);
          font-family: var(--font-body, 'Inter', system-ui, sans-serif);
          border-bottom: 1px solid var(--outline, rgba(26, 21, 48, 0.12));
        }
        .docai-hero__inner {
          max-width: 1080px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: clamp(20px, 2.5vw, 32px);
        }

        /* Trust strip — top, single line on desktop, wraps on mobile */
        .docai-hero__trust {
          margin: 0;
          display: flex;
          flex-wrap: wrap;
          gap: 8px 12px;
          align-items: center;
          font-family: var(--font-mono, 'JetBrains Mono', monospace);
          font-size: 11px;
          letter-spacing: 0.08em;
          color: var(--on-surface-var, #5C5670);
          text-transform: uppercase;
        }
        .docai-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--primary, #5B49E0);
          box-shadow: 0 0 8px var(--primary, #5B49E0);
        }
        .docai-sep {
          color: var(--dim, #ABA5BA);
        }

        /* Headline */
        .docai-hero__h1 {
          margin: 0;
          font-family: var(--font-display, 'Fraunces', serif);
          font-weight: 400;
          font-size: clamp(28px, 5.5vw, 56px);
          line-height: 1.05;
          letter-spacing: -0.025em;
          color: var(--on-surface, #1A1530);
        }
        .docai-hero__h1-accent {
          color: var(--primary, #5B49E0);
        }
        .docai-hero__br {
          display: none;
        }
        @media (min-width: 720px) {
          .docai-hero__br {
            display: inline;
          }
        }
        .docai-hero__sub {
          margin: 0;
          color: var(--on-surface-var, #5C5670);
          font-size: clamp(15px, 1.6vw, 18px);
          line-height: 1.55;
          max-width: 56ch;
        }

        /* CTAs — primary + secondary, stack on mobile */
        .docai-hero__ctas {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: center;
        }
        .docai-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 22px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: -0.005em;
          text-decoration: none;
          transition: filter 0.15s, transform 0.15s;
          min-height: 44px;  /* WCAG 2.5.5 target size */
        }
        .docai-cta--primary {
          background: var(--primary, #5B49E0);
          color: #fff;
          box-shadow: 0 8px 22px -10px rgba(91, 73, 224, 0.55);
        }
        .docai-cta--primary:hover {
          filter: brightness(1.06);
          transform: translateY(-1px);
        }
        .docai-cta--secondary {
          background: transparent;
          color: var(--on-surface, #1A1530);
          border: 1px solid var(--outline, rgba(26, 21, 48, 0.18));
        }
        .docai-cta--secondary:hover {
          background: var(--bg-low, #F2EEE5);
        }

        /* Role tiles */
        .docai-roles {
          display: grid;
          gap: 14px;
          grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
        }
        .docai-role {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: clamp(18px, 2vw, 24px);
          background: var(--bg-high, #FFFDF7);
          border: 1px solid var(--outline, rgba(26, 21, 48, 0.10));
          border-radius: 14px;
          text-decoration: none;
          color: inherit;
          transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
        }
        .docai-role:hover {
          transform: translateY(-2px);
          border-color: var(--primary, #5B49E0);
          box-shadow: 0 10px 28px -16px rgba(91, 73, 224, 0.35);
        }
        .docai-role__pill {
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
        .docai-role__title {
          margin: 4px 0 0;
          font-family: var(--font-display, 'Fraunces', serif);
          font-weight: 500;
          font-size: clamp(18px, 2vw, 22px);
          letter-spacing: -0.015em;
          color: var(--on-surface, #1A1530);
        }
        .docai-role__body {
          margin: 0;
          color: var(--on-surface-var, #5C5670);
          font-size: 13.5px;
          line-height: 1.55;
        }
        .docai-role__meta {
          margin-top: auto;
          padding-top: 12px;
          border-top: 1px dashed var(--outline-var, rgba(26, 21, 48, 0.08));
          display: flex;
          justify-content: space-between;
          gap: 12px;
          font-family: var(--font-mono, 'JetBrains Mono', monospace);
          font-size: 11px;
          letter-spacing: 0.04em;
        }
        .docai-role__meta-left {
          color: var(--gold, #B8852D);
          font-weight: 600;
        }
        .docai-role__meta-right {
          color: var(--on-surface-var, #5C5670);
          text-align: right;
        }

        /* How it works strip */
        .docai-how {
          padding: clamp(18px, 2vw, 24px);
          background: var(--bg-low, #F2EEE5);
          border: 1px solid var(--outline-var, rgba(26, 21, 48, 0.07));
          border-radius: 14px;
        }
        .docai-how__title {
          margin: 0 0 14px;
          font-family: var(--font-mono, 'JetBrains Mono', monospace);
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--on-surface-var, #5C5670);
        }
        .docai-how__list {
          margin: 0;
          padding: 0;
          list-style: none;
          display: grid;
          gap: 12px;
          grid-template-columns: repeat(auto-fit, minmax(min(220px, 100%), 1fr));
        }
        .docai-how__item {
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }
        .docai-how__num {
          flex-shrink: 0;
          width: 28px;
          height: 28px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: var(--bg-highest, #FFFFFF);
          border: 1px solid var(--outline, rgba(26, 21, 48, 0.12));
          font-family: var(--font-display, 'Fraunces', serif);
          font-size: 14px;
          color: var(--primary, #5B49E0);
        }
        .docai-how__step-title {
          margin: 4px 0 4px;
          font-size: 14px;
          font-weight: 600;
          color: var(--on-surface, #1A1530);
        }
        .docai-how__step-body {
          margin: 0;
          font-size: 12.5px;
          line-height: 1.5;
          color: var(--on-surface-var, #5C5670);
        }

        /* Disclaimer */
        .docai-hero__disclaimer {
          margin: 0;
          font-size: 11.5px;
          line-height: 1.55;
          color: var(--muted, #7E7990);
          max-width: 72ch;
        }

        /* Mobile: stack CTAs full-width when there's not enough room */
        @media (max-width: 480px) {
          .docai-cta {
            flex: 1 1 100%;
          }
        }
      `}</style>
    </section>
  )
}
