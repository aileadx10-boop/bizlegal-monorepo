import type { Metadata } from "next"
import type { ReactNode } from "react"
import Link from "next/link"
import "./globals.css"
import "./styles/theme-v2.css"
import { ThemeToggle } from "./components/ui-v2/ThemeToggle"

export const metadata: Metadata = {
  title: "BRAI — Blockchain Regulatory Intelligence",
  description:
    "BRAI produces compliance posture reports for digital-asset ventures. Human-reviewed. Not legal advice.",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Theme V2 — set data-theme synchronously to avoid flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('bl-theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);if(t==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
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
        <main>{children}</main>
      </body>
    </html>
  )
}

const navLink = { color: "var(--muted)", textDecoration: "none" }
