import Link from 'next/link'

interface AuthorBioProps {
  topics?: string[]
}

const CREDENTIALS = [
  { label: 'LLB · LLM', sub: 'International Commercial Law' },
  { label: '20 Years', sub: 'Active Legal Practice' },
  { label: 'Notary + Arbitrator', sub: 'Commissioned & International' },
  { label: 'Jurisdictions', sub: 'UAE · EU · US · UK · Singapore' },
]

export default function AuthorBio({ topics }: AuthorBioProps) {
  const personLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'BizLegal AI Senior Counsel',
    jobTitle: 'International Commercial Lawyer',
    description:
      'LLB, LLM-qualified international commercial lawyer, notary, and arbitrator with 20 years of active practice across UAE, EU, US, UK, and Singapore jurisdictions. Builder of BizLegal AI.',
    url: 'https://bizlegal-ai.com/about',
    worksFor: {
      '@type': 'Organization',
      name: 'BizLegal AI',
      url: 'https://bizlegal-ai.com',
    },
    knowsAbout: topics ?? [
      'Securities Law',
      'Crypto-Asset Regulation',
      'GDPR',
      'AML Compliance',
      'Digital Asset Markets',
      'International Commercial Arbitration',
      'Cross-Border Business Law',
    ],
    hasCredential: [
      {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'degree',
        name: 'LLB (Bachelor of Laws)',
      },
      {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'degree',
        name: 'LLM — International Commercial Law',
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }}
      />

      <div
        style={{
          marginTop: 48,
          padding: '24px 28px',
          background: 'var(--bg-mid, rgba(255,255,255,0.03))',
          borderRadius: 10,
          border: '1px solid var(--outline-var, rgba(255,255,255,0.08))',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 20,
            alignItems: 'flex-start',
            flexWrap: 'wrap',
          }}
        >
          {/* Avatar placeholder */}
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8e 100%)',
              border: '2px solid var(--primary, #1d4ed8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontSize: 22,
            }}
            aria-hidden="true"
          >
            ⚖️
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 10,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--primary, #3b82f6)',
                fontWeight: 700,
                marginBottom: 6,
              }}
            >
              About the Author
            </div>

            <p
              style={{
                margin: '0 0 16px',
                fontSize: 13,
                lineHeight: 1.75,
                color: 'var(--on-surface-var)',
              }}
            >
              This hub was written and is maintained by an LLB, LLM-qualified international
              commercial lawyer, notary, and arbitrator with 20 years of active practice. The
              analysis draws on direct practitioner experience across UAE, EU, US, UK, and
              Singapore jurisdictions — not synthesis from secondary sources.
            </p>

            {/* Credential chips */}
            <div
              style={{
                display: 'flex',
                gap: 8,
                flexWrap: 'wrap',
                marginBottom: 16,
              }}
            >
              {CREDENTIALS.map((c) => (
                <div
                  key={c.label}
                  style={{
                    padding: '4px 12px',
                    borderRadius: 6,
                    background: 'var(--bg, rgba(0,0,0,0.2))',
                    border: '1px solid var(--outline-var, rgba(255,255,255,0.08))',
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: 'var(--on-surface)',
                    }}
                  >
                    {c.label}
                  </div>
                  <div
                    style={{
                      fontSize: 9,
                      color: 'var(--on-surface-var)',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {c.sub}
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/about"
              style={{
                fontSize: 11,
                color: 'var(--primary, #3b82f6)',
                textDecoration: 'none',
                fontWeight: 600,
                letterSpacing: '0.04em',
              }}
            >
              Full credentials and methodology →
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
