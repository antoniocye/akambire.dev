import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useParams, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { loadBlogPosts, formatDate } from './blogUtils'

const allPosts = loadBlogPosts()

const remarkPlugins = [remarkGfm, remarkMath]
const rehypePlugins = [rehypeKatex]

function ExpandIcon() {
  return (
    <svg viewBox="0 0 16 16" className="blog-fullscreen-icon" fill="none" aria-hidden="true">
      <path d="M1 6V1h5M10 1h5v5M15 10v5h-5M6 15H1v-5"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CollapseIcon() {
  return (
    <svg viewBox="0 0 16 16" className="blog-fullscreen-icon" fill="none" aria-hidden="true">
      <path d="M6 1v5H1M15 6h-5V1M10 15v-5h5M1 10h5v5"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PostContent({ content }: { content: string }) {
  return (
    <div className="blog-post-content">
      <ReactMarkdown remarkPlugins={remarkPlugins} rehypePlugins={rehypePlugins}>
        {content}
      </ReactMarkdown>
    </div>
  )
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [fullscreen, setFullscreen] = useState(false)

  const post = useMemo(() => allPosts.find((p) => p.slug === slug), [slug])

  if (!post) {
    return (
      <div className="blog-post-panel">
        <header className="terminal-header">
          <div className="terminal-dots">
            <span className="dot red" />
            <span className="dot yellow" />
            <span className="dot green" />
          </div>
          <button className="finder-back-btn" onClick={() => navigate('/blog')} type="button">
            ← Back
          </button>
        </header>
        <div className="blog-post-body">
          <p className="blog-not-found">Post not found: <code>{slug}</code></p>
        </div>
      </div>
    )
  }

  const postMeta = (
    <header className="blog-post-meta">
      <h1 className="blog-post-title">{post.title}</h1>
      <div className="blog-post-meta-row">
        {post.date && (
          <time className="blog-post-date" dateTime={post.date}>
            {formatDate(post.date)}
          </time>
        )}
        {post.tags.length > 0 && (
          <div className="tag-list">
            {post.tags.map((tag) => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </header>
  )

  return (
    <>
      <div className="blog-post-panel">
        <header className="terminal-header">
          <div className="terminal-dots">
            <span className="dot red" />
            <span className="dot yellow" />
            <span className="dot green" />
          </div>
          <button className="finder-back-btn" onClick={() => navigate('/blog')} type="button">
            ← Blog
          </button>
          <div className="finder-breadcrumb">
            <span className="finder-path-segment">akambire.dev</span>
            <span className="finder-path-sep">›</span>
            <span
              className="finder-path-segment finder-path-link"
              onClick={() => navigate('/blog')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') navigate('/blog') }}
            >
              blog
            </span>
            <span className="finder-path-sep">›</span>
            <span className="finder-path-segment finder-path-active">{post.slug}.md</span>
          </div>
          <button
            className="blog-fullscreen-btn"
            onClick={() => setFullscreen(true)}
            type="button"
            title="Fullscreen view"
            aria-label="Open in fullscreen"
          >
            <ExpandIcon />
          </button>
        </header>

        <div className="blog-post-body">
          <article className="blog-post-article">
            {postMeta}
            <PostContent content={post.content} />
          </article>
        </div>
      </div>

      {fullscreen && createPortal(
        <div className="blog-fullscreen-overlay" role="dialog" aria-modal="true" aria-label={post.title}>
          <div className="blog-fullscreen-header">
            <button
              className="blog-fullscreen-close"
              onClick={() => setFullscreen(false)}
              type="button"
            >
              <CollapseIcon />
              Exit fullscreen
            </button>
            <span className="blog-fullscreen-sep" aria-hidden="true" />
            <span className="blog-fullscreen-title">{post.title}</span>
          </div>
          <div className="blog-fullscreen-body">
            <article className="blog-post-article">
              {postMeta}
              <PostContent content={post.content} />
            </article>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
