import { NextRequest, NextResponse } from 'next/server'
import { logEventAsync } from '@/lib/ops/log'
import { fetchOpsContext, contextToJson } from '@/lib/agents/context-fetcher'
import { findTask } from '@/lib/agents/prompts'
import { runEaTask, sendToTelegram } from '@/lib/agents/ea-runner'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * GET /api/agents/run?task=<id>
 *
 * Universal task runner for cron-triggered EA agents. Loads the prompt
 * spec for `task`, fetches the relevant ops context, invokes Anthropic,
 * posts the result to Telegram, and logs `agent.run.completed` (or
 * `agent.run.error`) so the dashboards surface it.
 *
 * Auth: Bearer CRON_SECRET. Returns 404 on mismatch (no leak).
 *
 * Vercel cron entries call this with `?task=daily-revenue-digest` etc.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization') ?? ''
  const provided = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : (new URL(req.url).searchParams.get('token') ?? '')
  const expected = process.env.CRON_SECRET ?? ''
  if (!expected || provided !== expected) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  const url = new URL(req.url)
  const taskId = (url.searchParams.get('task') ?? '').trim()
  const task = findTask(taskId)
  if (!task) {
    return NextResponse.json({ error: `unknown task: ${taskId}` }, { status: 400 })
  }

  const startedAt = Date.now()
  try {
    const ctx = await fetchOpsContext()
    const result = await runEaTask({
      task: task.id,
      model: task.model,
      systemPrompt: task.system,
      userMessage: task.userTemplate(contextToJson(ctx)),
      maxTokens: task.maxTokens,
    })

    if (!result.ok) {
      logEventAsync({
        type: 'agent.run.error',
        source: 'ea',
        ref_id: task.id,
        status: 'failed',
        metadata: {
          task: task.title,
          model: task.model,
          error: result.error,
          duration_ms: Date.now() - startedAt,
        },
      })
      await sendToTelegram(`*EA error* — ${task.title}\n\n${result.error ?? 'unknown'}`)
      return NextResponse.json({ ok: false, error: result.error }, { status: 500 })
    }

    const message = `*${task.title}*\n\n${result.text}`
    await sendToTelegram(message)

    logEventAsync({
      type: 'agent.run.completed',
      source: 'ea',
      ref_id: task.id,
      status: 'ok',
      metadata: {
        task: task.title,
        model: result.model,
        input_tokens: result.input_tokens,
        output_tokens: result.output_tokens,
        cached_tokens: result.cached_tokens,
        duration_ms: Date.now() - startedAt,
        cadence: task.cadence,
      },
    })

    return NextResponse.json({
      ok: true,
      task: task.id,
      model: result.model,
      input_tokens: result.input_tokens,
      output_tokens: result.output_tokens,
      cached_tokens: result.cached_tokens,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error'
    logEventAsync({
      type: 'agent.run.error',
      source: 'ea',
      ref_id: task.id,
      status: 'failed',
      metadata: { task: task.title, error: message, duration_ms: Date.now() - startedAt },
    })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
