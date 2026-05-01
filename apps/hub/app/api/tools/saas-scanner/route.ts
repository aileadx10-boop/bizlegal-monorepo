import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  try {
    const { text, lang = 'en' } = await req.json()
    if (!text || typeof text !== 'string' || text.trim().length < 50) {
      return NextResponse.json({ error: 'Please paste at least 50 characters of contract text.' }, { status: 400 })
    }

    const langInstructions: Record<string, string> = {
      en: 'Respond in English.',
      pt: 'Responda em Português do Brasil.',
      es: 'Responde en Español.',
    }

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `You are a senior commercial lawyer specializing in SaaS contracts. Analyze the following SaaS terms/contract text and return a structured JSON response.

${langInstructions[lang] ?? langInstructions.en}

Analyze this contract text:
"""
${text.slice(0, 8000)}
"""

Return ONLY valid JSON with this exact structure (no markdown, no explanation):
{
  "riskScore": <number 0-100, 100 being highest risk>,
  "riskLevel": "<LOW|MEDIUM|HIGH|CRITICAL>",
  "summary": "<2-3 sentence plain-language summary of the main risk posture>",
  "redFlags": [
    { "clause": "<clause name>", "issue": "<what it says>", "severity": "<HIGH|MEDIUM|LOW>", "fix": "<suggested fix>" }
  ],
  "positives": ["<positive clause or protection>"],
  "negotiationPoints": ["<specific point to negotiate>"],
  "missingClauses": ["<important clause that is absent>"],
  "overallVerdict": "<one sentence verdict>"
}`
      }]
    })

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type')

    const result = JSON.parse(content.text)
    return NextResponse.json(result)
  } catch (err) {
    if (err instanceof SyntaxError) {
      return NextResponse.json({ error: 'Failed to parse AI response. Please try again.' }, { status: 500 })
    }
    console.error('SaaS scanner error:', err)
    return NextResponse.json({ error: 'Analysis failed. Please try again.' }, { status: 500 })
  }
}
