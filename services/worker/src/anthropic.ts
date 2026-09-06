import type { Env } from "./types";

// Raw Anthropic API client for Cloudflare Workers (no SDK dependency).
// All prompts use temperature: 0 unless overridden.
// Output is forced to JSON via prefill + stop sequences.

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";

export interface HaikuJsonCallOpts {
  readonly model: string;
  readonly system: string;
  readonly user: string;
  readonly prefill?: string;
  readonly maxTokens?: number;
  readonly temperature?: number;
  readonly stopSequences?: readonly string[];
  readonly maxRetries?: number;
  /**
   * Whether to inject the prefill as an assistant turn. Some models
   * (e.g., claude-sonnet-4-6) reject prefill and require the conversation
   * to end with a user turn. Auto-detects from model ID if omitted.
   */
  readonly usePrefill?: boolean;
}

function modelSupportsPrefill(model: string): boolean {
  // Claude Sonnet 4.6 and any newer "sonnet-4-X" reject assistant prefill.
  // Haiku 4.5, Opus, older Sonnets accept it.
  if (/sonnet-4-[6-9]/.test(model)) return false;
  return true;
}

export interface HaikuJsonCallResult<T> {
  readonly data: T;
  readonly raw: string;
  readonly retries: number;
  readonly durationMs: number;
  readonly modelUsed: string;
}

export async function callHaikuJson<T = unknown>(
  env: Env,
  opts: HaikuJsonCallOpts
): Promise<HaikuJsonCallResult<T>> {
  const maxRetries = opts.maxRetries ?? 3;
  const prefill = opts.prefill ?? "{";
  const usePrefill = opts.usePrefill ?? modelSupportsPrefill(opts.model);
  const start = Date.now();

  let lastError: unknown = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const raw = await callRaw(env, opts, prefill, usePrefill);
      const parsed = parseJsonResponse<T>(raw, usePrefill ? prefill : "");
      return {
        data: parsed,
        raw,
        retries: attempt,
        durationMs: Date.now() - start,
        modelUsed: opts.model
      };
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        await backoff(attempt);
      }
    }
  }
  throw new AnthropicCallFailed(
    `callHaikuJson failed after ${maxRetries + 1} attempts: ${errString(lastError)}`,
    lastError
  );
}

async function callRaw(
  env: Env,
  opts: HaikuJsonCallOpts,
  prefill: string,
  usePrefill: boolean
): Promise<string> {
  // Anthropic requires each stop sequence to contain at least one non-whitespace char.
  const validStops = (opts.stopSequences ?? []).filter((s) => /\S/.test(s));
  // Augment the user turn with a "JSON only" nudge when prefill is not available,
  // so Sonnet-4.6 doesn't wrap output in prose.
  const userContent = usePrefill
    ? opts.user
    : `${opts.user}\n\nIMPORTANT: Respond with ONLY valid JSON. No markdown, no prose, no code fences. Begin your response with "{" and end with "}".`;

  const messages: Array<{ role: "user" | "assistant"; content: string }> = [
    { role: "user", content: userContent }
  ];
  if (usePrefill) {
    messages.push({ role: "assistant", content: prefill });
  }

  const body: Record<string, unknown> = {
    model: opts.model,
    max_tokens: opts.maxTokens ?? 1024,
    temperature: opts.temperature ?? 0,
    system: opts.system,
    messages
  };
  if (validStops.length > 0) {
    body.stop_sequences = validStops;
  }

  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": ANTHROPIC_VERSION,
      "content-type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const detail = await safeText(res);
    throw new AnthropicCallFailed(`Anthropic ${res.status}: ${detail}`, null);
  }

  const payload = (await res.json()) as {
    content?: ReadonlyArray<{ type: string; text?: string }>;
    stop_reason?: string;
  };

  const text = payload.content?.find((c) => c.type === "text")?.text;
  if (!text) {
    throw new AnthropicCallFailed("Anthropic response missing text content", payload);
  }
  return text;
}

function parseJsonResponse<T>(raw: string, prefill: string): T {
  // Reconstruct candidate: prepend prefill if it was used. Then extract the
  // outermost JSON object/array, tolerating prose wrappers and code fences.
  const combined = (prefill + raw).trim();
  const slice = extractJsonSlice(combined);
  try {
    return JSON.parse(slice) as T;
  } catch (e) {
    throw new AnthropicCallFailed(
      `JSON parse failed. Slice head: ${slice.slice(0, 200)}`,
      e
    );
  }
}

function extractJsonSlice(s: string): string {
  // Strip ```json ... ``` fences if present
  const fence = /```(?:json)?\s*([\s\S]*?)```/i.exec(s);
  if (fence && fence[1]) return fence[1].trim();

  const firstObj = s.indexOf("{");
  const firstArr = s.indexOf("[");
  const first = [firstObj, firstArr].filter((i) => i >= 0).sort((a, b) => a - b)[0];
  const last = Math.max(s.lastIndexOf("}"), s.lastIndexOf("]"));
  if (first === undefined || first < 0 || last < first) return s;
  return s.slice(first, last + 1);
}

async function backoff(attempt: number): Promise<void> {
  const delayMs = Math.min(16_000, Math.pow(4, attempt) * 250);
  await new Promise((resolve) => setTimeout(resolve, delayMs));
}

async function safeText(res: Response): Promise<string> {
  try {
    const t = await res.text();
    return t.slice(0, 500);
  } catch {
    return "<unreadable>";
  }
}

function errString(e: unknown): string {
  if (e instanceof Error) return `${e.name}: ${e.message}`;
  return String(e);
}

export class AnthropicCallFailed extends Error {
  override readonly name = "AnthropicCallFailed";
  constructor(message: string, override readonly cause: unknown) {
    super(message);
  }
}
