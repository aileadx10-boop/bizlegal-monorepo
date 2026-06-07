import type { AgentRunRecord } from './types'

export interface NewsletterDraft {
  subject_a: string
  subject_b: string
  body_html: string
  cta_product: string
  cta_url: string
}

export function composeNewsletterPrompt(blogPosts: { title: string; url: string; excerpt: string }[]): string {
  const postsList = blogPosts.map((p, i) => `${i + 1}. "${p.title}" — ${p.excerpt}`).join('\n')

  return `Write a professional compliance newsletter email. Include:

1. A 2-sentence intro about this week in regulatory compliance
2. Three brief sections summarizing these blog posts:
${postsList}
3. A "Tool Spotlight" section highlighting one BizLegal AI product (rotate between: DocAI contract scanner, AI Act classifier, Immigration petition drafter, BOI compliance kit)
4. A clear CTA button text + link

Format as clean HTML email (inline styles, max-width 600px, professional look).
Also provide 2 subject line variants for A/B testing.

Return JSON: { subject_a, subject_b, body_html, cta_product, cta_url }`
}

export function buildNewsletterRunRecord(action: string, status: 'success' | 'failed' | 'skipped', details?: Record<string, unknown>): AgentRunRecord {
  return { agent_name: 'newsletter_engine', workflow_id: 'WF-7', action, status, details }
}
