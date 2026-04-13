import type { BlogPost } from './types'
import pdfManifest from '../content/blog/pdf-posts.json'

type PdfManifest = {
  posts: Array<{
    slug: string
    title: string
    date: string
    file: string
    description?: string
  }>
}

const rawMarkdown = import.meta.glob<string>('../content/blog/posts/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

/** Minimal YAML frontmatter (title, date, summary) — no eval, safe in the browser */
function parseSimpleFrontmatter(raw: string): {
  data: Record<string, string>
  content: string
} {
  const text = raw.replace(/^\uFEFF/, '')
  const m = text.match(
    /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/,
  )
  if (!m) {
    return { data: {}, content: text.trim() }
  }
  const data: Record<string, string> = {}
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([\w-]+):\s*(.*)$/)
    if (kv) {
      let v = kv[2].trim()
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1)
      }
      data[kv[1]] = v
    }
  }
  return { data, content: m[2].trim() }
}

function slugFromPath(path: string): string {
  const base = path.split('/').pop() ?? ''
  return base.replace(/\.md$/i, '')
}

export function getMarkdownPosts(): BlogPost[] {
  const posts: BlogPost[] = []
  for (const path of Object.keys(rawMarkdown)) {
    const raw = rawMarkdown[path]
    const slug = slugFromPath(path)
    const { data, content } = parseSimpleFrontmatter(raw)
    const title = typeof data.title === 'string' ? data.title : slug
    const date = typeof data.date === 'string' ? data.date : '1970-01-01'
    const summary = typeof data.summary === 'string' ? data.summary : undefined
    posts.push({
      kind: 'markdown',
      slug,
      title,
      date,
      body: content,
      summary,
    })
  }
  return posts
}

export function getPdfPosts(): BlogPost[] {
  const m = pdfManifest as PdfManifest
  return m.posts.map((p) => ({
    kind: 'pdf' as const,
    slug: p.slug,
    title: p.title,
    date: p.date,
    url: `/blog/${p.file}`,
    description: p.description,
  }))
}

export function getAllPosts(): BlogPost[] {
  return [...getMarkdownPosts(), ...getPdfPosts()].sort((a, b) =>
    b.date.localeCompare(a.date),
  )
}
