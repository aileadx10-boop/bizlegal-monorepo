import type { GetServerSideProps, InferGetServerSidePropsType } from "next";

import { ReportView } from "@/components/report-view";
import type { AnalyzeResult } from "@/lib/contract-analysis";
import { fetchScanReport } from "@/lib/report-data";

type ReportSummary = {
  scanId: string;
  email: string;
  filename: string;
  contractType: string;
  paid: boolean;
  riskLevel: string;
  riskScore: number;
  analysis: AnalyzeResult;
};

type ReportPageProps = {
  report: ReportSummary | null;
  invoiceError: string | null;
  message: string | null;
  payoneerLink: string | null;
};

export const getServerSideProps: GetServerSideProps<ReportPageProps> = async (context) => {
  const scanId = typeof context.query.scan_id === "string" ? context.query.scan_id : "";
  const requestedEmail = typeof context.query.email === "string" ? context.query.email : "";
  const invoiceError = typeof context.query.invoice_error === "string" ? context.query.invoice_error : null;

  if (!scanId) {
    return {
      props: {
        report: null,
        invoiceError,
        message: "We could not find a scan ID for this report.",
        payoneerLink: process.env.PAYONEER_DOCAI_LINK || null,
      },
    };
  }

  const report = await fetchScanReport(scanId);

  if (!report) {
    return {
      props: {
        report: null,
        invoiceError,
        message: "We could not load that scan.",
        payoneerLink: process.env.PAYONEER_DOCAI_LINK || null,
      },
    };
  }

  return {
    props: {
      report: {
        scanId: report.scan.id,
        email: requestedEmail || report.scan.email || "",
        filename: report.scan.filename,
        contractType: report.scan.contract_type || report.analysis.contract_type,
        paid: Boolean(report.scan.paid),
        riskLevel: report.analysis.risk_level,
        riskScore: report.scan.score ?? report.analysis.risk_score,
        analysis: report.analysis,
      },
      invoiceError,
      message: null,
      payoneerLink: process.env.PAYONEER_DOCAI_LINK || null,
    },
  };
};

export default function ReportPage({
  report,
  invoiceError,
  message,
  payoneerLink,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  if (!report) {
    return (
      <div className="report-shell">
        <div className="report-card">
          <p className="eyebrow">Report unavailable</p>
          <h1>{message || "We could not load that scan."}</h1>
          <p className="section-subtitle">Try uploading the document again or refresh in a moment.</p>
        </div>
      </div>
    );
  }

  return (
    <ReportView
      scanId={report.scanId}
      email={report.email}
      filename={report.filename}
      contractType={report.contractType}
      paid={report.paid}
      riskLevel={report.riskLevel}
      riskScore={report.riskScore}
      analysis={report.analysis}
      payoneerLink={payoneerLink}
      invoiceError={invoiceError}
    />
  );
}
