import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

import type { FunnelService } from "../services/funnel-service.js";

const uploadRequestSchema = z.object({
  session_id: z.string().uuid(),
  filename: z.string().min(1),
  mime_type: z.string().min(1),
  size_bytes: z.number().int().positive()
});

const uploadCompleteSchema = z.object({
  session_id: z.string().uuid(),
  storage_path: z.string().min(1),
  filename: z.string().min(1),
  mime_type: z.string().min(1),
  size_bytes: z.number().int().positive()
});

export async function registerUploadRoutes(app: FastifyInstance, funnelService: FunnelService) {
  const typed = app.withTypeProvider<ZodTypeProvider>();

  typed.post(
    "/uploads/request",
    {
      schema: {
        body: uploadRequestSchema
      }
    },
    async (request, reply) => {
      const signedUpload = await funnelService.createSignedUpload({
        sessionId: request.body.session_id,
        filename: request.body.filename,
        mimeType: request.body.mime_type
      });
      return reply.status(200).send(signedUpload);
    }
  );

  typed.post(
    "/uploads/complete",
    {
      schema: {
        body: uploadCompleteSchema
      }
    },
    async (request, reply) => {
      const session = await funnelService.completeUpload({
        sessionId: request.body.session_id,
        storagePath: request.body.storage_path
      });
      return reply.status(200).send({ accepted: true, sessionId: session.id });
    }
  );
}
