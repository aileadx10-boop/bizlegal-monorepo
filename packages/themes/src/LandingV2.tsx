'use client'

/**
 * LandingV2 — shared full-template homepage component used by
 * LexAudit / BRAI / TRACR.
 *
 * Adapted from `lexaudit-page-v2.jsx` (the design source). All visual
 * styling is theme-driven via CSS custom properties — change theme,
 * the page restyles. Content is supplied per subdomain via the
 * `LandingV2Content` prop so the same component renders 3 distinct
 * brand-true pages.
 *
 * Sections in render order:
 *   1. Sticky nav (brand + middle links + theme toggle + ember CTA)
 *   2. Hero (eyebrow + headline + sub + dual-CTA + parallax shield)
 *   3. Brief ("What you get" 3-step graphic) — D11 subdomain pass
 *   4. Audits (recent regulator-watched updates)
 *   5. Spotlight (single case study)
 *   6. Pricing (3-tier card row)
 *   7. Contact / intake form
 *   8. Footer
 *
 * Animations: scroll-reveal, parallax, pulse, hover lift, animated
 * counters, theme cross-fade — all respect prefers-reduced-motion.
 */

import * as React from 'react'
import { TurnstileWidget } from '@bizlegal/turnstile-widget'

// ── shared CSS exported so subdomains can layer overrides ────────
export const lexCSSv2 = `
.lex-page * { box-sizing: border-box; margin: 0; padding: 0; }
.lex-page {
  background: var(--ink, #0B0717);
  color: var(--paper, #E9E5F5);
  font-family: var(--lex-body, 'Inter', system-ui, sans-serif);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  width: 100%;
  position: relative;
  overflow-x: hidden;
}

/* sr-only utility — WCAG 2.4.6 visually-hidden helper for screen readers. */
.lex-page .sr-only {
  position: absolute !important;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0, 0, 0, 0);
  white-space: nowrap; border: 0;
}

/* Assertive live region for inline form errors (paired with role=alert). */
.lex-page [role="alert"] {
  color: #ef4444;
  font-size: 13px;
  margin-top: 8px;
}
.lex-page a { color: inherit; text-decoration: none; }
.lex-page button { font-family: inherit; }
.lex-page .serif {
  font-family: var(--lex-display, 'Fraunces', serif);
  font-weight: 300;
  letter-spacing: -0.02em;
}

/* Theme cross-fade overlay */
.lex-page::before {
  content: ""; position: fixed; inset: 0; z-index: -1;
  background: var(--ink, #0B0717);
  opacity: 1; transition: opacity 600ms ease;
  pointer-events: none;
}

/* Reveal on scroll */
.lex-reveal { opacity: 0; transform: translateY(22px); transition: opacity .9s cubic-bezier(.2,.7,.2,1), transform .9s cubic-bezier(.2,.7,.2,1); }
.lex-reveal.in { opacity: 1; transform: translateY(0); }

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .lex-reveal, .lex-reveal.in { opacity: 1 !important; transform: none !important; transition: none !important; }
  .lex-page *, .lex-page *::before, .lex-page *::after {
    animation: none !important; transition-duration: 0.001ms !important;
  }
}

/* Nav */
.lex-nav {
  position: sticky; top: 0; z-index: 50;
  display: flex; justify-content: space-between; align-items: center;
  padding: 18px 32px;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  background: linear-gradient(180deg, color-mix(in srgb, var(--ink) 78%, transparent), color-mix(in srgb, var(--ink) 30%, transparent));
  border-bottom: 1px solid var(--line-2, rgba(233,229,245,.06));
}
.lex-brand {
  display: flex; align-items: center; gap: 10px;
  font-family: var(--lex-display, 'Fraunces', serif);
  font-weight: 300; font-size: 22px; letter-spacing: 0.02em;
  color: var(--paper);
}
.lex-brand .mark { width: 22px; height: 22px; display: grid; place-items: center; color: var(--brand); }
.lex-navmid { display: flex; gap: 28px; font-size: 13px; color: var(--paper-dim); font-weight: 400; }
.lex-navmid a { padding: 6px 0; transition: color 200ms ease; }
.lex-navmid a:hover { color: var(--paper); }
.lex-navend { display: flex; align-items: center; gap: 10px; }
.lex-nav-cta {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 16px 10px 18px; border-radius: 999px;
  /* Gradient stops shifted darker so white text passes WCAG 1.4.3 contrast (4.5:1).
     Earlier value (--ember #FFB347 → --ember-2 #FF3D00) measured 1.80–3.92:1. */
  background: linear-gradient(135deg, var(--ember-2, #FF3D00), #B22A00);
  color: #fff; font-size: 12.5px; font-weight: 600; letter-spacing: .01em;
  border: 0; cursor: pointer; text-decoration: none;
  box-shadow: 0 10px 28px -10px color-mix(in srgb, var(--ember-2, #FF3D00) 70%, transparent),
              inset 0 1px 0 rgba(255,255,255,0.28);
  transition: transform 200ms ease, box-shadow 250ms ease;
}
.lex-nav-cta:hover { transform: translateY(-1px); }
.lex-nav-cta:focus-visible {
  outline: 2px solid var(--brand-soft, #fff);
  outline-offset: 3px;
}
.lex-nav-cta .pulse {
  width: 8px; height: 8px; border-radius: 99px; background: #fff;
  animation: lex-pulse 2.2s ease-out infinite;
}
@keyframes lex-pulse {
  0%   { box-shadow: 0 0 0 0 rgba(255,255,255,.6); }
  70%  { box-shadow: 0 0 0 10px rgba(255,255,255,0); }
  100% { box-shadow: 0 0 0 0 rgba(255,255,255,0); }
}

/* Hero */
.lex-hero {
  position: relative; min-height: 720px;
  display: grid; place-items: center; padding: 88px 24px 80px;
  background: var(--hero-bg);
}
.lex-hero-inner {
  position: relative; z-index: 2;
  max-width: 1080px; width: 100%;
  display: flex; flex-direction: column; gap: 32px; align-items: center; text-align: center;
}
.lex-eyebrow {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 6px 14px; border: 1px solid var(--line); border-radius: 999px;
  color: var(--paper-dim); font-size: 11px; letter-spacing: 0.18em;
  text-transform: uppercase; background: var(--surface);
}
.lex-eyebrow .dot {
  width: 6px; height: 6px; border-radius: 99px;
  background: var(--brand); box-shadow: 0 0 12px var(--brand);
  animation: lex-glow 2.6s ease-in-out infinite;
}
@keyframes lex-glow {
  0%, 100% { opacity: .8; }
  50% { opacity: 1; }
}
.lex-hero h1 {
  font-size: clamp(40px, 6vw, 76px); line-height: 1.05;
  font-weight: 300; max-width: 880px;
}
.lex-hero h1 em { font-style: italic; color: var(--brand-soft); }
.lex-hero-sub { font-size: 17px; color: var(--paper-dim); max-width: 560px; line-height: 1.6; }

.lex-hero-ctas {
  display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: center;
  margin-top: 8px;
}
.lex-cta-primary {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 14px 22px; border-radius: 999px;
  background: var(--brand); color: #fff;
  font-size: 14px; font-weight: 600; letter-spacing: .01em;
  border: 0; cursor: pointer; text-decoration: none;
  box-shadow: 0 18px 40px -18px color-mix(in srgb, var(--brand) 80%, transparent),
              inset 0 1px 0 rgba(255,255,255,0.2);
  transition: transform 200ms ease, box-shadow 250ms ease;
}
.lex-cta-primary:hover { transform: translateY(-1px); }
.lex-cta-primary .dot {
  width: 8px; height: 8px; border-radius: 99px; background: #fff;
  animation: lex-pulse 2.2s ease-out infinite;
}

.lex-quick-form {
  display: flex; gap: 8px; max-width: 420px; width: 100%;
}
.lex-quick-form input {
  flex: 1; min-width: 0;
  padding: 13px 16px; border-radius: 12px;
  background: var(--surface); border: 1px solid var(--line);
  color: var(--paper); font-size: 13px;
  transition: border-color 200ms ease, box-shadow 200ms ease;
}
.lex-quick-form input::placeholder { color: var(--paper-dim); }
.lex-quick-form input:focus { outline: none; border-color: var(--brand); }
/* Restore visible focus indicator on keyboard focus (WCAG 2.4.7 + 2.4.11). */
.lex-quick-form input:focus-visible {
  outline: 2px solid var(--brand-soft);
  outline-offset: 2px;
  border-color: var(--brand);
}
.lex-quick-form button:focus-visible {
  outline: 2px solid var(--brand-soft);
  outline-offset: 2px;
}
.lex-quick-form button {
  padding: 13px 18px; border-radius: 12px;
  background: var(--surface-2); color: var(--paper);
  border: 1px solid var(--line); font-size: 13px; font-weight: 600;
  cursor: pointer; transition: background 200ms ease, border-color 200ms ease;
}
.lex-quick-form button:hover:not(:disabled) {
  background: color-mix(in srgb, var(--brand) 18%, var(--surface-2));
  border-color: var(--brand-soft);
}
.lex-quick-form button:disabled { opacity: .5; cursor: not-allowed; }
.lex-quick-success {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 12px 18px; border-radius: 999px;
  background: color-mix(in srgb, var(--brand) 14%, var(--surface));
  border: 1px solid color-mix(in srgb, var(--brand) 30%, var(--line));
  color: var(--paper); font-size: 13px;
  animation: lex-fade-in 300ms ease;
}
@keyframes lex-fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Brief */
/* Section rhythm — varied padding per section type to break the
   uniform-padding-everywhere anti-pattern flagged by the UI auditor.
   Each section has a deliberate cadence relationship to its neighbors:
   tight intro (Brief) → wide data shelf (Audits) → editorial pause
   (Spotlight) → decision moment (Pricing, bottom-weighted) → close
   (Contact). */
.lex-section { padding: 96px 24px; }
.lex-section-inner { max-width: 1080px; margin: 0 auto; }
.lex-section h2 { font-size: clamp(28px, 3.4vw, 40px); margin-bottom: 16px; }
.lex-section .lex-section-sub { color: var(--paper-dim); font-size: 15px; max-width: 640px; line-height: 1.6; }
/* Per-section overrides — each tells a different story rhythmically. */
.lex-brief { padding: 72px 24px 48px; }
.lex-audits { padding: 96px 24px 88px; }
.lex-spotlight { padding: 128px 24px 96px; }
.lex-pricing { padding: 96px 24px 128px; }
.lex-contact { padding: 80px 24px 56px; }
@media (max-width: 720px) {
  .lex-brief, .lex-audits, .lex-spotlight, .lex-pricing, .lex-contact { padding-left: 18px; padding-right: 18px; }
}

/* Brief — no-card chrome, editorial 3-step rail (distinct from spotlight + pricing).
   Numbered badges sit prominently OFF the text block; no surface, no
   border, no hover lift — the brief is meant to read like body copy
   not a card grid. */
.lex-brief { background: var(--audits-bg); }
.lex-brief-grid {
  display: grid; gap: 56px 32px; margin-top: 48px;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}
.lex-brief-card {
  position: relative; padding: 0;
  /* deliberately no surface / border / shadow — distinct from spotlight + pricing */
}
.lex-brief-num {
  display: inline-flex; align-items: center; justify-content: center;
  width: 44px; height: 44px; border-radius: 999px;
  background: var(--brand); color: #fff;
  font-family: var(--lex-display); font-size: 18px; font-weight: 500;
  margin-bottom: 18px;
  box-shadow: 0 12px 28px -10px color-mix(in srgb, var(--brand) 60%, transparent);
}
.lex-brief-card h3 { font-size: 19px; margin-bottom: 10px; font-family: var(--lex-display); font-weight: 400; }
.lex-brief-card p { color: var(--paper-dim); font-size: 14.5px; line-height: 1.7; }
@media (max-width: 720px) { .lex-brief-grid { gap: 36px 24px; } }

/* Audits */
.lex-audits { background: var(--audits-bg); }
.lex-audits-list {
  display: flex; flex-direction: column; gap: 10px; margin-top: 32px;
}
.lex-audit-row {
  display: grid; grid-template-columns: 96px 1fr auto;
  align-items: center; gap: 18px;
  padding: 18px 22px; border: 1px solid var(--line); border-radius: 14px;
  background: var(--surface); transition: border-color 250ms ease, transform 250ms ease;
}
.lex-audit-row:hover {
  border-color: color-mix(in srgb, var(--brand) 35%, var(--line));
  transform: translateY(-1px);
}
.lex-audit-date { color: var(--paper-dim); font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase; }
.lex-audit-title { font-size: 15px; line-height: 1.4; }
.lex-audit-title strong { display: block; color: var(--brand-soft); font-weight: 500; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 4px; }
.lex-audit-tag {
  font-size: 11px; padding: 4px 10px; border-radius: 999px;
  background: color-mix(in srgb, var(--accent-a) 18%, transparent);
  color: var(--accent-a); border: 1px solid color-mix(in srgb, var(--accent-a) 35%, transparent);
}

/* Spotlight */
.lex-spotlight { background: var(--spotlight-bg); }
.lex-spot {
  display: grid; gap: 32px; margin-top: 32px;
  grid-template-columns: 1.2fr 1fr; align-items: center;
}
@media (max-width: 720px) { .lex-spot { grid-template-columns: 1fr; } }
.lex-spot-quote {
  font-family: var(--lex-display); font-weight: 300;
  font-size: clamp(20px, 2vw, 26px); line-height: 1.45; color: var(--paper);
}
.lex-spot-quote::before { content: '"'; color: var(--brand-soft); font-size: 1.4em; margin-right: 4px; }
.lex-spot-meta { margin-top: 18px; color: var(--paper-dim); font-size: 13px; }
/* Spotlight stats — editorial numeric portrait (distinct chrome from brief + pricing).
   No card chrome; just a vertical rule + oversized display num. Reads
   as data not as a card; distinct from brief (no surface) AND pricing
   (full card chrome). */
.lex-spot-stats { display: grid; gap: 28px; }
.lex-spot-stat {
  padding: 4px 0 4px 22px;
  border-left: 2px solid color-mix(in srgb, var(--brand) 40%, var(--line));
  display: flex; flex-direction: column; gap: 4px;
}
.lex-spot-stat .num {
  font-family: var(--lex-display); font-weight: 300;
  font-size: clamp(38px, 4.4vw, 52px); line-height: 1; letter-spacing: -0.02em;
  color: var(--paper);
}
.lex-spot-stat .lbl {
  font-size: 11px; color: var(--paper-dim);
  letter-spacing: 0.14em; text-transform: uppercase; margin-top: 6px;
}

/* Pricing — explicit elevation hierarchy (distinct chrome from brief + spotlight).
   The .feat tier is permanently elevated (translated up + brand glow),
   non-feat tiers are flatter with subtler chrome. Both still get a
   distinct hover, but the resting states already communicate priority. */
.lex-pricing { background: var(--bleed-bg); }
.lex-tiers {
  display: grid; gap: 20px; margin-top: 40px;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  align-items: start;
}
.lex-tier {
  padding: 32px 28px;
  border: 1px solid var(--line-2);
  border-radius: 18px;
  background: color-mix(in srgb, var(--surface) 60%, transparent);
  display: flex; flex-direction: column; gap: 16px;
  transition: transform 250ms ease, border-color 250ms ease, box-shadow 250ms ease, background 250ms ease;
}
.lex-tier:hover {
  transform: translateY(-3px);
  border-color: color-mix(in srgb, var(--brand) 35%, var(--line));
  background: var(--surface);
  box-shadow: 0 24px 60px -28px color-mix(in srgb, var(--brand) 50%, transparent);
}
.lex-tier.feat {
  /* Resting elevation — feat tier is "already lifted" so the hierarchy
     reads at first glance, not only on hover. */
  transform: translateY(-12px);
  padding: 36px 28px;
  border: 1px solid color-mix(in srgb, var(--brand) 60%, var(--line));
  background: color-mix(in srgb, var(--brand) 12%, var(--surface));
  box-shadow: 0 28px 80px -32px color-mix(in srgb, var(--brand) 70%, transparent),
              inset 0 1px 0 color-mix(in srgb, var(--brand) 20%, rgba(255,255,255,.1));
}
.lex-tier.feat:hover { transform: translateY(-15px); }
@media (max-width: 720px) { .lex-tier.feat { transform: translateY(0); } .lex-tier.feat:hover { transform: translateY(-3px); } }
.lex-tier h3 { font-size: 17px; }
.lex-tier .price { font-family: var(--lex-display); font-size: 36px; color: var(--paper); }
.lex-tier .price small { font-size: 14px; color: var(--paper-dim); margin-left: 4px; }
.lex-tier ul { list-style: none; display: flex; flex-direction: column; gap: 8px; font-size: 13.5px; color: var(--paper-dim); }
.lex-tier li::before { content: "✓ "; color: var(--accent-a); margin-right: 4px; }
.lex-tier .lex-tier-cta {
  margin-top: auto; padding: 12px 16px; border-radius: 999px;
  background: var(--brand); color: #fff; border: 0;
  font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none;
  text-align: center; transition: filter 200ms ease;
}
.lex-tier .lex-tier-cta:hover { filter: brightness(1.1); }

/* Contact */
.lex-contact { background: var(--contact-bg); }
.lex-contact-form {
  display: grid; gap: 14px; margin-top: 32px; max-width: 640px;
}
.lex-contact-form input,
.lex-contact-form textarea {
  padding: 14px 16px; border-radius: 12px;
  background: var(--surface); border: 1px solid var(--line);
  color: var(--paper); font-size: 14px; font-family: inherit;
  transition: border-color 200ms ease, box-shadow 200ms ease;
}
.lex-contact-form input:focus,
.lex-contact-form textarea:focus { outline: none; border-color: var(--brand); }
/* Keyboard-only focus ring (WCAG 2.4.7 + 2.4.11). */
.lex-contact-form input:focus-visible,
.lex-contact-form textarea:focus-visible {
  outline: 2px solid var(--brand-soft);
  outline-offset: 2px;
  border-color: var(--brand);
}
.lex-contact-form textarea { min-height: 120px; resize: vertical; }
.lex-contact-form button {
  padding: 14px 18px; border-radius: 12px;
  background: var(--brand); color: #fff; border: 0;
  font-size: 14px; font-weight: 600; cursor: pointer;
  transition: filter 200ms ease;
}
.lex-contact-form button:hover:not(:disabled) { filter: brightness(1.1); }
.lex-contact-form button:focus-visible {
  outline: 2px solid var(--brand-soft);
  outline-offset: 3px;
}

/* Footer */
.lex-footer {
  padding: 48px 24px 24px; background: var(--footer-bg);
  color: var(--paper-dim); font-size: 13px;
}
.lex-footer-inner {
  max-width: 1080px; margin: 0 auto;
  display: flex; flex-wrap: wrap; gap: 24px; justify-content: space-between; align-items: center;
}
.lex-footer-disc { font-size: 11px; color: var(--paper-dim); margin-top: 24px; max-width: 1080px; margin-left: auto; margin-right: auto; }
`

// ── content schema ───────────────────────────────────────────────
export interface AuditRow {
  readonly date: string
  readonly tag: string
  readonly title: string
  readonly url?: string
}
export interface PricingTier {
  readonly name: string
  readonly price: string
  readonly cadence: string
  readonly features: readonly string[]
  readonly cta: string
  readonly href: string
  readonly featured?: boolean
}
export interface LandingV2Content {
  readonly brand: string
  readonly nav: ReadonlyArray<{ label: string; href: string }>
  readonly heroEyebrow: string
  readonly heroHeadline: React.ReactNode
  readonly heroSub: string
  readonly heroPrimaryCta: { label: string; href: string }
  readonly heroQuickFormPlaceholder: string
  readonly briefIntro: string
  readonly briefSteps: ReadonlyArray<{ title: string; body: string }>
  readonly auditsTitle: string
  readonly auditsSub: string
  readonly audits: ReadonlyArray<AuditRow>
  readonly spotlightQuote: string
  readonly spotlightMeta: string
  readonly spotlightStats: ReadonlyArray<{ num: string; lbl: string }>
  readonly pricingTitle: string
  readonly pricingSub: string
  readonly tiers: ReadonlyArray<PricingTier>
  readonly contactTitle: string
  readonly contactSub: string
  readonly footerTagline: string
  readonly disclaimer: string
}

// ── component ─────────────────────────────────────────────────────

/** Source slugs the shared LandingV2 forms use; literal union closes
 *  the door on free-string typos at the call site. */
export type LeadSubmitSource = 'home-quick-capture' | 'home-intake'

export interface LeadSubmitArgs {
  readonly email: string
  readonly name?: string
  readonly scenario?: string
  readonly source: LeadSubmitSource
  /** Cloudflare Turnstile bot-challenge token; required at runtime
   *  when NEXT_PUBLIC_TURNSTILE_SITE_KEY is set, optional otherwise. */
  readonly turnstile_token?: string
}

/** Discriminated Result so consumers cannot construct `{ok:false}` with
 *  no error or `{ok:true, error: 'oops'}`. The `if (res.ok)` narrowing
 *  in Hero/Contact relies on this. */
export type LeadSubmitResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly error: string }

export interface LandingV2Props {
  readonly content: LandingV2Content
  /** Submit handler for hero quick-capture + bottom intake forms. */
  readonly onLeadSubmit: (args: LeadSubmitArgs) => Promise<LeadSubmitResult>
}

export function LandingV2(props: LandingV2Props): React.ReactElement {
  const { content, onLeadSubmit } = props

  // Reveal-on-scroll observer
  React.useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.lex-reveal')
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        }
      },
      { threshold: 0.12 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  // Nav + Footer now provided by SiteShell at layout level. LandingV2
  // renders only the page-body sections so it can be embedded inside
  // SiteShell without doubling up.
  return (
    <div className="lex-page">
      <style dangerouslySetInnerHTML={{ __html: lexCSSv2 }} />

      <Hero content={content} onLeadSubmit={onLeadSubmit} />
      <Brief content={content} />
      <Audits content={content} />
      <Spotlight content={content} />
      <Pricing content={content} />
      <Contact content={content} onLeadSubmit={onLeadSubmit} />
    </div>
  )
}

// ── sections ──────────────────────────────────────────────────────

function Hero(props: {
  content: LandingV2Content
  onLeadSubmit: LandingV2Props['onLeadSubmit']
}): React.ReactElement {
  const { content, onLeadSubmit } = props
  const [email, setEmail] = React.useState('')
  const [token, setToken] = React.useState<string | null>(null)
  const [submitting, setSubmitting] = React.useState(false)
  const [submitted, setSubmitted] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Turnstile only blocks submission when the env site-key is configured
  // (skip-if-not-configured stays compatible with dev + pre-launch deploys).
  const turnstileEnabled = typeof window !== 'undefined' && !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await onLeadSubmit({
        email,
        source: 'home-quick-capture',
        ...(token ? { turnstile_token: token } : {}),
      })
      if (!res.ok) {
        // Discriminated Result narrows res.error to string on the failure
        // branch — no optional chain needed.
        const detail = res.error.trim() ? `: ${res.error}` : ''
        throw new Error(`submit_failed${detail}`)
      }
      setSubmitted(true)
    } catch (err) {
      // Log the original error to console + ops, surface a sanitized
      // message (truncated, turnstile-aware) to the user. Never let the
      // catch block swallow the failure into a generic retry prompt.
      const msg = err instanceof Error ? err.message : String(err)
      // eslint-disable-next-line no-console
      console.error('[lead-submit:hero] failed', err)
      setError(
        msg.includes('turnstile')
          ? 'Bot challenge failed — please refresh and try again.'
          : `Could not save your email — please try again. (${msg.slice(0, 100)})`,
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="lex-hero" id="hero">
      <div className="lex-hero-inner">
        <span className="lex-eyebrow">
          <span className="dot" aria-hidden="true" />
          {content.heroEyebrow}
        </span>
        <h1 className="serif">{content.heroHeadline}</h1>
        <p className="lex-hero-sub">{content.heroSub}</p>
        <div className="lex-hero-ctas">
          <a className="lex-cta-primary" href={content.heroPrimaryCta.href}>
            <span className="dot" aria-hidden="true" />
            {content.heroPrimaryCta.label}
          </a>
          {submitted ? (
            <span className="lex-quick-success" role="status">Sent — check your inbox</span>
          ) : (
            <form className="lex-quick-form" onSubmit={submit} aria-describedby="hero-quick-error">
              <label className="sr-only" htmlFor="hero-quick-email">
                Email address
              </label>
              <input
                id="hero-quick-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={content.heroQuickFormPlaceholder}
                aria-invalid={error ? true : undefined}
              />
              <button
                type="submit"
                disabled={submitting || !email || (turnstileEnabled && !token)}
              >
                {submitting ? 'Sending…' : 'Email me'}
              </button>
            </form>
          )}
        </div>
        {!submitted ? (
          <div style={{ marginTop: 12 }}>
            <TurnstileWidget onToken={setToken} />
          </div>
        ) : null}
        <p
          id="hero-quick-error"
          role="alert"
          aria-live="assertive"
          style={{ minHeight: 0 }}
        >
          {error ?? ''}
        </p>
      </div>
    </section>
  )
}

function Brief({ content }: { content: LandingV2Content }): React.ReactElement {
  return (
    <section className="lex-section lex-brief lex-reveal" id="brief">
      <div className="lex-section-inner">
        <h2 className="serif">What you get</h2>
        <p className="lex-section-sub">{content.briefIntro}</p>
        <div className="lex-brief-grid">
          {content.briefSteps.map((s, i) => (
            <div key={s.title} className="lex-brief-card">
              <span className="lex-brief-num">{i + 1}</span>
              <h3 className="serif">{s.title}</h3>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Audits({ content }: { content: LandingV2Content }): React.ReactElement {
  return (
    <section className="lex-section lex-audits lex-reveal" id="audits">
      <div className="lex-section-inner">
        <h2 className="serif">{content.auditsTitle}</h2>
        <p className="lex-section-sub">{content.auditsSub}</p>
        <div className="lex-audits-list">
          {content.audits.map((row) => (
            <a
              key={row.title}
              className="lex-audit-row"
              href={row.url ?? '#'}
              {...(row.url ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              <div className="lex-audit-date">{row.date}</div>
              <div className="lex-audit-title">
                <strong>{row.tag}</strong>
                {row.title}
              </div>
              <span className="lex-audit-tag">{row.tag}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

function Spotlight({ content }: { content: LandingV2Content }): React.ReactElement {
  return (
    <section className="lex-section lex-spotlight lex-reveal" id="spotlight">
      <div className="lex-section-inner">
        <h2 className="serif">Spotlight</h2>
        <div className="lex-spot">
          <div>
            <p className="lex-spot-quote">{content.spotlightQuote}</p>
            <p className="lex-spot-meta">{content.spotlightMeta}</p>
          </div>
          <div className="lex-spot-stats">
            {content.spotlightStats.map((s) => (
              <div key={s.lbl} className="lex-spot-stat">
                <span className="num serif">{s.num}</span>
                <span className="lbl">{s.lbl}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Pricing({ content }: { content: LandingV2Content }): React.ReactElement {
  return (
    <section className="lex-section lex-pricing lex-reveal" id="pricing">
      <div className="lex-section-inner">
        <h2 className="serif">{content.pricingTitle}</h2>
        <p className="lex-section-sub">{content.pricingSub}</p>
        <div className="lex-tiers">
          {content.tiers.map((t) => (
            <div key={t.name} className={`lex-tier${t.featured ? ' feat' : ''}`}>
              <h3 className="serif">{t.name}</h3>
              <div className="price">
                {t.price}
                <small>{t.cadence}</small>
              </div>
              <ul>
                {t.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <a className="lex-tier-cta" href={t.href}>
                {t.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Contact(props: {
  content: LandingV2Content
  onLeadSubmit: LandingV2Props['onLeadSubmit']
}): React.ReactElement {
  const { content, onLeadSubmit } = props
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [scenario, setScenario] = React.useState('')
  const [token, setToken] = React.useState<string | null>(null)
  const [submitting, setSubmitting] = React.useState(false)
  const [submitted, setSubmitted] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const turnstileEnabled = typeof window !== 'undefined' && !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await onLeadSubmit({
        email,
        name,
        scenario,
        source: 'home-intake',
        ...(token ? { turnstile_token: token } : {}),
      })
      if (!res.ok) {
        // Discriminated Result narrows res.error to string on the failure
        // branch — no optional chain needed.
        const detail = res.error.trim() ? `: ${res.error}` : ''
        throw new Error(`submit_failed${detail}`)
      }
      setSubmitted(true)
    } catch (err) {
      // Log the original error to console + ops, surface a sanitized
      // message (truncated, turnstile-aware) to the user.
      const msg = err instanceof Error ? err.message : String(err)
      // eslint-disable-next-line no-console
      console.error('[lead-submit:contact] failed', err)
      setError(
        msg.includes('turnstile')
          ? 'Bot challenge failed — please refresh and try again.'
          : `Could not save your details — please try again. (${msg.slice(0, 100)})`,
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="lex-section lex-contact lex-reveal" id="contact">
      <div className="lex-section-inner">
        <h2 className="serif">{content.contactTitle}</h2>
        <p className="lex-section-sub">{content.contactSub}</p>
        {submitted ? (
          <p className="lex-quick-success" role="status" style={{ marginTop: 32 }}>
            Sent — we&apos;ll be in touch within a business day.
          </p>
        ) : (
          <form
            className="lex-contact-form"
            onSubmit={submit}
            aria-describedby="contact-error"
          >
            <label className="sr-only" htmlFor="contact-name">
              Your name
            </label>
            <input
              id="contact-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
            />
            <label className="sr-only" htmlFor="contact-email">
              Email address
            </label>
            <input
              id="contact-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              autoComplete="email"
              aria-invalid={error ? true : undefined}
            />
            <label className="sr-only" htmlFor="contact-scenario">
              Briefly describe your scenario
            </label>
            <textarea
              id="contact-scenario"
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              placeholder="Briefly: what are you hoping we help with?"
            />
            <div style={{ margin: '8px 0' }}>
              <TurnstileWidget onToken={setToken} />
            </div>
            <button
              type="submit"
              disabled={submitting || !email || (turnstileEnabled && !token)}
            >
              {submitting ? 'Sending…' : 'Talk to us'}
            </button>
            <p
              id="contact-error"
              role="alert"
              aria-live="assertive"
              style={{ minHeight: 0 }}
            >
              {error ?? ''}
            </p>
          </form>
        )}
      </div>
    </section>
  )
}

