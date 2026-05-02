import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? '' })

export type VerticalType =
  | 'noncompete'
  | 'phantom_1099'
  | 'surplus_funds'
  | 'passport'
  | 'gdpr'
  | 'boi'
  | 'sms'
  | 'tdpsa'
  | 'cipa'
  | 'gpc'
  | 'mhmda'
  | 'iso27001'
  | 'gipa'
  | 'edtech'
  | 'surplus'

export interface PassportIntake {
  company_name: string
  contact_name: string
  email: string
  website?: string
  product_type: string
  crypto_involved: boolean
  entity_types: string[]
  target_markets: string[]
  current_revenue_usd?: number
  fundraising_stage?: string
  investor_jurisdiction?: string
  notes?: string
}

export interface PassportResult extends ModuleResult {
  markets: Record<string, {
    required_licenses: string[]
    aml_kyc: Record<string, unknown>
    data_privacy: Record<string, unknown>
    entity_req: Record<string, unknown>
    employment: Record<string, unknown>
    tax: Record<string, unknown>
    immediate_actions: string[]
    estimated_cost_usd: number
    timeline_months: number
  }>
  cross_cutting: { fatf_obligations: string[]; ip_strategy: string[]; banking_considerations: string[] }
  red_flags: string[]
  priority_actions_30_days: string[]
  estimated_total_compliance_cost_usd: number
}

export interface ModuleResult {
  violation: boolean
  confidence: number
  risk_level: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

const PASSPORT_SYSTEM = `You are a senior cross-border regulatory compliance expert with deep expertise in Israeli technology company expansion to UK, EU, US, and Singapore markets.`

function buildPassportPrompt(intake: PassportIntake): string {
  const countryFlags: Record<string, string> = {
    uk: 'United Kingdom', eu: 'European Union', us: 'United States', sg: 'Singapore',
    au: 'Australia', ca: 'Canada', de: 'Germany', nl: 'Netherlands',
    ch: 'Switzerland', ae: 'UAE', jp: 'Japan', hk: 'Hong Kong',
  }
  const markets = (intake.target_markets as string[]).map((m: string) => countryFlags[m] ?? m).join(', ')

  return `You are a senior cross-border regulatory compliance expert with deep expertise in Israeli and global technology company expansion.

Analyze this company and provide a complete Regulatory Passport — jurisdiction-by-jurisdiction compliance roadmap.

COMPANY PROFILE:
Name: ${intake.company_name}
Product type: ${intake.product_type}
Crypto/blockchain involved: ${intake.crypto_involved}
Entity structure: ${JSON.stringify(intake.entity_types)}
Target markets: ${markets}
Revenue: $${intake.current_revenue_usd?.toLocaleString() || 'undisclosed'}
Stage: ${intake.fundraising_stage}
Primary investor jurisdiction: ${intake.investor_jurisdiction}

ADDITIONAL NOTES: ${intake.notes || 'None'}

For each target market provide:

1. REQUIRED LICENSES — specific license names, issuing authority, timeline, cost estimate
2. AML/KYC OBLIGATIONS — FATF Travel Rule if crypto involved
3. DATA PRIVACY REQUIREMENTS — GDPR, CCPA, PIPL, PDPA, Privacy Act
4. MARKETING RESTRICTIONS — what requires licensing before marketing
5. ENTITY REQUIREMENTS — branch, subsidiary, local agent, EU Article 27 representative
6. EMPLOYMENT LAW — contractor vs employee, local hiring restrictions
7. TAX OBLIGATIONS — VAT/GST registration, withholding taxes, treaty relief
8. KEY RISKS — specific red flags for this company profile
9. IMMEDIATE ACTIONS — what to do in next 30 days
10. ESTIMATED COMPLIANCE COST — total for market entry

MARKET-SPECIFIC REQUIREMENTS:

UK:
- FCA authorization for financial services, crypto asset activities (MLSR/FCA reg)
- Economic Crime Act 2022: Companies House filing, PSC register
- UK GDPR + Data Protection Act 2018
- Employment: Right to work checks, holiday pay, auto-enrollment pension
- VAT: Registration threshold £85,000, flat rate scheme for tech

EU:
- MiCA regulation for cryptoassets (applicable from 2024)
- Digital Services Act (DSA), Digital Markets Act (DMA)
- GDPR Article 27 representative requirement for non-EU companies targeting EU
- EU AML Regulation (AMLR 2024): MLD6 compliance
- VAT: OSS registration for SaaS, VAT number required for B2B

US:
- FinCEN: MSB registration for money transmission, FinCEN CTA BOI filing
- SEC: Howey Test for investment contracts, accredited investor rules
- FTC: advertising rules, reviews, endorsements, dark patterns
- CCPA/CPRA: consumer rights, opt-out, data broker registration (CA)
- State: Money transmitter licenses (NY BitLicense, CA DFPI)
- Employment: FLSA, ABC test for contractors (CA AB5)

Singapore:
- MAS: CMS for payment services, PSA for digital payment tokens
- PDPA: data protection obligations
- MAS AI governance guidelines (2024)
- Employment Pass / S Pass requirements for hiring

Australia:
- ASIC: AFS License for financial advice, credit licensing
- Privacy Act 1988: APPs, Notifiable Data Breaches scheme
- ePayments Code, AML/CTF Act for payments
- GST: Registration threshold AUD $75,000

Canada:
- FINTRAC: MSB registration, large cash transaction reports
- OSC/CSA: securities registration exemptions for tech companies
- PIPEDA: consent, data breach notification
- Quebec Act 25: enhanced privacy obligations (Quebec-specific)
- Provincial: PST/QST registration for SaaS

Germany:
- BaFin: KWG license for financial services, payment institution
- GDPR with enhanced enforcement (BfDI + state DPAs)
- GwG (Geldwäschegesetz): AML compliance program
- MiCA: crypto asset service provider registration with BaFin
- Employment: Works Council requirements, Mitbestimmungsgesetz

Netherlands:
- AFM: financial market authority licensing
- DNB: payment institution registration
- GDPR: Autoriteit Persoonsgegevens enforcement
- Netherlands BV: Dutch company formation, UBO register
- Employment: Flexible Act (Wet flexveilig), WWZ reforms

Switzerland:
- FINMA: asset manager, fund manager, bank licenses
- Swiss Data Protection Act (nDPA) — stricter than GDPR in some areas
- VQF license for financial intermediaries
- Employment: LAV restrictions on hiring foreign workers

UAE:
- DIFC/ADGM: financial center licenses (light-touch regulation)
- UAERA: AI regulation for Dubai
- AML/CFT: Federal Law No. 20 re: AML
- UAE Personal Data Protection Law (PDPL) 2022
- Employment: kafala system considerations

Japan:
- FSA: Financial Instruments Exchange Act (FIEA), payment services
- APPI: data protection, strict cross-border transfer rules
- JVCEA: crypto exchange registration (for crypto companies)
- Employment: Worker dispatch law, equal pay reforms

Hong Kong:
- SFC: Type 1-9 licenses for securities/futures/advice
- PDPO: data protection ordinance (less strict than GDPR)
- AML/CFT: SFC licensing for virtual asset service providers
- Employment: Immigration Ordinance, MPF contributions

Return as structured JSON:
{
  "summary": "3-sentence executive overview",
  "risk_level": "low|medium|high|critical",
  "priority_market": "first market to tackle",
  "markets": {
    "UK": { "required_licenses": [], "aml_kyc": {}, "data_privacy": {}, "entity_req": {}, "employment": {}, "tax": {}, "immediate_actions": [], "estimated_cost_usd": 0, "timeline_months": 0 },
    "EU": { "required_licenses": [], "aml_kyc": {}, "data_privacy": {}, "entity_req": {}, "employment": {}, "tax": {}, "immediate_actions": [], "estimated_cost_usd": 0, "timeline_months": 0 },
    "US": { "required_licenses": [], "aml_kyc": {}, "data_privacy": {}, "entity_req": {}, "employment": {}, "tax": {}, "immediate_actions": [], "estimated_cost_usd": 0, "timeline_months": 0 },
    "SG": { "required_licenses": [], "aml_kyc": {}, "data_privacy": {}, "entity_req": {}, "employment": {}, "tax": {}, "immediate_actions": [], "estimated_cost_usd": 0, "timeline_months": 0 },
    "AU": { "required_licenses": [], "aml_kyc": {}, "data_privacy": {}, "entity_req": {}, "employment": {}, "tax": {}, "immediate_actions": [], "estimated_cost_usd": 0, "timeline_months": 0 },
    "CA": { "required_licenses": [], "aml_kyc": {}, "data_privacy": {}, "entity_req": {}, "employment": {}, "tax": {}, "immediate_actions": [], "estimated_cost_usd": 0, "timeline_months": 0 },
    "DE": { "required_licenses": [], "aml_kyc": {}, "data_privacy": {}, "entity_req": {}, "employment": {}, "tax": {}, "immediate_actions": [], "estimated_cost_usd": 0, "timeline_months": 0 },
    "NL": { "required_licenses": [], "aml_kyc": {}, "data_privacy": {}, "entity_req": {}, "employment": {}, "tax": {}, "immediate_actions": [], "estimated_cost_usd": 0, "timeline_months": 0 },
    "CH": { "required_licenses": [], "aml_kyc": {}, "data_privacy": {}, "entity_req": {}, "employment": {}, "tax": {}, "immediate_actions": [], "estimated_cost_usd": 0, "timeline_months": 0 },
    "AE": { "required_licenses": [], "aml_kyc": {}, "data_privacy": {}, "entity_req": {}, "employment": {}, "tax": {}, "immediate_actions": [], "estimated_cost_usd": 0, "timeline_months": 0 },
    "JP": { "required_licenses": [], "aml_kyc": {}, "data_privacy": {}, "entity_req": {}, "employment": {}, "tax": {}, "immediate_actions": [], "estimated_cost_usd": 0, "timeline_months": 0 },
    "HK": { "required_licenses": [], "aml_kyc": {}, "data_privacy": {}, "entity_req": {}, "employment": {}, "tax": {}, "immediate_actions": [], "estimated_cost_usd": 0, "timeline_months": 0 }
  },
  "cross_cutting": { "fatf_obligations": [], "ip_strategy": [], "banking_considerations": [] },
  "red_flags": [],
  "priority_actions_30_days": [],
  "estimated_total_compliance_cost_usd": 0
}`
}

// ── VERTICAL PROMPTS ─────────────────────────────────────────────────────────

const VERB_PROMPTS: Record<string, (p: Record<string, unknown>) => string> = {

  noncompete: (p) => `Analyze this company for CA non-compete enforcement risk (SB 699 / AB 1076).

Company: ${p.company_name}
Recent CA acquisition: ${p.acquired_ca_company}
Employee count with legacy non-competes: ${p.employee_count}
Nullification notices sent: ${p.notices_sent}

CA law requires mandatory written notices to employees with non-compete clauses.

Return JSON:
{
  "violation": boolean,
  "confidence": 0.0-1.0,
  "risk_level": "low|medium|high|critical",
  "notices_required": number,
  "notices_sent": number,
  "exposure_min": number,
  "exposure_max": number,
  "findings": [],
  "fix_steps": []
}`,

  phantom_1099: (p) => `Analyze for CA ABC Test contractor misclassification risk.

Company location: ${p.company_state}
CA remote contractor roles: ${JSON.stringify(p.ca_roles)}
Worker classification used: ${p.classification}

Return JSON:
{
  "violation": boolean,
  "confidence": 0.0-1.0,
  "risk_level": "low|medium|high|critical",
  "at_risk_workers": number,
  "exposure_min": number,
  "exposure_max": number,
  "findings": [],
  "fix_steps": []
}`,

  surplus_funds: (p) => `Qualify this surplus funds case for attorney routing.

Case data: ${JSON.stringify(p)}

Return JSON:
{
  "qualified": boolean,
  "score": 0-100,
  "estimated_value_usd": number,
  "summary": "string",
  "key_facts": [],
  "risk_flags": [],
  "recommended_executor_type": "attorney"
}`,

  passport: () => '',  // handled by runPassportAssessment

  gdpr: (p) => `Analyze for GDPR cookie consent compliance (EU/UK).

URL: ${p.url}
Non-essential cookies before consent: ${JSON.stringify(p.cookies_before_consent)}
Consent banner present: ${p.has_banner}
Pre-ticked boxes: ${p.has_preticked}
Granular controls: ${p.has_granular}

Return JSON:
{
  "violation": boolean,
  "confidence": 0.0-1.0,
  "risk_level": "low|medium|high|critical",
  "issues": [],
  "exposure_min": number,
  "exposure_max": number,
  "findings": [],
  "fix_steps": []
}`,

  boi: (p) => `Analyze this company's Beneficial Ownership Information (BOI) filing status under the Corporate Transparency Act (31 CFR 1010.306).

Company: ${p.company_name || 'Unknown'}
Formation date: ${p.formation_date || 'Unknown'}
State formed: ${p.state || 'Unknown'}
Has BOI been filed with FinCEN: ${p.boi_filed || 'Unknown'}
Ownership change since filing: ${p.ownership_changed || 'No'}
Number of beneficial owners (25%+ or substantial control): ${p.owner_count || 'Unknown'}
Prior BOI filing date: ${p.boi_filing_date || 'Never filed'}

CTA requires:
- FinCEN BOI Report (Form 1) within 90 days of formation for existing companies, or 30 days for companies formed after Jan 1, 2024
- Updates within 30 days of any ownership change
- Penalties: $500/day per violation, accruing from Jan 1, 2024

Return JSON:
{
  "filing_required": boolean,
  "already_filed": boolean,
  "filing_overdue": boolean,
  "days_overdue": number,
  "exposure_min": number,
  "exposure_max": number,
  "finCEN_id": "string|null",
  "next_deadline": "string|null",
  "findings": [],
  "fix_steps": []
}`,

  sms: (p) => `Analyze this company's SMS marketing compliance under FCC TCPA and 10DLC rules.

Company name: ${p.company_name}
SMS campaign URL or description: ${p.campaign_description || 'N/A'}
Consent obtained from recipients: ${p.consent_obtained || 'Unknown'}
TCPA disclaimer present: ${p.tcpa_disclaimer || 'Unknown'}
10DLC campaign registered: ${p.tdlc_registered || 'Unknown'}
Carrier filter used: ${p.carrier_filter || 'Unknown'}
Company state: ${p.company_state || 'Unknown'}

Return JSON:
{
  "violation": boolean,
  "confidence": 0.0-1.0,
  "risk_level": "low|medium|high|critical",
  "at_risk_messages": number,
  "consent_issues": [],
  "tdlc_compliant": boolean,
  "exposure_min": number,
  "exposure_max": number,
  "findings": [],
  "fix_steps": []
}`,

  tdpsa: (p) => `Analyze this website for Texas Data Privacy Act (TDPSA / HB 4) compliance.

Website URL: ${p.url}
Company target market: Texas consumers
Data collected: ${JSON.stringify(p.data_collected || [])}
Third-party data sharing: ${JSON.stringify(p.third_party_sharing || [])}
Privacy policy URL: ${p.privacy_policy_url || 'None'}
Opt-out mechanism present: ${p.opt_out_present || 'Unknown'}
"Do Not Sell" link present: ${p.donot_sell_present || 'Unknown'}
Data breach notification policy: ${p.breach_notification || 'Unknown'}

Return JSON:
{
  "violation": boolean,
  "confidence": 0.0-1.0,
  "risk_level": "low|medium|high|critical",
  "consumer_rights_violations": [],
  "data_security_issues": [],
  "exposure_min": number,
  "exposure_max": number,
  "findings": [],
  "fix_steps": []
}`,

  cipa: (p) => `Analyze this website for CIPA §631 (California Invasion of Privacy Act) violations.

Website URL: ${p.url}
Third-party trackers detected: ${JSON.stringify(p.trackers_before_consent || [])}
Camera/microphone access requested: ${p.camera_mic_access || 'Unknown'}
Consent management platform: ${p.cmp || 'None'}
Pre-checked consent boxes: ${p.preticked || 'Unknown'}
Session recording tools: ${p.session_recording || 'Unknown'}
Employee monitoring tools: ${p.employee_monitoring || 'Unknown'}

CIPA §631 makes it a misdemeanor for any person to intentionally record a conversation without the consent of all parties in California (one-party consent state, but §631 is specific about electronic monitoring).

Return JSON:
{
  "violation": boolean,
  "confidence": 0.0-1.0,
  "risk_level": "low|medium|high|critical",
  "prohibited_trackers": [],
  "prohibited_circumstances": [],
  "exposure_min": number,
  "exposure_max": number,
  "findings": [],
  "fix_steps": []
}`,

  gpc: (p) => `Analyze this website for Global Privacy Control (GPC) signal compliance under CCPA/CPRA.

Website URL: ${p.url}
GPC signal detected on page: ${p.gpc_detected || 'Unknown'}
GPC opt-out request honored: ${p.gpc_honored || 'Unknown'}
Third-party cookies after GPC signal: ${p.cookies_after_gpc || 'Unknown'}
Privacy policy mentions GPC: ${p.gpc_in_privacy_policy || 'Unknown'}
Opt-out link present: ${p.ccpa_optout_link || 'Unknown'}
"Do Not Sell My Info" link: ${p.donot_sell_link || 'Unknown'}

CCPA/CPRA requires businesses to honor GPC signals as valid consumer requests to opt out of sale/sharing.

Return JSON:
{
  "violation": boolean,
  "confidence": 0.0-1.0,
  "risk_level": "low|medium|high|critical",
  "gpc_requests_ignored": number,
  "sale_or_sharing_detected": boolean,
  "exposure_min": number,
  "exposure_max": number,
  "findings": [],
  "fix_steps": []
}`,

  mhmda: (p) => `Analyze this website for WA My Health My Data Act (MHMDA) compliance.

Website URL: ${p.url}
Health data collected: ${JSON.stringify(p.health_data_collected || [])}
Consumer health queries tracked: ${p.health_queries_tracked || 'Unknown'}
HIPAA exemption claimed: ${p.hipaa_exempt || 'Unknown'}
Privacy policy covers MHMDA: ${p.mhmda_in_policy || 'Unknown'}
Consumer consent obtained: ${p.health_consent || 'Unknown'}
Data shared with third parties: ${JSON.stringify(p.third_party_health_sharing || [])}

MHMDA (WA SB 5032, effective Jan 2024) prohibits collecting/sharing consumer health data without affirmative opt-in consent. Covers online identifiers, location data related to health, and inferred health data.

Return JSON:
{
  "violation": boolean,
  "confidence": 0.0-1.0,
  "risk_level": "low|medium|high|critical",
  "prohibited_collections": [],
  "health_data_categories": [],
  "exposure_min": number,
  "exposure_max": number,
  "findings": [],
  "fix_steps": []
}`,

  iso27001: (p) => `Assess this organization's readiness for ISO 27001 certification.

Company name: ${p.company_name || 'Unknown'}
Industry: ${p.industry || 'Unknown'}
Employee count: ${p.employee_count || 'Unknown'}
Existing security controls: ${JSON.stringify(p.existing_controls || [])}
Data handled: ${JSON.stringify(p.data_types || [])}
Has a documented ISMS: ${p.has_isms || 'Unknown'}
Previous security incidents: ${p.incidents || 'Unknown'}
Regulatory requirements: ${JSON.stringify(p.regulatory_reqs || [])}

ISO 27001 requires: Risk assessment, asset inventory, 114 security controls across 14 domains, Statement of Applicability, internal audit, management review.

Return JSON:
{
  "ready_for_certification": boolean,
  "gap_score": "0-100",
  "risk_level": "low|medium|high|critical",
  "domains_incomplete": [],
  "estimated_effort_months": number,
  "findings": [],
  "fix_steps": []
}`,

  gipa: (p) => `Analyze this HR document for Illinois GIPA (410 ILCS 513) violations.

Document text: ${p.document_text}
Document type: ${p.document_type}
Company state: ${p.company_state}
Estimated applicants per year: ${p.applicant_count || 'unknown'}

GIPA prohibits soliciting family medical history in pre-employment context.
Damages: $2,500 negligent / $15,000 intentional per applicant.

Return JSON:
{
  "violation": boolean,
  "confidence": 0.0-1.0,
  "risk_level": "low|medium|high|critical",
  "prohibited_questions": [],
  "question_context": "pre-offer|post-offer|unclear",
  "applicant_count_estimate": number,
  "exposure_min": number,
  "exposure_max": number,
  "findings": [],
  "fix_steps": []
}`,

  edtech: (p) => `Analyze this EdTech platform for California Student Privacy (EC §49073.1) compliance.

Platform URL: ${p.url}
Student data collected: ${JSON.stringify(p.student_data || [])}
Age range served: ${p.age_range || 'Unknown'}
School contracts in place: ${p.school_contracts || 'Unknown'}
Data sold or shared for广告: ${p.data_for_ads || 'Unknown'}
Parental consent obtained: ${p.parental_consent || 'Unknown'}
Student directory information shared: ${p.directory_info_shared || 'Unknown'}

California EC §49073.1 requires: Written agreement with schools, limitations on data use, prohibition on targeted advertising, parental access rights.

Return JSON:
{
  "violation": boolean,
  "confidence": 0.0-1.0,
  "risk_level": "low|medium|high|critical",
  "data_categories_collected": [],
  "advertising_use_detected": boolean,
  "exposure_min": number,
  "exposure_max": number,
  "findings": [],
  "fix_steps": []
}`,

  surplus: (p) => `Qualify this surplus funds case for attorney routing.

Case data: ${JSON.stringify(p)}

Return JSON:
{
  "qualified": boolean,
  "score": 0-100,
  "estimated_value_usd": number,
  "summary": "string",
  "key_facts": [],
  "risk_flags": [],
  "recommended_executor_type": "attorney"
}`,
}

// ── CORE: run any module through Claude ─────────────────────────────────────

export async function runModule(vertical: VerticalType, payload: unknown): Promise<ModuleResult> {
  const fn = VERB_PROMPTS[vertical]
  if (!fn) throw new Error(`Unknown vertical: ${vertical}`)

  const prompt = fn(payload as Record<string, unknown>)
  const msg = await anthropic.messages.create({
    model: 'claude-opus-4-5(20241120)',
    max_tokens: 2048,
    system: 'You are a senior regulatory compliance analyst. Return only valid JSON matching the schema exactly. No markdown, no explanation.',
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = msg.content[0]
  if (raw.type !== 'text') throw new Error('Unexpected response type')
  try {
    return JSON.parse(raw.text) as ModuleResult
  } catch {
    throw new Error('Failed to parse Claude response: ' + raw.text.slice(0, 200))
  }
}

// ── PASSPORT: uses dedicated prompt ──────────────────────────────────────────

export async function runPassportAssessment(intake: PassportIntake): Promise<PassportResult> {
  const msg = await anthropic.messages.create({
    model: 'claude-opus-4-5(20241120)',
    max_tokens: 4096,
    system: PASSPORT_SYSTEM,
    messages: [{ role: 'user', content: buildPassportPrompt(intake) }],
  })

  const raw = msg.content[0]
  if (raw.type !== 'text') throw new Error('Unexpected response type')
  try {
    return JSON.parse(raw.text) as PassportResult
  } catch {
    throw new Error('Failed to parse passport response: ' + raw.text.slice(0, 200))
  }
}

// ── SURPLUS case qualifier ───────────────────────────────────────────────────

export async function qualifyCase(vertical: string, payload: Record<string, unknown>): Promise<ModuleResult> {
  const fn = VERB_PROMPTS[vertical]
  if (!fn) throw new Error(`Unknown vertical: ${vertical}`)

  const prompt = fn(payload)
  const msg = await anthropic.messages.create({
    model: 'claude-opus-4-5(20241120)',
    max_tokens: 1024,
    system: 'You are a legal case qualification expert. Return only valid JSON matching the schema exactly.',
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = msg.content[0]
  if (raw.type !== 'text') throw new Error('Unexpected response type')
  try {
    return JSON.parse(raw.text) as ModuleResult
  } catch {
    throw new Error('Failed to parse qualification response')
  }
}

// Alias for scan/report route
export async function generateReport(
  vertical: VerticalType,
  findings: Record<string, unknown>,
  name?: string
): Promise<string> {
  const payload = { ...findings, company_name: name }
  const result = await runModule(vertical, payload)
  return JSON.stringify(result, null, 2)
}
