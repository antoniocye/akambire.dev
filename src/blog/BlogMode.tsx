import {
  Component,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ErrorInfo,
  type ReactNode,
} from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import 'katex/dist/katex.min.css'

import { getAllPosts } from './loadPosts'
import type { BlogPost } from './types'

type BlogModeProps = {
  selectedSlug: string | null
  onSelectSlug: (slug: string | null) => void
}

class MarkdownErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Blog markdown render failed:', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <p className="blog-render-error" role="alert">
          Could not render this post (markdown/math error). Try editing the source{' '}
          <code>.md</code> file.
        </p>
      )
    }
    return this.props.children
  }
}

/** `YYYY-MM-DD` from JSON/frontmatter is parsed as UTC by `new Date()`, so in US timezones it shows as the previous calendar day. Parse as local midnight instead. */
function parseCalendarDate(value: string): Date | null {
  const m = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return null
  const y = Number(m[1])
  const month = Number(m[2])
  const day = Number(m[3])
  if (!y || month < 1 || month > 12 || day < 1 || day > 31) return null
  return new Date(y, month - 1, day)
}

function formatDate(iso: string): string {
  const d = parseCalendarDate(iso) ?? new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d)
}

function BlogPostCard({
  post,
  onOpenMarkdown,
}: {
  post: BlogPost
  onOpenMarkdown: (slug: string) => void
}) {
  const badge = post.kind === 'markdown' ? 'Post' : 'PDF'
  const excerpt =
    post.kind === 'markdown'
      ? post.summary ??
        (() => {
          const plain = post.body.replace(/\s+/g, ' ').trim()
          return plain.length > 140 ? `${plain.slice(0, 140)}…` : plain
        })()
      : post.description ?? 'PDF document'

  if (post.kind === 'pdf') {
    return (
      <a
        href={post.url}
        target="_blank"
        rel="noopener noreferrer"
        className="blog-card blog-card--pdf-link"
      >
        <span className="blog-card-badge">{badge}</span>
        <h3 className="blog-card-title">{post.title}</h3>
        <time className="blog-card-date" dateTime={post.date}>
          {formatDate(post.date)}
        </time>
        <p className="blog-card-excerpt">{excerpt}</p>
        <span className="blog-card-cta">Open PDF →</span>
      </a>
    )
  }

  return (
    <button
      type="button"
      className="blog-card"
      onClick={() => onOpenMarkdown(post.slug)}
    >
      <span className="blog-card-badge">{badge}</span>
      <h3 className="blog-card-title">{post.title}</h3>
      <time className="blog-card-date" dateTime={post.date}>
        {formatDate(post.date)}
      </time>
      <p className="blog-card-excerpt">{excerpt}</p>
      <span className="blog-card-cta">Read →</span>
    </button>
  )
}

function MarkdownReader({
  post,
  onBack,
}: {
  post: Extract<BlogPost, { kind: 'markdown' }>
  onBack: () => void
}) {
  return (
    <article className="blog-article" aria-labelledby={`blog-title-${post.slug}`}>
      <nav className="blog-article-nav">
        <button type="button" className="blog-back" onClick={onBack}>
          ← All posts
        </button>
      </nav>
      <header className="blog-article-header">
        <h1 id={`blog-title-${post.slug}`} className="blog-article-title">
          {post.title}
        </h1>
        <time className="blog-article-date" dateTime={post.date}>
          {formatDate(post.date)}
        </time>
      </header>
      <div className="blog-article-body">
        <MarkdownErrorBoundary>
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[
              [
                rehypeKatex,
                {
                  errorColor: 'var(--app-text-muted)',
                  strict: false,
                },
              ],
            ]}
            components={{
              a: ({ href, children, node, ...props }) => {
                void node
                const external =
                  href?.startsWith('http://') || href?.startsWith('https://')
                return (
                  <a
                    href={href}
                    {...props}
                    {...(external
                      ? { target: '_blank', rel: 'noreferrer noopener' }
                      : {})}
                  >
                    {children}
                  </a>
                )
              },
            }}
          >
            {post.body}
          </ReactMarkdown>
        </MarkdownErrorBoundary>
      </div>
    </article>
  )
}

export function BlogMode({ selectedSlug, onSelectSlug }: BlogModeProps) {
  const posts = useMemo(() => getAllPosts(), [])
  const [query, setQuery] = useState('')
  const openedPdfSlugRef = useRef<string | null>(null)

  /** PDFs open in a new tab; clear hash/deep-link state so we stay on the index */
  useEffect(() => {
    if (!selectedSlug) {
      openedPdfSlugRef.current = null
      return
    }
    const post = posts.find((p) => p.slug === selectedSlug)
    if (!post || post.kind !== 'pdf') {
      return
    }
    if (openedPdfSlugRef.current === selectedSlug) {
      return
    }
    openedPdfSlugRef.current = selectedSlug
    window.open(post.url, '_blank', 'noopener,noreferrer')
    onSelectSlug(null)
  }, [selectedSlug, posts, onSelectSlug])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return posts
    return posts.filter((p) => {
      if (p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q)) {
        return true
      }
      if (p.kind === 'markdown') {
        return (
          (p.summary?.toLowerCase().includes(q) ?? false) ||
          p.body.toLowerCase().includes(q)
        )
      }
      return p.description?.toLowerCase().includes(q) ?? false
    })
  }, [posts, query])

  const selected = useMemo(
    () => (selectedSlug ? posts.find((p) => p.slug === selectedSlug) : undefined),
    [posts, selectedSlug],
  )

  if (selectedSlug && !selected) {
    return (
      <div className="blog-mode">
        <div className="blog-missing">
          <p>No post with slug “{selectedSlug}”.</p>
          <button type="button" className="blog-back" onClick={() => onSelectSlug(null)}>
            ← All posts
          </button>
        </div>
      </div>
    )
  }

  if (selected && selected.kind === 'markdown') {
    return (
      <MarkdownReader post={selected} onBack={() => onSelectSlug(null)} />
    )
  }

  return (
    <div className="blog-mode">
      <header className="blog-index-header">
        <div className="blog-index-intro">
          <h2 className="blog-index-title">Notes and Writing</h2>
          <p className="blog-index-lede">
            I will post some of the cooler things I do and learn (and I end up doing a writeup for) here!
          </p>
        </div>
        <label className="blog-search">
          <span className="blog-search-label">Search</span>
          <input
            type="search"
            className="blog-search-input"
            placeholder="Filter by title or content…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
        </label>
      </header>

      {filtered.length === 0 ? (
        <p className="blog-empty">
          {posts.length === 0
            ? 'No posts yet. Add .md files under src/content/blog/posts/ or PDFs under public/blog/.'
            : 'No posts match your search.'}
        </p>
      ) : (
        <div className="blog-grid">
          {filtered.map((post) => (
            <BlogPostCard
              key={`${post.kind}-${post.slug}`}
              post={post}
              onOpenMarkdown={(slug) => onSelectSlug(slug)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
