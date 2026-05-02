import type { MiniMaxClient } from "../ai/minimax-client.js";
import type { DocumentExtractionService } from "../ai/ollama-document-extraction-service.js";
import type { AppConfig } from "../config/env.js";
import type { LemonPaymentService } from "../payments/lemon-service.js";
import type { PayPalPaymentService } from "../payments/paypal-service.js";
import type { FunnelRepository } from "../services/funnel-repository.js";
import type { MessageAdapter, SendMessageInput } from "../services/message-adapter.js";
import type { NotionService } from "../services/notion-service.js";
import type { StorageAdapter } from "../services/storage-adapter.js";
import type {
  AnalysisRun,
  DeliverableRecord,
  EvidenceBundle,
  FullAnalysisOutput,
  JobRun,
  LeadSession,
  MessageRecord,
  PaymentRecord,
  PrescanOutput
} from "../types/domain.js";
import { DisclaimerText } from "../utils/disclaimer.js";

class InMemoryRepository implements FunnelRepository {
  private readonly leadSessions = new Map<string, LeadSession>();
  private readonly messages = new Map<string, MessageRecord[]>();
  private readonly evidence = new Map<string, EvidenceBundle[]>();
  private readonly analysisRuns = new Map<string, AnalysisRun[]>();
  private readonly payments = new Map<string, PaymentRecord[]>();
  private readonly deliverables = new Map<string, DeliverableRecord[]>();
  private readonly jobRuns = new Map<string, JobRun[]>();
  private readonly processedEvents = new Set<string>();

  async createLeadSession(session: LeadSession) {
    this.leadSessions.set(session.id, session);
  }

  async updateLeadSession(sessionId: string, patch: Partial<LeadSession>) {
    const current = this.leadSessions.get(sessionId);
    if (!current) {
      throw new Error(`Session ${sessionId} missing.`);
    }
    const next = {
      ...current,
      ...patch
    };
    this.leadSessions.set(sessionId, next);
    return next;
  }

  async getLeadSession(sessionId: string) {
    return this.leadSessions.get(sessionId) ?? null;
  }

  async findLeadSessionByActor(username: string, platform: string) {
    return [...this.leadSessions.values()].find(
      (session) => session.username === username && session.platform === platform
    ) ?? null;
  }

  async saveMessage(message: MessageRecord) {
    const current = this.messages.get(message.sessionId) ?? [];
    current.push(message);
    this.messages.set(message.sessionId, current);
  }

  async saveEvidenceBundle(bundle: EvidenceBundle) {
    const current = this.evidence.get(bundle.sessionId) ?? [];
    current.push(bundle);
    this.evidence.set(bundle.sessionId, current);
  }

  async saveAnalysisRun(run: AnalysisRun) {
    const current = this.analysisRuns.get(run.sessionId) ?? [];
    current.push(run);
    this.analysisRuns.set(run.sessionId, current);
  }

  async listAnalysisRuns(sessionId: string) {
    return this.analysisRuns.get(sessionId) ?? [];
  }

  async saveJobRun(jobRun: JobRun) {
    const current = this.jobRuns.get(jobRun.sessionId) ?? [];
    current.push(jobRun);
    this.jobRuns.set(jobRun.sessionId, current);
  }

  async updateJobRun(jobRunId: string, sessionId: string, patch: Partial<JobRun>) {
    const current = this.jobRuns.get(sessionId) ?? [];
    const index = current.findIndex((run) => run.id === jobRunId);
    if (index >= 0) {
      current[index] = {
        ...current[index]!,
        ...patch
      };
    }
  }

  async savePayment(payment: PaymentRecord) {
    const current = this.payments.get(payment.sessionId) ?? [];
    current.push(payment);
    this.payments.set(payment.sessionId, current);
  }

  async getLatestPayment(sessionId: string) {
    return this.payments.get(sessionId)?.at(-1) ?? null;
  }

  async saveDeliverable(deliverable: DeliverableRecord) {
    const current = this.deliverables.get(deliverable.sessionId) ?? [];
    current.push(deliverable);
    this.deliverables.set(deliverable.sessionId, current);
  }

  async hasProcessedExternalEvent(eventId: string) {
    return this.processedEvents.has(eventId);
  }

  async markExternalEventProcessed(eventId: string) {
    this.processedEvents.add(eventId);
  }

  listLeadSessions() {
    return [...this.leadSessions.values()];
  }

  listEvidenceBundles(sessionId: string) {
    return this.evidence.get(sessionId) ?? [];
  }

  snapshotAnalysisRuns(sessionId: string) {
    return this.analysisRuns.get(sessionId) ?? [];
  }

  listAnalysisRunsSync(sessionId: string) {
    return this.analysisRuns.get(sessionId) ?? [];
  }
}

class TestMessageAdapter implements MessageAdapter {
  readonly sentMessages: SendMessageInput[] = [];

  async sendMessage(input: SendMessageInput) {
    this.sentMessages.push(input);
  }
}

class TestMiniMaxClient implements MiniMaxClient {
  async runPrescan(): Promise<PrescanOutput> {
    return {
      topRisks: [
        {
          title: "Indemnity cap ambiguity",
          summary: "The indemnity cap language is unclear.",
          evidenceRefs: ["fact-free-text"]
        }
      ],
      hiddenRisk: "Weak indemnity mechanics may shift tail risk.",
      riskScore: 7,
      decision: "Renegotiate",
      teaserSummary: "Material indemnity risk detected.",
      confidence: 0.86,
      evidenceRefs: ["fact-free-text"],
      disclaimer: DisclaimerText
    };
  }

  async runFullAnalysis(): Promise<FullAnalysisOutput> {
    return {
      overview: "The draft leaves indemnity exposure and cap mechanics unresolved.",
      riskScore: 8,
      topRisks: [
        {
          title: "Indemnity cap ambiguity",
          summary: "The indemnity cap language is unclear.",
          evidenceRefs: ["fact-free-text"]
        }
      ],
      hiddenRisk: "Tail risk could survive closing due to cap carve-out ambiguity.",
      legalVulnerabilities: ["Unclear indemnity cap structure"],
      negotiationPoints: ["Clarify indemnity cap and carve-outs"],
      actionPlan: ["Revise indemnity clause", "Confirm cap mechanics in redline"],
      decision: "Renegotiate",
      confidence: 0.81,
      evidenceRefs: ["fact-free-text"],
      disclaimer: DisclaimerText
    };
  }
}

class TestDocumentExtractionService implements DocumentExtractionService {
  async extract() {
    return {
      clauses: [],
      anomalies: [],
      missingProtections: [],
      ambiguities: []
    };
  }
}

class TestStorageAdapter implements StorageAdapter {
  async createSignedUploadTarget(input: { sessionId: string; filename: string; mimeType: string }) {
    return {
      uploadUrl: `https://example.test/upload/${input.sessionId}/${input.filename}`,
      storagePath: `uploads/${input.sessionId}/${input.filename}`,
      expiresAt: new Date(Date.now() + 60_000).toISOString()
    };
  }

  async readDocument(storagePath: string) {
    return {
      storagePath,
      filename: "primary.txt",
      mimeType: "text/plain",
      content: Buffer.from("No uploaded document.")
    };
  }

  async saveReport(input: { sessionId: string; filename: string; content: Buffer; mimeType: string }) {
    return `reports/${input.sessionId}/${input.filename}`;
  }

  async createSignedDownloadUrl(storagePath: string) {
    return `https://example.test/download/${encodeURIComponent(storagePath)}`;
  }
}

class TestNotionService implements NotionService {
  async createReportPage() {
    return {
      pageId: "notion-page-1",
      pageUrl: "https://notion.so/report-1"
    };
  }
}

class TestLemonService implements LemonPaymentService {
  async createCheckout(input: { sessionId: string }) {
    return {
      checkoutId: `lemon-${input.sessionId}`,
      checkoutUrl: `https://checkout.test/lemon/${input.sessionId}`
    };
  }

  verifyWebhook() {
    return true;
  }
}

class TestPayPalService implements PayPalPaymentService {
  async createCheckout(input: { sessionId: string }) {
    return {
      checkoutId: `paypal-${input.sessionId}`,
      checkoutUrl: `https://checkout.test/paypal/${input.sessionId}`
    };
  }

  async verifyWebhook() {
    return true;
  }
}

export function createTestContainer(input: { webhookSecret: string }) {
  const config: AppConfig = {
    NODE_ENV: "test",
    PORT: 3000,
    APP_BASE_URL: "http://localhost:3000",
    WEBHOOK_HMAC_SECRET: input.webhookSecret,
    FIREBASE_PROJECT_ID: undefined,
    FIREBASE_CLIENT_EMAIL: undefined,
    FIREBASE_PRIVATE_KEY: undefined,
    FIREBASE_STORAGE_BUCKET: undefined,
    MINIMAX_API_KEY: undefined,
    MINIMAX_MODEL: "MiniMax-Text-01",
    MINIMAX_BASE_URL: "https://api.minimax.io/anthropic",
    OLLAMA_BASE_URL: "http://localhost:11434",
    OLLAMA_MODEL: "llama3.1",
    LEMON_API_KEY: undefined,
    LEMON_STORE_ID: undefined,
    LEMON_VARIANT_ID: undefined,
    LEMON_WEBHOOK_SECRET: undefined,
    PAYPAL_CLIENT_ID: undefined,
    PAYPAL_CLIENT_SECRET: undefined,
    PAYPAL_API_BASE_URL: "https://api-m.paypal.com",
    PAYPAL_WEBHOOK_ID: undefined,
    NOTION_API_KEY: undefined,
    NOTION_DATABASE_ID: undefined
  };

  return {
    config,
    repository: new InMemoryRepository(),
    messageAdapter: new TestMessageAdapter(),
    minimaxClient: new TestMiniMaxClient(),
    documentExtractionService: new TestDocumentExtractionService(),
    storageAdapter: new TestStorageAdapter(),
    notionService: new TestNotionService(),
    lemonService: new TestLemonService(),
    paypalService: new TestPayPalService()
  };
}
