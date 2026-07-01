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
    "@id": "https://leadforge.bizlegal-ai.com#organization",
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
      "@id": "https://leadforge.bizlegal-ai.com#website",
      "name": "LeadForge — B2B Lead Intelligence",
      "url": "https://leadforge.bizlegal-ai.com",
    }},
  }};

  const website = {{
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://leadforge.bizlegal-ai.com#site",
    "url": "https://leadforge.bizlegal-ai.com",
    "name": "LeadForge — B2B Lead Intelligence",
    "description": "LeadForge powers the main deals funnel while Pipeforge handles the unclaimed funds upsell inside one unified Next.js deployment.",
    "inLanguage": "en-US",
    "publisher": {{ "@id": "https://leadforge.bizlegal-ai.com#organization" }},
  }};

  const software = {{
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "LeadForge — B2B Lead Intelligence",
    "url": "https://leadforge.bizlegal-ai.com",
    "description": "LeadForge powers the main deals funnel while Pipeforge handles the unclaimed funds upsell inside one unified Next.js deployment.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {{
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "description": "Free lead-intake screen, paid routing for qualified leads",
      "url": "https://leadforge.bizlegal-ai.com/pricing",
      "availability": "https://schema.org/InStock",
    }},
    "provider": {{ "@id": "https://leadforge.bizlegal-ai.com#organization" }},
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
