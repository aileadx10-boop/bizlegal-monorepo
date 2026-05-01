import type { Metadata } from "next"

export const siteConfig = {
  name: "BizLegal AI",
  description:
    "Forensic-grade blockchain intelligence, AI compliance certificates, and regulatory intelligence. Built by an LLB+LLM international commercial lawyer with 20 years of practice.",
  url: "https://bizlegal-ai.com",
  ogImage: "https://bizlegal-ai.com/api/og?title=BizLegal+AI+Compliance+Intelligence",
  logo: "https://bizlegal-ai.com/logo.png",
  keywords: [
    "blockchain forensics",
    "compliance certificates",
    "AI contracts",
    "regulatory intelligence",
    "GDPR compliance",
    "MiCA",
    "VARA",
    "crypto compliance",
    "legal technology",
    "international commercial law",
  ],
  authors: [{ name: "BizLegal AI", url: "https://bizlegal-ai.com" }],
  creator: "BizLegal AI",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website" as const,
    locale: "en_US",
    siteName: "BizLegal AI",
    url: "https://bizlegal-ai.com",
    title: "BizLegal AI — Regulatory Intelligence Command Center",
    description:
      "Forensic-grade blockchain intelligence, AI compliance certificates, and regulatory intelligence. Built by a 20-year international commercial lawyer.",
    images: [
      {
        url: "https://bizlegal-ai.com/api/og?title=BizLegal+AI",
        width: 1200,
        height: 630,
        alt: "BizLegal AI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image" as const,
    title: "BizLegal AI — Regulatory Intelligence Command Center",
    description: "Forensic-grade blockchain intelligence and AI compliance tools.",
    creator: "@bizlegal_ai",
  },
}

export const pageMetadata = {
  home: {
    title: "BizLegal AI — Regulatory Intelligence Command Center",
    description:
      "Six AI-powered legal tools built by an LLB+LLM international commercial lawyer. Blockchain forensics, compliance certificates, AI contracts.",
    alternates: { canonical: "https://bizlegal-ai.com" },
  },
  products: {
    title: "Products | BizLegal AI",
    description:
      "Six legal intelligence tools: BRAI, TRACR, LexAudit, DocAI, Forge, LeadForge. Built by a 20-year international commercial lawyer.",
    alternates: { canonical: "https://bizlegal-ai.com/products" },
  },
  trust: {
    title: "Trust & Security | BizLegal AI",
    description:
      "Four-layer hallucination prevention, expert review, full audit trails. How BizLegal AI ensures legal accuracy.",
    alternates: { canonical: "https://bizlegal-ai.com/trust" },
  },
  about: {
    title: "About | BizLegal AI",
    description:
      "Built by an LLB+LLM international commercial lawyer, notary, and arbitrator with 20 years of practice.",
    alternates: { canonical: "https://bizlegal-ai.com/about" },
  },
  blog: {
    title: "Resources | BizLegal AI",
    description:
      "150+ compliance and regulatory intelligence articles. Filtered by jurisdiction: UAE, US, EU, UK, Singapore.",
    alternates: { canonical: "https://bizlegal-ai.com/blog" },
  },
  intelligence: {
    title: "Intelligence Reports | BizLegal AI",
    description:
      "Premium compliance research packaged as digital products. Updated quarterly. Written by a 20-year practitioner.",
    alternates: { canonical: "https://bizlegal-ai.com/products/intelligence" },
  },
}

export function generatePageMetadata(
  page: keyof typeof pageMetadata,
  custom?: Partial<Metadata>
): Metadata {
  const base = pageMetadata[page]
  return {
    title: base.title,
    description: base.description,
    keywords: siteConfig.keywords,
    openGraph: { ...siteConfig.openGraph, title: base.title, description: base.description },
    twitter: { ...siteConfig.twitter, title: base.title, description: base.description },
    alternates: base.alternates,
    robots: siteConfig.robots,
    ...custom,
  }
}

export function generateArticleMetadata(params: {
  title: string
  description: string
  publishedAt: string
  slug: string
  jurisdiction?: string
  image?: string
}): Metadata {
  const url = `https://bizlegal-ai.com/blog/${params.slug}`
  const img = params.image ?? siteConfig.ogImage
  return {
    title: `${params.title} | BizLegal AI`,
    description: params.description,
    openGraph: {
      ...siteConfig.openGraph,
      title: params.title,
      description: params.description,
      url,
      type: "article",
      publishedTime: params.publishedAt,
      images: [{ url: img, width: 1200, height: 630 }],
    },
    twitter: { ...siteConfig.twitter, title: params.title, description: params.description },
    alternates: { canonical: url },
    robots: siteConfig.robots,
  }
}

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: siteConfig.name, template: "%s | BizLegal AI" },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  openGraph: siteConfig.openGraph,
  twitter: siteConfig.twitter,
  robots: siteConfig.robots,
}
