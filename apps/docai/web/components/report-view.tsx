import type { AnalyzeResult } from "@/lib/contract-analysis";

type ReportViewProps = {
  scanId: string;
  email: string;
  filename: string;
  contractType: string;
  paid: boolean;
  riskLevel: string;
  riskScore: number;
  analysis: AnalyzeResult;
  payoneerLink?: string | null;
  invoiceError?: string | null;
};

function normalizeScore(score: number) {
  return Math.max(0, Math.min(100, score));
}

function riskTone(level: string) {
  switch (level.toLowerCase()) {
    case "critical":
      return "critical";
    case "high":
      return "high";
    case "medium":
      return "medium";
    default:
      return "low";
  }
}

export function ReportView({
  scanId,
  email,
  filename,
  contractType,
  paid,
  riskLevel,
  riskScore,
  analysis,
  payoneerLink,
  invoiceError,
}: ReportViewProps) {
  const visibleIssues = analysis.red_flags.slice(0, 2);
  const hiddenIssueCount = Math.max(0, analysis.red_flags.length - visibleIssues.length);

  return (
    <div className="report-shell">
      <div className="report-card">
        <div className="report-topline">
          <div>
            <p className="eyebrow">Contract Intelligence Report</p>
            <h1>{filename}</h1>
            <p className="section-subtitle">{contractType}</p>
          </div>
          <a className="button-secondary" href="javascript:window.print()">
            Print Report
          </a>
        </div>

        <div className="report-summary">
          <div className="gauge-card">
            <div
              className={`risk-gauge risk-gauge-${riskTone(riskLevel)}`}
              style={{ ["--risk-score" as string]: `${normalizeScore(riskScore)}%` }}
            >
              <span>{normalizeScore(riskScore)}</span>
            </div>
            <div>
              <p className="eyebrow">Risk Score</p>
              <h2>{riskLevel.toUpperCase()}</h2>
            </div>
          </div>
          <div className="summary-box">
            <p className="eyebrow">Executive Summary</p>
            <p>{analysis.summary}</p>
          </div>
        </div>

        {!paid ? (
          <>
            <div className="preview-grid">
              {visibleIssues.map((issue) => (
                <article key={`${issue.clause}-${issue.issue}`} className="issue-card">
                  <div className="issue-card-top">
                    <span className="pill">{issue.severity}</span>
                    <strong>{issue.clause}</strong>
                  </div>
                  <p>{issue.issue}</p>
                </article>
              ))}
              <article className="issue-card issue-card-locked">
                <strong>{hiddenIssueCount > 0 ? `${hiddenIssueCount}+ more flagged issues` : "Missing clause list"}</strong>
                <p>Unlock the full report to see every risk, every missing protection, and the fix path.</p>
              </article>
            </div>

            <div className="paywall">
              <div>
                <p className="eyebrow">Get Your Full Report</p>
                <h2>Unlock all red flags, missing clauses, compliance issues, and suggested fixes.</h2>
                <p className="section-subtitle">Crypto via NOWPayments · Card via Payoneer</p>
              </div>

              <form className="paywall-form" action="/api/payment/checkout" method="POST">
                <input type="hidden" name="scan_id" value={scanId} />
                <label className="field-group">
                  <span>Delivery email</span>
                  <input type="email" name="email" defaultValue={email} placeholder="you@company.com" required />
                </label>

                {invoiceError ? <p className="error-line">{invoiceError}</p> : null}

                <div className="paywall-actions">
                  <button className="button-primary" type="submit">
                    Pay $24 Crypto
                  </button>
                  <a
                    className={`button-secondary ${payoneerLink ? "" : "button-disabled"}`}
                    href={payoneerLink || "#"}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Pay $29 By Card
                  </a>
                </div>
              </form>
            </div>
          </>
        ) : (
          <>
            <div className="report-sections">
              <section className="report-section">
                <p className="eyebrow">Red Flags</p>
                <div className="preview-grid">
                  {analysis.red_flags.map((issue) => (
                    <article key={`${issue.clause}-${issue.issue}`} className="issue-card">
                      <div className="issue-card-top">
                        <span className="pill">{issue.severity}</span>
                        <strong>{issue.clause}</strong>
                      </div>
                      <p>{issue.issue}</p>
                      {issue.recommendation ? <p className="issue-fix">Suggested fix: {issue.recommendation}</p> : null}
                      {issue.suggested_fix ? <p className="issue-fix">Draft language: {issue.suggested_fix}</p> : null}
                    </article>
                  ))}
                </div>
              </section>

              <section className="report-section">
                <p className="eyebrow">Missing Clauses</p>
                <div className="pill-list">
                  {analysis.missing_clauses.map((clause) => (
                    <span key={clause} className="pill">
                      {clause}
                    </span>
                  ))}
                </div>
              </section>

              <section className="report-section">
                <p className="eyebrow">Compliance Issues</p>
                <ul className="report-list">
                  {analysis.compliance_issues.map((issue) => (
                    <li key={issue}>{issue}</li>
                  ))}
                </ul>
              </section>

              <section className="report-section highlight-section">
                <p className="eyebrow">Fix This With DocAI</p>
                <h2>{analysis.docstack_recommendation?.template_name}</h2>
                <p>{analysis.docstack_recommendation?.reason}</p>
                <a className="button-primary" href={analysis.docstack_recommendation?.href || "/#documents"}>
                  Fix this with DocStack
                </a>
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
