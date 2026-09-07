'use client'

import { useEffect } from 'react'

/**
 * Flip the document to English/LTR for this route and put it back on the way out.
 *
 * The root layout is `lang="he" dir="rtl"` because Israel is the first market.
 * English text laid out right-to-left reads as broken software, so any English
 * route re-stamps the document element.
 */
export default function LtrShell({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const el = document.documentElement
    const prevLang = el.lang
    const prevDir = el.dir
    el.lang = 'en'
    el.dir = 'ltr'
    return () => {
      el.lang = prevLang
      el.dir = prevDir
    }
  }, [])
  return <>{children}</>
}
