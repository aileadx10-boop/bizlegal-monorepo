import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'SaaS Billing Compliance Guide (2025): FTC Click-to-Cancel Rule, Automatic Renewal Laws, EU Omnibus Directive | BizLegal AI',
  description: 'How SaaS companies must comply with the FTC Click-to-Cancel Rule (effective July 2025), state automatic renewal laws (California ARL, New York, Illinois), EU Omnibus Directive 30-day price history requirement, CFPB unfair billing practices, and negative option marketing requirements under FTC Section 5.',
  alternates: { canonical: 'https://bizlegal-ai.com/guides/saas-billing-compliance-guide' },
  openGraph: {
    title: 'SaaS Billing Compliance Guide (2025) — BizLegal AI',
    description: 'FTC Click-to-Cancel Rule, negative option marketing, state automatic renewal laws, EU Omnibus price history, and CFPB unfair billing enforcement — the complete guide for SaaS subscription businesses.',
    url: 'https://bizlegal-ai.com/guides/saas-billing-compliance-guide',
    type: 'article',
  },
}

const FAQS = [
  {
    q: 'What does the FTC Click-to-Cancel Rule require, and when does it take effect?',
    a: 'The FTC\'s "Click-to-Cancel" rule (formally the Negative Option Rule, 16 C.F.R. Part 425) was finalized in October 2024 and became effective January 19, 2025, with a phased compliance deadline. The rule governs negative option marketing — subscription models where a consumer\'s failure to take action (silence or inaction) results in ongoing charges. What the rule requires: (1) Simple mechanism to cancel: sellers must provide a mechanism to cancel a subscription that is at least as easy to use as the mechanism to sign up. If a consumer can sign up online, they must be able to cancel online. If they signed up by phone, they must be able to cancel by phone. This eliminates cancellation flows that require calling customer service when sign-up was online, requiring chat support that deflects cancellation, or multi-step retention flows that delay the cancellation. (2) Immediate cancellation processing: upon cancellation request, sellers must cancel immediately (or at the end of the current paid period) without additional retention hurdles. (3) Clear disclosure before charge: before charging, sellers must clearly and conspicuously disclose all material terms of the negative option feature — including the amount the consumer will be charged, the date(s) when charges will occur, and how to cancel. Disclosures must appear immediately adjacent to the consent mechanism. (4) Express informed consent: sellers must obtain express, informed consent to the negative option feature before billing. Consent must be captured and retained. (5) Prohibition on misrepresentation: any misrepresentation of material terms of the negative option feature (pricing, cancellation policy, trial terms) violates the rule. What counts as a "negative option feature": (a) continuity plans (subscribe and receive products automatically); (b) auto-renewal provisions (annual plan renews unless cancelled); (c) free-to-paid conversions (free trial converts to paid without affirmative opt-in at the time of conversion); (d) trial marketing offers (trial pricing converts to standard pricing automatically). Civil penalties: FTC can seek up to $51,744 per violation per day. In the Fortnite case (Epic Games, 2023), the FTC secured $245 million for dark pattern billing practices. In the Amazon Prime case (2023), FTC alleged Amazon illegally enrolled consumers without consent; Amazon settled for $25 million (consent decree still governs Amazon\'s subscription practices). Enforcement began immediately — the transition period that ended January 2025 applied only to the annual audit requirement. The clear and conspicuous disclosure, consent, and cancellation mechanism requirements are currently enforceable.',
  },
  {
    q: 'What does California\'s Automatic Renewal Law (ARL) require for SaaS subscriptions, and how does it differ from the FTC rule?',
    a: 'California Business and Professions Code Sections 17600-17606 (the Automatic Renewal Law, ARL) is among the most comprehensive automatic renewal statutes in the US and applies to any offer of automatic renewal or continuous service that is presented to a California consumer. It is stricter in several respects than the FTC Click-to-Cancel Rule. California ARL requirements: (1) Clear and conspicuous disclosure before sign-up: the automatic renewal offer terms must be presented clearly and conspicuously — meaning in "larger type than the surrounding text, or in contrasting type, font, or color to the surrounding text of the same size, or set off from the surrounding text of the same size by symbols or other marks." The disclosure must appear immediately adjacent to the request for consent. Required disclosure elements for ARL compliance: (a) that the subscription will automatically renew unless the consumer cancels; (b) the length of the automatic renewal term; (c) the cancellation policy that allows the consumer to cancel; (d) the amount that will be charged. (2) Affirmative consent required: the consumer must affirmatively consent to the automatic renewal offer terms before the consumer is charged. Checking a pre-checked box does not satisfy this requirement. The consumer must actively check an unchecked box or take an equivalent affirmative action. (3) Acknowledgment to consumer: after sign-up, the seller must send an acknowledgment that includes the automatic renewal offer terms, cancellation policy, and information about how to cancel. For annual subscriptions or subscriptions of 12 months or more, the seller must send a clear and conspicuous notice of the upcoming charge between 3-30 days before the charge date. (4) Online cancellation required: if the initial offer was made online, the consumer must be able to cancel online via a clear and conspicuous link or button. (5) Gift without additional charge: if a consumer accepts an offer that includes a trial period and is then charged without being provided with the required disclosures and affirmative consent, the consumer is entitled to the goods or services without being charged. Enforcement: ARL violations can give rise to class action litigation under California\'s Unfair Competition Law (UCL, Business and Professions Code Section 17200). UCL class actions do not require proof of actual deception by individual class members — only that defendant violated the law. Class action settlements in ARL cases routinely reach tens of millions of dollars. Recent examples: Adobe (2023 CFPB enforcement, $13M settlement for unclear cancellation terms), Peloton (2022 ARL class action settlement, $19.2M), SiriusXM (2023 class action settlement, $54M). New York, Illinois, and other states have similar laws: New York General Obligations Law Section 5-903 requires 15-60 days advance notice before automatic renewal. Illinois Automatic Contract Renewal Act (815 ILCS 601) requires advance notice and easy cancellation. Delaware, Massachusetts, Oregon, Texas, and others have their own requirements. The federal FTC Click-to-Cancel Rule does not preempt more protective state laws — if California ARL is stricter (as it often is), the California rule governs for California consumers. Multi-state SaaS companies should design their billing flows to satisfy the most stringent requirement across all states where they have customers.',
  },
  {
    q: 'What does the EU Omnibus Directive require regarding pricing disclosures for SaaS companies?',
    a: 'The EU Omnibus Directive (Directive (EU) 2019/2161), which amended the Consumer Rights Directive, Unfair Commercial Practices Directive, and Price Indication Directive, introduced significant new pricing transparency requirements that affect SaaS companies operating in EU member states. Effective dates: member states were required to transpose by November 28, 2021; transposition varied by member state with most implementing between 2022-2023. The 30-day prior price rule (Directive 98/6/EC, Article 6a as amended): when a product or service is sold with a price reduction or promotional offer, sellers must display the prior price alongside the reduced price. The prior price must be the lowest price applied during the 30-day period before the price reduction was introduced. Why this matters for SaaS: "Flash sales," "limited time offers," and "introductory pricing" must be accompanied by the lowest price charged in the prior 30 days. A company cannot price something at $99/month for 30 days, drop it to $79/month and advertise "21% off" if they had previously charged $79/month — the prior lowest price (from before the original $99 period) would need to be displayed. Annual plan discounts: if you offer "$499/year (save 17% vs monthly)" you must be able to show the lowest monthly price in the prior 30 days was $49.95/month. If the monthly price changed during that 30-day period, the lowest price governs. Dynamic pricing: frequent price changes complicate compliance because the "prior price" calculation resets with each change. Consistent pricing is easier to comply with than frequent discounting. Digital subscription introductory pricing under the Consumer Rights Directive (as amended): for contracts under which the price is determined after conclusion of the contract (or the price will increase after an initial period), the total price for each billing period must be disclosed before the consumer is bound. Free trials converting to paid: under the amended Consumer Rights Directive, consumers must be reminded of the start of their paid obligation and must have the right to withdraw. Article 8(6) of the Consumer Rights Directive requires that when a digital content contract includes a free trial that automatically converts, the consumer is informed before the paid period begins and can cancel. Personalized pricing disclosure: if a price is personalized based on automated decision-making (algorithms, profiling), the trader must inform the consumer that the price is personalized. Member state enforcement: the Omnibus Directive does not harmonize penalties — each member state sets its own. Germany, France, and the Netherlands have the most aggressive enforcement. German authorities have fined companies up to 4% of annual turnover for Omnibus violations. UK: after Brexit, the UK implemented similar requirements under the Consumer Contracts Regulations and the Price Marking Order. The UK\'s Digital Markets, Competition and Consumers Act 2024 introduces new subscription requirements effective January 2026: clear information at point of sale, reminder notice before renewal, simple cancellation mechanism — closely mirroring the California ARL and FTC rules.',
  },
  {
    q: 'What CFPB enforcement actions target SaaS and subscription billing, and what practices should companies avoid?',
    a: 'The Consumer Financial Protection Bureau (CFPB) has enforcement jurisdiction over consumer financial products and services, including subscription billing practices when they involve financial harm to consumers. The CFPB\'s Section 1031 of the Dodd-Frank Act prohibits unfair, deceptive, and abusive acts or practices (UDAAP). An act is UNFAIR if it causes substantial injury to consumers, the injury is not reasonably avoidable, and the injury is not outweighed by countervailing benefits. An act is DECEPTIVE if it involves a material misrepresentation that is likely to mislead a consumer acting reasonably. An act is ABUSIVE if it materially interferes with consumers\' ability to understand a product, or takes unreasonable advantage of consumers. Key CFPB enforcement patterns in subscription billing: (1) Hidden fees and charges: in 2024, the CFPB issued a rule (still effective despite industry challenges) requiring banks and financial institutions to disclose all fees clearly before consumers are bound. The underlying UDAAP authority has been used to pursue subscription businesses that bury charges in terms of service. (2) Dark patterns in cancellation: the CFPB has highlighted subscription cancellation flows that require multiple steps, deliberate time delays, or mandatory phone calls as "abusive" under Section 1031 because they take unreasonable advantage of consumers\' desire to cancel by adding friction that benefits the company at consumers\' expense. (3) Free trial to paid conversions without adequate disclosure: charging consumers after a free trial without sending a clear notification of the upcoming charge is a recurring CFPB enforcement focus. The CFPB\'s 2023 circular on "junk fees" specifically called out subscription billing models that charge consumers without adequate advance notice. (4) Misleading pricing representations: advertising "cancel anytime" while imposing early termination fees, minimum commitment periods, or per-seat minimum charges that effectively prevent cancellation violates UDAAP. (5) Negative option enrollment without consent: enrolling consumers in subscriptions (or upselling to higher tiers) without affirmative opt-in is specifically targeted by CFPB enforcement. The CFPB\'s 2023 enforcement action against TransUnion ($23M civil penalty, $15M redress) included allegations of negative option enrollment without proper consent. Specific practices to avoid: (a) requiring consumers to call to cancel when they signed up online; (b) automatically upgrading users to higher tiers without affirmative consent; (c) imposing annual commitments without disclosing them clearly at sign-up; (d) advertising "cancel anytime" when there are minimum commitment periods; (e) charging for unused seats or services after the stated cancellation date; (f) sending cancellation confirmations that restart subscriptions unless the consumer takes further action; (g) burying automatic renewal terms below the fold or in fine print; (h) pre-checking "agree to automatic renewal" checkboxes.',
  },
  {
    q: 'What are the disclosure requirements for free-to-paid trial conversions, and how should annual vs monthly renewal notices differ?',
    a: 'Free-to-paid trial conversions and subscription renewals are high-enforcement-risk areas because they represent moments when consumers are charged without necessarily expecting a charge. Regulatory requirements have converged around advance notice before any charge that the consumer might not have anticipated. Free trial to paid conversion — required disclosures and timing: (1) At sign-up: before the consumer enters payment information for a free trial, you must disclose clearly and conspicuously: (a) that the trial will automatically convert to a paid subscription; (b) the exact amount that will be charged after the trial; (c) when the first charge will occur (specific date or "after X days"); (d) how to cancel before being charged. This disclosure must appear immediately adjacent to the payment information capture — not buried in terms of service that require scrolling. (2) Before conversion: California ARL requires notice 3-30 days before the first charge on an annual plan. For free trials converting to paid monthly plans, a reminder notice is best practice under the FTC rule (and in several states, required). The notice must include the amount to be charged, the charge date, and a one-click cancellation link. (3) Consent at conversion: the FTC Click-to-Cancel Rule requires "express, informed consent" to the negative option feature before billing. For trials, this means the consumer must have checked an unchecked box or taken an equivalent affirmative action acknowledging the conversion at the time they enrolled in the trial — not just accepted your general terms. Annual subscription renewal notices — requirements by framework: California ARL requires sellers to send a clear and conspicuous notice of automatic renewal 3-30 days before the renewal date for plans of 12 months or more. The notice must contain: the amount that will be charged, the date of the charge, the renewal term, the cancellation policy, and how to cancel. FTC Click-to-Cancel Rule: for annual plans, best practice is to send renewal notice 30 days before the charge. The rule does not specify a minimum notice period for renewals (it applies to the initial enrollment), but failure to notify before charging annually would likely be characterized as a deceptive act. New York General Obligations Law Section 5-903: requires 15-60 days advance notice before automatic renewal of contracts of 12 months or longer. Illinois Automatic Contract Renewal Act: requires advance notice (at least 30 days) before annual plan renewal. Best practice checklist for renewal compliance: (a) send renewal reminders for all annual and multi-year subscriptions, 30 days before charge; (b) send trial expiration reminders, 48-72 hours before trial ends; (c) include cancellation link in every renewal reminder that links directly to the cancellation flow (no authentication required if possible); (d) send cancellation confirmation with effective date and final access date; (e) retain records of consents and notices for minimum 3 years (many states have 3-year statute of limitations for ARL claims); (f) use clear subject lines ("Your BizLegal subscription renews in 3 days — $499") rather than vague subjects ("Account update"); (g) send from a recognized domain that passes DMARC/SPF/DKIM (reminders in spam are not excused).',
  },
  {
    q: 'How should SaaS Terms of Service and subscription agreements be drafted to comply with these requirements?',
    a: 'SaaS Terms of Service (ToS) are the contractual foundation for billing compliance — but they are not a substitute for in-product disclosures. Courts have repeatedly held that disclosures buried in terms of service do not satisfy "clear and conspicuous" disclosure requirements. The ToS must work in concert with in-product disclosures, email notices, and the checkout flow. Critical ToS provisions for billing compliance: (1) Subscription and billing terms: clearly define the billing cycle (monthly, annual), the amount charged per cycle, the currency, and whether prices include applicable taxes. Specify exactly when billing begins (at sign-up, at end of trial, at activation). State the annual renewal date or that renewal is on the anniversary of sign-up. (2) Automatic renewal language: use plain language, not just legal terms. "Your subscription automatically renews at the end of each billing period. For annual plans, we will send you a reminder 30 days before renewal. You may cancel at any time by [specific cancellation mechanism] and your subscription will not renew." Avoid language like "unless you timely notify us of your wish to cancel" — "timely" is ambiguous and does not specify the mechanism. (3) Cancellation policy: specify the exact cancellation mechanism (link in account settings, email to cancel@company.com, phone number). State whether cancellation takes effect immediately or at end of billing period. Specify whether there is any refund for unused days in the current period. Avoid "cancel anytime" if there are any constraints (minimum commitment periods, per-seat minimums). (4) Price change notice: specify how much advance notice you provide before price increases, and that consumers may cancel if they don\'t accept the new price. California ARL requires that a price increase triggers a new affirmative consent requirement before the higher price is charged. (5) Free trial terms: explicitly state when the trial ends, what happens automatically (conversion to paid subscription at specified price), and the mechanism to cancel before being charged. State that by entering payment information for the trial, the consumer is authorizing the conversion charge unless they cancel. (6) Disputes and chargebacks: specify the dispute resolution process and that consumers must contact you first before initiating a chargeback. Include a dispute resolution timeline. (7) Jurisdiction and governing law: specify which state or country\'s law governs. If you have California customers, ensure your cancellation mechanism satisfies California ARL regardless of your governing law clause — ARL applies based on where the consumer is located, not where the business is incorporated. Common ToS drafting mistakes: (a) using arbitration clauses that eliminate class action rights without providing adequate individual remedies for billing disputes; (b) including terms that purport to authorize charging "amounts owed" without specifying which amounts; (c) ToS that allow the company to change prices by posting updated terms online without any affirmative notice requirement; (d) cancellation terms that describe a different process than the actual cancellation flow (if users call to cancel but ToS says cancel online, consumers may have a claim); (e) ToS that include minimum commitment periods without prominently disclosing them at sign-up.',
  },
]

export default function SaaSBillingComplianceGuide() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'SaaS Billing Compliance Guide (2025): FTC Click-to-Cancel Rule, Automatic Renewal Laws, EU Omnibus Directive',
    description: 'Complete guide to SaaS billing compliance: FTC Click-to-Cancel Rule, California ARL, EU Omnibus 30-day price history, CFPB unfair billing enforcement, free trial disclosure requirements, and subscription agreement drafting.',
    url: 'https://bizlegal-ai.com/guides/saas-billing-compliance-guide',
    publisher: { '@type': 'Organization', name: 'BizLegal AI', url: 'https://bizlegal-ai.com' },
    author: { '@type': 'Organization', name: 'BizLegal AI' },
    inLanguage: 'en-US',
    datePublished: '2026-01-01',
    dateModified: '2026-07-22',
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
      { '@type': 'ListItem', position: 3, name: 'SaaS Billing Compliance Guide', item: 'https://bizlegal-ai.com/guides/saas-billing-compliance-guide' },
    ],
  }

  const COMPLIANCE_MATRIX = [
    {
      requirement: 'Clear disclosure before enrollment',
      ftcClickToCancel: '✅ Required — immediately adjacent to consent',
      caARL: '✅ Required — clear and conspicuous',
      euOmnibus: '✅ Required — before consumer is bound',
      cfpbUdaap: '✅ Required — material terms before charge',
      nyGoL: '⚠️ Implied by ARL / UDAP',
    },
    {
      requirement: 'Affirmative consent (unchecked box)',
      ftcClickToCancel: '✅ Required',
      caARL: '✅ Required — no pre-checked boxes',
      euOmnibus: '✅ Required under Consumer Rights Directive',
      cfpbUdaap: '✅ Required to avoid "abusive" classification',
      nyGoL: '⚠️ Not explicit — best practice',
    },
    {
      requirement: 'Online cancellation mechanism',
      ftcClickToCancel: '✅ Must match sign-up mechanism',
      caARL: '✅ Required if signed up online',
      euOmnibus: '✅ Required under UK DMCCA (2026)',
      cfpbUdaap: '✅ Friction-heavy cancellation = abusive',
      nyGoL: '⚠️ Not specified — ARL best practice',
    },
    {
      requirement: 'Annual renewal advance notice',
      ftcClickToCancel: '⚠️ No specified period (best practice: 30 days)',
      caARL: '✅ 3-30 days before charge',
      euOmnibus: '✅ Required — member state period varies',
      cfpbUdaap: '✅ Failure to notify = deceptive practice',
      nyGoL: '✅ 15-60 days before renewal',
    },
    {
      requirement: 'Price change notice before billing',
      ftcClickToCancel: '✅ Material terms change triggers re-disclosure',
      caARL: '✅ Price increase requires new affirmative consent',
      euOmnibus: '✅ 30-day prior price display for discounts',
      cfpbUdaap: '✅ Surprise price increase = deceptive',
      nyGoL: '✅ Required under ARL principles',
    },
    {
      requirement: 'Free trial → paid conversion notice',
      ftcClickToCancel: '✅ Required before conversion charge',
      caARL: '✅ Required; 3-30 day reminder for annual',
      euOmnibus: '✅ Consumer must be informed before paid period',
      cfpbUdaap: '✅ Charging without notice = deceptive',
      nyGoL: '⚠️ Best practice',
    },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <main style={{ maxWidth: '760px', margin: '0 auto', padding: '3rem 1.5rem' }}>

        <nav style={{ fontSize: '0.8rem', opacity: 0.55, marginBottom: '2rem' }}>
          <a href="/" style={{ color: 'inherit' }}>Home</a>
          {' → '}
          <a href="/guides" style={{ color: 'inherit' }}>Guides</a>
          {' → '}
          SaaS Billing Compliance Guide
        </nav>

        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>
          Consumer Protection & Billing Law
        </span>

        <h1 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, margin: '0.75rem 0 1.25rem' }}>
          SaaS Billing Compliance Guide (2025): FTC Click-to-Cancel Rule, Automatic Renewal Laws, and the EU Omnibus Directive
        </h1>

        <p style={{ fontSize: '1.05rem', lineHeight: 1.75, opacity: 0.85, marginBottom: '2.5rem' }}>
          Subscription billing has become one of the highest-enforcement-risk areas in SaaS law. The FTC Click-to-Cancel Rule took effect in 2025. California, New York, and 11 other states have automatic renewal statutes with class action exposure. The EU Omnibus Directive introduced new price history requirements for EU customers. Adobe paid $13 million for unclear cancellation terms, Amazon paid $25 million for Prime enrollment practices, and Peloton paid $19.2 million in an ARL class action. Your Terms of Service and checkout flow may be noncompliant right now.
        </p>

        <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', padding: '1rem 1.25rem', marginBottom: '2.5rem' }}>
          <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.7 }}>
            <strong>FTC enforcement alert:</strong> The FTC Click-to-Cancel Rule has been effective since January 19, 2025. Companies that require phone calls to cancel online subscriptions, use retention flows that delay cancellation, or fail to provide clear disclosures before charging are currently subject to civil penalties of up to $51,744 per violation per day.
          </p>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border, #e5e7eb)', marginBottom: '2.5rem' }} />

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>Billing Compliance Requirements by Framework</h2>
          <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem', minWidth: '640px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Requirement</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>FTC Click-to-Cancel</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>CA ARL</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>EU Omnibus</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>CFPB UDAAP</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>NY GOL</th>
                </tr>
              </thead>
              <tbody>
                {COMPLIANCE_MATRIX.map(({ requirement, ftcClickToCancel, caARL, euOmnibus, cfpbUdaap, nyGoL }) => (
                  <tr key={requirement} style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, fontSize: '0.8rem', verticalAlign: 'top' }}>{requirement}</td>
                    <td style={{ padding: '10px 12px', fontSize: '0.76rem', verticalAlign: 'top' }}>{ftcClickToCancel}</td>
                    <td style={{ padding: '10px 12px', fontSize: '0.76rem', verticalAlign: 'top' }}>{caARL}</td>
                    <td style={{ padding: '10px 12px', fontSize: '0.76rem', verticalAlign: 'top' }}>{euOmnibus}</td>
                    <td style={{ padding: '10px 12px', fontSize: '0.76rem', verticalAlign: 'top' }}>{cfpbUdaap}</td>
                    <td style={{ padding: '10px 12px', fontSize: '0.76rem', verticalAlign: 'top' }}>{nyGoL}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* DocAI CTA */}
        <div style={{ margin: '2.5rem 0', padding: '1.5rem', background: 'linear-gradient(135deg, #1a56db08, #1a56db14)', border: '1px solid #1a56db30', borderRadius: '10px' }}>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, marginBottom: '0.5rem' }}>Contract Risk — $97</p>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.75rem' }}>Scan Your Terms of Service or Subscription Agreement</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.7, opacity: 0.85, marginBottom: '1.25rem' }}>
            Upload your SaaS Terms of Service, subscription agreement, or billing policy. BizLegal AI identifies whether your cancellation mechanism is compliant with the FTC Click-to-Cancel Rule, whether your automatic renewal disclosures satisfy California ARL requirements, whether your free trial conversion terms include the required disclosures, and whether any provisions constitute unfair or deceptive billing practices under CFPB UDAAP standards.
          </p>
          <a href="https://docai.bizlegal-ai.com" style={{ display: 'inline-block', padding: '0.6rem 1.25rem', background: '#1a56db', color: '#fff', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
            Scan Your Terms of Service →
          </a>
        </div>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1.25rem' }}>Frequently Asked Questions</h2>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: i < FAQS.length - 1 ? '1px solid var(--color-border, #e5e7eb)' : 'none' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.4 }}>{faq.q}</h3>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.75, opacity: 0.85, margin: 0 }}>{faq.a}</p>
            </div>
          ))}
        </section>

        <div style={{ borderTop: '1px solid var(--color-border, #e5e7eb)', paddingTop: '2rem', marginTop: '2rem', marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '1rem' }}>Related compliance resources</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <Link href="/guides/terms-of-service-guide-saas" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Terms of Service Guide →</Link>
            <Link href="/guides/ccpa-cpra-compliance-checklist" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>CCPA/CPRA Checklist →</Link>
            <Link href="/guides/payment-processing-compliance-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Payment Processing Compliance →</Link>
            <Link href="/guides/gdpr-compliance-checklist-saas" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>GDPR Compliance Checklist →</Link>
            <Link href="/guides/saas-master-subscription-agreement-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>SaaS MSA Guide →</Link>
            <Link href="/guides" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>All Guides →</Link>
          </div>
        </div>

        <footer style={{ borderTop: '1px solid var(--color-border, #e5e7eb)', paddingTop: '1.5rem', fontSize: '0.8rem', opacity: 0.5 }}>
          <p style={{ margin: 0, lineHeight: 1.7 }}>
            This guide is for informational purposes only and does not constitute legal advice. FTC enforcement priorities, California ARL enforcement, EU Omnibus Directive implementation, and CFPB regulatory guidance are subject to change. Civil penalty amounts and class action exposure vary based on the specific facts and jurisdiction. Consult qualified legal counsel before revising your subscription billing terms or checkout flows.
          </p>
        </footer>

      </main>
    </>
  )
}
