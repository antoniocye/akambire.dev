import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { loadBlogPosts, formatDate } from './blogUtils'

const allPosts = loadBlogPosts()

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

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

  return (
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
      </header>

      <div className="blog-post-body">
        <article className="blog-post-article">
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
          <div className="blog-post-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </div>
        </article>
      </div>
    </div>
  )
}
