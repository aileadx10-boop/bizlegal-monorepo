import { z } from "zod";

// Worker env bindings. Mirrors wrangler.toml [vars] + secrets.
export interface Env {
  // Non-secret vars
  readonly PIPELINE_VERSION: string;
  readonly GITHUB_REPO_OWNER: string;
  readonly GITHUB_REPO_NAME: string;
  readonly GITHUB_DEFAULT_BRANCH: string;
  readonly HAIKU_MODEL_ID: string;
  readonly SONNET_ESCALATION_MODEL_ID: string;
  readonly MIN_CONFIDENCE_THRESHOLD: string;
  readonly NOTIFY_SCORE_THRESHOLD: string;

  // Secrets
  readonly ANTHROPIC_API_KEY: string;
  readonly GITHUB_TOKEN: string;
  readonly TELEGRAM_BOT_TOKEN?: string;
  readonly TELEGRAM_CHAT_ID?: string;
  readonly WEBHOOK_SHARED_SECRET: string;
  readonly GEMINI_API_KEY?: string;       // Optional — enables Nano Banana hero images
  readonly RESEND_API_KEY?: string;       // Optional — enables email delivery on /report/snapshot-public
  readonly RESEND_FROM?: string;          // e.g., "BizLegal-AI <team@intelligence.bizlegal-ai.com>" (Resend-verified subdomain)
  readonly RESEND_REPLY_TO?: string;      // e.g., "team@bizlegal-ai.com" (Namecheap PrivateEmail inbox)
  readonly PUBLIC_SNAPSHOT_ENABLED?: string; // "1" to enable the unauthenticated public endpoint
  readonly OPS_LOG_URL?: string;          // Optional override; defaults to https://bizlegal-ai.com/api/ops/log

  // Phase AA V3 — lead-nurture machine. Worker reads/writes
  // public.lead_nurture_state via Supabase REST. SUPABASE_SECRET is
  // the service-role key (full RW); RLS on the table is service_role-only.
  readonly SUPABASE_URL?: string;
  readonly SUPABASE_SECRET?: string;

  // KV bindings
  readonly DIGEST_KV?: KVNamespace; // Optional — Phase 3.2 product-digest cache (`hub:digest:latest`)
}

// Inbound form submission — what the landing page POSTs to /intake.
export const FormSubmissionSchema = z.object({
  full_name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().max(50).optional().nullable(),
  company: z.string().trim().max(200).optional().nullable(),
  challenge: z.string().trim().min(10).max(5000),
  utm_source: z.string().trim().max(100).optional().nullable(),
  utm_medium: z.string().trim().max(100).optional().nullable(),
  utm_campaign: z.string().trim().max(100).optional().nullable(),
  referrer: z.string().trim().max(500).optional().nullable()
});

export type FormSubmission = z.infer<typeof FormSubmissionSchema>;

// Canonical LeadProfile shape — matches /schemas/lead-profile.json.
// Staged population: Worker seeds metadata, then Haiku calls fill the rest.
export interface LeadProfile {
  lead_id: string;
  received_at: string;
  source: {
    form_url: string;
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
    referrer: string | null;
    user_agent: string | null;
    ip_country: string | null;
  };
  language?: string;
  contact: {
    full_name: string;
    email: string;
    phone: string | null;
    role: string | null;
  };
  company?: {
    name: string | null;
    website: string | null;
    industry: string | null;
    size_band: string | null;
    hq_country: string | null;
    hq_region: string | null;
  };
  pain: {
    raw_text: string;
    extracted_challenge: string | null;
    jurisdictions_mentioned: string[];
    regulations_mentioned: string[];
    urgency_signals: string[];
    budget_signals: string[];
  };
  qualification?: {
    vertical: "compliance" | "regulatory_risk" | "jurisdiction_arbitrage" | "business_intelligence" | "other";
    scores: {
      fit: number;
      urgency: number;
      budget: number;
      vertical_match: number;
      decision_authority: number;
      pain_clarity: number;
    };
    overall_score: number;
    recommended_action: "respond_immediately" | "qualify_further" | "disqualify";
    rationale: string;
  };
  confidence?: {
    per_field: Record<string, number>;
    min_confidence: number;
    critical_fields_missing: string[];
    concerns: string[];
    escalate_to_cloud: boolean;
  };
  summary_bullets?: [string, string, string, string, string];
  pipeline_meta: {
    extraction_model: string;
    critique_model?: string;
    scoring_model?: string;
    summary_model?: string;
    escalated_to_cloud: boolean;
    retries: number;
    status: "received" | "extracted" | "scored" | "stored" | "notified" | "failed" | "dlq";
    error_class: string | null;
    error_detail: string | null;
    processed_at: string | null;
    duration_ms: number | null;
  };
}

export type PipelineStatus = LeadProfile["pipeline_meta"]["status"];
