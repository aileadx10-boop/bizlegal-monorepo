export const leadSessionStates = [
  "comment_received",
  "dm_sent",
  "qualification_pending",
  "prescan_ready",
  "prescan_complete",
  "teaser_sent",
  "payment_pending",
  "paid",
  "full_analysis_running",
  "report_ready",
  "delivered",
  "failed"
] as const;

export type LeadSessionState = (typeof leadSessionStates)[number];

export const decisionValues = [
  "Proceed",
  "Kill",
  "Renegotiate",
  "Needs Human Review",
  "Insufficient Evidence"
] as const;

export type Decision = (typeof decisionValues)[number];

export interface Qualification {
  dealType: string;
  dealSize?: string;
  jurisdiction?: string;
  freeText: string;
}

export interface LeadSession {
  id: string;
  username: string;
  platform: string;
  state: LeadSessionState;
  sourceComment?: string;
  qualification?: Qualification;
  paymentStatus?: "pending" | "paid";
  uploadedDocumentPaths?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MessageRecord {
  id: string;
  sessionId: string;
  direction: "outbound" | "inbound";
  text: string;
  createdAt: string;
}

export interface EvidenceFact {
  id: string;
  label: string;
  value: string;
  category: "qualification" | "document" | "analysis";
  sourceType: "reply" | "document" | "ollama";
  sourceRef: string;
}

export interface EvidenceBundle {
  id: string;
  sessionId: string;
  facts: EvidenceFact[];
  createdAt: string;
}

export interface RiskItem {
  title: string;
  summary: string;
  evidenceRefs: string[];
}

export interface PrescanOutput {
  topRisks: RiskItem[];
  hiddenRisk: string;
  riskScore: number;
  decision: Decision;
  teaserSummary: string;
  confidence: number;
  evidenceRefs: string[];
  disclaimer: string;
}

export interface FullAnalysisOutput {
  overview: string;
  riskScore: number;
  topRisks: RiskItem[];
  hiddenRisk: string;
  legalVulnerabilities: string[];
  negotiationPoints: string[];
  actionPlan: string[];
  decision: Decision;
  confidence: number;
  evidenceRefs: string[];
  disclaimer: string;
}

export interface AnalysisRun {
  id: string;
  sessionId: string;
  type: "prescan" | "full";
  raw: unknown;
  validated: PrescanOutput | FullAnalysisOutput;
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  sessionId: string;
  provider: "lemon" | "paypal";
  status: "pending" | "paid";
  transactionId?: string;
  checkoutUrl?: string;
  createdAt: string;
}

export interface DeliverableRecord {
  id: string;
  sessionId: string;
  pdfStoragePath?: string;
  pdfUrl?: string;
  notionPageUrl?: string;
  createdAt: string;
}

export interface JobRun {
  id: string;
  sessionId: string;
  name: string;
  status: "running" | "completed" | "failed";
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExtractedDocumentInsight {
  title: string;
  detail: string;
  chunkId: string;
}

export interface OllamaExtraction {
  clauses: ExtractedDocumentInsight[];
  anomalies: ExtractedDocumentInsight[];
  missingProtections: ExtractedDocumentInsight[];
  ambiguities: ExtractedDocumentInsight[];
}

export interface ReportArtifact {
  pdfBuffer: Buffer;
  html: string;
}
