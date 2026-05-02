import Fastify from "fastify";
import rateLimit from "@fastify/rate-limit";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";

import type { MiniMaxClient } from "./ai/minimax-client.js";
import { OutputValidatorService } from "./ai/output-validator-service.js";
import type { DocumentExtractionService } from "./ai/ollama-document-extraction-service.js";
import type { AppConfig } from "./config/env.js";
import type { LemonPaymentService } from "./payments/lemon-service.js";
import type { PayPalPaymentService } from "./payments/paypal-service.js";
import { registerHealthRoutes } from "./routes/health-routes.js";
import { registerUploadRoutes } from "./routes/upload-routes.js";
import { registerWebhookRoutes } from "./routes/webhook-routes.js";
import { GroundingService } from "./services/grounding-service.js";
import type { FunnelRepository } from "./services/funnel-repository.js";
import { FunnelService } from "./services/funnel-service.js";
import { JobRunner } from "./services/job-runner.js";
import type { MessageAdapter } from "./services/message-adapter.js";
import type { NotionService } from "./services/notion-service.js";
import { DocumentTextExtractor, ReportService } from "./services/report-service.js";
import type { StorageAdapter } from "./services/storage-adapter.js";

export interface AppContainer {
  config: AppConfig;
  repository: FunnelRepository;
  messageAdapter: MessageAdapter;
  minimaxClient: MiniMaxClient;
  documentExtractionService: DocumentExtractionService;
  storageAdapter: StorageAdapter;
  notionService: NotionService;
  lemonService: LemonPaymentService;
  paypalService: PayPalPaymentService;
}

export function buildApp(container: AppContainer) {
  const app = Fastify({
    logger: false
  });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  void app.register(rateLimit, {
    global: true,
    max: 100,
    timeWindow: "1 minute"
  });

  const funnelService = new FunnelService({
    config: container.config,
    repository: container.repository,
    messageAdapter: container.messageAdapter,
    groundingService: new GroundingService(),
    minimaxClient: container.minimaxClient,
    outputValidator: new OutputValidatorService({ minimumConfidence: 0.65 }),
    storageAdapter: container.storageAdapter,
    documentExtractionService: container.documentExtractionService,
    documentTextExtractor: new DocumentTextExtractor(),
    reportService: new ReportService(),
    notionService: container.notionService,
    lemonService: container.lemonService,
    paypalService: container.paypalService,
    jobRunner: new JobRunner(container.repository)
  });

  void registerHealthRoutes(app);
  void registerWebhookRoutes(app, {
    config: container.config,
    funnelService,
    lemonService: container.lemonService,
    paypalService: container.paypalService
  });
  void registerUploadRoutes(app, funnelService);

  return app;
}
