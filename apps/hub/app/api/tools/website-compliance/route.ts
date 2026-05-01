import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  try {
    const { url, context = '', lang = 'en' } = await req.json()
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Please provide a website URL.' }, { status: 400 })
    }

    const langInstructions: Record<string, string> = {
      en: 'Respond in English.',
      pt: 'Responda em Português do Brasil.',
      es: 'Responde en Español.',
    }

    // Attempt to fetch website content for context
    let siteContent = ''
    try {
      const fetchRes = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 BizLegalAI-Compliance-Scanner/1.0' },
        signal: AbortSignal.timeout(8000),
      })
      const html = await fetchRes.text()
      // Extract text content (rough)
      siteContent = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .slice(0, 4000)
    } catch {
      siteContent = `Could not fetch ${url}. Analyze based on URL and any context provided.`
    }

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2500,
      messages: [{
        role: 'user',
        content: `You are a digital compliance attorney specializing in GDPR, CCPA, ADA/WCAG, ePrivacy, and cookie law. Analyze the following website for compliance gaps.

${langInstructions[lang] ?? langInstructions.en}

Website URL: ${url}
Additional context: ${context || 'None provided'}
Page content sample:
"""
${siteContent}
"""

Return ONLY valid JSON (no markdown):
{
  "overallScore": <number 0-100, 100 = fully compliant>,
  "complianceLevel": "<COMPLIANT|NEEDS_WORK|NON_COMPLIANT|CRITICAL>",
  "summary": "<2-3 sentence overview>",
  "gdpr": { "score": <0-100>, "status": "<PASS|FAIL|PARTIAL>", "issues": ["<issue>"], "fixes": ["<fix>"] },
  "ccpa": { "score": <0-100>, "status": "<PASS|FAIL|PARTIAL>", "issues": ["<issue>"], "fixes": ["<fix>"] },
  "cookies": { "score": <0-100>, "status": "<PASS|FAIL|PARTIAL>", "issues": ["<issue>"], "fixes": ["<fix>"] },
  "accessibility": { "score": <0-100>, "status": "<PASS|FAIL|PARTIAL>", "issues": ["<issue>"], "fixes": ["<fix>"] },
  "privacyPolicy": { "score": <0-100>, "status": "<PASS|FAIL|PARTIAL>", "issues": ["<issue>"], "fixes": ["<fix>"] },
  "topPriorities": ["<most urgent fix with reasoning>"],
  "estimatedFineRisk": "<LOW|MEDIUM|HIGH> — <brief explanation>",
  "verdict": "<one sentence summary>"
}`
      }]
    })

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response')
    const result = JSON.parse(content.text)
    return NextResponse.json(result)
  } catch (err) {
    if (err instanceof SyntaxError) {
      return NextResponse.json({ error: 'Failed to parse AI response. Please try again.' }, { status: 500 })
    }
    console.error('Compliance checker error:', err)
    return NextResponse.json({ error: 'Analysis failed. Please try again.' }, { status: 500 })
  }
}
