import type { Metadata } from "next";
import { DM_Mono, DM_Sans, Playfair_Display } from "next/font/google";

import "./globals.css";
import "./styles/theme-v2.css";
import CookieConsent from "@/components/CookieConsent";
import { ThemeToggle } from "./components/ui-v2/ThemeToggle";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-mono",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "600", "700"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "DocAI | Institutional Legal Documents",
  description:
    "Unified DocAI by BizLegal AI: generate attorney-grade contracts, review agreements, and unlock gated risk reports in one Next.js app.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
      <body className={`${dmSans.variable} ${dmMono.variable} ${playfair.variable}`}>
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 16px', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', background: 'var(--bl-bg-low, #0b1326)', borderBottom: '1px solid var(--bl-divider, rgba(218,226,253,0.08))', color: 'var(--bl-text-muted, rgba(218,226,253,0.4))', fontFamily: 'var(--bl-font-mono, var(--font-mono))' }}>
          <a href="https://bizlegal-ai.com" style={{ color: 'inherit', textDecoration: 'none' }}>← Back to BizLegal AI</a>
          <ThemeToggle size={24} />
        </div>
        <div style={{ paddingTop: '36px' }}>{children}</div>
        <CookieConsent />
      </body>
    </html>
  );
}
