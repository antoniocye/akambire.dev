import { useEffect, useState } from 'react'
import { Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import './App.css'
import { BlogFinderView } from './components/BlogFinderView'
import { TerminalView } from './components/TerminalView'
import { blogPosts } from './lib/blog'
import type { ThemeScheme } from './types'

const THEME_STORAGE_KEY = 'preferredTheme'
const THEME_OPTIONS: ThemeScheme[] = ['dark', 'light', 'purple', 'red', 'blue', 'green']

const buildEmail = (user: string, domain: string) => `${user}@${domain}`
const obfuscateEmail = (user: string, domain: string) =>
  `${user} [at] ${domain.replace('.', ' [dot] ')}`

const isThemeScheme = (value: string): value is ThemeScheme =>
  THEME_OPTIONS.includes(value as ThemeScheme)

const TerminalIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5Zm2 0v11a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5v-11a.5.5 0 0 0-.5-.5h-11a.5.5 0 0 0-.5.5Zm2.2 2.95 3.1 2.55-3.1 2.55 1.28 1.56L14.47 12l-4.99-4.11ZM13.5 15h3v-2h-3Z"
      fill="currentColor"
    />
  </svg>
)

const FinderIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M3 7.5A2.5 2.5 0 0 1 5.5 5H10l1.6 1.8H18.5A2.5 2.5 0 0 1 21 9.3v7.2a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 16.5Zm2.5-.5a.5.5 0 0 0-.5.5v1h14v-.2a.5.5 0 0 0-.5-.5h-7.8L9.1 7Zm13.5 3.5H5v6a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5Z"
      fill="currentColor"
    />
  </svg>
)

function App() {
  const location = useLocation()
  const [theme, setTheme] = useState<ThemeScheme>(() => {
    if (typeof window === 'undefined') {
      return 'dark'
    }

    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)?.toLowerCase()
    return storedTheme && isThemeScheme(storedTheme) ? storedTheme : 'dark'
  })

  useEffect(() => {
    if (typeof document === 'undefined') {
      return
    }

    const root = document.documentElement
    root.setAttribute('data-theme', theme)
    root.style.colorScheme = theme === 'light' ? 'light' : 'dark'

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme)
    }
  }, [theme])

  const primaryEmail = buildEmail('akambire', 'stanford.edu')
  const secondaryEmail = buildEmail('antoniokambire', 'gmail.com')
  const primaryEmailLabel = obfuscateEmail('akambire', 'stanford.edu')
  const secondaryEmailLabel = obfuscateEmail('antoniokambire', 'gmail.com')
  const isFinderRoute = location.pathname.startsWith('/blog')

  return (
    <div className="page">
      <aside className="sidebar">
        <div className="profile">
          <div className="profile-image-wrapper">
            <img src="/profile.jpg" alt="Antonio Kambire" className="profile-image" />
          </div>
          <h1 className="profile-name">Antonio Kambire</h1>
          <div className="profile-education">
            <p>Stanford University</p>
            <ul>
              <li>Mathematics B.S. (2023-2027)</li>
              <li>Prospective CS coterm</li>
            </ul>
          </div>
        </div>

        <section className="sidebar-section">
          <h2>Who am I?</h2>
          <p>A junior at Stanford interested in cryptography, mathematics, and AI safety.</p>
          <div className="location-lines">
            <span>From Burkina Faso</span>
            <span>Currently in California, U.S.</span>
          </div>
        </section>

        <section className="sidebar-section">
          <h2>Skills</h2>
          <ul className="skills-list">
            <li>Mathematics</li>
            <li>Modern cryptography</li>
            <li>Machine learning</li>
            <li>Zero knowledge proofs</li>
            <li>C, C++ and Rust</li>
          </ul>
        </section>

        <section className="sidebar-section">
          <h2>Apps</h2>
          <p>Switch between the Terminal and Finder views from the dock below.</p>
          <p>Markdown blog posts live in `src/content/blog/`.</p>
        </section>

        <section className="sidebar-section">
          <h2>Contact</h2>
          <ul className="contact-list">
            <li>
              <span>Email (school):</span>
              <a href={`mailto:${primaryEmail}`}>{primaryEmailLabel}</a>
              <a href={`mailto:${secondaryEmail}`}>{secondaryEmailLabel}</a>
            </li>
            <li>
              <span>Phone:</span>
              <a href="tel:+16502835358">+1 (650) 283-5358</a>
            </li>
          </ul>
        </section>
      </aside>

      <main className="page-main">
        <section className="page-summary">
          <p className="page-summary-label">Current app</p>
          <div>
            <h2>{isFinderRoute ? 'Finder / Blog' : 'Terminal'}</h2>
            <p>
              {isFinderRoute
                ? 'Browse markdown-backed notes, sort them, and read them inside the same themed app.'
                : 'Run portfolio commands, switch themes, and use ls to jump into blog posts.'}
            </p>
          </div>
        </section>

        <div className="page-workspace">
          <Routes>
            <Route path="/" element={<TerminalView blogPosts={blogPosts} theme={theme} setTheme={setTheme} />} />
            <Route path="/blog" element={<BlogFinderView />} />
            <Route path="/blog/:slug" element={<BlogFinderView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        <nav className="app-dock" aria-label="Application dock">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `dock-link${isActive ? ' active' : ''}`}
          >
            <span className="dock-link-icon">
              <TerminalIcon />
            </span>
            <span className="dock-link-label">Terminal</span>
          </NavLink>

          <NavLink to="/blog" className={({ isActive }) => `dock-link${isActive ? ' active' : ''}`}>
            <span className="dock-link-icon finder">
              <FinderIcon />
            </span>
            <span className="dock-link-label">Finder</span>
          </NavLink>
        </nav>
      </main>
    </div>
  )
}

export default App
