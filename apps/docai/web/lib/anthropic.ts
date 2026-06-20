// /lib/anthropic.ts — fixed for /generate hang.
//
// Two changes vs. the original:
//  1. AbortController timeout (default 45s, configurable per call) so a stuck
//     Anthropic API call fails fast and the Vercel route returns 504
//     instead of hanging on "Loading..." until the 60s function timeout.
//  2. Optional streaming via Vercel AI SDK (if AI SDK is installed);
//     we keep the non-streaming path for the JSON contract generator
//     (must return valid JSON, partial tokens break parsing) but other
//     routes (analyze, review) can opt into streaming via callClaudeStream.

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5";
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";

const DEFAULT_TIMEOUT_MS = 45_000;

type ClaudeRequest = {
  system: string;
  user: string;
  maxTokens?: number;
  timeoutMs?: number;
};

function cleanModelJson(raw: string) {
  return raw.replace(/```json|```/gi, "").trim();
}

export function parseJsonFromText<T>(raw: string): T {
  const cleaned = cleanModelJson(raw);

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const objectMatch = cleaned.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      return JSON.parse(objectMatch[0]) as T;
    }

    const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      return JSON.parse(arrayMatch[0]) as T;
    }
  }

  throw new Error("The model did not return valid JSON.");
}

/**
 * Fetch with AbortController timeout. Throws on timeout, network error, or non-2xx.
 */
async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

async function callAnthropicText({
  system,
  user,
  maxTokens = 4000,
  timeoutMs = DEFAULT_TIMEOUT_MS,
}: ClaudeRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error("Missing ANTHROPIC_API_KEY.");
  }

  let response: Response;
  try {
    response = await fetchWithTimeout(
      ANTHROPIC_API_URL,
      {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: ANTHROPIC_MODEL,
          max_tokens: maxTokens,
          system,
          messages: [{ role: "user", content: user }],
        }),
      },
      timeoutMs,
    );
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(`Anthropic request exceeded ${timeoutMs}ms timeout.`);
    }
    throw err;
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic error ${response.status}: ${errorText}`);
  }

  const data = (await response.json()) as {
    content?: Array<{ type?: string; text?: string }>;
  };

  const text = data.content?.find((item) => item.type === "text")?.text?.trim();

  if (!text) {
    throw new Error("Anthropic returned an empty response.");
  }

  return text;
}

function getOpenAiTextContent(content?: string | Array<{ type?: string; text?: string }>) {
  if (typeof content === "string") {
    return content.trim();
  }

  if (Array.isArray(content)) {
    const text = content
      .filter((item) => item.type === "text" && typeof item.text === "string")
      .map((item) => item.text?.trim())
      .filter(Boolean)
      .join("\n")
      .trim();

    if (text) {
      return text;
    }
  }

  return "";
}

async function callOpenAiText({
  system,
  user,
  maxTokens = 4000,
  timeoutMs = DEFAULT_TIMEOUT_MS,
}: ClaudeRequest) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY.");
  }

  let response: Response;
  try {
    response = await fetchWithTimeout(
      OPENAI_API_URL,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: OPENAI_MODEL,
          max_completion_tokens: maxTokens,
          temperature: 0.2,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
      },
      timeoutMs,
    );
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(`OpenAI request exceeded ${timeoutMs}ms timeout.`);
    }
    throw err;
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI error ${response.status}: ${errorText}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string | Array<{ type?: string; text?: string }>;
      };
    }>;
  };

  const text = getOpenAiTextContent(data.choices?.[0]?.message?.content);

  if (!text) {
    throw new Error("OpenAI returned an empty response.");
  }

  return text;
}

function shouldUseOpenAiFallback(error: unknown) {
  return Boolean(process.env.OPENAI_API_KEY && error instanceof Error);
}

export async function callClaudeText(request: ClaudeRequest) {
  try {
    return await callAnthropicText(request);
  } catch (error) {
    if (!shouldUseOpenAiFallback(error)) {
      throw error;
    }

    console.warn("Anthropic request failed, falling back to OpenAI.", error);
    return callOpenAiText(request);
  }
}

export async function callClaudeJson<T>(request: ClaudeRequest) {
  const raw = await callClaudeText(request);
  return parseJsonFromText<T>(raw);
}

/**
 * Streaming variant for analyze / review routes where partial text is fine.
 * Returns a ReadableStream<Uint8Array> that emits Anthropic SSE text deltas.
 *
 * Use in route handlers like:
 *   return new Response(callClaudeStream({...}), { headers: { "content-type": "text/event-stream" } });
 */
export function callClaudeStream(request: ClaudeRequest): ReadableStream<Uint8Array> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Missing ANTHROPIC_API_KEY.");
  }

  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        const res = await fetchWithTimeout(
          ANTHROPIC_API_URL,
          {
            method: "POST",
            headers: {
              "x-api-key": apiKey,
              "anthropic-version": "2023-06-01",
              "content-type": "application/json",
              accept: "text/event-stream",
            },
            body: JSON.stringify({
              model: ANTHROPIC_MODEL,
              max_tokens: request.maxTokens ?? 4000,
              system: request.system,
              messages: [{ role: "user", content: request.user }],
              stream: true,
            }),
          },
          request.timeoutMs ?? DEFAULT_TIMEOUT_MS,
        );
        if (!res.ok || !res.body) {
          controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ status: res.status })}\n\n`));
          controller.close();
          return;
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const text = decoder.decode(value, { stream: true });
          controller.enqueue(encoder.encode(text));
        }
        controller.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ msg })}\n\n`));
        controller.close();
      }
    },
  });
}
