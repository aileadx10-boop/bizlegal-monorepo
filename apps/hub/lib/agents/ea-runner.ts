/**
 * EA Agent runner — minimal Anthropic client wrapper for cron-triggered tasks.
 *
 * Each EA task = one Claude API call with prompt-caching enabled on the
 * system message (Phase RR daily/weekly digests, 2026-05-21). Output goes
 * to Telegram + logged as `agent.run.completed` ops_event.
 *
 * Model selection rule (per ~/.claude/rules/common/performance.md):
 *   - Haiku 4.5 for daily digests + audits (volume, simple synthesis)
 *   - Sonnet 4.6 for retrospectives + scorecards (deeper analysis)
 */

import Anthropic from '@anthropic-ai/sdk'

export type EaModel = 'haiku' | 'sonnet'

interface RunArgs {
  readonly task: string
  readonly model: EaModel
  readonly systemPrompt: string
  readonly userMessage: string
  readonly maxTokens?: number
}

interface RunResult {
  readonly ok: boolean
  readonly text: string
  readonly model: string
  readonly input_tokens: number
  readonly output_tokens: number
  readonly cached_tokens: number
  readonly error?: string
}

const MODEL_ID: Record<EaModel, string> = {
  haiku: 'claude-haiku-4-5-20251001',
  sonnet: 'claude-sonnet-4-6',
}

let _client: Anthropic | null = null

function getClient(): Anthropic {
  if (_client) return _client
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured')
  _client = new Anthropic({ apiKey })
  return _client
}

export async function runEaTask(args: RunArgs): Promise<RunResult> {
  try {
    const client = getClient()
    // SDK 0.27 types don't expose the typed `system` array variant on the
    // public overload, but the runtime supports the structured form with
    // cache_control. Cast keeps prompt-caching while staying within the
    // SDK's public surface.
    const response = await client.messages.create({
      model: MODEL_ID[args.model],
      max_tokens: args.maxTokens ?? 1024,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      system: [
        {
          type: 'text',
          text: args.systemPrompt,
          cache_control: { type: 'ephemeral' },
        },
      ] as unknown as string,
      messages: [{ role: 'user', content: args.userMessage }],
    })
    const text = response.content
      .filter((c): c is Anthropic.TextBlock => c.type === 'text')
      .map((c) => c.text)
      .join('\n')
    const usage = response.usage as Anthropic.Usage & {
      cache_read_input_tokens?: number
      cache_creation_input_tokens?: number
    }
    return {
      ok: true,
      text,
      model: response.model,
      input_tokens: usage.input_tokens,
      output_tokens: usage.output_tokens,
      cached_tokens: (usage.cache_read_input_tokens ?? 0) + (usage.cache_creation_input_tokens ?? 0),
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error'
    return {
      ok: false,
      text: '',
      model: MODEL_ID[args.model],
      input_tokens: 0,
      output_tokens: 0,
      cached_tokens: 0,
      error: message,
    }
  }
}

export async function sendToTelegram(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text.slice(0, 4000),
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      }),
    })
  } catch {
    // Telegram delivery is best-effort
  }
}
