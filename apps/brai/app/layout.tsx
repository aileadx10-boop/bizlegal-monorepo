import type { Metadata } from "next"
import type { ReactNode } from "react"
import Link from "next/link"
import "./globals.css"
import "./styles/theme-v2.css"
import { ThemeToggle } from "./components/ui-v2/ThemeToggle"
import { ThemeProvider, themeFOUCScript } from '@bizlegal/themes'

export const metadata: Metadata = {
  title: "BRAI — Blockchain Regulatory Intelligence",
  description:
    "BRAI produces compliance posture reports for digital-asset ventures. Human-reviewed. Not legal advice.",
}

const LANDING_FOUC = themeFOUCScript({
  primary: 'royal-dark',
  alternate: 'royal-light',
  storageKey: 'brai-theme',
})

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Subdomain Design Pass — Fraunces + Inter for the LandingV2 homepage. */}
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,ital,wght@9..144,0,300;9..144,0,400;9..144,1,300;9..144,1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
        {/* Existing bl-theme FOUC (light/dark) — kept for /pricing, /methodology, /trust. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('bl-theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);if(t==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
        {/* Subdomain Design Pass FOUC — sets CSS vars for the LandingV2 themes (royal-dark/royal-light). */}
        <script dangerouslySetInnerHTML={{ __html: LANDING_FOUC }} />
      </head>
      <body>
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 28px",
            borderBottom: "1px solid var(--outline-var)",
            background: "var(--bg-low)",
            fontFamily: "var(--font-mono, ui-monospace)",
            fontSize: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link href="https://bizlegal-ai.com" style={{ color: "var(--muted)", textDecoration: "none" }}>
              ← BizLegal AI
            </Link>
            <span style={{ color: "var(--outline)" }}>·</span>
            <Link href="/" style={{ color: "var(--on-surface)", fontWeight: 600, textDecoration: "none", letterSpacing: "0.08em" }}>
              BRAI
            </Link>
          </div>
          <nav style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <Link href="/pricing" style={navLink}>Pricing</Link>
            <Link href="/methodology" style={navLink}>Methodology</Link>
            <Link href="/trust" style={navLink}>Trust</Link>
            <Link href="/contact" style={navLink}>Contact</Link>
            <ThemeToggle size={22} />
          </nav>
        </header>
        <ThemeProvider primary="royal-dark" alternate="royal-light" storageKey="brai-theme">
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}

const navLink = { color: "var(--muted)", textDecoration: "none" }
