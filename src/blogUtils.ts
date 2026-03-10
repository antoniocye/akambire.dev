export interface BlogPost {
  slug: string
  title: string
  date: string
  description: string
  tags: string[]
  content: string
  sizeBytes: number
}

function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) return { meta: {}, body: raw }

  const meta: Record<string, string> = {}
  match[1].split('\n').forEach((line) => {
    const colonIdx = line.indexOf(':')
    if (colonIdx === -1) return
    const key = line.slice(0, colonIdx).trim()
    const value = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '')
    if (key) meta[key] = value
  })
  return { meta, body: match[2] }
}

function slugFromPath(path: string): string {
  return path.replace(/^.*\//, '').replace(/\.md$/, '')
}

export function loadBlogPosts(): BlogPost[] {
  const rawModules = import.meta.glob('./blog/*.md', {
    query: '?raw',
    import: 'default',
    eager: true,
  }) as Record<string, string>

  return Object.entries(rawModules)
    .map(([path, raw]) => {
      const slug = slugFromPath(path)
      const { meta, body } = parseFrontmatter(raw)
      const sizeBytes = new TextEncoder().encode(raw).length
      const rawTags = meta.tags ?? ''
      const tags = rawTags
        .replace(/^\[|\]$/g, '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
      return {
        slug,
        title: meta.title ?? slug,
        date: meta.date ?? '',
        description: meta.description ?? '',
        tags,
        content: body,
        sizeBytes,
      }
    })
    .sort((a, b) => b.date.localeCompare(a.date))
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export function formatLsDate(dateStr: string): string {
  if (!dateStr) return '           '
  try {
    const d = new Date(dateStr)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const month = months[d.getMonth()]
    const day = String(d.getDate()).padStart(2, ' ')
    const year = d.getFullYear()
    return `${month} ${day} ${year}`
  } catch {
    return dateStr
  }
}
