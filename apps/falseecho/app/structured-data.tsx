import type { ReactElement } from "react";

/**
 * StructuredData — JSON-LD for SEO + AI-citation.
 * Organization + WebSite + SoftwareApplication, server-rendered into <head>.
 */
export default function StructuredData(): ReactElement {
  const org = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://falseecho.bizlegal-ai.com#organization",
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
      "https://falseecho.bizlegal-ai.com",
    ],
    "subOrganization": {
      "@type": "WebSite",
      "@id": "https://falseecho.bizlegal-ai.com#website",
      "name": "FalseEcho — AI Falsehood Monitoring",
      "url": "https://falseecho.bizlegal-ai.com",
    },
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "FalseEcho",
    "url": "https://falseecho.bizlegal-ai.com",
    "publisher": { "@id": "https://falseecho.bizlegal-ai.com#organization" },
  };

  const app = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "FalseEcho",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "description":
      "AI falsehood monitoring for professionals. Probes ChatGPT, Claude, Perplexity, and Google AI Overviews for false claims about a person or firm and captures hash-anchored evidence packs.",
    "url": "https://falseecho.bizlegal-ai.com",
    "offers": [
      { "@type": "Offer", "name": "FalseEcho Audit", "price": "29", "priceCurrency": "USD" },
      { "@type": "Offer", "name": "FalseEcho Monitor", "price": "149", "priceCurrency": "USD" },
    ],
    "brand": { "@type": "Brand", "name": "FalseEcho" },
    "provider": { "@type": "Organization", "name": "BizLegal AI", "url": "https://bizlegal-ai.com" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(app) }} />
    </>
  );
}
