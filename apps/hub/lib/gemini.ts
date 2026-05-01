/**
 * Gemini API Client for SEO Automation
 * Supports content generation, social media adaptation, and tool descriptions
 */

export interface GeminiConfig {
  apiKey: string
  model?: string
}

export interface ContentRequest {
  topic: string
  jurisdiction: string
  keywords: string[]
  wordCount?: number
  contentType: 'seo-page' | 'tool-description' | 'social-post' | 'meta-tags'
  platform?: 'twitter' | 'linkedin' | 'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'threads'
}

export interface ContentResponse {
  title?: string
  meta?: string
  content?: string
  keywords?: string[]
  socialPosts?: SocialPost[]
  toolDescription?: ToolDescription
}

export interface SocialPost {
  platform: string
  content: string
  hashtags: string[]
  imageUrl?: string
  scheduledTime?: string
}

export interface ToolDescription {
  name: string
  shortDescription: string
  fullDescription: string
  features: string[]
  useCases: string[]
  tags: string[]
}

export class GeminiClient {
  private apiKey: string
  private model: string
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models'

  constructor(config: GeminiConfig) {
    this.apiKey = config.apiKey
    this.model = config.model || 'gemini-2.0-flash'
  }

  async generateContent(request: ContentRequest): Promise<ContentResponse> {
    const prompt = this.buildPrompt(request)
    
    const response = await fetch(`${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          maxOutputTokens: request.contentType === 'seo-page' ? 4096 : 1024,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${await response.text()}`)
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    
    return this.parseResponse(text, request)
  }

  async generateSocialPosts(topic: string, content: string, brandName = 'BizLegal AI'): Promise<SocialPost[]> {
    const prompt = `Adapt this content for BizLegal AI across 7 social media platforms.

Brand: ${brandName}
Topic: ${topic}
Content: ${content.substring(0, 2000)}

Platforms and requirements:
1. Facebook (500 chars): Engaging, shareable, 3-4 hashtags
2. Instagram (300 chars): Visual caption with emojis, 5-8 hashtags
3. Twitter/X (280 chars): Punchy, thread-worthy, 2-3 hashtags
4. Pinterest (500 chars): Descriptive, keyword-rich, 10-15 hashtags
5. LinkedIn (1300 chars): Professional, industry insights, 3-5 hashtags
6. YouTube (5000 chars): Video description format, SEO keywords, 5-10 hashtags
7. Substack (1000 chars): Newsletter style, detailed, professional tone

Include relevant hashtags for each platform.
Mention BizLegal AI where appropriate.

Return ONLY valid JSON array in this format:
[
  {"platform": "facebook", "content": "...", "hashtags": ["#tag1", "#tag2"]},
  {"platform": "instagram", "content": "...", "hashtags": ["#tag1"]},
  ...
]`

    const response = await fetch(`${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    })

    if (!response.ok) throw new Error(`Gemini API error: ${response.status}`)

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      const json = jsonMatch ? jsonMatch[0] : '[]'
      return JSON.parse(json) as SocialPost[]
    } catch {
      return []
    }
  }

  private async generateViaAnthropic(prompt: string): Promise<string> {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (apiKey) {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 4096,
          messages: [{ role: 'user', content: prompt }],
        }),
      })
      if (response.ok) {
        const data = await response.json()
        return data.content?.[0]?.text || ''
      }
      console.log(`  ⚠️  Anthropic failed (${response.status}) — trying OpenAI`)
    }
    // Fallback: OpenAI GPT-4o-mini
    const oaiKey = process.env.OPENAI_API_KEY
    if (!oaiKey) throw new Error('No working AI API key available (ANTHROPIC_API_KEY and OPENAI_API_KEY both unset/invalid)')
    const oaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${oaiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    if (!oaiRes.ok) throw new Error(`OpenAI API error: ${oaiRes.status} ${await oaiRes.text()}`)
    const oaiData = await oaiRes.json()
    return oaiData.choices?.[0]?.message?.content || ''
  }

  async generateStructuredContent(topic: string, jurisdiction: string, keywords: string[]): Promise<{
    title: string
    meta: string
    keywords: string[]
    regulation_tag: string | null
    content: {
      intro: string
      sections: Array<{ heading: string; body: string }>
      clauses: string[]
      faq: Array<{ q: string; a: string }>
    }
  }> {
    const prompt = `You are a legal compliance expert writing SEO content for BizLegal AI.

Write a comprehensive guide about: "${topic}"
Jurisdiction: ${jurisdiction}
Keywords: ${keywords.join(', ')}

Return ONLY valid JSON in this exact structure (no markdown, no code fences):
{
  "title": "<65 char SEO title>",
  "meta": "<155 char meta description>",
  "keywords": ["kw1", "kw2", "kw3", "kw4", "kw5"],
  "regulation_tag": "<one of: SEC, MiCA, VARA, GDPR, AML, FCA, MAS, or null>",
  "content": {
    "intro": "<2-3 sentence authoritative intro paragraph, 80-120 words>",
    "sections": [
      {"heading": "<H2 heading>", "body": "<200-300 word paragraph, authoritative, practical>"},
      {"heading": "<H2 heading>", "body": "<200-300 word paragraph>"},
      {"heading": "<H2 heading>", "body": "<200-300 word paragraph>"},
      {"heading": "<H2 heading>", "body": "<200-300 word paragraph>"}
    ],
    "clauses": [
      "<key clause or practical takeaway 1>",
      "<key clause or practical takeaway 2>",
      "<key clause or practical takeaway 3>",
      "<key clause or practical takeaway 4>",
      "<key clause or practical takeaway 5>"
    ],
    "faq": [
      {"q": "<specific question>", "a": "<2-3 sentence precise answer>"},
      {"q": "<specific question>", "a": "<2-3 sentence precise answer>"},
      {"q": "<specific question>", "a": "<2-3 sentence precise answer>"}
    ]
  }
}`

    const response = await fetch(`${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.65,
          topP: 0.9,
          maxOutputTokens: 4096,
        },
      }),
    })

    let rawText: string
    if (!response.ok) {
      const errBody = await response.text()
      const isRateLimit = response.status === 429 || errBody.includes('RESOURCE_EXHAUSTED')
      if (isRateLimit) {
        console.log('  ⚠️  Gemini quota exhausted — falling back to Anthropic Claude')
        rawText = await this.generateViaAnthropic(prompt)
      } else {
        throw new Error(`Gemini API error: ${response.status} ${errBody}`)
      }
    } else {
      const data = await response.json()
      rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    }

    const text = rawText
    // Strip markdown code fences if present
    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()

    let parsed: ReturnType<typeof JSON.parse>
    try {
      parsed = JSON.parse(cleaned)
    } catch {
      // Try extracting JSON object — handles cases where model wraps in prose
      const match = cleaned.match(/\{[\s\S]*\}/)
      if (!match) {
        throw new Error(`AI returned non-JSON (first 300 chars): ${text.substring(0, 300)}`)
      }
      try {
        parsed = JSON.parse(match[0])
      } catch (e2) {
        throw new Error(`JSON parse failed after extraction: ${(e2 as Error).message} | text: ${match[0].substring(0, 200)}`)
      }
    }
    if (!parsed || typeof parsed !== 'object') {
      throw new Error(`AI returned empty or non-object JSON`)
    }

    return {
      title: parsed.title || topic,
      meta: parsed.meta || `Guide to ${topic}`,
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : keywords,
      regulation_tag: parsed.regulation_tag || null,
      content: {
        intro: parsed.content?.intro || '',
        sections: Array.isArray(parsed.content?.sections) ? parsed.content.sections : [],
        clauses: Array.isArray(parsed.content?.clauses) ? parsed.content.clauses : [],
        faq: Array.isArray(parsed.content?.faq) ? parsed.content.faq : [],
      },
    }
  }

  async generateToolIdea(category: string): Promise<ToolDescription | null> {
    const prompt = `Generate a new legal tech tool idea for category: ${category}

Focus on: compliance automation, legal document analysis, regulatory intelligence, or risk assessment

Return JSON in this exact format:
{
  "name": "Tool Name",
  "shortDescription": "One sentence description (max 100 chars)",
  "fullDescription": "Detailed description (200-300 words)",
  "features": ["Feature 1", "Feature 2", "Feature 3"],
  "useCases": ["Use case 1", "Use case 2"],
  "tags": ["tag1", "tag2", "tag3"]
}`

    const response = await fetch(`${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.9,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    })

    if (!response.ok) throw new Error(`Gemini API error: ${response.status}`)

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      const json = jsonMatch ? jsonMatch[0] : '{}'
      return JSON.parse(json) as ToolDescription
    } catch {
      return null
    }
  }

  private buildPrompt(request: ContentRequest): string {
    const { topic, jurisdiction, keywords, wordCount = 1200, contentType } = request

    if (contentType === 'seo-page') {
      return `Write a comprehensive SEO guide about "${topic}" for jurisdiction: ${jurisdiction}

Keywords to include: ${keywords.join(', ')}
Target word count: ${wordCount}

Requirements:
- Professional, authoritative tone for legal/compliance professionals
- Include regulatory references, compliance requirements, timelines
- Add practical next steps and risk warnings
- Structure with H2/H3 headings
- End with 3-5 FAQs

Return in this EXACT format:
TITLE: <max 65 characters>
META: <150-160 characters>
KEYWORDS: <comma-separated>
CONTENT:
<h2>Overview</h2>
<p>...</p>
<h2>Key Requirements</h2>
<p>...</p>
<h2>Compliance Steps</h2>
<p>...</p>
<h2>FAQ</h2>
<h3>...</h3>
<p>...</p>`
    }

    if (contentType === 'tool-description') {
      return `Write a compelling tool description for a legal tech tool about "${topic}"

Include:
- Problem it solves
- Key features (3-5)
- Benefits for users
- Use cases

Return in JSON format:
{
  "name": "...",
  "shortDescription": "...",
  "fullDescription": "...",
  "features": [],
  "useCases": [],
  "tags": []
}`
    }

    if (contentType === 'social-post' && request.platform) {
      return `Write a ${request.platform} post about "${topic}" for jurisdiction: ${jurisdiction}

Platform requirements:
- Twitter: 280 chars max, punchy, 2-3 hashtags
- LinkedIn: Professional tone, 1000 chars, industry insights, 3-5 hashtags
- Facebook: Engaging, conversational, 500 chars, 3-4 hashtags
- Instagram: Visual caption, emojis, 300 chars, 5-8 hashtags
- TikTok: Hook-focused, 150 chars, trending style
- YouTube: Description format, 500 chars, SEO keywords
- Threads: Casual, conversational, 500 chars

Keywords: ${keywords.join(', ')}

Return JSON:
{"content": "...", "hashtags": []}`
    }

    return `Generate content about "${topic}" for ${jurisdiction}`
  }

  private parseResponse(text: string, request: ContentRequest): ContentResponse {
    const result: ContentResponse = {}

    if (request.contentType === 'seo-page') {
      const titleMatch = text.match(/TITLE:\s*(.+?)(?=\n|$)/i)
      const metaMatch = text.match(/META:\s*(.+?)(?=\n|$)/i)
      const keywordsMatch = text.match(/KEYWORDS:\s*(.+?)(?=\n|$)/i)
      const contentMatch = text.match(/CONTENT:\s*([\s\S]+)/i)

      result.title = titleMatch?.[1]?.trim() || request.topic
      result.meta = metaMatch?.[1]?.trim() || `Guide to ${request.topic}`
      result.content = contentMatch?.[1]?.trim() || text
      result.keywords = keywordsMatch?.[1]?.split(',').map(k => k.trim()) || request.keywords
    } else if (request.contentType === 'tool-description') {
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        const json = jsonMatch ? jsonMatch[0] : '{}'
        result.toolDescription = JSON.parse(json) as ToolDescription
      } catch {
        result.toolDescription = {
          name: request.topic,
          shortDescription: text.substring(0, 100),
          fullDescription: text,
          features: [],
          useCases: [],
          tags: request.keywords,
        }
      }
    }

    return result
  }
}
