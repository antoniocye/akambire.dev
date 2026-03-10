import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadBlogPosts, formatSize, formatDate } from './blogUtils'

type SortKey = 'date' | 'name' | 'size'
type SortDir = 'asc' | 'desc'

const allPosts = loadBlogPosts()

function SortIcon({ dir }: { dir: SortDir }) {
  return <span className="finder-sort-arrow">{dir === 'desc' ? '↓' : '↑'}</span>
}

export default function Finder() {
  const navigate = useNavigate()
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const sorted = useMemo(() => {
    const copy = [...allPosts]
    copy.sort((a, b) => {
      let cmp = 0
      if (sortKey === 'date') cmp = a.date.localeCompare(b.date)
      else if (sortKey === 'name') cmp = a.title.localeCompare(b.title)
      else cmp = a.sizeBytes - b.sizeBytes
      return sortDir === 'asc' ? cmp : -cmp
    })
    return copy
  }, [sortKey, sortDir])

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir(key === 'name' ? 'asc' : 'desc')
    }
  }

  return (
    <div className="finder-panel">
      <header className="terminal-header">
        <div className="terminal-dots">
          <span className="dot red" />
          <span className="dot yellow" />
          <span className="dot green" />
        </div>
        <div className="finder-breadcrumb">
          <span className="finder-path-segment">akambire.dev</span>
          <span className="finder-path-sep">›</span>
          <span className="finder-path-segment finder-path-active">blog</span>
        </div>
      </header>

      <div className="finder-body">
        <div className="finder-toolbar">
          <span className="finder-toolbar-label">Sort by</span>
          {(['name', 'date', 'size'] as SortKey[]).map((key) => (
            <button
              key={key}
              className={`finder-sort-btn${sortKey === key ? ' active' : ''}`}
              onClick={() => handleSort(key)}
              type="button"
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
              {sortKey === key && <SortIcon dir={sortDir} />}
            </button>
          ))}
          <span className="finder-file-count">
            {sorted.length} {sorted.length === 1 ? 'post' : 'posts'}
          </span>
        </div>

        <div className="finder-list-header" aria-hidden="true">
          <span className="finder-col-icon" />
          <span className="finder-col-name">Name</span>
          <span className="finder-col-date">Date Modified</span>
          <span className="finder-col-size">Size</span>
        </div>

        <div className="finder-list" role="list">
          {sorted.map((post, idx) => (
            <button
              key={post.slug}
              className="finder-row"
              onClick={() => navigate(`/blog/${post.slug}`)}
              type="button"
              role="listitem"
              style={{ '--row-index': idx } as React.CSSProperties}
            >
              <span className="finder-col-icon">
                <svg className="finder-file-icon-svg" viewBox="0 0 20 24" fill="none" aria-hidden="true">
                  <path
                    d="M3 2C3 1.44772 3.44772 1 4 1H13L18 6V22C18 22.5523 17.5523 23 17 23H4C3.44772 23 3 22.5523 3 22V2Z"
                    fill="var(--bg-elevated)"
                    stroke="var(--border)"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M13 1L18 6H14C13.4477 6 13 5.55228 13 5V1Z"
                    fill="var(--border)"
                  />
                  <line x1="6" y1="10" x2="15" y2="10" stroke="var(--accent)" strokeWidth="1.2" strokeOpacity="0.6" strokeLinecap="round" />
                  <line x1="6" y1="13" x2="15" y2="13" stroke="var(--text-muted)" strokeWidth="1.2" strokeOpacity="0.4" strokeLinecap="round" />
                  <line x1="6" y1="16" x2="11" y2="16" stroke="var(--text-muted)" strokeWidth="1.2" strokeOpacity="0.3" strokeLinecap="round" />
                </svg>
              </span>
              <span className="finder-col-name">
                <span className="finder-file-name">{post.slug}.md</span>
                {post.description && (
                  <span className="finder-file-desc">{post.description}</span>
                )}
              </span>
              <span className="finder-col-date">{formatDate(post.date)}</span>
              <span className="finder-col-size">{formatSize(post.sizeBytes)}</span>
            </button>
          ))}

          {sorted.length === 0 && (
            <div className="finder-empty">
              <svg viewBox="0 0 48 48" className="finder-empty-icon" fill="none" aria-hidden="true">
                <rect width="48" height="48" rx="10" fill="var(--bg-surface)" />
                <path d="M14 16C14 15.4477 14.4477 15 15 15H26L34 23V34C34 34.5523 33.5523 35 33 35H15C14.4477 35 14 34.5523 14 34V16Z" fill="var(--bg-elevated)" stroke="var(--border)" strokeWidth="1.5" />
                <path d="M26 15L34 23H27C26.4477 23 26 22.5523 26 22V15Z" fill="var(--border)" />
              </svg>
              <p>No blog posts yet.</p>
              <p className="finder-empty-hint">Drop <code>.md</code> files into <code>src/blog/</code> to get started.</p>
            </div>
          )}
        </div>

        {sorted.length > 0 && (
          <div className="finder-status-bar">
            <span>{sorted.length} {sorted.length === 1 ? 'item' : 'items'}</span>
          </div>
        )}
      </div>
    </div>
  )
}
