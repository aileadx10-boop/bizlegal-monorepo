// VERTICAL REPLICATION FILE
// To launch a new vertical: fork this repo, update every value here,
// update infra/HEARTBEAT.md with new regulations,
// run: npm run deploy

export const SITE_CONFIG = {
  brand: {
    name: 'BizLegal AI',
    tagline: 'Compliance Intelligence for Digital Assets',
    description:
      'Attorney-grade regulatory intelligence for crypto, fintech, and digital asset companies.',
    domain: 'bizlegal-ai.com',
    email_support: 'team@bizlegal-ai.com',
    email_from: 'hello@bizlegal-ai.com',
    founder:
      'Moses Dor, LLB LLM — NY Bar · Israel Bar · ICC Arbitrator · DIFC Registered',
    linkedin: 'https://linkedin.com/company/bizlegal-ai',
    twitter: 'https://twitter.com/bizlegal_ai',
  },
  products: {
    hub: 'https://bizlegal-ai.com',
    tracr: 'https://tracr.bizlegal-ai.com',
    brai: 'https://brai.bizlegal-ai.com',
    lexaudit: 'https://lexaudit.bizlegal-ai.com',
    docai: 'https://docai.bizlegal-ai.com',
    forge: 'https://forge.bizlegal-ai.com',
    leadforge: 'https://leadforge.bizlegal-ai.com',
  },
  regulations: [
    'SEC',
    'MiCA',
    'VARA',
    'MAS',
    'FCA',
    'FATF',
    'GDPR',
    'FinCEN',
    'CFTC',
    'ADGM',
    'DFSA',
  ],
  jurisdictions: ['US', 'EU', 'UAE', 'Singapore', 'UK', 'Global'],
  pricing: {
    report_standard: 149,
    report_priority: 249,
    scan_ofac: 299,
    trace_full: 899,
    audit_smart_contract: 1499,
  },
  ai_models: {
    gap_finding: 'gemma2:9b', // Ollama local — free
    dedup: 'llama3.2:3b', // Ollama local — free
    content_draft: 'gemma2:9b', // Ollama local — free
    content_qa: 'claude-haiku-4-5-20251001', // Anthropic — legal QA only
    bizbot: 'claude-haiku-4-5-20251001', // Anthropic — customer chat
    reports: 'claude-sonnet-4-6', // Anthropic — Tier 1 reports only
  },
}
