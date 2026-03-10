export type BlogSort = 'recent' | 'oldest' | 'name-asc' | 'name-desc'

export type BlogPost = {
  slug: string
  fileName: string
  title: string
  date: Date | null
  dateLabel: string
  excerpt: string
  content: string
}

type Frontmatter = {
  title?: string
  date?: string
}

const rawBlogPosts = import.meta.glob('./content/blog/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
})

const FRONTMATTER_PATTERN = /^---\s*\n([\s\S]*?)\n---\s*\n?/

const titleFromSlug = (slug: string) =>
  slug
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase())

const getExcerpt = (markdown: string) => {
  const lines = markdown
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'))
  if (lines.length === 0) {
    return 'No preview available.'
  }
  return lines[0].slice(0, 140)
}

const parseFrontmatter = (rawMarkdown: string): { frontmatter: Frontmatter; content: string } => {
  const match = rawMarkdown.match(FRONTMATTER_PATTERN)
  if (!match) {
    return { frontmatter: {}, content: rawMarkdown.trim() }
  }

  const pairs = match[1].split('\n')
  const frontmatter: Frontmatter = {}
  for (const pair of pairs) {
    const separatorIndex = pair.indexOf(':')
    if (separatorIndex === -1) {
      continue
    }
    const key = pair.slice(0, separatorIndex).trim().toLowerCase()
    const value = pair.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '')
    if (key === 'title' || key === 'date') {
      frontmatter[key] = value
    }
  }

  const content = rawMarkdown.replace(FRONTMATTER_PATTERN, '').trim()
  return { frontmatter, content }
}

const parseDate = (value?: string) => {
  if (!value) {
    return null
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const toBlogPost = (path: string, rawMarkdown: string): BlogPost => {
  const fileName = path.split('/').pop() ?? ''
  const slug = fileName.replace(/\.md$/i, '')
  const { frontmatter, content } = parseFrontmatter(rawMarkdown)
  const date = parseDate(frontmatter.date)
  const inferredTitle = content.match(/^#\s+(.+)$/m)?.[1]?.trim()
  const title = frontmatter.title || inferredTitle || titleFromSlug(slug)
  return {
    slug,
    fileName,
    title,
    date,
    dateLabel: date ? DATE_FORMATTER.format(date) : 'Undated',
    excerpt: getExcerpt(content),
    content,
  }
}

export const blogPosts = Object.entries(rawBlogPosts)
  .map(([path, rawMarkdown]) => toBlogPost(path, rawMarkdown))
  .sort((left, right) => left.title.localeCompare(right.title))

export const sortBlogPosts = (posts: BlogPost[], sort: BlogSort) => {
  const cloned = [...posts]
  if (sort === 'name-asc') {
    return cloned.sort((left, right) => left.title.localeCompare(right.title))
  }
  if (sort === 'name-desc') {
    return cloned.sort((left, right) => right.title.localeCompare(left.title))
  }

  const withDateOrdering = cloned.sort((left, right) => {
    const leftTime = left.date?.getTime() ?? Number.NEGATIVE_INFINITY
    const rightTime = right.date?.getTime() ?? Number.NEGATIVE_INFINITY
    if (leftTime === rightTime) {
      return left.title.localeCompare(right.title)
    }
    return rightTime - leftTime
  })

  return sort === 'recent' ? withDateOrdering : withDateOrdering.reverse()
}

export const findBlogPostBySlug = (slug: string | null) =>
  slug ? blogPosts.find((post) => post.slug === slug) ?? null : null
