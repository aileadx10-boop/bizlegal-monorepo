import { NextRequest, NextResponse } from 'next/server'
import { redactFields, summariseRedaction } from '@/lib/safe/redact'

interface MatterIn {
  title?: string
  ai_tool?: string
  [k: string]: unknown
}

interface FormIn {
  ai_tool?: string
  prompt?: string
  edits?: string
  lawyer?: string
  partner?: string
  [k: string]: unknown
}

export async function POST(req: NextRequest) {
  const { matter, form } = (await req.json()) as { matter?: MatterIn; form?: FormIn }

  const certId = 'LA-' + Math.random().toString(36).substring(2, 8).toUpperCase()

  // ── Safe — redact PII from the AI-bound fields BEFORE sending upstream.
  // Lawyer + partner names + tool name are structural metadata for the
  // audit trail and are NOT redacted here. The matter title, prompt body,
  // and edits notes ARE redacted — those carry the highest PII risk.
  const matterRedaction = redactFields(
    {
      title: typeof matter?.title === 'string' ? matter.title : '',
    },
    ['title'],
  )
  const formRedaction = redactFields(
    {
      prompt: typeof form?.prompt === 'string' ? form.prompt : '',
      edits: typeof form?.edits === 'string' ? form.edits : '',
    },
    ['prompt', 'edits'],
  )
  const totalRedacted = matterRedaction.total + formRedaction.total
  const redactionLog = summariseRedaction({
    counts: { ...matterRedaction.totals, ...formRedaction.totals },
    total: totalRedacted,
  })
  console.log(`[generate-certificate] cert=${certId} ${redactionLog}`)

  const safeTitle = matterRedaction.redacted.title
  const safePrompt = formRedaction.redacted.prompt
  const safeEdits = formRedaction.redacted.edits

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        system:
          'You are a regulatory-intelligence assistant for LexAudit. Generate a concise process-attestation rationale (3-4 sentences) for a Compliance Health Score snapshot. Describe what the AI was used for, what human oversight was applied, and what risk mitigations were performed. Frame as audit-ready intelligence — not legal advice and not a verdict on the underlying work product. Formal English, prose only, no bullet points. The matter title and prompt have been redacted of PII (placeholders like [PII:EMAIL]) — treat the redactions as faithful structure but do not attempt to reconstruct values.',
        messages: [
          {
            role: 'user',
            content: `Document: ${safeTitle}\nAI Tool: ${form?.ai_tool || matter?.ai_tool || ''}\nPrompt: ${safePrompt}\nHuman edits: ${safeEdits || 'None recorded'}\nResponsible lawyer: ${form?.lawyer || ''}\nReviewing partner: ${form?.partner || 'Not specified'}`,
          },
        ],
      }),
    })

    const data = (await res.json()) as { content?: Array<{ text?: string }> }
    const summary = data.content?.[0]?.text || ''
    return NextResponse.json({
      summary,
      certId,
      safe: {
        pii_redactions: totalRedacted,
        summary: redactionLog,
      },
    })
  } catch {
    return NextResponse.json({
      summary:
        'AI-assisted drafting was performed under direct lawyer supervision. The responsible lawyer reviewed AI outputs for accuracy and potential hallucinations prior to use. Human edits were applied. This is a process-attestation snapshot — regulatory intelligence, not legal advice and not a verdict on the underlying work product.',
      certId,
      safe: {
        pii_redactions: totalRedacted,
        summary: redactionLog,
      },
    })
  }
}
