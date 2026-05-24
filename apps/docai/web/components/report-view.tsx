import type { AnalyzeResult, RedFlag, UnsupportedClaim } from "@/lib/contract-analysis";

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

const SEVERITY_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
const PAYPAL_SCAN_ENABLED = process.env.NEXT_PUBLIC_PAYPAL_SCAN_ENABLED === "true";

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

function severity(issue: RedFlag) {
  return issue.severity?.toLowerCase() || "medium";
}

function sortBySeverity(issues: RedFlag[]) {
  return [...issues].sort((left, right) => (SEVERITY_ORDER[severity(left)] ?? 2) - (SEVERITY_ORDER[severity(right)] ?? 2));
}

function previewIssues(issues: RedFlag[]) {
  const prioritized = sortBySeverity(issues.filter((issue) => ["critical", "high", "medium"].includes(severity(issue))));
  return (prioritized.length ? prioritized : sortBySeverity(issues)).slice(0, 2);
}

function lockedSeveritySummary(allIssues: RedFlag[], visibleIssues: RedFlag[], missingClauseCount: number) {
  const visible = new Set(visibleIssues);
  const locked = allIssues.filter((issue) => !visible.has(issue));
  const counts = locked.reduce<Record<string, number>>((accumulator, issue) => {
    const key = severity(issue);
    accumulator[key] = (accumulator[key] || 0) + 1;
    return accumulator;
  }, {});

  return [
    counts.critical ? `+${counts.critical} critical` : "",
    counts.high ? `+${counts.high} high-severity` : "",
    counts.medium ? `+${counts.medium} medium-severity` : "",
    missingClauseCount ? `+${missingClauseCount} missing protections` : "",
  ].filter(Boolean);
}

function confidenceLabel(confidence?: number) {
  if (typeof confidence !== "number") {
    return "Confidence pending";
  }
  return `${Math.round(confidence * 100)}% confidence`;
}

function needsHumanReview(analysis: AnalyzeResult): UnsupportedClaim[] {
  return Array.isArray(analysis.unsupported_claims) ? analysis.unsupported_claims : [];
}

function evidenceRefs(analysis: AnalyzeResult) {
  const refs = new Map<string, { id: string; location: string; quote: string }>();

  for (const ref of analysis.evidence_refs || []) {
    if (ref.id && ref.quote) refs.set(ref.id, ref);
  }

  for (const issue of analysis.red_flags || []) {
    for (const ref of issue.evidence_refs || []) {
      if (ref.id && ref.quote) refs.set(ref.id, ref);
    }
  }

  return [...refs.values()];
}

function paymentErrorMessage(code?: string | null) {
  switch (code) {
    case "missing_input":
      return "Add your delivery email and try checkout again.";
    case "scan_not_found":
      return "We could not match this checkout to a scan. Please upload the document again.";
    case "invoice_creation_failed":
    case "invoice_origin_invalid":
      return PAYPAL_SCAN_ENABLED
        ? "Crypto checkout is temporarily unavailable. Use the card / PayPal option instead."
        : "Crypto checkout is temporarily unavailable. Contact support with this scan ID.";
    case "checkout_failed":
      return "Card checkout is temporarily unavailable. Try crypto checkout or contact support.";
    case "capture_failed":
    case "not_completed":
      return "PayPal did not confirm payment. If you were charged, contact support with this scan ID.";
    case "scan_mismatch":
      return "Payment confirmation did not match this scan. Contact support with this scan ID.";
    case "cancelled":
      return "Checkout was cancelled. Your free preview is still saved.";
    default:
      return code ? "Checkout could not be completed. Try the fallback payment option or contact support." : null;
  }
}

function EvidenceList({ issue }: { issue: RedFlag }) {
  if (!issue.evidence_refs?.length) return null;

  return (
    <div className="evidence-list">
      {issue.evidence_refs.map((ref) => (
        <p key={`${issue.clause}-${ref.id}`} className="issue-fix">
          Evidence {ref.location}: “{ref.quote}”
        </p>
      ))}
    </div>
  );
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
  const visibleIssues = previewIssues(analysis.red_flags);
  const lockedSummary = lockedSeveritySummary(analysis.red_flags, visibleIssues, analysis.missing_clauses.length);
  const humanReviewItems = needsHumanReview(analysis);
  const reportEvidence = evidenceRefs(analysis);

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
              <p className="section-subtitle">{confidenceLabel(analysis.confidence)}</p>
            </div>
          </div>
          <div className="summary-box">
            <p className="eyebrow">Executive Summary</p>
            <p>{analysis.summary}</p>
            <p className="section-subtitle">This is not legal advice. Use this evidence-cited scan to prepare for attorney review.</p>
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
                  <EvidenceList issue={issue} />
                </article>
              ))}
              <article className="issue-card issue-card-locked">
                <strong>{lockedSummary.length ? lockedSummary.join(" · ") : "Full evidence basis locked"}</strong>
                <p>Unlock the full report to see every cited issue, every missing protection, and the attorney-ready fix path.</p>
              </article>
            </div>

            <div className="paywall">
              <div>
                <p className="eyebrow">Get Your Full Evidence-Cited Report</p>
                <h2>Unlock all clause-cited risks, missing protections, confidence notes, and suggested fixes.</h2>
                <p className="section-subtitle">$97 · formatted for attorney action · This is not legal advice.</p>
                <p className="section-subtitle">Refund promise: if we cite an issue that is not supported by your uploaded document, request a refund within 7 days.</p>
              </div>

              <form className="paywall-form" action="/api/payment/checkout" method="POST">
                <input type="hidden" name="scan_id" value={scanId} />
                <label className="field-group">
                  <span>Delivery email</span>
                  <input type="email" name="email" defaultValue={email} placeholder="you@company.com" required />
                </label>

                {paymentErrorMessage(invoiceError) ? <p className="error-line">{paymentErrorMessage(invoiceError)}</p> : null}

                <div className="paywall-actions">
                  <button className="button-primary" type="submit">
                    Pay $97 Crypto
                  </button>
                  {PAYPAL_SCAN_ENABLED ? (
                    <button className="button-secondary" type="submit" formAction="/api/payment/paypal/checkout">
                      Pay $97 Card / PayPal
                    </button>
                  ) : null}
                </div>
                {payoneerLink ? (
                  <p className="section-subtitle">
                    Backup hosted card link: <a href={payoneerLink} target="_blank" rel="noreferrer">open Payoneer checkout</a>. Manual unlock may be required.
                  </p>
                ) : null}
              </form>
            </div>
          </>
        ) : (
          <>
            <div className="report-sections">
              <section className="report-section">
                <p className="eyebrow">Supported Red Flags</p>
                <div className="preview-grid">
                  {analysis.red_flags.map((issue) => (
                    <article key={`${issue.clause}-${issue.issue}`} className="issue-card">
                      <div className="issue-card-top">
                        <span className="pill">{issue.severity}</span>
                        <strong>{issue.clause}</strong>
                      </div>
                      <p>{issue.issue}</p>
                      <EvidenceList issue={issue} />
                      {typeof issue.confidence === "number" ? <p className="issue-fix">Finding confidence: {Math.round(issue.confidence * 100)}%</p> : null}
                      {issue.recommendation ? <p className="issue-fix">Suggested fix: {issue.recommendation}</p> : null}
                      {issue.suggested_fix ? <p className="issue-fix">Draft language: {issue.suggested_fix}</p> : null}
                    </article>
                  ))}
                </div>
              </section>

              {humanReviewItems.length ? (
                <section className="report-section">
                  <p className="eyebrow">Needs Human Review</p>
                  <div className="preview-grid">
                    {humanReviewItems.map((item) => (
                      <article key={`${item.claim}-${item.reason}`} className="issue-card issue-card-locked">
                        <strong>{item.claim}</strong>
                        <p>{item.reason}</p>
                      </article>
                    ))}
                  </div>
                </section>
              ) : null}

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

              {reportEvidence.length ? (
                <section className="report-section">
                  <p className="eyebrow">Evidence Basis</p>
                  <ul className="report-list">
                    {reportEvidence.map((ref) => (
                      <li key={ref.id}>
                        <strong>{ref.location}:</strong> “{ref.quote}”
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

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


