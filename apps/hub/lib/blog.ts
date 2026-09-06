import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"

/**
 * Resolve the canonical blog content directory.
 *
 * The MDX library lives at the monorepo root (`content/blog/`), but the hub
 * app runs with `process.cwd()` = `apps/hub` (Vercel root directory, pnpm -F).
 * Try the monorepo-root path first, then fall back to a cwd-relative path
 * (covers running from the repo root, and the legacy hub-local content dir).
 */
function resolveContentDir(): string {
  const candidates = [
    // Canonical: monorepo root content/blog (cwd = apps/hub on Vercel + pnpm -F)
    path.join(process.cwd(), "../../content/blog"),
    // cwd = monorepo root, or legacy hub-local content dir
    path.join(process.cwd(), "content/blog"),
  ]
  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate)) return candidate
    } catch {
      // ignore and try the next candidate
    }
  }
  return candidates[0]
}

const CONTENT_DIR = resolveContentDir()

export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  author: string
  tag: string
  tagColor?: string
  readTime: string
  featured?: boolean
  image?: string
  published: boolean
  content: string
  keywords?: string[]
  jurisdiction?: string[]
}

export interface BlogPostMeta extends Omit<BlogPost, "content"> {}

/** Recursively collect every `.mdx` / `.md` file under `dir` (one level deep or more). */
function walkContentDir(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files: string[] = []
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...walkContentDir(fullPath))
    } else if (/\.mdx?$/.test(entry.name)) {
      files.push(fullPath)
    }
  }
  return files
}

function readPost(filePath: string): BlogPost | null {
  try {
    const raw = fs.readFileSync(filePath, "utf-8")
    const { data, content } = matter(raw)

    if (!data.title || !data.date || !data.published) return null

    // Subdirectory posts keep their filename slug (e.g. comparisons/foo.mdx → "foo").
    const slug = path.basename(filePath).replace(/\.mdx?$/, "")

    return {
      slug,
      title: data.title,
      description: data.description ?? "",
      date: data.date,
      author: data.author ?? "BizLegal AI Editorial Team",
      tag: data.tag ?? "Compliance",
      tagColor: data.tagColor,
      readTime: data.readTime ?? "5 min",
      featured: data.featured ?? false,
      image: data.image,
      published: data.published,
      content,
      keywords: data.keywords ?? [],
      jurisdiction: data.jurisdiction ?? [],
    }
  } catch {
    return null
  }
}

function ensureContentDir(): boolean {
  try {
    return fs.existsSync(CONTENT_DIR)
  } catch {
    return false
  }
}

export function getAllPosts(): BlogPostMeta[] {
  if (!ensureContentDir()) return []

  const seen = new Set<string>()
  const posts = walkContentDir(CONTENT_DIR)
    .map((filePath) => readPost(filePath))
    // biome-ignore lint/complexity/useOptionalChain: type guard requires explicit null check
    .filter((p): p is BlogPost => p !== null && p.published)
    // Defensive: if a flat file and a subdirectory file share a basename slug,
    // keep the first (root-level) occurrence and drop the duplicate.
    .filter((p) => {
      if (seen.has(p.slug)) return false
      seen.add(p.slug)
      return true
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map(({ content: _content, ...meta }) => meta)

  return posts
}

export function getPostBySlug(slug: string): BlogPost | null {
  if (!ensureContentDir()) return null

  const match = walkContentDir(CONTENT_DIR).find(
    (filePath) => path.basename(filePath).replace(/\.mdx?$/, "") === slug
  )

  return match ? readPost(match) : null
}

export function getFeaturedPosts(limit = 2): BlogPostMeta[] {
  return getAllPosts()
    .filter((p) => p.featured)
    .slice(0, limit)
}

export function getPostsByTag(tag: string): BlogPostMeta[] {
  return getAllPosts().filter((p) => p.tag.toLowerCase() === tag.toLowerCase())
}

export function getPostsByJurisdiction(jurisdiction: string): BlogPostMeta[] {
  return getAllPosts().filter((p) =>
    p.jurisdiction?.some((j) => j.toLowerCase() === jurisdiction.toLowerCase())
  )
}

export function getAllTags(): string[] {
  const tags = getAllPosts().map((p) => p.tag)
  return Array.from(new Set(tags))
}

export function getSurroundingPosts(slug: string): {
  prev: BlogPostMeta | null
  next: BlogPostMeta | null
} {
  const posts = getAllPosts()
  const idx = posts.findIndex((p) => p.slug === slug)
  return {
    prev: idx > 0 ? posts[idx - 1] : null,
    next: idx < posts.length - 1 ? posts[idx + 1] : null,
  }
}
