import type { Env, LeadProfile } from "./types";

// Minimal GitHub REST client for committing LeadProfile artifacts.
// Uses PUT /repos/{owner}/{repo}/contents/{path} (single-file commits).
// For bulk writes (multiple files per commit), swap to Git Data API (blobs + trees + commits).
// Day-2 scope: 2 files per lead (.md + .json) + decisions log append = 3 API calls per lead.

const GITHUB_API = "https://api.github.com";
const API_VERSION = "2022-11-28";

export interface CommitFileInput {
  readonly path: string;
  readonly content: string;
  readonly message: string;
}

export async function commitLeadProfile(env: Env, profile: LeadProfile): Promise<void> {
  const baseName = `${profile.received_at.slice(0, 10)}-${profile.lead_id.slice(0, 8)}`;
  const jsonPath = `lead_profiles/${baseName}.json`;
  const mdPath = `lead_profiles/${baseName}.md`;

  await putFile(env, {
    path: jsonPath,
    content: JSON.stringify(profile, null, 2),
    message: `lead: ${baseName} (${profile.qualification?.recommended_action ?? "unscored"})`
  });

  await putFile(env, {
    path: mdPath,
    content: renderLeadMarkdown(profile),
    message: `lead-md: ${baseName}`
  });

  await appendDecisionsLog(env, profile);
}

/**
 * Generic single-file commit helper. Used by digest.ts and any future
 * ad-hoc artefact writes (decisions log entries, scout outputs, etc.).
 * Wraps the internal putFile so callers don't need to know about
 * GitHub's content-API quirks (sha-on-update, base64 encoding, etc.).
 */
export async function commitFileToGithub(
  env: Env,
  path: string,
  content: string,
  message: string
): Promise<void> {
  await putFile(env, { path, content, message });
}

export async function commitDlq(env: Env, payload: unknown, error: unknown): Promise<void> {
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const path = `outputs/dlq/${ts}.json`;
  const content = JSON.stringify(
    {
      dlq_ts: new Date().toISOString(),
      error_class: errClass(error),
      error_message: errMessage(error),
      original_payload: payload
    },
    null,
    2
  );
  await putFile(env, {
    path,
    content,
    message: `dlq: ${ts} (${errClass(error)})`
  });
}

async function appendDecisionsLog(env: Env, profile: LeadProfile): Promise<void> {
  const path = "decisions/log.md";
  const dateStr = profile.received_at.slice(0, 10);
  const bullet = profile.qualification
    ? `| SCORE: ${profile.qualification.overall_score} (${profile.qualification.recommended_action}) | VERTICAL: ${profile.qualification.vertical}`
    : `| SCORE: n/a`;
  const line = `\n[${dateStr}] LEAD: ${profile.lead_id} | CONTACT: ${profile.contact.full_name} <${profile.contact.email}> | COMPANY: ${profile.company?.name ?? "-"} ${bullet} | SOURCE: ${profile.source.form_url}`;

  const existing = await getFile(env, path);
  const newContent = existing.content + line;
  await putFile(env, {
    path,
    content: newContent,
    message: `log: append lead ${profile.lead_id.slice(0, 8)}`
  });
}

interface GetFileResult {
  readonly content: string;
  readonly sha: string;
}

async function getFile(env: Env, path: string): Promise<GetFileResult> {
  const url = `${GITHUB_API}/repos/${env.GITHUB_REPO_OWNER}/${env.GITHUB_REPO_NAME}/contents/${encodeURIComponent(path)}?ref=${env.GITHUB_DEFAULT_BRANCH}`;
  const res = await fetch(url, {
    headers: githubHeaders(env)
  });
  if (!res.ok) {
    throw new Error(`GitHub GET ${path} -> ${res.status}: ${(await safeText(res)).slice(0, 300)}`);
  }
  const body = (await res.json()) as { content: string; encoding: string; sha: string };
  const decoded =
    body.encoding === "base64"
      ? atob(body.content.replace(/\n/g, ""))
      : body.content;
  return { content: decoded, sha: body.sha };
}

async function putFile(env: Env, input: CommitFileInput): Promise<void> {
  // Check for existing file to include its sha (required for updates).
  let sha: string | undefined;
  try {
    const existing = await getFile(env, input.path);
    sha = existing.sha;
  } catch {
    // File does not exist yet - proceed without sha for creation.
  }

  const url = `${GITHUB_API}/repos/${env.GITHUB_REPO_OWNER}/${env.GITHUB_REPO_NAME}/contents/${encodeURIComponent(input.path)}`;
  const body = {
    message: input.message,
    content: btoa(unescape(encodeURIComponent(input.content))),
    branch: env.GITHUB_DEFAULT_BRANCH,
    ...(sha ? { sha } : {})
  };

  const res = await fetch(url, {
    method: "PUT",
    headers: githubHeaders(env),
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    throw new Error(`GitHub PUT ${input.path} -> ${res.status}: ${(await safeText(res)).slice(0, 300)}`);
  }
}

function githubHeaders(env: Env): Record<string, string> {
  return {
    Authorization: `Bearer ${env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": API_VERSION,
    "User-Agent": "bizlegal-lead-intake-worker"
  };
}

function renderLeadMarkdown(profile: LeadProfile): string {
  const q = profile.qualification;
  const bullets = profile.summary_bullets ?? [];
  return `---
lead_id: ${profile.lead_id}
received_at: ${profile.received_at}
name: ${profile.contact.full_name}
email: ${profile.contact.email}
company: ${profile.company?.name ?? "-"}
vertical: ${q?.vertical ?? "-"}
overall_score: ${q?.overall_score ?? "-"}
recommended_action: ${q?.recommended_action ?? "-"}
min_confidence: ${profile.confidence?.min_confidence ?? "-"}
escalated_to_cloud: ${profile.pipeline_meta.escalated_to_cloud}
---

# ${profile.contact.full_name} - ${profile.company?.name ?? profile.contact.email}

${bullets.map((b, i) => `${i + 1}. ${b}`).join("\n")}

## Qualification

- Vertical: **${q?.vertical ?? "-"}**
- Overall score: **${q?.overall_score ?? "-"}** -> **${q?.recommended_action ?? "-"}**
- Rationale: ${q?.rationale ?? "-"}

## Scores

| Dimension | Score |
|---|---|
| Fit | ${q?.scores.fit ?? "-"} |
| Urgency | ${q?.scores.urgency ?? "-"} |
| Budget | ${q?.scores.budget ?? "-"} |
| Vertical match | ${q?.scores.vertical_match ?? "-"} |
| Decision authority | ${q?.scores.decision_authority ?? "-"} |
| Pain clarity | ${q?.scores.pain_clarity ?? "-"} |

## Pain

${profile.pain.raw_text}

**Extracted:** ${profile.pain.extracted_challenge ?? "-"}

- **Jurisdictions:** ${profile.pain.jurisdictions_mentioned.join(", ") || "-"}
- **Regulations:** ${profile.pain.regulations_mentioned.join(", ") || "-"}
- **Urgency signals:** ${profile.pain.urgency_signals.join(", ") || "-"}
- **Budget signals:** ${profile.pain.budget_signals.join(", ") || "-"}

## Source

- Form URL: ${profile.source.form_url}
- UTM source/medium/campaign: ${profile.source.utm_source ?? "-"} / ${profile.source.utm_medium ?? "-"} / ${profile.source.utm_campaign ?? "-"}
- IP country: ${profile.source.ip_country ?? "-"}

## Confidence

- Min confidence: ${profile.confidence?.min_confidence ?? "-"}
- Critical fields missing: ${profile.confidence?.critical_fields_missing.join(", ") || "none"}
- Concerns: ${profile.confidence?.concerns.join("; ") || "none"}
`;
}

function errClass(e: unknown): string {
  if (e instanceof Error) return e.name;
  return typeof e;
}

function errMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  return String(e).slice(0, 500);
}

async function safeText(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return "<unreadable>";
  }
}
