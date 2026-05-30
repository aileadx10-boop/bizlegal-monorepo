import { DISCLAIMER_VERSION, disclaimerStamp } from './disclaimer'

export interface LegalShield {
  disclaimer_version: string
  supervision_notice: string
  disclosure: string
  confidentiality: string
  consent_recorded_at: string
  jurisdiction_warnings: string[]
}

const VERTICAL_WARNINGS: Record<string, string[]> = {
  contract: [
    'Not a substitute for attorney review of your specific agreement.',
    'Risk assessments are informational — consult licensed counsel before acting.',
  ],
  'ai-act': [
    'EU AI Act obligations vary by deployer classification. Confirm with EU counsel.',
    'Risk tiers are preliminary — formal assessment requires human legal review.',
  ],
  immigration: [
    'Not valid for USCIS filing without attorney signature and verification.',
    'Petition drafts require licensed attorney review before submission.',
    'Immigration law changes frequently — verify current requirements with counsel.',
  ],
  'tech-transfer': [
    'Corporate formation requires local counsel in each jurisdiction.',
    'Templates are standard forms — customize with professional legal guidance.',
    'Tax implications require review by a qualified tax advisor.',
  ],
}

export function buildShield(vertical: string, consentTimestamp: string): LegalShield {
  const stamp = disclaimerStamp()
  return {
    disclaimer_version: stamp.disclaimer_version,
    supervision_notice: 'This output requires review by a licensed attorney before use.',
    disclosure: 'AI Conductor is a decision-support tool, not a licensed attorney. This is not legal advice.',
    confidentiality: 'Documents processed via Claude API under Anthropic zero-retention commercial terms.',
    consent_recorded_at: consentTimestamp,
    jurisdiction_warnings: VERTICAL_WARNINGS[vertical] ?? [
      'Consult a licensed attorney in your jurisdiction before acting on this output.',
    ],
  }
}
