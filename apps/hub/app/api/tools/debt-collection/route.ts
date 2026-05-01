import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  try {
    const {
      creditorName, creditorAddress,
      debtorName, debtorAddress,
      amount, currency = 'USD',
      dueDate, invoiceNumber,
      jurisdiction, letterType = 'first_notice',
      additionalContext = '',
      lang = 'en',
    } = await req.json()

    if (!creditorName || !debtorName || !amount) {
      return NextResponse.json({ error: 'Creditor name, debtor name, and amount are required.' }, { status: 400 })
    }

    const langInstructions: Record<string, string> = {
      en: 'Write the letter in formal English.',
      pt: 'Escreva a carta em Português formal do Brasil.',
      es: 'Escribe la carta en Español formal.',
    }

    const letterTypes: Record<string, string> = {
      first_notice: 'First friendly reminder notice',
      second_notice: 'Second firm notice with deadline',
      final_demand: 'Final demand before legal action',
      legal_notice: 'Formal pre-litigation legal notice',
    }

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2500,
      messages: [{
        role: 'user',
        content: `You are a senior debt recovery solicitor. Generate a professional, jurisdiction-compliant debt collection letter.

${langInstructions[lang] ?? langInstructions.en}

Details:
- Creditor: ${creditorName}, ${creditorAddress || 'Address on file'}
- Debtor: ${debtorName}, ${debtorAddress || 'Address on file'}
- Amount owed: ${currency} ${amount}
- Invoice/Reference: ${invoiceNumber || 'N/A'}
- Original due date: ${dueDate || 'As per agreement'}
- Jurisdiction: ${jurisdiction || 'General international'}
- Letter type: ${letterTypes[letterType] ?? letterType}
- Additional context: ${additionalContext || 'None'}

Return ONLY valid JSON (no markdown):
{
  "subject": "<email/letter subject line>",
  "letter": "<full professional letter text with proper formatting using \\n for line breaks>",
  "tone": "<FRIENDLY|FIRM|FORMAL|LEGAL>",
  "keyPoints": ["<key legal point included in this letter>"],
  "nextSteps": ["<what creditor should do next if no response>"],
  "legalNotes": ["<jurisdiction-specific legal note or disclaimer>"],
  "recommendedDeadline": "<suggested response deadline e.g. 14 days from date>",
  "escalationPath": "<what type of legal action is typically next>"
}`
      }]
    })

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response')
    const result = JSON.parse(content.text)
    return NextResponse.json(result)
  } catch (err) {
    if (err instanceof SyntaxError) {
      return NextResponse.json({ error: 'Failed to generate letter. Please try again.' }, { status: 500 })
    }
    console.error('Debt collection error:', err)
    return NextResponse.json({ error: 'Generation failed. Please try again.' }, { status: 500 })
  }
}
