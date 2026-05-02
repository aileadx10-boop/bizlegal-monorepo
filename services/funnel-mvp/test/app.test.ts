import { afterEach, describe, expect, test } from "vitest";

import { buildApp } from "../src/app.js";
import { createTestContainer } from "../src/test/test-container.js";
import { createHmacSignature } from "../src/utils/hmac.js";

const webhookSecret = "super-secret";

function signPayload(payload: string) {
  const timestamp = "1714300000";
  const signature = createHmacSignature(payload, timestamp, webhookSecret);

  return {
    timestamp,
    signature
  };
}

describe("AI legal risk intelligence funnel", () => {
  afterEach(async () => {
    // Fastify instances are closed per test for clean async queues.
  });

  test("returns health status", async () => {
    const container = createTestContainer({ webhookSecret });
    const app = buildApp(container);

    const response = await app.inject({
      method: "GET",
      url: "/health"
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ok" });

    await app.close();
  });

  test("creates a lead session from a RISK comment and sends the DM", async () => {
    const container = createTestContainer({ webhookSecret });
    const app = buildApp(container);
    const body = JSON.stringify({
      username: "alice",
      comment_text: "RISK - should I buy this SaaS company?",
      platform: "instagram"
    });
    const { timestamp, signature } = signPayload(body);

    const response = await app.inject({
      method: "POST",
      url: "/webhook/comment",
      payload: body,
      headers: {
        "content-type": "application/json",
        "x-webhook-timestamp": timestamp,
        "x-webhook-signature": signature
      }
    });

    expect(response.statusCode).toBe(202);
    expect(response.json()).toMatchObject({
      accepted: true,
      state: "dm_sent"
    });

    const sessions = container.repository.listLeadSessions();
    expect(sessions).toHaveLength(1);
    expect(sessions[0]?.state).toBe("dm_sent");
    expect(container.messageAdapter.sentMessages).toHaveLength(1);
    expect(container.messageAdapter.sentMessages[0]?.text).toContain("Sending you the risk scan");

    await app.close();
  });

  test("captures a reply, builds grounded evidence, and sends a teaser", async () => {
    const container = createTestContainer({ webhookSecret });
    const app = buildApp(container);

    const commentBody = JSON.stringify({
      username: "bob",
      comment_text: "RISK deal review please",
      platform: "linkedin"
    });
    const commentSignature = signPayload(commentBody);

    const commentResponse = await app.inject({
      method: "POST",
      url: "/webhook/comment",
      payload: commentBody,
      headers: {
        "content-type": "application/json",
        "x-webhook-timestamp": commentSignature.timestamp,
        "x-webhook-signature": commentSignature.signature
      }
    });

    const { sessionId } = commentResponse.json() as { sessionId: string };
    const replyBody = JSON.stringify({
      session_id: sessionId,
      username: "bob",
      platform: "linkedin",
      reply_text: "Deal type: asset purchase\nDeal size: $2.4M\nJurisdiction: Delaware\nSeller refuses strong indemnity and cap clarity."
    });
    const replySignature = signPayload(replyBody);

    const response = await app.inject({
      method: "POST",
      url: "/webhook/reply",
      payload: replyBody,
      headers: {
        "content-type": "application/json",
        "x-webhook-timestamp": replySignature.timestamp,
        "x-webhook-signature": replySignature.signature
      }
    });

    expect(response.statusCode).toBe(202);
    expect(response.json()).toMatchObject({
      accepted: true,
      state: "teaser_sent"
    });

    const session = await container.repository.getLeadSession(sessionId);
    expect(session?.qualification?.dealType).toBe("asset purchase");
    expect(session?.qualification?.jurisdiction).toBe("Delaware");
    expect(session?.state).toBe("teaser_sent");

    const evidenceBundles = container.repository.listEvidenceBundles(sessionId);
    expect(evidenceBundles).toHaveLength(1);
    expect(evidenceBundles[0]?.facts.map((fact) => fact.label)).toContain("jurisdiction");

    const analysisRuns = await container.repository.listAnalysisRuns(sessionId);
    expect(analysisRuns).toHaveLength(1);
    expect(analysisRuns[0]?.validated?.decision).toBe("Renegotiate");

    const teaserMessage = container.messageAdapter.sentMessages.at(-1);
    expect(teaserMessage?.text).toContain("This is not legal advice.");
    expect(teaserMessage?.text).toContain("Checkout");

    await app.close();
  });
});
