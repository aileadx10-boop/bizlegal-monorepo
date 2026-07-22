import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy Compliance Guide for SaaS Startups (2025) | BizLegal AI',
  description:
    '7 frameworks, 6 phases, 40+ required disclosures. GDPR, CCPA, CPRA, Quebec Law 25, Colorado, Connecticut, Texas DPSA. When your policy goes stale and how to keep it current.',
  alternates: { canonical: 'https://bizlegal-ai.com/guides/privacy-policy-compliance-guide' },
  openGraph: {
    title: 'Privacy Policy Compliance Guide for SaaS Startups (2025) | BizLegal AI',
    description:
      '7 frameworks, 6 phases, 40+ required disclosures. GDPR, CCPA, CPRA, Quebec Law 25, Colorado, Connecticut, Texas DPSA. When your policy goes stale and how to keep it current.',
    url: 'https://bizlegal-ai.com/guides/privacy-policy-compliance-guide',
    type: 'article',
  },
}

const FRAMEWORKS = [
  {
    name: 'GDPR',
    jurisdiction: 'European Union',
    regulator: 'Lead supervisory DPA',
    max_fine: '€20M or 4% of global annual revenue',
    trigger: 'Processing personal data of any EU/EEA resident — regardless of where your company is based',
    key_requirement: 'Lawful basis for every processing activity must be explicitly documented in the policy',
    color: '#2563eb',
  },
  {
    name: 'CCPA',
    jurisdiction: 'California, USA',
    regulator: 'California Privacy Protection Agency (CPPA)',
    max_fine: '$7,500 per intentional violation',
    trigger: '>$25M annual revenue, OR >100K CA consumers/year, OR >50% revenue from selling personal info',
    key_requirement: 'Right to opt-out of sale or sharing of personal information must be prominently disclosed with a working mechanism',
    color: '#dc2626',
  },
  {
    name: 'CPRA',
    jurisdiction: 'California, USA',
    regulator: 'California Privacy Protection Agency (CPPA)',
    max_fine: '$7,500 per violation; $15,000 if minors involved',
    trigger: 'Same thresholds as CCPA; adds sensitive personal information (SPI) as a distinct regulated category',
    key_requirement: 'Right to limit use of sensitive personal information must be separately disclosed with a dedicated opt-out link',
    color: '#ea580c',
  },
  {
    name: 'Colorado CPA',
    jurisdiction: 'Colorado, USA',
    regulator: 'Colorado Attorney General',
    max_fine: '$20,000 per violation; up to $500,000 per series',
    trigger: 'Processing data of 100K+ Colorado consumers/year, or 25K+ consumers where revenue is derived from data sales',
    key_requirement: 'Universal opt-out mechanism (GPC signal) must be honored within 15 days and disclosed in the policy',
    color: '#7c3aed',
  },
  {
    name: 'Connecticut CTDPA',
    jurisdiction: 'Connecticut, USA',
    regulator: 'Connecticut Attorney General',
    max_fine: '$5,000 per violation',
    trigger: 'Processing data of 100K+ Connecticut consumers/year, or 25K+ where revenue is derived from data sales',
    key_requirement: 'Right to appeal a denial of a consumer rights request must be disclosed in the policy and operationally supported',
    color: '#0891b2',
  },
  {
    name: 'Texas DPSA',
    jurisdiction: 'Texas, USA',
    regulator: 'Texas Attorney General',
    max_fine: '$7,500 per violation; $15,000 for violations involving children',
    trigger: 'Processing data of 100K+ Texas consumers/year, or 25K+ consumers with revenue derived from data sales (effective July 1, 2024)',
    key_requirement: 'Disclosure of data sales and opt-out rights must appear in the published privacy policy with a working opt-out link',
    color: '#b45309',
  },
  {
    name: 'Quebec Law 25',
    jurisdiction: 'Quebec, Canada',
    regulator: "Commission d'accès à l'information (CAI)",
    max_fine: 'CAD $25M or 4% of worldwide turnover',
    trigger: 'Any collection of personal information from any Quebec resident — no minimum user count or revenue threshold',
    key_requirement: 'Privacy Impact Assessment required before communicating personal information outside Quebec; must be referenced in the policy',
    color: '#166534',
  },
]

const POLICY_SECTIONS = [
  {
    title: '1. Identity and Contact Information',
    description: 'Who you are, your incorporation jurisdiction, and how to reach your privacy team or Data Protection Officer.',
    common_mistake:
      'Generic "contact us" form with no named contact or postal address — insufficient under GDPR Art. 13 and most US state privacy laws.',
  },
  {
    title: '2. Categories of Data Collected',
    description:
      'Every category of personal data you collect, including data collected passively: IP addresses, device IDs, usage logs, session recordings, and behavioral data.',
    common_mistake:
      'Listing only form-submitted data and omitting passively collected data. Analytics events and server log files are personal data under GDPR and US state definitions.',
  },
  {
    title: '3. Legal Basis for Processing',
    description:
      'For GDPR: the specific legal basis for each processing activity (contract, legitimate interests, or consent). For US frameworks: the business or commercial purpose for each data collection.',
    common_mistake:
      'Using a blanket "consent" basis for all processing when contract or legitimate interests is more appropriate — and legally more defensible — for core SaaS product operations.',
  },
  {
    title: '4. Third-Party Sharing and Data Sales',
    description:
      'Every category of recipient: processors (AWS, analytics, support tools), business partners, affiliates, and whether you sell or share data under US state law definitions.',
    common_mistake:
      'Omitting analytics and advertising tools. Under CCPA, sharing data with Google Analytics for cross-context behavioral advertising may constitute a "sale" requiring an opt-out.',
  },
  {
    title: '5. Retention Schedule',
    description:
      'How long you retain each category of personal data, and the specific criteria used to determine retention periods for each category.',
    common_mistake:
      '"We retain data as long as necessary" without a per-category timeline — non-compliant under GDPR and increasingly the target of US state AG enforcement actions.',
  },
  {
    title: '6. User Rights',
    description:
      'The specific rights users have under each applicable framework: access, deletion, correction, portability, opt-out of sale, restriction of processing, and objection.',
    common_mistake:
      'Listing generic rights without specifying the mechanism to submit requests (email address or webform URL), or failing to indicate which framework grants each right.',
  },
  {
    title: '7. Cookie and Tracking Technology Disclosure',
    description:
      'Types of cookies and tracking technologies used, their purpose category (strictly necessary vs. analytics vs. advertising), and how users can manage or withdraw consent.',
    common_mistake:
      'Installing a new tracking script (Facebook Pixel, LinkedIn Insight Tag, Hotjar) without updating the cookie section. Each new tool is an immediate, documentable policy gap.',
  },
]

const STALE_TRIGGERS = [
  {
    event: 'Adding a new third-party data processor',
    detail:
      'Each SaaS tool you add that handles personal data — analytics, CRM, customer support platform, CDN — must be disclosed as a recipient or subprocessor.',
    consequence: 'Undisclosed processors are a primary basis for GDPR enforcement action and FTC "deceptive practices" findings.',
  },
  {
    event: 'Changing data retention periods',
    detail:
      'If your engineering team extends or shortens how long data is stored in production databases, data warehouses, or backups, the policy must reflect the new timeline.',
    consequence: 'Retaining data longer than disclosed violates the data minimization principle under GDPR and creates liability in state AG investigations.',
  },
  {
    event: "Adding users from a new jurisdiction",
    detail:
      "Entering a new market (launching in Quebec, Texas, or Connecticut) activates that jurisdiction's framework requirements in your policy, often retroactively.",
    consequence: 'Operating in a new jurisdiction without required disclosures exposes you to enforcement even before any user complaint is filed.',
  },
  {
    event: 'Introducing cookies or new tracking technology',
    detail:
      'Each new tracking pixel, session recording tool, or A/B testing SDK is a new category of data collection that must be disclosed with its purpose and opt-out mechanism.',
    consequence: 'Regulators treat undisclosed tracking as a deliberate deceptive practice, triggering higher penalty tiers and reputational consequences.',
  },
  {
    event: 'A framework amendment or new regulatory guidance',
    detail:
      'Regulators issue guidance reinterpreting existing law — CPPA regulations under CPRA, EDPB guidance on consent, CAI clarifications on Law 25 PIAs. Your policy may be compliant today and non-compliant tomorrow without you changing anything.',
    consequence: 'The day new guidance takes effect, any policy that does not reflect it is potentially non-compliant. Most frameworks provide no grace period.',
  },
  {
    event: 'A data breach affecting personal data',
    detail:
      'Material breaches may require adding disclosures about the categories of data affected, security measures now in place, and how affected individuals can contact you.',
    consequence: 'Post-breach regulatory review routinely scrutinizes whether the published policy accurately described security practices at the time of the incident.',
  },
]

const ENFORCEMENT_CASES = [
  {
    company: 'Sephora',
    year: 2022,
    fine: '$1.2M',
    jurisdiction: 'California (CCPA)',
    issue:
      "Privacy policy did not disclose that sharing user data with advertising networks constituted a \"sale\" under CCPA. First major CCPA enforcement action by the California AG — set the precedent that advertising data flows must be explicitly named in the policy.",
  },
  {
    company: 'H&M Germany',
    year: 2020,
    fine: '€35.3M',
    jurisdiction: 'GDPR (Hamburg DPA)',
    issue:
      'Privacy policy and internal employee notice failed to disclose the scope of surveillance data collected — health conditions, family circumstances, and religious beliefs. The policy did not reflect actual data practices. One of the largest GDPR fines in Germany.',
  },
  {
    company: 'Google LLC',
    year: 2022,
    fine: '€150M',
    jurisdiction: 'GDPR (CNIL, France)',
    issue:
      'Cookie consent interface was deceptive and the privacy policy made it harder to refuse cookies than to accept them — directly violating the GDPR requirement that consent be as easy to withdraw as to give.',
  },
  {
    company: 'Clearview AI',
    year: 2022,
    fine: '£7.5M',
    jurisdiction: 'UK GDPR (ICO)',
    issue:
      'Privacy policy failed to disclose the scope of facial recognition data collected by scraping billions of public web images, the use of that data for law enforcement customers, and provided no valid lawful basis for processing.',
  },
  {
    company: 'Zoom Video Communications',
    year: 2021,
    fine: '$85M settlement',
    jurisdiction: 'US Federal (FTC + class action)',
    issue:
      'Privacy policy stated that calls were end-to-end encrypted when they were not. Policy also did not disclose that user data was shared with Facebook, Google, and LinkedIn.',
  },
]

const REVIEW_CADENCE = [
  {
    tier: 'Annual Review',
    description: 'Review policy once per year during a scheduled compliance audit cycle.',
    triggers: 'Calendar-based only. No event-driven checks between scheduled cycles.',
    effort: '8–16 hours of legal counsel time per cycle',
    risk_if_skipped: 'Near-certain policy staleness within 12 months given the rate of framework amendments across 7 active regimes.',
    highlighted: false,
  },
  {
    tier: 'Quarterly Review',
    description: 'Review policy every 90 days, synchronized with product sprint planning or board reporting cycles.',
    triggers: 'Calendar-based quarterly + triggered by major product feature launches.',
    effort: '3–6 hours per quarter',
    risk_if_skipped: 'Policy may lag 2–3 framework amendments per year and miss multiple product changes to data flows.',
    highlighted: false,
  },
  {
    tier: 'Event-Driven Review',
    description: 'Review triggered by specific events: new processor onboarded, new jurisdiction, breach, or new regulatory guidance.',
    triggers: 'New processor onboarding, new market entry, regulatory alerts, incident response runbooks.',
    effort: '1–4 hours per event, variable frequency throughout the year',
    risk_if_skipped: 'Without systematic event tracking, gaps routinely occur between the trigger event and the actual policy update.',
    highlighted: false,
  },
  {
    tier: 'Continuous Monitoring — $29/mo',
    description:
      'Daily automated semantic diff of your live policy URL against authoritative framework text. Alerts only when a new HIGH-severity gap appears. BizLegal Policy Auto-Refresh.',
    triggers: 'Every day — plus framework amendment detection and your own policy edit detection.',
    effort: 'Near-zero: review email alerts only when actionable HIGH-severity findings appear',
    risk_if_skipped: 'N/A — this is the baseline that eliminates the gap entirely.',
    highlighted: true,
  },
]

const FAQS = [
  {
    q: "What's the difference between a privacy policy and a data processing agreement?",
    a: "A Data Processing Agreement (DPA) is a B2B contract between a data controller and a data processor — it governs how a vendor processes personal data on your behalf and is required under GDPR Art. 28 for any subprocessor relationship. A privacy policy is a public-facing consumer disclosure explaining your data practices to users. Both are required under GDPR, but they serve different audiences: DPAs are signed commercial contracts between companies; privacy policies are unilateral public disclosures aimed at individual users.",
  },
  {
    q: "Does my B2B SaaS need to comply with CCPA if I have no California consumers?",
    a: "Even in pure B2B, if you have employees who are California residents and you collect their data in an employment context, CCPA applies to that employment data. Additionally, if any of your business customers' end-users are California residents and your service processes that data, you are a service provider under CCPA with specific obligations — even if you never deal directly with those consumers. The 'no consumers' argument is narrower than it appears in practice.",
  },
  {
    q: 'How do I know if Quebec Law 25 applies to my SaaS?',
    a: "If you collect personal information from any Quebec resident — including in a B2B context, such as collecting a contact's work email address — Law 25 applies. There is no minimum user count or revenue threshold. A US SaaS serving a single Quebec-based customer is within scope. The most commonly missed requirement is the Privacy Impact Assessment (PIA) that must be completed before communicating personal information outside Quebec, which must be referenced in the policy.",
  },
  {
    q: "What happens if my policy doesn't reflect my actual data flows?",
    a: "Enforcement agencies — the FTC, CNIL, CPPA, and state AG offices — routinely cite 'policy did not accurately reflect data practices' as the primary basis for enforcement action. It is the single most common GDPR violation cited in EU fines. When your policy says you do not sell data but your advertising pixel implementation does, that gap is both a legal violation and a consumer deception claim. A privacy policy is a legal commitment, not marketing copy.",
  },
  {
    q: 'Does the Texas DPSA apply outside Texas?',
    a: "Yes. The Texas Data Privacy and Security Act (effective July 1, 2024) applies to businesses that process personal data of Texas residents regardless of where the business is located. The threshold is 100,000 consumers per year, or 25,000+ consumers where revenue is derived from selling personal data. A SaaS company headquartered in Amsterdam with 100,000 Texas users is fully within scope.",
  },
  {
    q: 'How does Policy Auto-Refresh monitor changes?',
    a: "It runs a daily Sonnet-powered semantic diff of your live policy URL against the authoritative text of all 7 frameworks. The diff identifies gaps by severity — HIGH, MEDIUM, LOW — and generates suggested replacement language for each finding. When a new HIGH-severity gap appears (because you updated your policy, added a tool, or a regulatory amendment was issued), you receive an email with the specific clause, the gap, and draft replacement language grounded in the relevant regulatory provision. You only hear from it when there is something to act on.",
  },
]

export default function PrivacyPolicyComplianceGuidePage() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Privacy Policy Compliance Guide for SaaS Startups (2025)',
    description:
      '7 frameworks, 6 phases, 40+ required disclosures. GDPR, CCPA, CPRA, Quebec Law 25, Colorado, Connecticut, Texas DPSA. When your policy goes stale and how to keep it current.',
    url: 'https://bizlegal-ai.com/guides/privacy-policy-compliance-guide',
    datePublished: '2025-01-15',
    dateModified: '2025-07-22',
    mainEntityOfPage: 'https://bizlegal-ai.com/guides/privacy-policy-compliance-guide',
    publisher: { '@type': 'Organization', name: 'BizLegal AI', url: 'https://bizlegal-ai.com' },
    author: { '@type': 'Organization', name: 'BizLegal AI', url: 'https://bizlegal-ai.com' },
    inLanguage: 'en-US',
  }

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bizlegal-ai.com' },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://bizlegal-ai.com/guides' },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Privacy Policy Compliance Guide',
        item: 'https://bizlegal-ai.com/guides/privacy-policy-compliance-guide',
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <main style={{ maxWidth: '860px', margin: '0 auto', padding: '3rem 1.5rem' }}>

        {/* Breadcrumb */}
        <nav style={{ fontSize: '0.8rem', opacity: 0.55, marginBottom: '2rem' }}>
          <a href="/" style={{ color: 'inherit' }}>Home</a>
          {' → '}
          <a href="/guides" style={{ color: 'inherit' }}>Guides</a>
          {' → '}
          Privacy Policy Compliance Guide
        </nav>

        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>
          Compliance Guide · 7 Frameworks · 2025
        </span>

        {/* ── Hero ── */}
        <h1 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, margin: '0.75rem 0 1.25rem' }}>
          Privacy Policy Compliance Guide for SaaS Startups (2025)
        </h1>

        <p style={{ fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '1rem' }}>
          <strong>Your privacy policy is already stale.</strong> Most B2B SaaS privacy policies are 6&ndash;24 months out of date. In that window, Texas enacted a new privacy law, the CPPA issued binding CPRA regulations, Quebec&apos;s Law 25 PIA requirements took effect, and the EDPB updated its consent guidance. Meanwhile, your policy still lists tools you no longer use and omits the six processors you added last quarter.
        </p>

        <p style={{ lineHeight: 1.75, opacity: 0.85, marginBottom: '1.75rem' }}>
          This guide covers the 7 active frameworks your SaaS policy must address, the 7 required sections every compliant policy needs, 6 events that make your policy non-compliant the day they happen, and 5 real enforcement cases where a stale or inaccurate policy was the documented basis for the fine.
        </p>

        <div
          style={{
            background: '#eff6ff',
            border: '1px solid var(--bl-accent, #1a56db)',
            borderRadius: '10px',
            padding: '1.25rem 1.5rem',
            marginBottom: '2.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '1rem',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ flex: 1, minWidth: '240px' }}>
            <p style={{ fontWeight: 700, margin: '0 0 0.3rem' }}>Run the free 3-finding audit right now</p>
            <p style={{ fontSize: '0.9rem', opacity: 0.8, margin: 0, lineHeight: 1.6 }}>
              Paste your policy URL. We&apos;ll redline it against all 7 frameworks and show you the top 3 findings — free, in under 60 seconds.
            </p>
          </div>
          <a
            href="/agents/policy-refresh"
            style={{
              display: 'inline-block',
              padding: '0.7rem 1.5rem',
              background: 'var(--primary, #1a56db)',
              color: '#fff',
              borderRadius: '8px',
              fontWeight: 600,
              textDecoration: 'none',
              fontSize: '0.95rem',
              whiteSpace: 'nowrap',
            }}
          >
            Run Free Audit →
          </a>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border, #e5e7eb)', marginBottom: '2.5rem' }} />

        {/* ── Section 1: FRAMEWORKS table ── */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            The 7 Frameworks Your Privacy Policy Must Address
          </h2>
          <p style={{ lineHeight: 1.75, opacity: 0.85, marginBottom: '1.5rem' }}>
            Each framework has its own scope trigger — the condition that makes it apply to your SaaS. If you have users, employees, or B2B contacts in any of these jurisdictions, you are likely within scope. The table below shows what activates each framework and the clause most commonly missing from SaaS policies.
          </p>

          <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid var(--color-border, #e5e7eb)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.87rem', minWidth: '740px' }}>
              <thead>
                <tr style={{ background: 'var(--surface, #f9fafb)', borderBottom: '2px solid var(--color-border, #e5e7eb)' }}>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'left', fontWeight: 700, whiteSpace: 'nowrap' }}>Framework</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'left', fontWeight: 700, whiteSpace: 'nowrap' }}>Jurisdiction</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'left', fontWeight: 700, whiteSpace: 'nowrap' }}>Max Fine</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'left', fontWeight: 700 }}>SaaS Trigger</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'left', fontWeight: 700 }}>Most-Missed Clause</th>
                </tr>
              </thead>
              <tbody>
                {FRAMEWORKS.map((fw, i) => (
                  <tr
                    key={fw.name}
                    style={{ borderBottom: i < FRAMEWORKS.length - 1 ? '1px solid var(--color-border, #e5e7eb)' : 'none' }}
                  >
                    <td style={{ padding: '0.85rem 1rem', borderLeft: `4px solid ${fw.color}`, fontWeight: 700, whiteSpace: 'nowrap', color: fw.color }}>
                      {fw.name}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', opacity: 0.85, whiteSpace: 'nowrap' }}>{fw.jurisdiction}</td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{fw.max_fine}</td>
                    <td style={{ padding: '0.85rem 1rem', opacity: 0.85, lineHeight: 1.5 }}>{fw.trigger}</td>
                    <td style={{ padding: '0.85rem 1rem', opacity: 0.85, lineHeight: 1.5 }}>{fw.key_requirement}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p style={{ fontSize: '0.82rem', opacity: 0.55, marginTop: '0.75rem' }}>
            For the full GDPR deep-dive, see{' '}
            <a href="/guides/gdpr-compliance-checklist-saas" style={{ color: 'var(--primary, #1a56db)' }}>
              GDPR Compliance Checklist for SaaS
            </a>{' '}
            and{' '}
            <a href="/regulations/gdpr" style={{ color: 'var(--primary, #1a56db)' }}>
              GDPR Framework Overview
            </a>
            .
          </p>
        </section>

        {/* ── Section 2: POLICY_SECTIONS cards ── */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            7 Sections Every SaaS Privacy Policy Must Include
          </h2>
          <p style={{ lineHeight: 1.75, opacity: 0.85, marginBottom: '1.5rem' }}>
            A compliant privacy policy is not marketing boilerplate. Each section below is either explicitly required by one or more of the 7 frameworks, or forms the factual basis regulators examine when investigating a complaint. Missing any of them is not a technicality — it is a documented gap.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1rem' }}>
            {POLICY_SECTIONS.map((section) => (
              <div
                key={section.title}
                style={{ border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '10px', padding: '1.25rem' }}
              >
                <p style={{ fontWeight: 700, margin: '0 0 0.5rem', fontSize: '0.95rem' }}>{section.title}</p>
                <p style={{ lineHeight: 1.7, opacity: 0.85, margin: '0 0 0.85rem', fontSize: '0.9rem' }}>{section.description}</p>
                <div style={{ background: '#fffbeb', border: '1px solid #f59e0b', borderRadius: '6px', padding: '0.6rem 0.85rem' }}>
                  <p style={{ fontSize: '0.82rem', margin: 0, color: '#92400e', lineHeight: 1.55 }}>
                    <strong>Common mistake:</strong> {section.common_mistake}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section 3: STALE_TRIGGERS ── */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            6 Events That Make Your Policy Stale — Immediately
          </h2>
          <p style={{ lineHeight: 1.75, opacity: 0.85, marginBottom: '1.5rem' }}>
            Your policy does not expire on a schedule. It becomes non-compliant the moment a triggering event occurs. These six events are the most common culprits — each one is actionable by a regulator or plaintiff the day it happens, without any cure period in most frameworks.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1rem' }}>
            {STALE_TRIGGERS.map((trigger) => (
              <div
                key={trigger.event}
                style={{
                  border: '1px solid var(--color-border, #e5e7eb)',
                  borderTop: '3px solid #dc2626',
                  borderRadius: '10px',
                  padding: '1.25rem',
                }}
              >
                <p style={{ fontWeight: 700, margin: '0 0 0.5rem', fontSize: '0.95rem' }}>{trigger.event}</p>
                <p style={{ lineHeight: 1.7, opacity: 0.85, margin: '0 0 0.75rem', fontSize: '0.9rem' }}>{trigger.detail}</p>
                <p style={{ fontSize: '0.82rem', margin: 0, color: '#991b1b', fontWeight: 500, lineHeight: 1.5 }}>
                  ⚠ {trigger.consequence}
                </p>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: '1.5rem',
              padding: '1rem 1.25rem',
              background: 'var(--surface, #f9fafb)',
              border: '1px solid var(--color-border, #e5e7eb)',
              borderRadius: '8px',
            }}
          >
            <p style={{ margin: 0, lineHeight: 1.7, fontSize: '0.9rem', opacity: 0.85 }}>
              The{' '}
              <a href="/agents/policy-refresh" style={{ color: 'var(--primary, #1a56db)', fontWeight: 600 }}>
                Policy Auto-Refresh agent
              </a>{' '}
              monitors your live policy URL daily and fires an alert when a new HIGH-severity gap appears — whether from a framework amendment, a new regulatory guidance document, or a change to your own policy text. $29/mo.
            </p>
          </div>
        </section>

        {/* ── Section 4: ENFORCEMENT_CASES ── */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            Real Enforcement Actions, Real Fines
          </h2>
          <p style={{ lineHeight: 1.75, opacity: 0.85, marginBottom: '1.5rem' }}>
            In each of these cases, the enforcement action was grounded in a documented mismatch between what the published privacy policy stated and what the company actually did. A stale or inaccurate policy is not a theoretical risk — it is the recorded basis for nine-figure fines.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {ENFORCEMENT_CASES.map((c) => (
              <div
                key={c.company}
                style={{
                  border: '1px solid var(--color-border, #e5e7eb)',
                  borderRadius: '10px',
                  padding: '1.25rem 1.5rem',
                  display: 'grid',
                  gridTemplateColumns: '100px 1fr',
                  gap: '1.25rem',
                  alignItems: 'start',
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#dc2626', lineHeight: 1.1 }}>{c.fine}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.55, marginTop: '0.25rem' }}>{c.year}</div>
                </div>
                <div>
                  <p style={{ fontWeight: 700, margin: '0 0 0.2rem' }}>{c.company}</p>
                  <p style={{ fontSize: '0.8rem', opacity: 0.55, margin: '0 0 0.6rem' }}>{c.jurisdiction}</p>
                  <p style={{ lineHeight: 1.7, opacity: 0.85, margin: 0, fontSize: '0.9rem' }}>{c.issue}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section 5: REVIEW_CADENCE ── */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            Pick Your Review Cadence
          </h2>
          <p style={{ lineHeight: 1.75, opacity: 0.85, marginBottom: '1.5rem' }}>
            No framework mandates a specific review interval — they require your policy to be accurate at all times. These four tiers represent how different teams manage the gap between &ldquo;accurate when written&rdquo; and &ldquo;accurate right now.&rdquo;
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(195px, 1fr))', gap: '1rem', alignItems: 'stretch' }}>
            {REVIEW_CADENCE.map((tier) => (
              <div
                key={tier.tier}
                style={{
                  border: tier.highlighted ? '2px solid var(--primary, #1a56db)' : '1px solid var(--color-border, #e5e7eb)',
                  borderRadius: '10px',
                  padding: '1.35rem 1.25rem',
                  background: tier.highlighted ? '#eff6ff' : 'transparent',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                {tier.highlighted && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-12px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'var(--primary, #1a56db)',
                      color: '#fff',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.25rem 0.8rem',
                      borderRadius: '9999px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Recommended
                  </span>
                )}
                <p
                  style={{
                    fontWeight: 700,
                    margin: tier.highlighted ? '0.35rem 0 0' : '0',
                    fontSize: '0.9rem',
                    color: tier.highlighted ? 'var(--primary, #1a56db)' : 'inherit',
                    lineHeight: 1.3,
                  }}
                >
                  {tier.tier}
                </p>
                <p style={{ lineHeight: 1.6, opacity: 0.85, margin: 0, fontSize: '0.87rem', flexGrow: 1 }}>{tier.description}</p>
                <p style={{ fontSize: '0.82rem', opacity: 0.7, margin: 0 }}>
                  <strong>Effort:</strong> {tier.effort}
                </p>
                <p
                  style={{
                    fontSize: '0.82rem',
                    margin: 0,
                    lineHeight: 1.5,
                    color: tier.highlighted ? '#166534' : '#991b1b',
                    fontWeight: 500,
                  }}
                >
                  {tier.highlighted ? '✓ ' : '⚠ '}
                  {tier.risk_if_skipped}
                </p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '1.75rem', textAlign: 'center' }}>
            <a
              href="/agents/policy-refresh"
              style={{
                display: 'inline-block',
                padding: '0.8rem 2rem',
                background: 'var(--primary, #1a56db)',
                color: '#fff',
                borderRadius: '8px',
                fontWeight: 600,
                textDecoration: 'none',
                fontSize: '0.95rem',
              }}
            >
              Start Continuous Monitoring — $29/mo →
            </a>
          </div>
        </section>

        {/* ── Section 6: FAQ ── */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1.5rem' }}>Frequently Asked Questions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
            {FAQS.map(({ q, a }) => (
              <div
                key={q}
                style={{ border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '10px', padding: '1.25rem' }}
              >
                <p style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.95rem', margin: '0 0 0.5rem' }}>{q}</p>
                <p style={{ lineHeight: 1.75, opacity: 0.85, margin: 0, fontSize: '0.9rem' }}>{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section
          style={{
            background: 'var(--surface, #f9fafb)',
            border: '1px solid var(--color-border, #e5e7eb)',
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '3rem',
            textAlign: 'center',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.75rem' }}>
            Run the free 3-finding audit right now
          </h2>
          <p
            style={{
              lineHeight: 1.7,
              opacity: 0.85,
              maxWidth: '540px',
              margin: '0 auto 1.5rem',
              fontSize: '0.95rem',
            }}
          >
            Paste your policy URL. We&apos;ll redline it against GDPR, CCPA, CPRA, Quebec Law 25, Colorado CPA, Connecticut CTDPA, and Texas DPSA — and show you the top 3 findings free, in under 60 seconds. Full redline plus suggested replacement language at $29/mo, cancel anytime.
          </p>
          <a
            href="/agents/policy-refresh"
            style={{
              display: 'inline-block',
              padding: '0.9rem 2.5rem',
              background: 'var(--primary, #1a56db)',
              color: '#fff',
              borderRadius: '8px',
              fontWeight: 600,
              textDecoration: 'none',
              fontSize: '1rem',
            }}
          >
            Run Free Audit — Policy Auto-Refresh →
          </a>
        </section>

        {/* ── Related guides ── */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', opacity: 0.7 }}>Related Guides</h2>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: 2.1, margin: 0 }}>
            <li>
              <a href="/guides/gdpr-compliance-checklist-saas" style={{ color: 'var(--primary, #1a56db)' }}>
                GDPR Compliance Checklist for SaaS Startups
              </a>
            </li>
            <li>
              <a href="/guides/soc2-compliance-checklist-saas" style={{ color: 'var(--primary, #1a56db)' }}>
                SOC 2 Compliance Checklist for SaaS Startups
              </a>
            </li>
            <li>
              <a href="/regulations/gdpr" style={{ color: 'var(--primary, #1a56db)' }}>
                GDPR Framework Overview
              </a>
            </li>
            <li>
              <a href="/agents/policy-refresh" style={{ color: 'var(--primary, #1a56db)' }}>
                Policy Auto-Refresh Agent — $29/mo continuous monitoring
              </a>
            </li>
            <li>
              <a href="/guides" style={{ color: 'var(--primary, #1a56db)' }}>
                All Compliance Guides
              </a>
            </li>
          </ul>
        </section>

        <footer
          style={{
            borderTop: '1px solid var(--color-border, #e5e7eb)',
            paddingTop: '1.5rem',
            fontSize: '0.8rem',
            opacity: 0.5,
          }}
        >
          <p style={{ margin: 0, lineHeight: 1.7 }}>
            This guide is for informational purposes only and does not constitute legal advice. Privacy regulations are enforced differently across jurisdictions and are subject to legislative and regulatory amendment. Consult a licensed attorney qualified in data protection law for advice specific to your situation.
          </p>
        </footer>
      </main>
    </>
  )
}
