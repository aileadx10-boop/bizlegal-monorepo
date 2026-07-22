import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'GDPR Legitimate Interests Guide (2025): Legitimate Interests Assessment (LIA), B2B Direct Marketing, Consent vs LIA | BizLegal AI',
  description: 'How to use legitimate interests as a GDPR legal basis: the 3-part Legitimate Interests Assessment (LIA) balancing test, when legitimate interests is appropriate vs consent (B2B direct marketing, fraud prevention, network security), EDPB guidance on legitimate interests for profiling and direct marketing, legitimate interests vs consent decision tree, and 6 common LIA mistakes that create enforcement risk.',
  alternates: { canonical: 'https://bizlegal-ai.com/guides/gdpr-legitimate-interests-guide' },
  openGraph: {
    title: 'GDPR Legitimate Interests Guide (2025) — BizLegal AI',
    description: 'GDPR legitimate interests legal basis: 3-part LIA balancing test, B2B direct marketing soft opt-in, consent vs legitimate interests decision tree, EDPB profiling guidance, and documentation requirements for GDPR Article 6(1)(f) compliance.',
    url: 'https://bizlegal-ai.com/guides/gdpr-legitimate-interests-guide',
    type: 'article',
  },
}

const FAQS = [
  {
    q: 'What is the legitimate interests legal basis under GDPR Article 6(1)(f), and when can it be used?',
    a: 'GDPR Article 6(1)(f) provides that processing is lawful where it is "necessary for the purposes of the legitimate interests pursued by the controller or by a third party, except where such interests are overridden by the interests or fundamental rights and freedoms of the data subject which require protection of personal data, in particular where the data subject is a child." Legitimate interests is one of six lawful bases for processing under GDPR — the others being consent (Article 6(1)(a)), contract (Article 6(1)(b)), legal obligation (Article 6(1)(c)), vital interests (Article 6(1)(d)), and public task (Article 6(1)(e)). Legitimate interests is often called the most "flexible" legal basis because it does not require a pre-existing contract, a legal obligation, or active consent — it allows controllers to process data based on their own business interests or third-party interests, subject to a balancing test. Key structural point: legitimate interests is a BALANCING test, not a blanket permission. The controller must assess whether its interests are "overridden by" the data subject\'s interests or fundamental rights. If they are, legitimate interests cannot be used as the legal basis regardless of how legitimate the controller\'s interest is. Recital 47 provides important guidance: it lists "direct marketing" as an example of a legitimate interest and states that "The processing of personal data for direct marketing purposes may be regarded as carried out for a legitimate interest." Recital 47 also notes that "The existence of a legitimate interest would need careful assessment including whether a data subject can reasonably expect at the time and in the context of the collection of the personal data that processing for that purpose may take place." Common use cases where legitimate interests is appropriate: (1) B2B direct marketing of similar products/services to existing customers or business contacts (not B2C cold marketing to individuals); (2) fraud prevention and security monitoring; (3) internal administration within a corporate group; (4) network and information security; (5) analytics and improvement of services where data subjects would reasonably expect this; (6) responding to or detecting security incidents; (7) employee monitoring within reasonable expectations; (8) preventing unauthorized access. Common use cases where legitimate interests is NOT appropriate: (a) processing that requires consent under specific ePrivacy rules (cookie placement, electronic direct marketing to individuals); (b) processing of special categories of data (sensitive data under Article 9 — health, race, religion, biometrics — requires one of the Article 9 conditions in addition to a lawful basis, and legitimate interests alone is not one of Article 9\'s conditions); (c) processing involving children (Recital 47 specifically notes that overriding interests are especially likely where children are involved); (d) processing that data subjects would not reasonably expect and that would likely come as a surprise.',
  },
  {
    q: 'How do you conduct a Legitimate Interests Assessment (LIA), and what must the documentation include?',
    a: 'A Legitimate Interests Assessment (LIA) is a documented balancing test that must be completed before relying on legitimate interests as a lawful basis under GDPR Article 6(1)(f). While GDPR does not prescribe a specific LIA format, the ICO (UK Information Commissioner\'s Office) and CNIL (French data protection authority) have published templates, and the European Data Protection Board (EDPB) has issued Opinion 06/2014 and various guidelines that shape the expected content. The LIA has three parts that must each be documented: Part 1 — Purpose test: identify a specific, legitimate purpose. The "legitimate interest" must be real and genuine — not speculative, generic, or invented to avoid seeking consent. Ask: (a) What is the specific purpose for the processing? Be precise — "improving our service" is too vague; "analyzing support ticket patterns to identify recurring product bugs" is specific enough. (b) Is it a legitimate interest of the controller or a third party? Legitimate interests include commercial interests, social interests, or interests of the controller\'s employees, partners, or customers. (c) Is it lawful? The interest must not conflict with applicable law. Part 2 — Necessity test: demonstrate that the processing is necessary for the stated purpose. "Necessary" under GDPR means reasonably necessary — not that it is the only possible way, but that it is not excessive relative to the purpose. Ask: (a) Would the purpose be fulfilled without the processing, or with less intrusive processing? (b) Is the data minimized to what is necessary? Processing more data than needed for the purpose fails the necessity test. (c) Are there less privacy-intrusive means to achieve the same purpose? If yes, those means must be used (or the LIA must explain why they are not adequate). Part 3 — Balancing test: weigh the controller\'s legitimate interest against the data subject\'s interests and fundamental rights. This is the most complex and fact-specific part. Factors that weigh in favor of the controller\'s interest: (a) reasonable expectation of the data subject (would they expect this processing given the context?); (b) minimal impact on the data subject (data is minimally sensitive, processing is non-intrusive); (c) relationship between the controller and data subject (existing customer relationship supports stronger expectations); (d) safeguards available (encryption, pseudonymization, access controls). Factors that weigh against the controller\'s interest (in favor of the data subject): (a) data subject would be surprised by the processing; (b) processing involves sensitive data or data likely to cause harm; (c) large-scale processing with significant profiling; (d) processing involving children or vulnerable individuals; (e) processing that limits or interferes with data subjects\' rights or freedoms; (f) risk of physical, financial, reputational, psychological, or social harm. Documentation requirements: the LIA must be documented in writing and retained as evidence of the lawful basis assessment. The Records of Processing Activities (RoPA) must identify legitimate interests as the legal basis and cross-reference the LIA. When you change the processing purpose, you must complete a new LIA — the original LIA only covers the original purpose.',
  },
  {
    q: 'Can legitimate interests be used as the legal basis for B2B direct marketing, and how does this differ from B2C marketing?',
    a: 'B2B direct marketing (marketing to businesses and business contacts) and B2C direct marketing (marketing to individual consumers) are treated very differently under GDPR and the ePrivacy Directive. This distinction has major practical implications for SaaS companies, fintech companies, and other B2B businesses. B2B direct marketing — legitimate interests as legal basis: GDPR Article 6(1)(f) and Recital 47 confirm that "direct marketing" may constitute a legitimate interest. EDPB guidance and the ICO have clarified that direct marketing to business contacts (sending relevant product/service information to people in their business capacity) can rely on legitimate interests when: (a) the marketing is relevant to the recipient\'s business role and the products/services marketed; (b) the recipient would reasonably expect to receive such marketing given the context of how their contact details were obtained; (c) the controller has provided an easy opt-out in every marketing communication; (d) the data subject has not opted out of marketing; (e) the marketing is not to a personal email address being used for personal purposes (a generic business email like marketing@company.com vs. john.smith@company.com requires assessment). Soft opt-in for similar products/services: Recital 47 and the ePrivacy Directive\'s Article 13(2) provide for a "soft opt-in" — an exception to the consent requirement for electronic marketing where: (a) the contact details were obtained in the context of a sale of products or services; (b) the marketing is for similar products or services; (c) the recipient was given an opt-out at the time of collection and in every subsequent communication. This applies to both B2B and B2C in the ePrivacy context, but in practice, B2B marketing to corporate email addresses at established business relationships is the most straightforward legitimate interests case. B2C direct marketing — more difficult under legitimate interests: while GDPR allows legitimate interests for direct marketing to individuals in principle, the ePrivacy Directive adds restrictions for electronic marketing to individuals. Most EU member states require consent for electronic marketing to consumers (individuals receiving marketing to personal email, phone, or via cookie-based targeting). The UK PECR (Privacy and Electronic Communications Regulations) follows the same pattern: consent required for most B2C electronic direct marketing, with the soft opt-in exception for existing customers. Cold email marketing to individuals you scraped from the internet: this is almost certainly NOT legitimately based on legitimate interests. The ICO has been clear that purchasing or scraping email lists and cold-emailing individuals without consent violates GDPR and PECR. Cold outreach to business contacts obtained from business directories or LinkedIn: assessed on a case-by-case basis. Better practice is to provide an opt-out opportunity at the point of first contact and before marketing begins. Key difference table: B2B to business role: legitimate interests generally available; B2C to personal email: consent generally required; B2B using purchased lists of individual names: consent or very careful LIA required; B2B to generic company emails: legitimate interests generally available with opt-out.',
  },
  {
    q: 'What does the EDPB say about using legitimate interests for profiling, analytics, and automated decision-making?',
    a: 'The EDPB (European Data Protection Board) has issued significant guidance on legitimate interests in the context of profiling and automated decision-making, making clear that legitimate interests is NOT automatically available for commercial profiling and behavioral analytics — these use cases require a careful LIA that will often fail. EDPB Opinion 06/2014 on Legitimate Interests (predecessor to the EDPB, the Article 29 Working Party): key conclusions: (a) legitimate interests must be assessed in context — what is legitimate for one controller may not be legitimate for another; (b) the "necessary" requirement limits legitimate interests to data minimized to what is needed; (c) legitimate interests balancing requires genuine engagement with the data subject\'s rights, not a pro forma exercise. EDPB Guidelines 2/2019 on Processing of Personal Data under Article 6(1)(b): while focused on contract, this guidance reinforces that "necessary" is interpreted strictly. Processing that is merely useful is not necessary. EDPB Guidelines on Automated Individual Decision-Making (Article 22): automated decision-making that produces legal or similarly significant effects CANNOT rely on legitimate interests — only contract (Article 6(1)(b)) or explicit consent (Article 6(1)(a)) are available legal bases, per the text of Article 22(2). Profiling that does NOT produce legal or significant effects: legitimate interests may apply if the LIA balancing test is satisfied. However, the EDPB has consistently held that: (a) tracking and profiling individuals across websites (behavioral advertising, third-party tracking) typically cannot rely on legitimate interests because the processing is invisible to the data subject and would likely be objectionable; (b) the balancing test for large-scale behavioral profiling of consumers typically fails because the data subjects would not expect such profiling and the scale of the processing amplifies the impact; (c) the "right to object" under Article 21 specifically applies to processing based on legitimate interests — data subjects have an absolute right to object to processing for direct marketing (Article 21(2)), and a qualified right to object to other legitimate interests processing. The French CNIL\'s enforcement action against Google (2022, €150M fine) and Facebook (2022, €60M fine) found that cookie consent flows violated GDPR — these cases also underscored that using legitimate interests for non-essential cookies (analytics, advertising) is not permissible in most EU contexts. The EDPB\'s consistency decisions and the emerging consensus is: (a) essential analytics (security, fraud detection, performance monitoring) — legitimate interests generally appropriate; (b) behavioral advertising and interest-based targeting — consent required; (c) third-party cookie tracking — consent required under ePrivacy, not eligible for legitimate interests override; (d) first-party analytics (your own users on your own site, aggregated, with opt-out available) — legitimate interests potentially available if proportionate.',
  },
  {
    q: 'What is the Right to Object under Article 21, and how does it interact with legitimate interests as a legal basis?',
    a: 'GDPR Article 21 gives data subjects the right to object to processing based on legitimate interests. The interaction between legitimate interests (as a legal basis) and the right to object is one of the most practically important aspects of GDPR data subject rights. Article 21(1) — General right to object: data subjects have the right to object, on grounds relating to their particular situation, to processing based on Article 6(1)(e) (public task) or Article 6(1)(f) (legitimate interests), including profiling based on those provisions. When a data subject objects, the controller must stop processing UNLESS the controller demonstrates compelling legitimate grounds for the processing which override the interests, rights and freedoms of the data subject, or for the establishment, exercise or defence of legal claims. What this means practically: (1) When you receive an Article 21 objection to legitimate-interests-based processing, you cannot simply continue — you must re-evaluate the balancing test in light of the data subject\'s stated particular situation; (2) The burden shifts to the controller to demonstrate "compelling" grounds — a general re-affirmation of legitimate interests is NOT sufficient; (3) If no compelling override exists, processing must stop immediately. Article 21(2) — Absolute right to object to direct marketing: where personal data are processed for direct marketing purposes, the data subject has the right to object at any time to processing of personal data for such marketing. This right is absolute — there is no balancing test. Once a data subject objects to direct marketing processing, you must stop all direct marketing to that person immediately and permanently. The right to object applies even if direct marketing was a lawful legitimate interest processing. How to operationalize Article 21 compliance: (a) Disclosure: your privacy notice must inform data subjects of their right to object under Article 21 at the point of first contact and in a transparent, prominent way (not buried in fine print). (b) Mechanism: provide a simple mechanism to object. For direct marketing, this must be a one-click unsubscribe. For other legitimate interests processing, provide a contact mechanism. (c) Timely response: respond to objections within one month (extendable to three months for complex requests). Confirm whether processing will stop or whether compelling grounds override the objection. (d) Permanent suppression: for direct marketing objections, maintain a suppression list and ensure the objecting data subject is never marketed to again (even after data purge and re-acquisition). (e) Records: document all Article 21 objections, your response, and the outcome. Suppression list and opt-out records must be maintained even after other personal data is deleted. Note: for child data, Article 21(1) objection rights are stronger — courts and DPAs have indicated that overriding an objection from a data subject concerning child data is particularly difficult.',
  },
  {
    q: 'What are the 6 most common legitimate interests mistakes that create GDPR enforcement risk?',
    a: 'DPA (data protection authority) enforcement actions and ICO investigation outcomes have identified consistent patterns of legitimate interests misuse. Understanding these common errors is essential for SaaS companies that process personal data under this legal basis. Mistake 1 — Using legitimate interests as a catch-all or default: legitimate interests is not a fall-back legal basis to use when consent would be too difficult to obtain. If your processing would not survive a genuine LIA balancing test, legitimate interests cannot be used — even if consent would be impossible in practice. Using legitimate interests instead of consent for commercial behavioral profiling, cookie-based tracking, or sending marketing emails to individuals without prior consent is specifically targeted in DPA enforcement. Mistake 2 — No documented LIA: claiming legitimate interests as a legal basis without a documented LIA is itself a compliance gap. Article 5(2) (accountability) requires controllers to demonstrate compliance with GDPR principles. If a DPA investigates your processing and you cannot produce a documented LIA showing that you conducted the balancing test, the lawful basis is effectively unsubstantiated. Mistake 3 — Failing to update the LIA when the purpose changes: a LIA is specific to the stated purpose and the processing context. If you expand processing (e.g., you analyzed purchase history for product improvement, then decided to use it for cross-sell marketing), you need a new LIA for the new purpose. Assuming the original LIA covers expanded use is a common audit finding. Mistake 4 — Not informing data subjects at point of collection: GDPR Articles 13 and 14 require controllers to inform data subjects of the legal basis for processing at the time of data collection (for Article 13, when data is collected directly; for Article 14, within one month when data is obtained from other sources). Failing to disclose legitimate interests as the legal basis — or disclosing it vaguely without specifying the legitimate interest — violates transparency obligations. Mistake 5 — Failing to honor Article 21 objections promptly: when a data subject objects to legitimate-interests-based processing, failure to stop processing within a reasonable time (without compelling grounds) is a direct GDPR violation. The most common failure: continuing to send direct marketing after an unsubscribe request. Under Article 21(2), no balancing test is available — direct marketing processing must stop immediately on objection. Mistake 6 — Using legitimate interests for processing that requires a specific legal basis: some processing has a dedicated legal basis under GDPR or related legislation that cannot be supplemented by legitimate interests. Examples: (a) special category data processing requires an Article 9 condition — legitimate interests under Article 6(1)(f) does not satisfy Article 9 requirements; (b) automated decision-making producing legal or significant effects requires Article 22 conditions — consent or contractual necessity, not legitimate interests; (c) cookie placement on user devices (even for analytics) requires consent under ePrivacy regardless of whether legitimate interests covers the underlying data processing.',
  },
]

export default function GDPRLegitimateInterestsGuide() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'GDPR Legitimate Interests Guide (2025): Legitimate Interests Assessment (LIA), B2B Direct Marketing, Consent vs LIA',
    description: 'GDPR Article 6(1)(f) legitimate interests: 3-part LIA balancing test, B2B vs B2C direct marketing, EDPB profiling guidance, Article 21 right to object, and 6 common LIA mistakes.',
    url: 'https://bizlegal-ai.com/guides/gdpr-legitimate-interests-guide',
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
      { '@type': 'ListItem', position: 3, name: 'GDPR Legitimate Interests Guide', item: 'https://bizlegal-ai.com/guides/gdpr-legitimate-interests-guide' },
    ],
  }

  const LIA_COMPARISON = [
    { useCase: 'B2B cold email to business role email', liaSuitable: '✅ Generally yes', consentRequired: '⚠️ Recommended (with opt-out)', notes: 'Soft opt-in available for existing customers; cold outreach to scraped contacts requires careful LIA' },
    { useCase: 'B2C cold email to personal email', liaSuitable: '❌ Generally no', consentRequired: '✅ Required under ePrivacy', notes: 'ePrivacy Directive / PECR requires consent for electronic direct marketing to consumers' },
    { useCase: 'Fraud prevention and security monitoring', liaSuitable: '✅ Yes', consentRequired: '❌ Not required', notes: 'ICO and EDPB confirm fraud prevention is a legitimate interest; minimal data, necessary processing' },
    { useCase: 'Website analytics (first-party, aggregated)', liaSuitable: '⚠️ Potentially yes', consentRequired: '⚠️ Consent for cookies (ePrivacy)', notes: 'Underlying analytics processing may use LI; cookie placement itself requires consent or strict necessity' },
    { useCase: 'Behavioral advertising / retargeting', liaSuitable: '❌ No', consentRequired: '✅ Required', notes: 'CNIL/ICO/EDPB guidance uniformly rejects LI for behavioral ads; consent required under ePrivacy' },
    { useCase: 'Network and information security', liaSuitable: '✅ Yes', consentRequired: '❌ Not required', notes: 'GDPR Recital 49 specifically recognizes security as a legitimate interest' },
    { useCase: 'Employee monitoring (proportionate)', liaSuitable: '⚠️ Case-by-case', consentRequired: '❌ Generally not (employee consent is not freely given)', notes: 'LI or legal obligation typically governs; monitoring must be proportionate and disclosed in workplace policies' },
    { useCase: 'Internal group administration', liaSuitable: '✅ Yes', consentRequired: '❌ Not required', notes: 'Recital 48 supports intra-group legitimate interests for administrative purposes' },
    { useCase: 'Automated decision-making with significant effects', liaSuitable: '❌ No (Article 22 prohibition)', consentRequired: '✅ Explicit consent or contract', notes: 'Article 22(2) limits legal bases to consent or contract; legitimate interests excluded' },
    { useCase: 'Processing children\'s data', liaSuitable: '❌ Almost never', consentRequired: '✅ Parental consent required', notes: 'Recital 47 notes overriding interests especially likely for children; DPAs uniformly reject LI for child data' },
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
          GDPR Legitimate Interests Guide
        </nav>

        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>
          GDPR & Privacy Law
        </span>

        <h1 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, margin: '0.75rem 0 1.25rem' }}>
          GDPR Legitimate Interests Guide (2025): The Legitimate Interests Assessment (LIA), B2B Direct Marketing, and the Right to Object
        </h1>

        <p style={{ fontSize: '1.05rem', lineHeight: 1.75, opacity: 0.85, marginBottom: '2.5rem' }}>
          Legitimate interests (Article 6(1)(f)) is GDPR's most flexible legal basis — and the most misused. DPAs across the EU have repeatedly found that controllers claim legitimate interests as a catch-all when they should have sought consent, conducted no genuine balancing test, or used it to justify behavioral advertising and commercial profiling where it cannot lawfully apply. Getting legitimate interests right requires a documented three-part assessment, specific purpose identification, and a genuine weighing of the data subject's rights against your business interests.
        </p>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border, #e5e7eb)', marginBottom: '2.5rem' }} />

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>Legitimate Interests vs Consent by Use Case</h2>
          <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem', minWidth: '580px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Use Case</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>LI Suitable?</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Consent Required?</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Key Notes</th>
                </tr>
              </thead>
              <tbody>
                {LIA_COMPARISON.map(({ useCase, liaSuitable, consentRequired, notes }) => (
                  <tr key={useCase} style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, fontSize: '0.8rem', verticalAlign: 'top' }}>{useCase}</td>
                    <td style={{ padding: '10px 12px', fontSize: '0.76rem', verticalAlign: 'top', whiteSpace: 'nowrap' }}>{liaSuitable}</td>
                    <td style={{ padding: '10px 12px', fontSize: '0.76rem', verticalAlign: 'top', whiteSpace: 'nowrap' }}>{consentRequired}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.85, fontSize: '0.76rem', verticalAlign: 'top' }}>{notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* DocAI CTA */}
        <div style={{ margin: '2.5rem 0', padding: '1.5rem', background: 'linear-gradient(135deg, #1a56db08, #1a56db14)', border: '1px solid #1a56db30', borderRadius: '10px' }}>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, marginBottom: '0.5rem' }}>Contract Risk — $97</p>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.75rem' }}>Scan Your Privacy Notice or Data Processing Agreement</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.7, opacity: 0.85, marginBottom: '1.25rem' }}>
            Upload your privacy policy, privacy notice, or data processing agreement. BizLegal AI identifies whether the legal bases disclosed (including legitimate interests) are correctly matched to the processing activities described, whether your privacy notice satisfies the Article 13/14 transparency obligations for legitimate interests processing, whether Article 21 right to object disclosures are present and adequate, and whether any processing activities claimed under legitimate interests would fail a rigorous LIA balancing test.
          </p>
          <a href="https://docai.bizlegal-ai.com" style={{ display: 'inline-block', padding: '0.6rem 1.25rem', background: '#1a56db', color: '#fff', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
            Scan Your Privacy Notice →
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
            <Link href="/guides/gdpr-compliance-checklist-saas" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>GDPR Compliance Checklist →</Link>
            <Link href="/guides/gdpr-data-processing-agreement-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>GDPR DPA Guide →</Link>
            <Link href="/guides/privacy-policy-compliance-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>Privacy Policy Guide →</Link>
            <Link href="/guides/eu-us-data-transfer-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>EU-US Data Transfer Guide →</Link>
            <Link href="/guides/ccpa-cpra-compliance-checklist" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>CCPA/CPRA Checklist →</Link>
            <Link href="/guides" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>All Guides →</Link>
          </div>
        </div>

        <footer style={{ borderTop: '1px solid var(--color-border, #e5e7eb)', paddingTop: '1.5rem', fontSize: '0.8rem', opacity: 0.5 }}>
          <p style={{ margin: 0, lineHeight: 1.7 }}>
            This guide is for informational purposes only and does not constitute legal advice. GDPR legitimate interests analysis is highly fact-specific — the same processing activity may be lawful under legitimate interests in one context and unlawful in another. EDPB guidelines, DPA enforcement decisions, and national implementing legislation continue to evolve. The right outcome in any specific case depends on the particular processing, the data subjects involved, the controller-data subject relationship, and the applicable national law. Consult qualified data privacy counsel before relying on legitimate interests as a legal basis.
          </p>
        </footer>

      </main>
    </>
  )
}
