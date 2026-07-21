import type { ReactElement } from "react";

/**
 * StructuredData — JSON-LD for SEO + AI-citation.
 *
 * Emits three blocks:
 *   1. Organization       — identity, parent org, contact
 *   2. WebSite            — search context for the subdomain
 *   3. SoftwareApplication — App Store / rich-result eligibility
 *
 * Server-rendered into <head>; crawlers index it without JS execution.
 */
export default function StructuredData(): ReactElement {
  const org = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://tracr.bizlegal-ai.com#organization",
    "name": "DOR INNOVATIONS",
    "alternateName": "BizLegal AI",
    "url": "https://bizlegal-ai.com",
    "logo": "https://bizlegal-ai.com/icon.png",
    "description": "Compliance-as-a-service for B2B SaaS, fintech, and DAOs. Operated by DOR INNOVATIONS.",
    "foundingDate": "2024",
    "founder": {
      "@type": "Person",
      "name": "Moses Dor",
      "jobTitle": "Founder & CEO",
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "IL",
    },
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "contactType": "customer support",
        "email": "intelligence@bizlegal-ai.com",
        "url": "https://bizlegal-ai.com/contact",
        "availableLanguage": ["English"],
      },
    ],
    "sameAs": [
      "https://bizlegal-ai.com",
      "https://docai.bizlegal-ai.com",
      "https://brai.bizlegal-ai.com",
      "https://forge.bizlegal-ai.com",
      "https://tracr.bizlegal-ai.com",
      "https://lexaudit.bizlegal-ai.com",
      "https://leadforge.bizlegal-ai.com",
    ],
    "subOrganization": {
      "@type": "WebSite",
      "@id": "https://tracr.bizlegal-ai.com#website",
      "name": "TRACR — Wallet Intelligence",
      "url": "https://tracr.bizlegal-ai.com",
    },
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://tracr.bizlegal-ai.com#site",
    "url": "https://tracr.bizlegal-ai.com",
    "name": "TRACR — Wallet Intelligence",
    "description": "On-chain forensic wallet reports for compliance teams, legal counsel, and asset recovery. Per-investigation pricing from $29 to $799. 9 chains, court-ready output.",
    "inLanguage": "en-US",
    "publisher": { "@id": "https://tracr.bizlegal-ai.com#organization" },
  };

  const software = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "TRACR Wallet Intelligence",
    "url": "https://tracr.bizlegal-ai.com",
    "description": "On-chain forensic wallet reports covering 9 chains with OFAC/UN/EU sanctions screening, counterparty graph traversal, and court-ready output. Regulatory scan $29, full forensic $149–$799.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "AggregateOffer",
      "lowPrice": "29",
      "highPrice": "799",
      "priceCurrency": "USD",
      "offerCount": "4",
      "url": "https://tracr.bizlegal-ai.com/pricing",
      "availability": "https://schema.org/InStock",
    },
    "provider": { "@id": "https://tracr.bizlegal-ai.com#organization" },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(software) }}
      />
    </>
  );
}
