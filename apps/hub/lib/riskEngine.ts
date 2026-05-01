export type RiskInput = {
  industry: 'fintech' | 'saas' | 'healthcare' | 'ecommerce' | 'crypto' | 'legal';
  userCountRange: 'under1k' | '1k-10k' | '10k-100k' | 'over100k';
  regions: Array<'US' | 'EU' | 'UAE' | 'Global'>;
  hasDPO: boolean;
};

export type RiskOutput = {
  score: number;
  severity: 'LOW' | 'MODERATE' | 'CRITICAL';
  threats: string[];
  mitigations: string[];
  precedent: string;
};

const INDUSTRY_BASE: Record<string, number> = {
  crypto: 45, healthcare: 42, fintech: 38,
  ecommerce: 22, saas: 20, legal: 15
};
const USER_SCALE: Record<string, number> = {
  over100k: 28, '10k-100k': 16, '1k-10k': 8, under1k: 0
};
const REGION_SCORE: Record<string, number> = {
  Global: 22, EU: 20, UAE: 12, US: 8
};

export function calculateRisk(input: RiskInput): RiskOutput {
  let score = INDUSTRY_BASE[input.industry] ?? 20;
  score += USER_SCALE[input.userCountRange] ?? 0;
  score += input.regions.reduce((sum, r) => sum + (REGION_SCORE[r] ?? 0), 0);
  if (input.hasDPO) score -= 14;
  score = Math.max(0, Math.min(100, Math.round(score)));

  const severity: RiskOutput['severity'] =
    score >= 70 ? 'CRITICAL' : score >= 40 ? 'MODERATE' : 'LOW';

  const threats = generateThreats(input, severity);
  const mitigations = generateMitigations(input);
  const precedent = getPrecedent(input.industry, input.regions);

  return { score, severity, threats, mitigations, precedent };
}

function generateThreats(input: RiskInput, severity: string): string[] {
  const t: string[] = [];
  if (input.regions.includes('EU') && input.industry !== 'legal') {
    t.push('GDPR Article 83(5) exposure — maximum €20M or 4% global turnover for data processing violations without documented legal basis');
  }
  if (input.industry === 'crypto' || input.industry === 'fintech') {
    if (input.regions.includes('EU')) t.push('MiCA Article 45 whitepaper deficiency — token issuance without compliant disclosure triggers €5M penalty and market suspension');
    if (input.regions.includes('UAE')) t.push('VARA VASP licensing gap — Dubai Virtual Asset operations without Category 3 licence constitute unauthorised financial business');
    if (input.regions.includes('US')) t.push('SEC Howey Test exposure — digital asset sales without registered offering or applicable exemption face disgorgement plus civil penalties');
  }
  if (!input.hasDPO && (input.regions.includes('EU') || input.userCountRange === 'over100k')) {
    t.push('GDPR Article 37 DPO obligation unmet — processing at scale requires mandatory Data Protection Officer appointment');
  }
  t.push('AML/KYC deficiency — absence of documented Customer Due Diligence programme for high-risk jurisdiction clients triggers FATF grey-list exposure');
  return t.slice(0, 4);
}

function generateMitigations(input: RiskInput): string[] {
  return [
    `Conduct a ${input.industry} regulatory gap analysis across all active jurisdictions within 30 days — prioritise ${input.regions.includes('EU') ? 'GDPR Article 30 Records of Processing' : 'AML policy documentation'}`,
    `Appoint a ${input.hasDPO ? 'qualified external counsel to review existing DPO mandate' : 'Data Protection Officer or qualified external DPO service'} — document appointment formally`,
    `Implement a compliance monitoring programme with quarterly internal audits against ${input.regions.includes('UAE') ? 'VARA' : input.regions.includes('EU') ? 'MiCA + GDPR' : 'SEC + AML'} updated guidance`
  ];
}

function getPrecedent(industry: string, regions: string[]): string {
  if (regions.includes('EU') && (industry === 'crypto' || industry === 'fintech')) {
    return 'Binance Holdings Ltd — CFTC and FinCEN imposed $4.3B in penalties in November 2023 for systemic AML failures and unlicensed money transmission across multiple jurisdictions. The enforcement action cited absence of KYC controls as the primary aggravating factor.';
  }
  if (regions.includes('EU')) {
    return 'Meta Platforms Ireland — Irish Data Protection Commission imposed a €1.2B GDPR fine in May 2023 for unlawful transfer of EU personal data to the United States without adequate safeguards, the largest GDPR penalty to date.';
  }
  if (regions.includes('UAE')) {
    return 'VARA issued its first enforcement action in Q4 2023 against an unlicensed VASP operating in Dubai, resulting in immediate business suspension and referral to the UAE Public Prosecution. No transition period was granted.';
  }
  return 'SEC v. Ripple Labs — the Southern District of New York ruled in July 2023 that programmatic XRP sales on exchanges constituted unregistered securities offerings, establishing a critical Howey Test precedent for token issuers globally.';
}
