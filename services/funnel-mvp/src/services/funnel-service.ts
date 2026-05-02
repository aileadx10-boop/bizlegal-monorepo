import { randomUUID } from "node:crypto";

import type { MiniMaxClient } from "../ai/minimax-client.js";
import { OutputValidatorService } from "../ai/output-validator-service.js";
import type { DocumentExtractionService } from "../ai/ollama-document-extraction-service.js";
import type { AppConfig } from "../config/env.js";
import type { LemonPaymentService } from "../payments/lemon-service.js";
import type { PayPalPaymentService } from "../payments/paypal-service.js";
import type {
  AnalysisRun,
  DeliverableRecord,
  FullAnalysisOutput,
  LeadSession,
  PaymentRecord,
  PrescanOutput
} from "../types/domain.js";
import { DisclaimerText } from "../utils/disclaimer.js";
import { extractQualification } from "../utils/qualification.js";
import { nowIso } from "../utils/time.js";
import { GroundingService } from "./grounding-service.js";
import { JobRunner } from "./job-runner.js";
import type { MessageAdapter } from "./message-adapter.js";
import type { NotionService } from "./notion-service.js";
import { DocumentTextExtractor, ReportService } from "./report-service.js";
import type { FunnelRepository } from "./funnel-repository.js";
import type { StorageAdapter } from "./storage-adapter.js";

export class FunnelService {
  constructor(
    private readonly deps: {
      config: AppConfig;
      repository: FunnelRepository;
      messageAdapter: MessageAdapter;
      groundingService: GroundingService;
      minimaxClient: MiniMaxClient;
      outputValidator: OutputValidatorService;
      storageAdapter: StorageAdapter;
      documentExtractionService: DocumentExtractionService;
      documentTextExtractor: DocumentTextExtractor;
      reportService: ReportService;
      notionService: NotionService;
      lemonService: LemonPaymentService;
      paypalService: PayPalPaymentService;
      jobRunner: JobRunner;
    }
  ) {}

  async handleComment(input: { username: string; commentText: string; platform: string }) {
    const existing = await this.deps.repository.findLeadSessionByActor(input.username, input.platform);
    const timestamp = nowIso();
    const session: LeadSession =
      existing ??
      ({
        id: randomUUID(),
        username: input.username,
        platform: input.platform,
        sourceComment: input.commentText,
        state: "comment_received",
        paymentStatus: "pending",
        createdAt: timestamp,
        updatedAt: timestamp
      } satisfies LeadSession);

    if (!existing) {
      await this.deps.repository.createLeadSession(session);
    }

    await this.deps.messageAdapter.sendMessage({
      sessionId: session.id,
      username: session.username,
      platform: session.platform,
      text: "Sending you the risk scan. What type of deal are you evaluating?"
    });

    await this.deps.repository.saveMessage({
      id: randomUUID(),
      sessionId: session.id,
      direction: "outbound",
      text: "Sending you the risk scan. What type of deal are you evaluating?",
      createdAt: nowIso()
    });

    const updated = await this.deps.repository.updateLeadSession(session.id, {
      state: "dm_sent",
      updatedAt: nowIso()
    });

    return updated;
  }

  async handleReply(input: {
    sessionId: string;
    username: string;
    platform: string;
    replyText: string;
  }) {
    const session = await this.requireSession(input.sessionId);
    const qualification = extractQualification(input.replyText);

    await this.deps.repository.saveMessage({
      id: randomUUID(),
      sessionId: session.id,
      direction: "inbound",
      text: input.replyText,
      createdAt: nowIso()
    });

    const updated = await this.deps.repository.updateLeadSession(session.id, {
      qualification,
      state: "prescan_ready",
      updatedAt: nowIso()
    });
    const bundle = this.deps.groundingService.buildQualificationEvidence(session.id, qualification);
    await this.deps.repository.saveEvidenceBundle(bundle);

    const validated = await this.deps.jobRunner.run(session.id, "prescan", async () => {
      const prompt = this.deps.groundingService.buildPrescanPrompt(bundle);
      const raw = await this.deps.minimaxClient.runPrescan(prompt);
      const clean = this.deps.outputValidator.validatePrescan(
        raw,
        this.deps.groundingService.createValidationContext(bundle)
      );

      await this.deps.repository.saveAnalysisRun({
        id: randomUUID(),
        sessionId: session.id,
        type: "prescan",
        raw,
        validated: clean,
        createdAt: nowIso()
      } satisfies AnalysisRun);

      return clean;
    });

    const payment = await this.deps.jobRunner.run(session.id, "payment-offer", async () =>
      this.createPrimaryPayment(session.id)
    );
    const teaser = this.deps.groundingService.decorateTeaser(validated, payment.checkoutUrl ?? "");

    await this.deps.messageAdapter.sendMessage({
      sessionId: session.id,
      username: session.username,
      platform: session.platform,
      text: teaser
    });

    await this.deps.repository.saveMessage({
      id: randomUUID(),
      sessionId: session.id,
      direction: "outbound",
      text: teaser,
      createdAt: nowIso()
    });

    return this.deps.repository.updateLeadSession(updated.id, {
      state: "teaser_sent",
      updatedAt: nowIso()
    });
  }

  async handlePaymentSuccess(input: {
    sessionId: string;
    provider: "lemon" | "paypal";
    transactionId: string;
  }) {
    const session = await this.requireSession(input.sessionId);
    const latestPayment = await this.deps.repository.getLatestPayment(session.id);

    if (latestPayment?.status === "paid") {
      return session;
    }

    const paidPayment: PaymentRecord = {
      id: randomUUID(),
      sessionId: session.id,
      provider: input.provider,
      status: "paid",
      transactionId: input.transactionId,
      createdAt: nowIso()
    };
    await this.deps.repository.savePayment(paidPayment);
    await this.deps.repository.updateLeadSession(session.id, {
      paymentStatus: "paid",
      state: "full_analysis_running",
      updatedAt: nowIso()
    });

    const analysis = await this.deps.jobRunner.run(session.id, "full-analysis", async () =>
      this.runFullAnalysis(session.id)
    );
    return this.deps.jobRunner.run(session.id, "report-delivery", async () =>
      this.deliverFullReport(session, analysis)
    );
  }

  async createSignedUpload(input: { sessionId: string; filename: string; mimeType: string }) {
    await this.requireSession(input.sessionId);
    return this.deps.storageAdapter.createSignedUploadTarget(input);
  }

  async completeUpload(input: { sessionId: string; storagePath: string }) {
    const session = await this.requireSession(input.sessionId);
    await this.deps.repository.updateLeadSession(session.id, {
      uploadedDocumentPaths: [...(session.uploadedDocumentPaths ?? []), input.storagePath],
      updatedAt: nowIso()
    });
    return session;
  }

  private async createPrimaryPayment(sessionId: string) {
    try {
      const checkout = await this.deps.lemonService.createCheckout({ sessionId });
      const payment: PaymentRecord = {
        id: randomUUID(),
        sessionId,
        provider: "lemon",
        status: "pending",
        checkoutUrl: checkout.checkoutUrl,
        transactionId: checkout.checkoutId,
        createdAt: nowIso()
      };
      await this.deps.repository.savePayment(payment);
      await this.deps.repository.updateLeadSession(sessionId, {
        state: "payment_pending",
        updatedAt: nowIso()
      });
      return payment;
    } catch {
      const checkout = await this.deps.paypalService.createCheckout({ sessionId });
      const payment: PaymentRecord = {
        id: randomUUID(),
        sessionId,
        provider: "paypal",
        status: "pending",
        checkoutUrl: checkout.checkoutUrl,
        transactionId: checkout.checkoutId,
        createdAt: nowIso()
      };
      await this.deps.repository.savePayment(payment);
      await this.deps.repository.updateLeadSession(sessionId, {
        state: "payment_pending",
        updatedAt: nowIso()
      });
      return payment;
    }
  }

  private async runFullAnalysis(sessionId: string) {
    const session = await this.requireSession(sessionId);
    if (!session.qualification) {
      throw new Error("Cannot run full analysis without a qualification.");
    }

    const baseBundle = this.deps.groundingService.buildQualificationEvidence(
      sessionId,
      session.qualification
    );
    const documentPath = session.uploadedDocumentPaths?.[0];
    let bundle = baseBundle;

    if (documentPath) {
      try {
        const document = await this.deps.storageAdapter.readDocument(documentPath);
        const text = await this.deps.documentTextExtractor.extractText(document);
        const extraction = await this.deps.documentExtractionService.extract(text);
        bundle = this.deps.groundingService.mergeDocumentEvidence(bundle, extraction);
        await this.deps.repository.saveEvidenceBundle(bundle);
      } catch {
        await this.deps.repository.saveEvidenceBundle(bundle);
      }
    } else {
      await this.deps.repository.saveEvidenceBundle(bundle);
    }

    const prescanRun = (await this.deps.repository.listAnalysisRuns(sessionId)).find(
      (run) => run.type === "prescan"
    );

    if (!prescanRun) {
      throw new Error("Prescan analysis is required before full analysis.");
    }

    const prompt = this.deps.groundingService.buildFullAnalysisPrompt(
      bundle,
      prescanRun.validated as PrescanOutput
    );
    const raw = await this.deps.minimaxClient.runFullAnalysis(prompt);
    const validated = this.deps.outputValidator.validateFullAnalysis(
      raw,
      this.deps.groundingService.createValidationContext(bundle)
    );

    await this.deps.repository.saveAnalysisRun({
      id: randomUUID(),
      sessionId,
      type: "full",
      raw,
      validated,
      createdAt: nowIso()
    });

    return validated;
  }

  private async deliverFullReport(session: LeadSession, analysis: FullAnalysisOutput) {
    const artifact = await this.deps.reportService.createArtifact({
      sessionLabel: `${session.username} — Legal Risk Intelligence`,
      analysis,
      evidenceBasis: analysis.evidenceRefs
    });

    const pdfStoragePath = await this.deps.storageAdapter.saveReport({
      sessionId: session.id,
      filename: `${session.id}.pdf`,
      content: artifact.pdfBuffer,
      mimeType: "application/pdf"
    });
    const pdfUrl = await this.deps.storageAdapter.createSignedDownloadUrl(pdfStoragePath);
    const notionRecord = await this.deps.notionService.createReportPage({
      session,
      analysis
    });

    await this.deps.repository.saveDeliverable({
      id: randomUUID(),
      sessionId: session.id,
      pdfStoragePath,
      pdfUrl,
      notionPageUrl: notionRecord.pageUrl,
      createdAt: nowIso()
    } satisfies DeliverableRecord);

    const message = this.deps.groundingService.decorateFinalDelivery(
      analysis,
      pdfUrl,
      notionRecord.pageUrl
    );
    await this.deps.messageAdapter.sendMessage({
      sessionId: session.id,
      username: session.username,
      platform: session.platform,
      text: message
    });
    await this.deps.repository.saveMessage({
      id: randomUUID(),
      sessionId: session.id,
      direction: "outbound",
      text: message,
      createdAt: nowIso()
    });

    return this.deps.repository.updateLeadSession(session.id, {
      state: "delivered",
      updatedAt: nowIso()
    });
  }

  private async requireSession(sessionId: string) {
    const session = await this.deps.repository.getLeadSession(sessionId);
    if (!session) {
      throw new Error(`Lead session ${sessionId} was not found.`);
    }
    return session;
  }
}
