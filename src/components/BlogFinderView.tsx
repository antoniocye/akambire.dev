import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { blogPosts, getBlogPostBySlug, sortBlogPosts, SORT_OPTIONS, type SortOption } from '../lib/blog'

const sortLabels: Record<SortOption, string> = {
  recent: 'Most recent',
  name: 'Name',
  updated: 'Last updated',
}

const formatDisplayDate = (value?: string) => {
  if (!value) {
    return 'No date'
  }

  const parsed = Date.parse(value)
  if (Number.isNaN(parsed)) {
    return value
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsed)
}

export function BlogFinderView() {
  const navigate = useNavigate()
  const { slug } = useParams()
  const [sortBy, setSortBy] = useState<SortOption>('recent')

  const sortedPosts = useMemo(() => sortBlogPosts(blogPosts, sortBy), [sortBy])
  const selectedPost = slug ? getBlogPostBySlug(slug) : sortedPosts[0] ?? null
  const activeSlug = selectedPost?.slug ?? null

  return (
    <section className="page-card finder-window">
      <header className="window-header finder-toolbar">
        <div className="terminal-dots" aria-hidden="true">
          <span className="dot red" />
          <span className="dot yellow" />
          <span className="dot green" />
        </div>

        <div className="finder-breadcrumbs">
          <button type="button" className="finder-breadcrumb" onClick={() => navigate('/blog')}>
            Antonio
          </button>
          <span>/</span>
          <button type="button" className="finder-breadcrumb" onClick={() => navigate('/blog')}>
            Blog
          </button>
          {selectedPost && (
            <>
              <span>/</span>
              <span className="finder-current-file">{selectedPost.fileName}</span>
            </>
          )}
        </div>

        <label className="finder-sort">
          <span>Sort</span>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortOption)}>
            {SORT_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {sortLabels[value]}
              </option>
            ))}
          </select>
        </label>
      </header>

      <div className="finder-body">
        <aside className="finder-sidebar">
          <div className="finder-sidebar-section">
            <p className="finder-sidebar-label">Folders</p>
            <button type="button" className="finder-folder-card active" onClick={() => navigate('/blog')}>
              <span className="finder-folder-icon" aria-hidden="true">
                📁
              </span>
              <span>
                <strong>blog</strong>
                <small>{blogPosts.length} markdown files</small>
              </span>
            </button>
          </div>

          <div className="finder-sidebar-section">
            <p className="finder-sidebar-label">Smart sort</p>
            <ul className="finder-smart-list">
              {SORT_OPTIONS.map((value) => (
                <li key={value}>
                  <button
                    type="button"
                    className={value === sortBy ? 'active' : undefined}
                    onClick={() => setSortBy(value)}
                  >
                    {sortLabels[value]}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="finder-browser">
          <section className="finder-file-panel">
            <div className="finder-section-header">
              <div>
                <p className="finder-section-eyebrow">Files</p>
                <h2>Markdown notes</h2>
              </div>
              <span>{sortedPosts.length} items</span>
            </div>

            {sortedPosts.length === 0 ? (
              <div className="finder-empty-state">
                <p>No posts yet.</p>
                <span>Add markdown files to `src/content/blog/` to populate the Finder.</span>
              </div>
            ) : (
              <div className="finder-file-list" role="list">
                {sortedPosts.map((post) => {
                  const isActive = post.slug === activeSlug

                  return (
                    <button
                      key={post.slug}
                      type="button"
                      role="listitem"
                      className={`finder-file-row${isActive ? ' active' : ''}`}
                      onClick={() => navigate(`/blog/${post.slug}`)}
                    >
                      <span className="finder-file-row-main">
                        <span className="finder-file-icon" aria-hidden="true">
                          📄
                        </span>
                        <span>
                          <strong>{post.fileName}</strong>
                          <small>{post.summary}</small>
                        </span>
                      </span>
                      <span className="finder-file-date">{formatDisplayDate(post.updated ?? post.date)}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </section>

          <article className="finder-preview-panel">
            {!selectedPost ? (
              <div className="finder-empty-state">
                <p>Select a file to preview it.</p>
                <span>The dock keeps you inside the same app while switching between Finder and Terminal.</span>
              </div>
            ) : (
              <>
                <header className="finder-preview-header">
                  <p className="finder-section-eyebrow">Preview</p>
                  <h1>{selectedPost.title}</h1>
                  <div className="finder-post-meta">
                    <span>Published {formatDisplayDate(selectedPost.date)}</span>
                    <span>Updated {formatDisplayDate(selectedPost.updated ?? selectedPost.date)}</span>
                  </div>
                  {selectedPost.tags.length > 0 && (
                    <div className="tag-list">
                      {selectedPost.tags.map((tag) => (
                        <span key={tag} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </header>

                <div className="markdown-prose">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{selectedPost.content}</ReactMarkdown>
                </div>
              </>
            )}
          </article>
        </div>
      </div>
    </section>
  )
}
