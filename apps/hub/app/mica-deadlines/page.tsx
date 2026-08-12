import type { Metadata } from "next"
import { supabaseAdmin } from "@/lib/supabase"
import { MICA_BASELINE, toView, type MicaDeadline } from "@/lib/mica-deadlines"
import MicaDeadlinesClient from "./MicaDeadlinesClient"

export const dynamic = "force-dynamic"
export const revalidate = 0

export const metadata: Metadata = {
  title: "MiCA Deadline Tracker — Key Dates for CASPs (2025-2026)",
  description:
    "Every statutory MiCA milestone for crypto-asset service providers: when the authorisation requirement, Travel Rule, stablecoin rules and grandfathering windows hit — with citations to EUR-Lex and ESMA. Curated daily.",
  keywords: [
    "MiCA deadlines",
    "MiCA 2026",
    "CASP authorisation deadline",
    "MiCA transitional regime",
    "Travel Rule MiCA date",
    "stablecoin rules MiCA",
    "ESMA MiCA technical standards",
    "crypto compliance timeline",
  ],
  alternates: { canonical: "https://bizlegal-ai.com/mica-deadlines" },
  openGraph: {
    title: "MiCA Deadline Tracker — Key Dates for CASPs",
    description:
      "When the big MiCA deadlines hit, who they hit, and where to verify — curated from EUR-Lex and ESMA, refreshed daily.",
    url: "https://bizlegal-ai.com/mica-deadlines",
  },
}

/**
 * Server page: reads the `mica_deadlines` cache table (seeded daily by
 * `/api/cron/mica-deadlines`). If the migration hasn't been applied yet
 * or the read fails, falls back to the curated baseline so the page is
 * never empty and never 500s.
 */
async function loadRows(): Promise<Array<MicaDeadline & { id: number }>> {
  try {
    const { data, error } = await supabaseAdmin
      .from("mica_deadlines")
      .select("*")
      .order("deadline_date", { ascending: true })
    if (error || !data || data.length === 0) {
      return MICA_BASELINE.map((r, i) => ({ ...r, id: i + 1 }))
    }
    return data as Array<MicaDeadline & { id: number }>
  } catch {
    return MICA_BASELINE.map((r, i) => ({ ...r, id: i + 1 }))
  }
}

export default async function MicaDeadlinesPage() {
  const rows = await loadRows()
  const view = toView(rows)
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
        <MicaDeadlinesClient rows={view} />
      </div>
    </div>
  )
}
