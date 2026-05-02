const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_MODEL = "claude-sonnet-4-20250514";
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";

type ClaudeRequest = {
  system: string;
  user: string;
  maxTokens?: number;
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

async function callAnthropicText({
  system,
  user,
  maxTokens = 4000,
}: ClaudeRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error("Missing ANTHROPIC_API_KEY.");
  }

  const response = await fetch(ANTHROPIC_API_URL, {
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
  });

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
}: ClaudeRequest) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY.");
  }

  const response = await fetch(OPENAI_API_URL, {
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
  });

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
