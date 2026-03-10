export type SortOption = 'recent' | 'name' | 'updated'

type FrontmatterValue = string | string[]

export type BlogPost = {
  slug: string
  title: string
  description: string
  date?: string
  updated?: string
  tags: string[]
  content: string
  fileName: string
  filePath: string
  summary: string
  sortDate: number
  updatedSortDate: number
}

const markdownModules = import.meta.glob<string>('/src/content/blog/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const stripWrappingQuotes = (value: string) =>
  value.replace(/^['"]/, '').replace(/['"]$/, '').trim()

const parseInlineArray = (value: string) =>
  value
    .slice(1, -1)
    .split(',')
    .map((item) => stripWrappingQuotes(item.trim()))
    .filter(Boolean)

const splitFrontmatter = (raw: string) => {
  const frontmatterMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!frontmatterMatch) {
    return { frontmatter: '', content: raw.trim() }
  }

  const [, frontmatter, content] = frontmatterMatch

  return { frontmatter, content }
}

const parseFrontmatter = (frontmatter: string) => {
  const result: Record<string, FrontmatterValue> = {}
  let activeArrayKey: string | null = null

  for (const rawLine of frontmatter.split(/\r?\n/)) {
    if (!rawLine.trim() || rawLine.trim().startsWith('#')) {
      continue
    }

    const arrayItemMatch = rawLine.match(/^\s*-\s+(.+)$/)
    if (activeArrayKey && arrayItemMatch) {
      const current = result[activeArrayKey]
      const nextItem = stripWrappingQuotes(arrayItemMatch[1].trim())
      result[activeArrayKey] = Array.isArray(current)
        ? [...current, nextItem]
        : [nextItem]
      continue
    }

    activeArrayKey = null
    const entryMatch = rawLine.match(/^([A-Za-z0-9_-]+):\s*(.*)$/)
    if (!entryMatch) {
      continue
    }

    const [, key, value] = entryMatch
    if (!value) {
      result[key] = []
      activeArrayKey = key
      continue
    }

    result[key] =
      value.startsWith('[') && value.endsWith(']')
        ? parseInlineArray(value)
        : stripWrappingQuotes(value)
  }

  return result
}

const toStringValue = (value: FrontmatterValue | undefined) =>
  Array.isArray(value) ? value[0] : value

const toTags = (value: FrontmatterValue | undefined) => {
  if (!value) {
    return []
  }

  if (Array.isArray(value)) {
    return value.map((item) => item.trim()).filter(Boolean)
  }

  return value
    .split(',')
    .map((item) => stripWrappingQuotes(item.trim()))
    .filter(Boolean)
}

const toTimestamp = (value?: string) => {
  if (!value) {
    return 0
  }

  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

const slugify = (value: string) => {
  const normalized = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return normalized || 'post'
}

const formatTitleFromStem = (stem: string) =>
  stem
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())

const stripMarkdown = (content: string) =>
  content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^>+\s?/gm, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

const buildSummary = (description: string, content: string) => {
  if (description) {
    return description
  }

  const plainText = stripMarkdown(content)
  if (plainText.length <= 180) {
    return plainText
  }

  return `${plainText.slice(0, 177).trimEnd()}...`
}

export const SORT_OPTIONS: SortOption[] = ['recent', 'name', 'updated']

export const blogPosts: BlogPost[] = Object.entries(markdownModules)
  .map(([filePath, rawContent]) => {
    const fileName = filePath.split('/').at(-1) ?? 'untitled.md'
    const stem = fileName.replace(/\.md$/i, '')
    const { frontmatter, content } = splitFrontmatter(rawContent)
    const metadata = parseFrontmatter(frontmatter)
    const date = toStringValue(metadata.date)
    const updated = toStringValue(metadata.updated ?? metadata.lastUpdated)
    const description = toStringValue(metadata.description) ?? ''
    const title = toStringValue(metadata.title) ?? formatTitleFromStem(stem)
    const slug = slugify(toStringValue(metadata.slug) ?? stem)
    const tags = toTags(metadata.tags)

    return {
      slug,
      title,
      description,
      date,
      updated,
      tags,
      content,
      fileName,
      filePath,
      summary: buildSummary(description, content),
      sortDate: toTimestamp(date),
      updatedSortDate: toTimestamp(updated ?? date),
    }
  })
  .sort((left, right) => right.sortDate - left.sortDate || left.title.localeCompare(right.title))

export const sortBlogPosts = (posts: BlogPost[], sortBy: SortOption) => {
  const nextPosts = [...posts]

  if (sortBy === 'name') {
    return nextPosts.sort((left, right) => left.title.localeCompare(right.title))
  }

  if (sortBy === 'updated') {
    return nextPosts.sort(
      (left, right) =>
        right.updatedSortDate - left.updatedSortDate || left.title.localeCompare(right.title),
    )
  }

  return nextPosts.sort(
    (left, right) => right.sortDate - left.sortDate || left.title.localeCompare(right.title),
  )
}

export const getBlogPostBySlug = (slug?: string) =>
  blogPosts.find((post) => post.slug === slug) ?? null
