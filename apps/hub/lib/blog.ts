import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"

const CONTENT_DIR = path.join(process.cwd(), "content/blog")

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

function readPost(filename: string): BlogPost | null {
  try {
    const filePath = path.join(CONTENT_DIR, filename)
    const raw = fs.readFileSync(filePath, "utf-8")
    const { data, content } = matter(raw)

    if (!data.title || !data.date || !data.published) return null

    const slug = filename.replace(/\.mdx?$/, "")

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

  const files = fs.readdirSync(CONTENT_DIR).filter((f) => /\.mdx?$/.test(f))

  const posts = files
    .map((f) => readPost(f))
    // biome-ignore lint/complexity/useOptionalChain: type guard requires explicit null check
    .filter((p): p is BlogPost => p !== null && p.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map(({ content: _content, ...meta }) => meta)

  return posts
}

export function getPostBySlug(slug: string): BlogPost | null {
  if (!ensureContentDir()) return null

  const extensions = ["mdx", "md"]
  for (const ext of extensions) {
    const post = readPost(`${slug}.${ext}`)
    if (post) return post
  }

  return null
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
