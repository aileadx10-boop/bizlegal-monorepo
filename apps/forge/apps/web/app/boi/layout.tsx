import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'State Transparency Report Kit — $149 | Forge Compliance Engine',
  description: 'Federal BOI filing for US domestic companies ended under FinCEN\'s 2025 rule. Map your LLC to state-level transparency duties — New York\'s enacted LLC Transparency Act and proposed acts elsewhere. Statute-cited, practitioner-reviewed, delivered in 2–5 minutes.',
  keywords: 'state transparency act, NY LLC Transparency Act, LLC disclosure requirements, beneficial ownership state law, LLC transparency, state disclosure duty',
  openGraph: {
    title: 'State Transparency Report Kit — Map Your LLC to State Disclosure Duties',
    description: 'States are filling the gap left by the end of federal BOI filing for domestic companies. NY LLCTA enacted; more states proposed. $149 flat fee, statute-cited.',
    url: 'https://forge.bizlegal-ai.com/boi',
    siteName: 'Forge Compliance Engine',
    type: 'website',
  },
  alternates: { canonical: 'https://forge.bizlegal-ai.com/boi' },
}

export default function BOILayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'SoftwareApplication',
                name: 'State Transparency Report Kit',
                url: 'https://forge.bizlegal-ai.com/boi',
                description: 'Guided state-level transparency disclosure kit for US LLCs, corporations, and partnerships. Maps entity details to enacted and proposed state transparency laws (e.g. NY LLC Transparency Act) with statute citations. Practitioner-reviewed output in 2–5 minutes. $149 flat fee.',
                applicationCategory: 'BusinessApplication',
                operatingSystem: 'Web',
                offers: {
                  '@type': 'Offer',
                  price: '149',
                  priceCurrency: 'USD',
                  availability: 'https://schema.org/InStock',
                  url: 'https://forge.bizlegal-ai.com/boi',
                },
                provider: {
                  '@type': 'Organization',
                  name: 'BizLegal AI',
                  url: 'https://bizlegal-ai.com',
                },
              },
              {
                '@type': 'FAQPage',
                mainEntity: [
                  {
                    '@type': 'Question',
                    name: 'What is the State Transparency Report Kit?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'The kit maps your entity details to the state-level transparency disclosure laws that apply to you. Federal BOI filing for US domestic companies ended under FinCEN\'s 2025 interim rule, and states are filling the gap — New York\'s LLC Transparency Act is enacted, and similar bills are proposed in other states. The kit identifies which duties apply, cites the controlling statutes, and walks you through what each law actually requires.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'Is federal BOI filing still required?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'No for US domestic companies. FinCEN\'s interim final rule (March 2025) removed domestic companies from the Corporate Transparency Act\'s beneficial-ownership reporting requirement; only certain foreign companies remain in scope. State-level transparency laws are a separate matter — New York\'s LLC Transparency Act (NY LLC Law § 1106) is enacted and phases in from January 1, 2026.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'Which states currently have transparency disclosure laws?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'As of this writing, New York\'s LLC Transparency Act is enacted (effective January 1, 2026 for newly formed LLCs; January 1, 2027 for existing ones). Disclosure bills have been proposed in other states — including California- and DC-style proposals — but are not enacted law. The kit distinguishes enacted duties from proposed legislation and cites each source so you can verify.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'What information does a state transparency disclosure typically require?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'State transparency acts generally follow the beneficial-ownership model: for each individual owning 25%+ or exercising substantial control, expect to disclose name, address, and identifying details. Exact requirements vary by state — the kit maps the specifics for your formation state and cites the controlling statute for each item.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'Does the $149 kit include update reminders?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'Yes. The kit includes reminders to re-check your state disclosure duties when ownership changes or when a proposed state bill is enacted — state transparency legislation is moving quickly and duties can appear mid-year.',
                    },
                  },
                ],
              },
              {
                '@type': 'BreadcrumbList',
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://forge.bizlegal-ai.com' },
                  { '@type': 'ListItem', position: 2, name: 'State Transparency Kit', item: 'https://forge.bizlegal-ai.com/boi' },
                ],
              },
            ],
          }),
        }}
      />
      {children}
    </>
  )
}
