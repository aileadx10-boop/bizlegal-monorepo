/**
 * mica-deadlines.ts — MiCA Deadline Tracker (W1-3).
 *
 * Source of truth for the daily `/api/cron/mica-deadlines` digest:
 *  - `MICA_BASELINE` — a curated set of known MiCA milestones with citations.
 *    This is the reliable backbone (dates are statutory / official ESMA-EU
 *    publications, not scraped guesses).
 *  - `fetchEsmNews()` — best-effort enhancement from ESMA's news RSS. If the
 *    feed is down or changes shape, the baseline still stands — the cron never
 *    fails because an external feed moved.
 *
 * Every row carries source_name + source_url so the digest can cite it and the
 * liability rule holds ("deadlines change — verify with your NCA").
 */

export interface MicaDeadline {
  title: string
  description: string
  deadline_date: string // YYYY-MM-DD
  source_name: string
  source_url: string
  jurisdiction: string
  item_type: "deadline" | "transition" | "guidance"
}

// Curated MiCA milestones. Verify against official sources before editing.
// MiCA: Regulation (EU) 2023/1114. Transitional regime art. 143, CASP
// authorisation requirements applied from 2025-12-30 (EU-wide) with NCA
// grandfathering windows; the 2026-07-01 wave is the big one.
export const MICA_BASELINE: MicaDeadline[] = [
  {
    title: "MiCA enters into force",
    description:
      "Regulation (EU) 2023/1114 on markets in crypto-assets published and enters into force.",
    deadline_date: "2023-06-29",
    source_name: "EUR-Lex",
    source_url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32023R1114",
    jurisdiction: "EU",
    item_type: "transition",
  },
  {
    title: "Stablecoin rules apply (Title III & IV)",
    description:
      "Rules for asset-referenced tokens (ARTs) and e-money tokens (EMTs) apply directly — stablecoin issuers need authorisation to offer to the EU public.",
    deadline_date: "2024-06-30",
    source_name: "ESMA",
    source_url: "https://www.esma.europa.eu/regulation/markets-crypto-assets-regulation-mica",
    jurisdiction: "EU",
    item_type: "deadline",
  },
  {
    title: "CASP authorisation requirement begins",
    description:
      "MiCA's core rules for crypto-asset service providers (CASP authorisation, Travel Rule, sanctions screening) apply across the EU.",
    deadline_date: "2024-12-30",
    source_name: "ESMA",
    source_url: "https://www.esma.europa.eu/regulation/markets-crypto-assets-regulation-mica",
    jurisdiction: "EU",
    item_type: "deadline",
  },
  {
    title: "End of national transitional / grandfathering regimes (EU-wide wave)",
    description:
      "NCAs' transitional regimes for pre-existing CASPs expire. Firms still operating under a national regime must complete MiCA authorisation or wind down. The biggest deadline wave in the market — confirm your NCA's specific date.",
    deadline_date: "2026-07-01",
    source_name: "ESMA",
    source_url: "https://www.esma.europa.eu/regulation/markets-crypto-assets-regulation-mica",
    jurisdiction: "EU",
    item_type: "deadline",
  },
  {
    title: "MiCAR implementing technical standards (RTS/ITS) apply",
    description:
      "ESMA's final technical standards under MiCA (authorisation templates, operational resilience, data reporting) apply to CASPs.",
    deadline_date: "2025-06-30",
    source_name: "ESMA",
    source_url: "https://www.esma.europa.eu/regulation/markets-crypto-assets-regulation-mica",
    jurisdiction: "EU",
    item_type: "guidance",
  },
]

export const MICA_BASELINE_SOURCES: string[] = [
  "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32023R1114",
  "https://www.esma.europa.eu/regulation/markets-crypto-assets-regulation-mica",
]

const ESMA_RSS =
  "https://www.esma.europa.eu/rss/news.xml"

export interface EsmNewsItem {
  title: string
  link: string
  pubDate: string
}

/**
 * Best-effort pull of ESMA news items. Returns [] on any failure — the
 * baseline carries the digest; this is enhancement only.
 */
export async function fetchEsmNews(): Promise<EsmNewsItem[]> {
  try {
    const res = await fetch(ESMA_RSS, {
      headers: { "User-Agent": "BizLegal-AI-MiCA-Tracker/1.0" },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return []
    const xml = await res.text()
    const items: EsmNewsItem[] = []
    const itemRe = /<item>([\s\S]*?)<\/item>/g
    let m: RegExpExecArray | null
    while ((m = itemRe.exec(xml))) {
      const block = m[1]
      const title = /<title>([^<]*)<\/title>/.exec(block)?.[1] ?? ""
      const link = /<link>([^<]*)<\/link>/.exec(block)?.[1] ?? ""
      const pubDate = /<pubDate>([^<]*)<\/pubDate>/.exec(block)?.[1] ?? ""
      if (title && link) {
        items.push({ title: decodeXml(title), link: decodeXml(link), pubDate })
      }
    }
    return items
  } catch {
    return []
  }
}

function decodeXml(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

/** Only ESMA items that mention MiCA / crypto-assets / deadlines qualify. */
export function isMicaRelevant(title: string): boolean {
  const t = title.toLowerCase()
  return (
    t.includes("mica") ||
    t.includes("mi ca") ||
    t.includes("crypto-asset") ||
    t.includes("crypto asset") ||
    t.includes("casp")
  )
}

/** Extract a plausible YYYY-MM-DD from an RFC-822 pubDate, or null. */
export function pubDateToIso(pubDate: string): string | null {
  const d = new Date(pubDate)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString().slice(0, 10)
}

/**
 * Build the tracker view for the page: deadlines sorted by date, flagged
 * past / upcoming / urgent (<90 days out).
 */
export interface MicaDeadlineView extends MicaDeadline {
  id: number
  isPast: boolean
  daysUntil: number | null
  isUrgent: boolean
}

export function toView(rows: Array<MicaDeadline & { id: number }>, today?: Date): MicaDeadlineView[] {
  const now = today ?? new Date()
  const todayIso = now.toISOString().slice(0, 10)
  return rows
    .map((r) => {
      const daysUntil = Math.round(
        (new Date(r.deadline_date).getTime() - new Date(todayIso).getTime()) /
          (24 * 60 * 60 * 1000)
      )
      return {
        ...r,
        isPast: r.deadline_date < todayIso,
        daysUntil: Number.isNaN(daysUntil) ? null : daysUntil,
        isUrgent: !(r.deadline_date < todayIso) && daysUntil >= 0 && daysUntil <= 90,
      }
    })
    .sort((a, b) => a.deadline_date.localeCompare(b.deadline_date))
}
