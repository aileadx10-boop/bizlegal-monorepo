import type { Metadata } from "next"
import WalletScreenerClient from "./WalletScreenerClient"

// Static route shadows the dynamic app/tools/[slug]/page.tsx stub (App Router
// prefers the more-specific static segment). Kept out of the [slug] PAGES
// array so generateStaticParams does not double-claim the slug.

export const metadata: Metadata = {
  title: "Free Sanctions & Wallet Screener — Check a Wallet Against OFAC, UN & EU Lists | BizLegal AI",
  description:
    "Free sanctions screening for a single Ethereum wallet address. Check one address against the OFAC SDN, UN Consolidated, and EU Financial Sanctions lists — instant three-way result with list citations. No account required.",
  keywords: [
    "sanctions screening",
    "wallet screening",
    "OFAC SDN check",
    "sanctioned address",
    "crypto compliance",
    "AML wallet check",
    "MiCA CASP screening",
  ],
  alternates: { canonical: "https://bizlegal-ai.com/tools/wallet-screener" },
  openGraph: {
    title: "Free Sanctions & Wallet Screener | BizLegal AI",
    description:
      "Check one Ethereum wallet against OFAC, UN, and EU sanctions lists — free, instant, with citations.",
    url: "https://bizlegal-ai.com/tools/wallet-screener",
  },
}

export default function WalletScreenerPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        paddingTop: "48px",
        paddingBottom: "96px",
      }}
    >
      <div className="quantum-container">
        <WalletScreenerClient />
      </div>
    </div>
  )
}
