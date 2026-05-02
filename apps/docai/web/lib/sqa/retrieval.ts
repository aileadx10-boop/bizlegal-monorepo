/**
 * DocAI — retrieval over the SQA knowledge base.
 *
 * Produces ranked KnowledgeBaseItem results with per-hit relevance
 * scores. The default implementation is a lightweight lexical scorer
 * (token overlap + topic/jurisdiction filters) suitable for unit tests
 * and early deployments; a pgvector adapter replaces this once the
 * backing store is live.
 *
 * Every retrieved hit carries:
 *   - the KnowledgeBaseItem with its source_url and last_updated
 *   - a relevance score in [0, 1]
 *   - the query terms that matched (for the draft-layer citation path)
 */

import type { Jurisdiction, KnowledgeBaseItem, KnowledgeStore } from "./knowledge-base"

export interface RetrievalQuery {
  text: string
  jurisdictions?: Jurisdiction[]
  topics?: string[]
  /** Hard cap on returned hits (default 8). */
  limit?: number
}

export interface RetrievalHit {
  item: KnowledgeBaseItem
  relevance: number
  matched_terms: string[]
}

export interface RetrievalResult {
  query: RetrievalQuery
  hits: RetrievalHit[]
  /** true when no hit clears the minimum relevance threshold. */
  below_threshold: boolean
  /** ISO timestamp of retrieval. */
  retrieved_at: string
}

const MIN_RELEVANCE = 0.15

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2)
}

function lexicalScore(queryTokens: string[], itemText: string): { score: number; matched: string[] } {
  if (queryTokens.length === 0) return { score: 0, matched: [] }
  const itemTokens = new Set(tokenize(itemText))
  const matched: string[] = []
  for (const t of queryTokens) if (itemTokens.has(t)) matched.push(t)
  const score = matched.length / queryTokens.length
  return { score, matched }
}

export async function retrieve(
  store: KnowledgeStore,
  query: RetrievalQuery,
): Promise<RetrievalResult> {
  const all = await store.all()
  const filterByJ = query.jurisdictions && query.jurisdictions.length > 0
    ? all.filter((i) => (query.jurisdictions as Jurisdiction[]).includes(i.jurisdiction))
    : all
  const filterByT = query.topics && query.topics.length > 0
    ? filterByJ.filter((i) =>
        i.topics.some((t) => (query.topics as string[]).map((x) => x.toLowerCase()).includes(t.toLowerCase())),
      )
    : filterByJ

  const qTokens = tokenize(query.text)
  const scored = filterByT
    .map<RetrievalHit>((item) => {
      const { score, matched } = lexicalScore(qTokens, item.text)
      return { item, relevance: score, matched_terms: matched }
    })
    .filter((h) => h.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, query.limit ?? 8)

  const below_threshold = scored.length === 0 || scored[0].relevance < MIN_RELEVANCE

  return {
    query,
    hits: scored,
    below_threshold,
    retrieved_at: new Date().toISOString(),
  }
}

export const RETRIEVAL_MIN_RELEVANCE = MIN_RELEVANCE
