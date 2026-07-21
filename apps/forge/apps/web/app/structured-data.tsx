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
    "@id": "https://forge.bizlegal-ai.com#organization",
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
        "email": "support@bizlegal-ai.com",
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
      "@id": "https://forge.bizlegal-ai.com#website",
      "name": "Forge Compliance Engine",
      "url": "https://forge.bizlegal-ai.com",
    },
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://forge.bizlegal-ai.com#site",
    "url": "https://forge.bizlegal-ai.com",
    "name": "Forge Compliance Engine",
    "description": "BOI/CTA filing kits, Regulatory Passports, and Web Compliance Scanner for US businesses and Israeli tech companies expanding globally. Practitioner-reviewed compliance intelligence.",
    "inLanguage": "en-US",
    "publisher": { "@id": "https://forge.bizlegal-ai.com#organization" },
  };

  const software = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Forge Compliance Engine",
    "url": "https://forge.bizlegal-ai.com",
    "description": "Multi-framework regulatory compliance for modern businesses. BOI Report Kit $149, Regulatory Passport $297, Web Compliance Scanner from $99. Practitioner-reviewed. Crypto + card checkout. 14-day money-back.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "AggregateOffer",
      "lowPrice": "49",
      "highPrice": "297",
      "priceCurrency": "USD",
      "offerCount": "3",
      "url": "https://forge.bizlegal-ai.com/pricing",
      "availability": "https://schema.org/InStock",
    },
    "provider": { "@id": "https://forge.bizlegal-ai.com#organization" },
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
