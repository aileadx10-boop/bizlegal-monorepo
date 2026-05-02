import type {
  AnalysisRun,
  DeliverableRecord,
  EvidenceBundle,
  LeadSession,
  MessageRecord,
  PaymentRecord
} from "../types/domain.js";

export interface FunnelRepository {
  createLeadSession(session: LeadSession): Promise<void>;
  updateLeadSession(sessionId: string, patch: Partial<LeadSession>): Promise<LeadSession>;
  getLeadSession(sessionId: string): Promise<LeadSession | null>;
  findLeadSessionByActor(username: string, platform: string): Promise<LeadSession | null>;
  saveMessage(message: MessageRecord): Promise<void>;
  saveEvidenceBundle(bundle: EvidenceBundle): Promise<void>;
  saveAnalysisRun(run: AnalysisRun): Promise<void>;
  listAnalysisRuns(sessionId: string): Promise<AnalysisRun[]>;
  saveJobRun(jobRun: import("../types/domain.js").JobRun): Promise<void>;
  updateJobRun(jobRunId: string, sessionId: string, patch: Partial<import("../types/domain.js").JobRun>): Promise<void>;
  savePayment(payment: PaymentRecord): Promise<void>;
  getLatestPayment(sessionId: string): Promise<PaymentRecord | null>;
  saveDeliverable(deliverable: DeliverableRecord): Promise<void>;
  hasProcessedExternalEvent(eventId: string): Promise<boolean>;
  markExternalEventProcessed(eventId: string): Promise<void>;
}
