import { enrichAnalyzeResult, type AnalyzeResult } from "@/lib/contract-analysis";
import { supabaseAdmin } from "@/lib/supabase";

export type ScanRow = {
  id: string;
  email: string | null;
  filename: string;
  contract_type: string | null;
  score: number | null;
  paid: boolean | null;
  ai_content: AnalyzeResult | string | null;
};

export function buildFallbackAnalysis(contractType: string, riskScore: number): AnalyzeResult {
  return enrichAnalyzeResult({
    risk_level: riskScore >= 80 ? "critical" : riskScore >= 60 ? "high" : riskScore >= 35 ? "medium" : "low",
    risk_score: riskScore,
    contract_type: contractType,
    red_flags: [],
    missing_clauses: [],
    compliance_issues: [],
    summary: "The scan exists, but the structured report payload could not be fully reconstructed.",
  });
}

export function parseStoredAnalysis(scan: Pick<ScanRow, "ai_content" | "contract_type" | "score">) {
  const fallback = buildFallbackAnalysis(scan.contract_type || "Commercial Contract", scan.score ?? 0);

  if (!scan.ai_content) {
    return fallback;
  }

  try {
    const parsed =
      typeof scan.ai_content === "string"
        ? (JSON.parse(scan.ai_content) as Partial<AnalyzeResult>)
        : (scan.ai_content as Partial<AnalyzeResult>);

    return enrichAnalyzeResult({
      ...fallback,
      ...parsed,
      contract_type: parsed.contract_type || fallback.contract_type,
      risk_score: typeof parsed.risk_score === "number" ? parsed.risk_score : fallback.risk_score,
      red_flags: Array.isArray(parsed.red_flags) ? parsed.red_flags : fallback.red_flags,
      missing_clauses: Array.isArray(parsed.missing_clauses) ? parsed.missing_clauses : fallback.missing_clauses,
      compliance_issues: Array.isArray(parsed.compliance_issues) ? parsed.compliance_issues : fallback.compliance_issues,
    });
  } catch (error) {
    console.error("Failed to parse stored report payload.", error);
    return fallback;
  }
}

export async function fetchScanReport(scanId: string) {
  const { data, error } = await supabaseAdmin
    .from("contract_scans")
    .select("id, email, filename, contract_type, score, paid, ai_content")
    .eq("id", scanId)
    .single();

  if (error || !data) {
    console.error("Failed to load scan report.", { scanId, error });
    return null;
  }

  const scan = data as ScanRow;

  return {
    scan,
    analysis: parseStoredAnalysis(scan),
  };
}
