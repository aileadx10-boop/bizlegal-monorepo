import type { AppProps } from "next/app";
import { DM_Mono, DM_Sans, Playfair_Display } from "next/font/google";

import "@/app/globals.css";

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

export default function PagesApp({ Component, pageProps }: AppProps) {
  return (
    <main className={`${dmSans.variable} ${dmMono.variable} ${playfair.variable}`}>
      <Component {...pageProps} />
    </main>
  );
}
