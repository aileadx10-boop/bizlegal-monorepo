import type { ReactElement } from "react";

/**
 * StructuredData — JSON-LD for SEO + AI-citation.
 *
 * Emits three blocks:
 *   1. Organization   — identity, parent org, contact
 *   2. WebSite        — search context for the subdomain
 *   3. SoftwareApplication — App Store / rich-result eligibility
 *
 * Server-rendered into <head>; crawlers index it without JS execution.
 * Idempotent: same output on every render.
 */
export default function StructuredData(): ReactElement {
  const org = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://docai.bizlegal-ai.com#organization",
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
      "@id": "https://docai.bizlegal-ai.com#website",
      "name": "DocAI — Contract & SQA Intelligence",
      "url": "https://docai.bizlegal-ai.com",
    },
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://docai.bizlegal-ai.com#site",
    "url": "https://docai.bizlegal-ai.com",
    "name": "DocAI — Contract & SQA Intelligence",
    "description": "Unified DocAI by BizLegal AI: generate attorney-grade contracts, review agreements, and unlock gated risk reports in one Next.js app.",
    "inLanguage": "en-US",
    "publisher": { "@id": "https://docai.bizlegal-ai.com#organization" },
  };

  const software = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DocAI — Contract & SQA Intelligence",
    "url": "https://docai.bizlegal-ai.com",
    "description": "Unified DocAI by BizLegal AI: generate attorney-grade contracts, review agreements, and unlock gated risk reports in one Next.js app.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "97",
      "priceCurrency": "USD",
      "description": "Free SQA preview, $97 per contract scan, $69-199/month subscriptions",
      "url": "https://docai.bizlegal-ai.com/pricing",
      "availability": "https://schema.org/InStock",
    },
    "provider": { "@id": "https://docai.bizlegal-ai.com#organization" },
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
