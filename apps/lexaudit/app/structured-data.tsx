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
export default function StructuredData(): ReactElement {{
  const org = {{
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://lexaudit.bizlegal-ai.com#organization",
    "name": "DOR INNOVATIONS",
    "alternateName": "BizLegal AI",
    "url": "https://bizlegal-ai.com",
    "logo": "https://bizlegal-ai.com/icon.png",
    "description": "Compliance-as-a-service for B2B SaaS, fintech, and DAOs. Operated by DOR INNOVATIONS.",
    "foundingDate": "2024",
    "founder": {{
      "@type": "Person",
      "name": "Moses Dor",
      "jobTitle": "Founder & CEO",
    }},
    "address": {{
      "@type": "PostalAddress",
      "addressCountry": "IL",
    }},
    "contactPoint": [
      {{
        "@type": "ContactPoint",
        "contactType": "customer support",
        "email": "intelligence@bizlegal-ai.com",
        "url": "https://bizlegal-ai.com/contact",
        "availableLanguage": ["English"],
      }},
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
    "subOrganization": {{
      "@type": "WebSite",
      "@id": "https://lexaudit.bizlegal-ai.com#website",
      "name": "LexAudit — Compliance Health Scores",
      "url": "https://lexaudit.bizlegal-ai.com",
    }},
  }};

  const website = {{
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://lexaudit.bizlegal-ai.com#site",
    "url": "https://lexaudit.bizlegal-ai.com",
    "name": "LexAudit — Compliance Health Scores",
    "description": "Regulatory intelligence \u2014 not legal advice. LexAudit turns your AI-assisted matter workflow into a versioned, source-cited Compliance Health Score reviewed by a named analyst.",
    "inLanguage": "en-US",
    "publisher": {{ "@id": "https://lexaudit.bizlegal-ai.com#organization" }},
  }};

  const software = {{
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "LexAudit — Compliance Health Scores",
    "url": "https://lexaudit.bizlegal-ai.com",
    "description": "Regulatory intelligence \u2014 not legal advice. LexAudit turns your AI-assisted matter workflow into a versioned, source-cited Compliance Health Score reviewed by a named analyst.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {{
      "@type": "Offer",
      "price": "99",
      "priceCurrency": "USD",
      "description": "$99/month monitor for SOC 2, ISO 27001, GDPR, HIPAA, DPDP, NIST 800-53",
      "url": "https://lexaudit.bizlegal-ai.com/pricing",
      "availability": "https://schema.org/InStock",
    }},
    "provider": {{ "@id": "https://lexaudit.bizlegal-ai.com#organization" }},
  }};

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
}}
