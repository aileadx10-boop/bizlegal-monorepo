/**
 * DocAI — SQA knowledge base.
 *
 * The knowledge base holds vetted regulatory passages with citations.
 * Every retrieval result ships with the originating source URL, the
 * last-updated timestamp, and jurisdiction metadata so the downstream
 * draft can cite provenance.
 *
 * This module intentionally abstracts the backing store behind the
 * KnowledgeStore interface. The default in-memory implementation is
 * fine for tests and low-volume deployments; production uses a
 * pgvector-backed store via Supabase (adapter at a later P2 commit).
 *
 * LIABILITY_JUDGMENT: Every passage in the knowledge base cites a
 * public regulatory source by URL. When a cited source contradicts
 * a passage we have indexed, the regulator controls; the indexer
 * must remove the stale passage and re-index. The retrieval layer
 * surfaces last_updated so the reviewer can spot drift.
 */

export type Jurisdiction = "US" | "EU" | "UK" | "IN" | "CA" | "AU" | "SG" | "OTHER"

export interface KnowledgeBaseItem {
  id: string
  source_name: string
  source_url: string
  jurisdiction: Jurisdiction
  topics: string[]
  text: string
  /** ISO timestamp when the passage was last verified against source. */
  last_updated: string
}

export interface KnowledgeStore {
  all(): Promise<KnowledgeBaseItem[]>
  byId(id: string): Promise<KnowledgeBaseItem | null>
  byTopic(topic: string): Promise<KnowledgeBaseItem[]>
  byJurisdiction(j: Jurisdiction): Promise<KnowledgeBaseItem[]>
}

/** Minimal in-memory implementation, used by tests and default dev runs. */
export class InMemoryKnowledgeStore implements KnowledgeStore {
  private items: KnowledgeBaseItem[]

  constructor(items: KnowledgeBaseItem[] = []) {
    this.items = items
  }

  async all(): Promise<KnowledgeBaseItem[]> {
    return this.items.slice()
  }

  async byId(id: string): Promise<KnowledgeBaseItem | null> {
    return this.items.find((i) => i.id === id) ?? null
  }

  async byTopic(topic: string): Promise<KnowledgeBaseItem[]> {
    const t = topic.toLowerCase()
    return this.items.filter((i) => i.topics.map((x) => x.toLowerCase()).includes(t))
  }

  async byJurisdiction(j: Jurisdiction): Promise<KnowledgeBaseItem[]> {
    return this.items.filter((i) => i.jurisdiction === j)
  }
}

/**
 * Seed the store from a serialised manifest. The manifest is a
 * reviewer-authored JSON file; each entry MUST have a source_url and
 * a last_updated timestamp.
 */
export function knowledgeStoreFromManifest(manifest: KnowledgeBaseItem[]): KnowledgeStore {
  for (const entry of manifest) {
    if (!entry.source_url || !entry.last_updated) {
      throw new Error(
        `Knowledge base entry ${entry.id} is missing source_url or last_updated. Every passage must be citation-complete.`,
      )
    }
  }
  return new InMemoryKnowledgeStore(manifest)
}
