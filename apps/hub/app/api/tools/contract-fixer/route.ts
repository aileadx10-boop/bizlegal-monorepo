import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  try {
    const { text, jurisdiction = 'international', lang = 'en' } = await req.json()
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
      max_tokens: 3000,
      messages: [{
        role: 'user',
        content: `You are a specialist freelance/contractor law attorney. A freelancer has pasted their contract below. Your job is to identify weak clauses that expose them to risk (non-payment, scope creep, IP loss, no kill fee) and rewrite those clauses to be stronger and fairer, under jurisdiction: ${jurisdiction}.

${langInstructions[lang] ?? langInstructions.en}

Contract text:
"""
${text.slice(0, 8000)}
"""

Return ONLY valid JSON (no markdown):
{
  "overallScore": <number 0-100, 100 = freelancer-friendly>,
  "riskLevel": "<LOW|MEDIUM|HIGH|CRITICAL>",
  "summary": "<2-3 sentence assessment>",
  "fixedClauses": [
    {
      "title": "<clause name>",
      "problem": "<what's wrong with the current version>",
      "original": "<exact text from contract or 'Not present'>",
      "fixed": "<rewritten clause text that protects the freelancer>",
      "severity": "<HIGH|MEDIUM|LOW>"
    }
  ],
  "missingProtections": ["<protection the contract lacks>"],
  "paymentRisks": ["<specific payment risk identified>"],
  "ipRisks": ["<IP ownership risk>"],
  "recommendations": ["<actionable recommendation>"],
  "verdict": "<one sentence overall verdict>"
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
    console.error('Contract fixer error:', err)
    return NextResponse.json({ error: 'Analysis failed. Please try again.' }, { status: 500 })
  }
}
