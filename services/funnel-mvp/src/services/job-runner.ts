import { randomUUID } from "node:crypto";

import type { FunnelRepository } from "./funnel-repository.js";
import { nowIso } from "../utils/time.js";

export class JobRunner {
  constructor(private readonly repository: FunnelRepository) {}

  async run<T>(sessionId: string, name: string, operation: () => Promise<T>) {
    const jobId = randomUUID();
    await this.repository.saveJobRun({
      id: jobId,
      sessionId,
      name,
      status: "running",
      createdAt: nowIso(),
      updatedAt: nowIso()
    });

    try {
      const result = await operation();
      await this.repository.updateJobRun(jobId, sessionId, {
        status: "completed",
        updatedAt: nowIso()
      });
      return result;
    } catch (error) {
      await this.repository.updateJobRun(jobId, sessionId, {
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
        updatedAt: nowIso()
      });
      throw error;
    }
  }
}
