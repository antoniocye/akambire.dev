import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { loadBlogPosts, formatDate } from './blogUtils'

const allPosts = loadBlogPosts()

// remark-math v6 treats $$...$$ on a single line as `inlineMath` inside a
// paragraph instead of a block `math` node. Obsidian (and LaTeX convention)
// treats it as display math. This plugin runs after remark-math and promotes
// any paragraph that contains only a single inlineMath child into a proper
// block math node with the hast data remark-math v6 emits, so rehype-katex
// picks it up and renders it centered in display mode.
function remarkPromoteDisplayMath() {
  return (tree: { children: Array<Record<string, unknown>> }) => {
    const promote = (nodes: Array<Record<string, unknown>>) => {
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]
        const children = n.children as Array<Record<string, unknown>> | undefined
        if (n.type === 'paragraph' && children?.length === 1 && children[0].type === 'inlineMath') {
          const val = children[0].value as string
          nodes[i] = {
            type: 'math',
            meta: null,
            value: val,
            data: {
              hName: 'pre',
              hChildren: [{
                type: 'element',
                tagName: 'code',
                properties: { className: ['language-math', 'math-display'] },
                children: [{ type: 'text', value: val }],
              }],
            },
          }
        } else if (Array.isArray(children)) {
          promote(children)
        }
      }
    }
    promote(tree.children)
  }
}

const remarkPlugins = [remarkGfm, remarkMath, remarkPromoteDisplayMath]
const rehypePlugins = [rehypeKatex]

function ExpandIcon() {
  return (
    <svg viewBox="0 0 16 16" className="blog-fsbtn-icon" fill="none" aria-hidden="true">
      <path d="M1 6V1h5M10 1h5v5M15 10v5h-5M6 15H1v-5"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CollapseIcon() {
  return (
    <svg viewBox="0 0 16 16" className="blog-fsbtn-icon" fill="none" aria-hidden="true">
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
          <Link to="/blog" className="finder-back-btn">← Back</Link>
        </header>
        <div className="blog-post-body">
          <p className="blog-not-found">Post not found: <code>{slug}</code></p>
        </div>
      </div>
    )
  }

  const postMeta = (
    <header className="blog-post-meta">
      <div className="blog-post-meta-title-row">
        <h1 className="blog-post-title">{post.title}</h1>
        {!fullscreen && (
          <button
            className="blog-fsbtn"
            onClick={() => setFullscreen(true)}
            type="button"
            title="Fullscreen view"
            aria-label="Open in fullscreen"
          >
            <ExpandIcon />
          </button>
        )}
      </div>
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
          <Link to="/blog" className="finder-back-btn">← Blog</Link>
          <div className="finder-breadcrumb">
            <span className="finder-path-segment">akambire.dev</span>
            <span className="finder-path-sep">›</span>
            <Link to="/blog" className="finder-path-segment finder-path-link">blog</Link>
            <span className="finder-path-sep">›</span>
            <span className="finder-path-segment finder-path-active">{post.slug}.md</span>
          </div>
        </header>

        <div className="blog-post-body">
          <article className="blog-post-article">
            {postMeta}
            <PostContent content={post.content} />
          </article>
        </div>
      </div>

      {fullscreen && createPortal(
        <>
          <div
            className="blog-fullscreen-overlay"
            role="dialog"
            aria-modal="true"
            aria-label={post.title}
          >
            <article className="blog-post-article">
              {postMeta}
              <PostContent content={post.content} />
            </article>
          </div>
          <button
            className="blog-fsbtn blog-fsbtn-exit"
            onClick={() => setFullscreen(false)}
            type="button"
            title="Exit fullscreen"
            aria-label="Exit fullscreen"
          >
            <CollapseIcon />
          </button>
        </>,
        document.body
      )}
    </>
  )
}
