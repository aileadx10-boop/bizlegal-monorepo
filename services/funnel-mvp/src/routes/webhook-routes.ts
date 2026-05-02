import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import type { AppConfig } from "../config/env.js";
import type { LemonPaymentService } from "../payments/lemon-service.js";
import type { PayPalPaymentService } from "../payments/paypal-service.js";
import type { FunnelService } from "../services/funnel-service.js";
import { verifyHmacSignature } from "../utils/hmac.js";

const commentSchema = z.object({
  username: z.string().min(1),
  comment_text: z.string().min(1),
  platform: z.string().min(1),
  event_id: z.string().optional(),
  timestamp: z.string().optional()
});

const replySchema = z.object({
  session_id: z.string().uuid(),
  username: z.string().min(1),
  platform: z.string().min(1),
  reply_text: z.string().min(1),
  metadata: z.record(z.any()).optional()
});

function getBodyString(body: unknown) {
  return typeof body === "string" ? body : JSON.stringify(body);
}

function requireHmac(config: AppConfig, body: unknown, headers: Record<string, unknown>) {
  return verifyHmacSignature({
    payload: getBodyString(body),
    timestamp: typeof headers["x-webhook-timestamp"] === "string" ? (headers["x-webhook-timestamp"] as string) : undefined,
    providedSignature:
      typeof headers["x-webhook-signature"] === "string" ? (headers["x-webhook-signature"] as string) : undefined,
    secret: config.WEBHOOK_HMAC_SECRET
  });
}

export async function registerWebhookRoutes(
  app: FastifyInstance,
  input: {
    config: AppConfig;
    funnelService: FunnelService;
    lemonService: LemonPaymentService;
    paypalService: PayPalPaymentService;
  }
) {
  const typed = app.withTypeProvider<ZodTypeProvider>();

  typed.post(
    "/webhook/comment",
    {
      schema: {
        body: commentSchema
      }
    },
    async (request, reply) => {
      if (!requireHmac(input.config, request.body, request.headers)) {
        return reply.status(401).send({ error: "Invalid webhook signature." });
      }

      if (!request.body.comment_text.toUpperCase().includes("RISK")) {
        return reply.status(202).send({ accepted: false, reason: "keyword_not_present" });
      }

      const session = await input.funnelService.handleComment({
        username: request.body.username,
        commentText: request.body.comment_text,
        platform: request.body.platform
      });

      return reply.status(202).send({
        accepted: true,
        sessionId: session.id,
        state: session.state
      });
    }
  );

  typed.post(
    "/webhook/reply",
    {
      schema: {
        body: replySchema
      }
    },
    async (request, reply) => {
      if (!requireHmac(input.config, request.body, request.headers)) {
        return reply.status(401).send({ error: "Invalid webhook signature." });
      }

      const session = await input.funnelService.handleReply({
        sessionId: request.body.session_id,
        username: request.body.username,
        platform: request.body.platform,
        replyText: request.body.reply_text
      });

      return reply.status(202).send({
        accepted: true,
        sessionId: session.id,
        state: session.state
      });
    }
  );

  typed.post("/webhook/payment-success/lemon", async (request, reply) => {
    const rawBody = getBodyString(request.body);
    const signature = request.headers["x-signature"];
    if (!input.lemonService.verifyWebhook(rawBody, typeof signature === "string" ? signature : undefined)) {
      return reply.status(401).send({ error: "Invalid LemonSqueezy signature." });
    }

    const body = request.body as { meta?: { custom_data?: { sessionId?: string } }; data?: { id?: string } };
    const sessionId = body.meta?.custom_data?.sessionId;
    if (!sessionId) {
      return reply.status(400).send({ error: "Missing sessionId." });
    }

    const session = await input.funnelService.handlePaymentSuccess({
      sessionId,
      provider: "lemon",
      transactionId: body.data?.id ?? "unknown"
    });

    return reply.status(200).send({ accepted: true, sessionId: session.id, state: session.state });
  });

  typed.post("/webhook/payment-success/paypal", async (request, reply) => {
    const rawBody = getBodyString(request.body);
    const headers = Object.fromEntries(
      Object.entries(request.headers).map(([key, value]) => [key, typeof value === "string" ? value : undefined])
    );
    const verified = await input.paypalService.verifyWebhook(headers, rawBody);
    if (!verified) {
      return reply.status(401).send({ error: "Invalid PayPal signature." });
    }

    const body = request.body as { resource?: { custom_id?: string; id?: string } };
    const sessionId = body.resource?.custom_id;
    if (!sessionId) {
      return reply.status(400).send({ error: "Missing sessionId." });
    }

    const session = await input.funnelService.handlePaymentSuccess({
      sessionId,
      provider: "paypal",
      transactionId: body.resource?.id ?? "unknown"
    });

    return reply.status(200).send({ accepted: true, sessionId: session.id, state: session.state });
  });
}
