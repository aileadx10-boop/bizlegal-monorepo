import { defineConfig } from "@trigger.dev/sdk";

export default defineConfig({
  // Set TRIGGER_PROJECT_REF in the environment (or pass --project) before deploy.
  project: process.env.TRIGGER_PROJECT_REF ?? "proj_replace_me",
  runtime: "node",
  logLevel: "log",
  maxDuration: 300,
  dirs: ["trigger"],
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10_000,
      factor: 2,
      randomize: true,
    },
  },
});
