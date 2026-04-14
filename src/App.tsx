import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from 'react'
import './App.css'

const BlogMode = lazy(() =>
  import('./blog/BlogMode').then((m) => ({ default: m.BlogMode })),
)

type KnownCommand =
  | 'help'
  | 'projects'
  | 'resume'
  | 'hobbies'
  | 'work'
  | 'awards'
  | 'classes'
  | 'clear'
  | 'theme'
  | 'blog'

type ViewMode = 'terminal' | 'view' | 'blog'

type ThemeScheme = 'dark' | 'light' | 'purple' | 'red' | 'blue' | 'green'

type ParsedThemeCommand =
  | { type: 'help' }
  | { type: 'current' }
  | { type: 'toggle' }
  | { type: 'set'; theme: ThemeScheme }
  | { type: 'invalid'; value: string }

type HobbyCommand = 'music' | 'bookshelf' | 'games' | 'media'

type HobbySection = {
  command: HobbyCommand
  title: string
  note: string
  image?: string
  emptyMessage?: string
  items: Array<{ title: string; detail: string }>
}

type ParsedHobbyCommand =
  | { type: 'overview' }
  | { type: 'section'; section: HobbySection }
  | { type: 'invalid'; value: string }

type HistoryEntry = {
  id: string
  command: string
}

const projects = [
  {
    title: 'evolve(browser)',
    description: `Built a Chrome extension and simple fork of Chromium empowering anybody to create cool extensions in order to modify any website to fit their workflow. 
    All of this is done in one prompt using an agentic system with context fed directly from the browser.
    First place winner of the Y Combinator challenge at TreeHacks 2026.`,
    tags: [
      'chrome-extensions-api',
      'typescript',
      'python',
      'openai'
    ],
    links: [
      { label: 'Devpost', url: 'https://devpost.com/software/evolve-browser' },
      { label: 'GitHub Repo', url: 'https://github.com/adeng27/evolve-browser/' },
    ],
  },
  {
    title: 'Phantom Dependencies: Ghost Busting',
    description:
      `Conducted a large scale study of 'phantom' dependencies in npm and PyPI and evaluated how these
packages are exposed to a version downgrade attack that we introduced. The analysis covered >12,000 packages and uncovered that >23% of the top 1000 downloaded packages in
npm may be vulnerable.`,
    tags: ['software-supply-chain', 
      'dependency-analysis',
      'python',
      'js'
    ],
    links: [{label: "GitHub Repo", url: "https://github.com/antoniocye/cs356"}],
  },
  {
    title: 'Snails Image Classification Project',
    description:
      `Built an end-to-end pipeline to classify snail images, including dataset prep, model training, evaluation, and a web application prototype for real-time inference.
      This would allow dam-builders to quickly recognize potentially disease-carrying snails (based on species) during early prospection without needing a human expert on site. `,
    tags: ['image-classification', 'disease-ecology', 'python', 'js'],
    links: [{label: "Poster", url: "https://github.com/antoniocye/de-leo-snails/blob/main/Poster.pdf"}, {label: "Demo", url: "snailsproject2024.web.app"}, {label: "GitHub Repo", url: "https://github.com/antoniocye/de-leo-snails"}],
  },
]

const hobbies: HobbySection[] = [
  {
    command: 'music',
    title: 'Music',
    note: 'I love to listen to good R&B and hip hop. Always open to try new artists and albums! Click to see some albums I like.',
    image: '/music.png',
    items: [
      { title: 'Good Kid, m.A.A.d City', detail: 'Kendrick Lamar (2012)' },
      { title: 'Ready to Die', detail: 'The Notorious B.I.G. (1994)' },
      { title: 'Lauryn Hill', detail: 'Miseducation (1998)' },
      { title: 'Liquid Swords', detail: "GZA (1995)"},
      { title: 'The Chronic', detail: "Dr. Dre (1992)"},
      { title: 'DAYTONA', detail: 'Pusha T (2018)' },
      { title: 'Ipséité', detail: 'Damso (2017)' },
      { title: 'Illmatic', detail: 'Nas (1994)' },
      { title: 'Hell Hath No Fury', detail: 'Clipse (2006)' },
      { title: 'The Blueprint', detail: 'Jay-Z (2001)' },
      { title: 'Let God Sort Em Out', detail: 'Clipse (2025)' },
    ],
  },
  {
    command: 'bookshelf',
    title: 'Bookshelf',
    note: 'A shelf of some of my math books (I own too may of them). I have a thing for some of the older, vintage-looking ones. Open to lending them out if anybody needs them!',
    image: '/books.webp',
    items: [
      { title: 'Algebra', detail: 'Serge Lang' },
      { title: 'A Book of Abstract Algebra', detail: 'Pinter' },
      { title: 'Elementary Methods in Number Theorey', detail: 'Nathanson' },
      { title: 'Elliptic Tales', detail: 'Ash and Gross' },
      { title: 'Proofs from the BOOK', detail: 'Aigner & Ziegler' },
      { title: 'Galois Theory', detail: 'Ian Stewart' },
      { title: 'Real Analysis', detail: 'Stein & Shakarchi' },
      { title: 'Foundations of Mathematical Analysis', detail: 'Johnsonbaugh & Pfaffenberger' },
      { title: 'Numerical Linear Algebra', detail: 'Trefethen & Bau' },
      { title: 'Introduction to Coding Theory', detail: 'van Lint' },
      { title: 'Visual Complex Analysis', detail: 'Needham' },
      { title: 'Functions of a Complex Variable', detail: 'William Fogg Osgood' },
      { title: 'Fourier Series and Boundary Value Problems', detail: 'Ruel V. Churchill' },
      { title: 'Real and Complex Analysis', detail: 'Walter Rudin' },
    ],
  },
  {
    command: 'games',
    title: 'Board games',
    note: 'I am a fiend for abstract and strategy-based board games (often with some type of area control) and love forcing my friends to play them with me. Click to see some of the games I own and hit me up for a round!',
    image: '/games.jpg',
    items: [
      { title: 'Spirit Island', detail: 'Gifted Winter 2025 on Christmas (Thanks Haley ❤️!)' },
      { title: 'Alchemist', detail: 'Gifted Summer 2025 (Thanks Mathcamp!)' },
      { title: 'Cryptid', detail: 'Bought Winter 2025' },
      { title: 'Memoir `44', detail: 'Gifted Fall 2025 (Thanks Nico!)' },
    ],
  },
  {
    command: 'media',
    title: 'Media',
    note: 'A place to collect great books, films, shows, essays, and whatever else I have watched or read and want to remember.',
    emptyMessage: 'Add favorite films, books, essays, or shows here.',
    items: [],
  },
]

const workExperiences: Array<{
  role: string
  org: string
  orgUrl?: string
  period: string
  highlights: string[]
  links?: Array<{ label: string; url: string }>
}> = [
  {
    role: "Cryptography Research Intern",
    org: "zkSecurity",
    orgUrl: "https://www.zksecurity.xyz",
    period: "Incoming - Summer 2026",
    highlights: ["Will work on fun cryptography projects!"]
  },
  {
    role: "Research Contributor, Prof. Dan Boneh \@ Stanford",
    org: "Stanford Applied Cryptography Group",
    orgUrl: "https://crypto.stanford.edu/",
    links: [
      {label: "Paper", url: "https://arxiv.org/abs/2604.09724"},
      {label: "Work Ackowledged", url: "https://eprint.iacr.org/2026/680"}
    ],
    period: "Jan. 2026 - Present",
    highlights: ["Worked on a detailed proof showing that the Proximity Gaps Conjecture fails near capacity for certain Reed-Solomon codes over prime fields."]
  },
  {
    role: "Section Leader",
    org: "Stanford CS Department",
    orgUrl: "https://cs.stanford.edu/",
    period: "Sept. 2024 - Present",
    highlights: ["Course assistant for CS 106A and 106B classes at Stanford",
      "Teaching C++ and Python sections to a dozen students, helping students debug during office hours, and grading assignments and exams."]
  },
  {
    role: "Olympiad Coach",
    org: "Communauté Mathématique",
    orgUrl: "https://cmathburkina.org/",
    period: "Aug. 2020 - Present",
    highlights: [
      "Taught classes in number theory from a cryptography perspective to selected students.",
      "Led the national team of Burkina to: Silver/Bronze medals in PAMO 2025 and a Bronze medal in PAMO 2024.",
      "Served as a deputy leader for the team to IMO 2023 in Japan."
    ]
  },
  {
    role: "Junior Counselor",
    org: "Canada/USA Mathcamp",
    orgUrl: "https://www.mathcamp.org/",
    period: "June 2025 - Aug. 2025",
    highlights: ["Taught a class on the Groth16 zero-knowledge proof system to mathematically gifted high school students.",
      "Served as a residential advisor, helped run day-to-day camp operations, and led activities and field trips."]
  }
]

const awards: Array<{
  title: string
  year: string
  details?: string
}> = [
  {
    title: 'TreeHacks Winner',
    year: '2026',
    details: 'Y Combinator challenge winner.',
  },
  {
    title: 'Rise Fellow',
    year: '2023',
    details: 'Full-ride scholarship.',
  },
  {
    title: 'Atlas Fellow',
    year: '2022',
    details: '$50k scholarship.',
  },
  {
    title: 'Canada/USA Mathcamp',
    details: 'Coolest people ever.',
    year: '2020, 2021',
  },
  {
    title: 'Summer Science Program',
    details: 'Alumnus of the Astrophysics program @ UNC.',
    year: '2022',
  },
]

const classes = {
  cs: [
    { code: 'CS 259Q', name: 'Quantum Computing', term: 'Spring 2026'},
    { code: 'CS 355', name: 'Advanced Topics in Cryptography', term: 'Spring 2026'},
    { code: 'CS 240LX', name: 'Advanced Systems Laboratory, Accelerated', term: 'Spring 2026'},
    { code: 'CS 140E', name: 'Operating systems design and implementation', term: 'Winter 2026'},
    { code: 'CS 356', name: 'Topics in Computer and Network Security', term: 'Fall 2025' },
    { code: 'CS 251', name: 'Cryptocurrencies and blockchain technologies', term: 'Fall 2025' },
    { code: 'CS 258', name: 'Quantum Cryptography', term: 'Fall 2025' },
    { code: 'CS 155', name: 'Computer and Network Security', term: 'Spring 2025' },
    { code: 'CS 355', name: 'Zero-Knowledge Proofs', term: 'Spring 2025' },
    { code: 'CS 255', name: 'Introduction to Cryptography', term: 'Winter 2025' },
    { code: 'CS 229', name: 'Machine Learning', term: 'Winter 2025' },
    { code: 'CS 161', name: 'Design and Analysis of Algorithms', term: 'Fall 2024' },
    { code: 'CS 107E', name: 'Computer Systems from the Ground Up', term: 'Winter 2024' },
    { code: 'CS 103', name: 'Mathematical Foundations of Computing', term: 'Winter 2024' },
    { code: 'CS 106B', name: 'Programming Abstractions', term: 'Fall 2023' },
  ],
  math: [
    { code: 'MATH 122', name: 'Modules and Group Representations', term: 'Spring 2026' },
    { code: 'MATH 121', name: 'Galois Theory', term: 'Winter 2026' },
    { code: 'MATH 62DM', name: 'Modern Mathematics', term: 'Winter 2026' },
    { code: 'MATH 120', name: 'Groups and Rings', term: 'Fall 2025' },
    { code: 'MATH 116', name: 'Complex Analysis', term: 'Fall 2025' },
    { code: 'MATH 151', name: 'Introduction to Probability Theory', term: 'Winter 2025' },
    { code: 'MATH 172', name: 'Lebesgue Integration and Fourier Analysis', term: 'Fall 2024' },
    { code: 'MATH 171', name: 'Fundamental Concepts of Analysis', term: 'Spring 2024' },
    { code: 'MATH 53', name: 'Differential Equations, and Fourier Methods', term: 'Spring 2024' },
    { code: 'MSE 111X', name: 'Introduction to Optimization (Accelerated)', term: 'Spring 2024' },
    { code: 'MATH 113', name: 'Linear Algebra and Matrix Theory', term: 'Winter 2024' },
    { code: 'MATH 51', name: 'Linear Algebra and Multivariable Calculus', term: 'Fall 2023' },
  ],
}

const siteAiModels = [
  'Composer 2',
  'GPT-5.4',
  'Opus 4.6',
  'Gemma 4 E2B'
]

const siteAiHarnesses = [
  'Cursor (editor + cloud)',
  'Codex',
  'Claude Code'
]

const education: Array<{
  school: string
  degree: string
  period: string
  detail?: string
  focus?: string[]
}> = [
  {
    school: 'Stanford University',
    degree: 'B.S. in Mathematics',
    period: '2023-2027',
    focus: ['Honors'],
  },
  {
    school: 'Stanford University',
    degree: 'M.S. in Computer Science',
    period: '2026-2027',
    focus: ['Computer and Network Security'],
  },
]

const KNOWN_COMMANDS: KnownCommand[] = [
  'help',
  'projects',
  'resume',
  'hobbies',
  'work',
  'awards',
  'classes',
  'clear',
  'theme',
  'blog',
]

const THEME_OPTIONS: ThemeScheme[] = [
  'dark',
  'light',
  'purple',
  'red',
  'blue',
  'green',
]

const commandDescriptions: Record<KnownCommand, string> = {
  help: 'List available commands',
  projects: 'Show project cards',
  work: 'Show work experience',
  awards: 'Show awards & programs',
  classes: 'Show coursework',
  resume: 'Open resume viewer',
  hobbies: 'Show hobbies overview or use hobbies [music|bookshelf|games|media]',
  clear: 'Clear the terminal output',
  theme: 'Personalize colors: theme [light|dark|purple|red|blue|green|toggle]',
  blog: 'Open the blog (optional: blog <post-slug> for a deep link)',
}

const buildEmail = (user: string, domain: string) => `${user}@${domain}`
const obfuscateEmail = (user: string, domain: string) =>
  `${user} [at] ${domain.replace('.', ' [dot] ')}`
const HISTORY_STORAGE_KEY = 'terminalHistory'
const THEME_STORAGE_KEY = 'preferredTheme'
const VIEW_MODE_STORAGE_KEY = 'viewMode'

/** Shown at the top of View mode — edit freely. Use `\n` or a multi-line template literal for line breaks. */
const viewIntro = {
  headline: 'Yo!',
  lede: `I am a junior at Stanford interested in modern cryptography (protocol cryptography like zero-knowledge proofs as well as post-quantum cryptography), secure systems, AI Safety, and open source AI.

Take a look at some of my writing in the \`Blog\` tab above!`,
} as const

const DEFAULT_HISTORY: HistoryEntry[] = [
  { id: 'init-0', command: 'projects' },
  { id: 'init-1', command: 'help' },
]

const isKnownCommand = (value: string): value is KnownCommand =>
  KNOWN_COMMANDS.includes(value as KnownCommand)

const isThemeScheme = (value: string): value is ThemeScheme =>
  THEME_OPTIONS.includes(value as ThemeScheme)

const getHobbySection = (value: string) =>
  hobbies.find((section) => section.command === value)

const parseThemeCommand = (command: string): ParsedThemeCommand => {
  const tokens = command.trim().toLowerCase().split(/\s+/)
  const args = tokens.slice(1)
  if (args.length === 0) {
    return { type: 'toggle' }
  }
  if (args[0] === 'help' || args[0] === 'list') {
    return { type: 'help' }
  }
  if (args[0] === 'current' || args.join(' ') === 'current theme') {
    return { type: 'current' }
  }
  if (args[0] === 'toggle') {
    return { type: 'toggle' }
  }
  if (isThemeScheme(args[0])) {
    return { type: 'set', theme: args[0] }
  }
  return { type: 'invalid', value: args.join(' ') }
}

const parseHobbyCommand = (command: string): ParsedHobbyCommand => {
  const tokens = command.trim().toLowerCase().split(/\s+/)
  const args = tokens.slice(1)
  if (args.length === 0 || args[0] === 'help' || args[0] === 'list') {
    return { type: 'overview' }
  }

  const normalizedArg =
    args[0] === 'books' ? 'bookshelf' : args[0] === 'boardgames' ? 'games' : args[0]
  const section = getHobbySection(normalizedArg)
  if (section) {
    return { type: 'section', section }
  }

  return { type: 'invalid', value: args.join(' ') }
}

const sortItemsAlphabetically = (items: HobbySection['items']) =>
  [...items].sort((left, right) => left.title.localeCompare(right.title))

const COLLAPSED_BOOKSHELF_COUNT = 6

function readInitialViewMode(): ViewMode {
  if (typeof window === 'undefined') return 'view'
  const h = window.location.hash
  if (h === '#blog' || h.startsWith('#blog/')) return 'blog'
  const stored = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY)
  if (stored === 'terminal') return 'terminal'
  if (stored === 'blog') return 'blog'
  return 'view'
}

function readInitialBlogSlug(): string | null {
  if (typeof window === 'undefined') return null
  const h = window.location.hash
  if (!h.startsWith('#blog/')) return null
  const s = h.slice(6)
  if (!s) return null
  try {
    return decodeURIComponent(s)
  } catch {
    return s
  }
}

function App() {
  const [inputValue, setInputValue] = useState('')
  const [expandedBookshelfEntries, setExpandedBookshelfEntries] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>(readInitialViewMode)
  const [blogPostSlug, setBlogPostSlug] = useState<string | null>(readInitialBlogSlug)
  const [theme, setTheme] = useState<ThemeScheme>(() => {
    if (typeof window === 'undefined') {
      return 'dark'
    }
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)?.toLowerCase()
    return storedTheme && isThemeScheme(storedTheme) ? storedTheme : 'dark'
  })
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    if (typeof window === 'undefined') {
      return DEFAULT_HISTORY
    }
    const stored = window.localStorage.getItem(HISTORY_STORAGE_KEY)
    if (!stored) {
      return DEFAULT_HISTORY
    }
    try {
      const parsed = JSON.parse(stored) as HistoryEntry[]
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_HISTORY
    } catch {
      return DEFAULT_HISTORY
    }
  })
  const terminalBodyRef = useRef<HTMLDivElement | null>(null)

  const commandEntries = useMemo(() => {
    return history.map((entry) => {
      const normalized = entry.command.trim().toLowerCase()
      const [baseCommand = ''] = normalized.split(/\s+/)
      const parsedThemeCommand =
        baseCommand === 'theme' ? parseThemeCommand(normalized) : null
      const parsedHobbyCommand =
        baseCommand === 'hobbies' ? parseHobbyCommand(normalized) : null
      const isKnown =
        parsedThemeCommand || parsedHobbyCommand
          ? true
          : baseCommand === 'blog' || isKnownCommand(normalized)
      return {
        ...entry,
        normalized,
        baseCommand,
        parsedThemeCommand,
        parsedHobbyCommand,
        isKnown,
      }
    })
  }, [history])

  useEffect(() => {
    const container = terminalBodyRef.current
    if (!container) {
      return
    }
    const entries = container.querySelectorAll<HTMLDivElement>('.terminal-entry')
    const lastEntry = entries[entries.length - 1]
    if (!lastEntry) {
      return
    }
    const containerTop = container.getBoundingClientRect().top
    const entryTop = lastEntry.getBoundingClientRect().top
    const offset = 16
    container.scrollTop += entryTop - containerTop - offset
  }, [history])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history))
  }, [history])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode)
    }
  }, [viewMode])

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

  const navigateBlogSlug = useCallback((slug: string | null) => {
    setBlogPostSlug(slug)
    if (typeof window === 'undefined') {
      return
    }
    const next =
      slug !== null && slug !== ''
        ? `#blog/${encodeURIComponent(slug)}`
        : '#blog'
    if (window.location.hash !== next) {
      window.history.replaceState(null, '', next)
    }
  }, [])

  useEffect(() => {
    const onHash = () => {
      const h = window.location.hash
      if (h === '#blog' || h.startsWith('#blog/')) {
        setViewMode('blog')
        setBlogPostSlug(
          h.startsWith('#blog/') && h.length > 6
            ? decodeURIComponent(h.slice(6))
            : null,
        )
      } else if (h === '#terminal') {
        setViewMode('terminal')
        setBlogPostSlug(null)
      } else if (h === '#view' || h === '') {
        setViewMode('view')
        setBlogPostSlug(null)
      }
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedInput = inputValue.trim().toLowerCase()
    if (!trimmedInput) {
      return
    }

    if (trimmedInput === 'clear') {
      setHistory([])
      setInputValue('')
      return
    }

    if (trimmedInput === 'theme' || trimmedInput.startsWith('theme ')) {
      const parsedThemeCommand = parseThemeCommand(trimmedInput)
      if (parsedThemeCommand.type === 'set') {
        setTheme(parsedThemeCommand.theme)
      }
      if (parsedThemeCommand.type === 'toggle') {
        setTheme((prevTheme) => {
          const currentIndex = THEME_OPTIONS.indexOf(prevTheme)
          const nextIndex = (currentIndex + 1) % THEME_OPTIONS.length
          return THEME_OPTIONS[nextIndex]
        })
      }
      setInputValue('')
      return
    }

    if (trimmedInput === 'blog' || trimmedInput.startsWith('blog ')) {
      const rest =
        trimmedInput === 'blog' ? '' : trimmedInput.slice(4).trim()
      setViewMode('blog')
      navigateBlogSlug(rest || null)
      setHistory((prev) => [
        ...prev,
        { id: `${Date.now()}-${prev.length}`, command: trimmedInput },
      ])
      setInputValue('')
      return
    }

    setHistory((prev) => [
      ...prev,
      { id: `${Date.now()}-${prev.length}`, command: trimmedInput },
    ])
    setInputValue('')
  }

  const primaryEmail = buildEmail('akambire', 'stanford.edu')
  const primaryEmailLabel = obfuscateEmail('akambire', 'stanford.edu')
  const isBookshelfEntryExpanded = (entryId: string) =>
    expandedBookshelfEntries.includes(entryId)
  const toggleBookshelfEntry = (entryId: string) => {
    setExpandedBookshelfEntries((prev) =>
      prev.includes(entryId)
        ? prev.filter((id) => id !== entryId)
        : [...prev, entryId],
    )
  }

  return (
    <div className="page">
      <div className="page-body">
      <div className="sidebar-shell">
      <aside className="sidebar">
        <div className="profile">
          <div className="profile-header">
            <div className="profile-image-wrapper">
              <img
                src="/profile.jpg"
                alt="Antonio Kambire"
                className="profile-image"
              />
            </div>
            <h1 className="profile-name">Antonio Kambiré</h1>
          </div>
          <div className="profile-education">
            <p className="profile-school">Stanford University</p>
            <div className="profile-degree-list">
              {education.map((entry) => (
                <div
                  key={`${entry.degree}-${entry.period}`}
                  className="profile-degree-item"
                >
                  <div className="profile-degree-row">
                    <p className="profile-degree-title">{entry.degree}</p>
                    <span className="profile-degree-period">{entry.period}</span>
                  </div>
                  {entry.detail && (
                    <p className="profile-degree-detail">{entry.detail}</p>
                  )}
                  {entry.focus && entry.focus.length > 0 && (
                    <ul className="profile-education-focus-list">
                      {entry.focus.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <section className="sidebar-section" aria-labelledby="sidebar-location-heading">
          <h2 id="sidebar-location-heading" className="sidebar-section-heading">
            Location
          </h2>
          <div className="location-lines">
            <span>From Burkina Faso 🇧🇫</span>
            <span>Currently in California, U.S.</span>
          </div>
        </section>

        <section className="sidebar-section" aria-labelledby="sidebar-interests-heading">
          <h2 id="sidebar-interests-heading" className="sidebar-section-heading">
            Skills
          </h2>
          <ul className="sidebar-interests-list">
            <li>I speak C/C++, Rust, Python & JS</li>
            <li>I can teach myself hard things</li>
          </ul>
        </section>

        <section className="sidebar-section" aria-labelledby="sidebar-contact-heading">
          <h2 id="sidebar-contact-heading" className="sidebar-section-heading">
            Contact
          </h2>
          <ul className="contact-list">
            <li>
              <a href={`mailto:${primaryEmail}`}>{primaryEmailLabel}</a>
            </li>
          </ul>
        </section>
      </aside>
      </div>

      <main
        className={[
          'terminal-panel',
          viewMode === 'blog' && 'terminal-panel--blog',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <header className="terminal-header">
          <div className="terminal-dots">
            <span className="dot red" />
            <span className="dot yellow" />
            <span className="dot green" />
          </div>
          <div className="terminal-title">akambire.dev</div>
          <div className="mode-toggle-group" role="group" aria-label="Display mode">
            <button
              type="button"
              className="mode-toggle-segment"
              aria-pressed={viewMode === 'terminal'}
              onClick={() => {
                setViewMode('terminal')
                setBlogPostSlug(null)
                if (typeof window !== 'undefined') {
                  window.history.replaceState(null, '', '#terminal')
                }
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <polyline points="4 17 10 11 4 5" />
                <line x1="12" y1="19" x2="20" y2="19" />
              </svg>
              <span>Terminal</span>
            </button>
            <button
              type="button"
              className="mode-toggle-segment"
              aria-pressed={viewMode === 'view'}
              onClick={() => {
                setViewMode('view')
                setBlogPostSlug(null)
                if (typeof window !== 'undefined') {
                  window.history.replaceState(null, '', '#view')
                }
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span>View</span>
            </button>
            <button
              type="button"
              className="mode-toggle-segment"
              aria-pressed={viewMode === 'blog'}
              onClick={() => {
                setViewMode('blog')
                navigateBlogSlug(null)
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                <path d="M8 7h8" />
                <path d="M8 11h8" />
              </svg>
              <span>Blog</span>
            </button>
          </div>
        </header>

        {viewMode === 'terminal' ? (
          <div className="terminal-body" ref={terminalBodyRef}>
            <div className="terminal-output">
              {commandEntries.map((entry) => {
                return (
                  <div key={entry.id} className="terminal-entry">
                    <div className="prompt-line">
                      <span className="prompt">akambire.dev</span>
                      <span className="prompt-symbol">$</span>
                      <span className="prompt-command">{entry.command}</span>
                    </div>

                    {entry.baseCommand === 'help' && (
                      <div className="command-output">
                        <p className="command-title">Available commands</p>
                        <ul>
                          {Object.entries(commandDescriptions).map(
                            ([command, description]) => (
                              <li key={command}>
                                <strong>{command}</strong> — {description}
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}

                    {entry.baseCommand === 'projects' && (
                      <div className="command-output">
                        <p className="command-title">Selected Projects</p>
                        <div className="project-grid">
                          {projects.map((project) => (
                            <article
                              key={project.title}
                              className="project-card"
                            >
                              <h3>{project.title}</h3>
                              <p className="project-details">
                                {project.description}
                              </p>
                              <p className="project-meta">{project.tags.join(' / ')}</p>
                              {project.links && project.links.length > 0 && (
                                <div className="project-links">
                                  {project.links.map((link) => (
                                    <a
                                      key={link.label}
                                      href={link.url}
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      {link.label}
                                    </a>
                                  ))}
                                </div>
                              )}
                            </article>
                          ))}
                        </div>
                      </div>
                    )}

                    {entry.baseCommand === 'resume' && (
                      <div className="command-output">
                        <div className="resume-header">
                          <p className="command-title">Resume</p>
                          <a className="download-button" href="/resume.pdf" download>
                            Download PDF
                          </a>
                        </div>
                        <div className="resume-viewer">
                          <object
                            data="/resume.pdf"
                            type="application/pdf"
                            aria-label="Resume PDF"
                          >
                            <p>
                              Your browser cannot display the PDF. Use the
                              download button above.
                            </p>
                          </object>
                        </div>
                      </div>
                    )}

                    {entry.baseCommand === 'hobbies' && entry.parsedHobbyCommand && (
                      <div className="command-output">
                        {entry.parsedHobbyCommand.type === 'overview' && (
                          <>
                            <p className="command-title">Hobbies</p>
                            <div className="hobby-grid">
                              {hobbies.map((hobby) => (
                                <article key={hobby.command} className="hobby-card">
                                  <div>
                                    <h3>{hobby.title}</h3>
                                    <p>{hobby.note}</p>
                                    <p className="hobby-command-hint">
                                      <strong>hobbies {hobby.command}</strong>
                                    </p>
                                  </div>
                                </article>
                              ))}
                            </div>
                          </>
                        )}

                        {entry.parsedHobbyCommand.type === 'section' && (
                          <>
                            <p className="command-title">
                              {entry.parsedHobbyCommand.section.title}
                            </p>
                            <p className="hobby-section-note">
                              {entry.parsedHobbyCommand.section.note}
                            </p>
                            {entry.parsedHobbyCommand.section.command === 'bookshelf' ? (
                              <>
                                <div className="bookshelf-grid">
                                  {sortItemsAlphabetically(
                                    entry.parsedHobbyCommand.section.items,
                                  )
                                    .slice(
                                      0,
                                      isBookshelfEntryExpanded(entry.id)
                                        ? entry.parsedHobbyCommand.section.items.length
                                        : COLLAPSED_BOOKSHELF_COUNT,
                                    )
                                    .map((item) => (
                                  <article
                                    key={`${item.title}-${item.detail}`}
                                    className="bookshelf-book"
                                  >
                                    <p className="bookshelf-book-title">{item.title}</p>
                                    <p className="bookshelf-book-detail">{item.detail}</p>
                                  </article>
                                    ))}
                                </div>
                                {entry.parsedHobbyCommand.section.items.length >
                                  COLLAPSED_BOOKSHELF_COUNT && (
                                  <button
                                    type="button"
                                    className="bookshelf-toggle"
                                    onClick={() => toggleBookshelfEntry(entry.id)}
                                  >
                                    {isBookshelfEntryExpanded(entry.id)
                                      ? 'Show fewer books'
                                      : `Show ${
                                          entry.parsedHobbyCommand.section.items.length -
                                          COLLAPSED_BOOKSHELF_COUNT
                                        } more books`}
                                  </button>
                                )}
                              </>
                            ) : entry.parsedHobbyCommand.section.items.length > 0 ? (
                              <div className="hobby-section-list">
                                {entry.parsedHobbyCommand.section.items.map((item) => (
                                  <article
                                    key={`${item.title}-${item.detail}`}
                                    className="hobby-section-item"
                                  >
                                    <p className="hobby-section-item-title">{item.title}</p>
                                    <p className="hobby-section-item-detail">{item.detail}</p>
                                  </article>
                                ))}
                              </div>
                            ) : (
                              <p className="terminal-helper">
                                {entry.parsedHobbyCommand.section.emptyMessage}
                              </p>
                            )}
                          </>
                        )}

                        {entry.parsedHobbyCommand.type === 'invalid' && (
                          <>
                            <p className="command-title">Hobbies</p>
                            <p>
                              Unknown hobby section{' '}
                              <strong>{entry.parsedHobbyCommand.value}</strong>. Try{' '}
                              <strong>hobbies</strong>, <strong>hobbies music</strong>,{' '}
                              <strong>hobbies bookshelf</strong>,{' '}
                              <strong>hobbies games</strong>, or{' '}
                              <strong>hobbies media</strong>.
                            </p>
                          </>
                        )}
                      </div>
                    )}

                    {entry.baseCommand === 'work' && (
                      <div className="command-output">
                        <p className="command-title">Work experience</p>
                        {workExperiences.length === 0 ? (
                          <p>Add your roles in the workExperiences list.</p>
                        ) : (
                          <div className="work-list">
                            {workExperiences.map((role) => (
                              <article key={`${role.role}-${role.org}`}>
                                <div className="work-heading">
                                  <h3>{role.role}</h3>
                                  <span className="work-org-line">
                                    @{' '}
                                    {role.orgUrl ? (
                                      <a
                                        href={role.orgUrl}
                                        className="work-org-link"
                                        target="_blank"
                                        rel="noreferrer"
                                      >
                                        {role.org}
                                      </a>
                                    ) : (
                                      role.org
                                    )}
                                  </span>
                                </div>
                                <p className="work-period">{role.period}</p>
                                {role.links && role.links.length > 0 && (
                                  <div className="work-extra-links">
                                    {role.links.map((link) => (
                                      <a
                                        key={`${link.label}-${link.url}`}
                                        href={link.url}
                                        target="_blank"
                                        rel="noreferrer"
                                      >
                                        {link.label}
                                      </a>
                                    ))}
                                  </div>
                                )}
                                <ul>
                                  {role.highlights.map((highlight) => (
                                    <li key={highlight}>{highlight}</li>
                                  ))}
                                </ul>
                              </article>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {entry.baseCommand === 'awards' && (
                      <div className="command-output">
                        <p className="command-title">Awards & Programs</p>
                        <div className="awards-list">
                          {awards.map((award) => (
                            <article key={`${award.title}-${award.year}`}>
                              <div className="awards-heading">
                                <h3>{award.title}</h3>
                                <span className="awards-year">{award.year}</span>
                              </div>
                              {award.details && (
                                <p className="awards-details">{award.details}</p>
                              )}
                            </article>
                          ))}
                        </div>
                      </div>
                    )}

                    {entry.baseCommand === 'classes' && (
                      <div className="command-output">
                        <p className="command-title">Classes</p>
                        <div className="classes-section">
                          <h3>Computer Science</h3>
                          <div className="classes-list">
                            {classes.cs.map((course) => (
                              <article key={`${course.code}-${course.term}`}>
                                <div className="classes-heading">
                                  <h3>{course.code}</h3>
                                  <span>{course.term}</span>
                                </div>
                                <p className="classes-name">{course.name}</p>
                              </article>
                            ))}
                          </div>
                        </div>
                        <div className="classes-section">
                          <h3>Mathematics</h3>
                          <div className="classes-list">
                            {classes.math.map((course) => (
                              <article key={`${course.code}-${course.term}`}>
                                <div className="classes-heading">
                                  <h3>{course.code}</h3>
                                  <span>{course.term}</span>
                                </div>
                                <p className="classes-name">{course.name}</p>
                              </article>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {entry.baseCommand === 'blog' && (
                      <div className="command-output">
                        <p className="command-title">Blog</p>
                        <p>
                          {entry.normalized === 'blog' ? (
                            <>
                              Opened the <strong>blog</strong>. Use{' '}
                              <strong>Blog</strong> in the header to read posts in reader
                              mode.
                            </>
                          ) : (
                            <>
                              Deep link to{' '}
                              <strong>{entry.normalized.slice(4).trim()}</strong>. Switch
                              to <strong>Blog</strong> mode — markdown opens in the reader;
                              PDFs open in a new tab.
                            </>
                          )}
                        </p>
                      </div>
                    )}

                    {!entry.isKnown && (
                      <div className="command-output">
                        <p className="command-title">Command not found</p>
                        <p>
                          Type <strong>help</strong> to see the available commands.
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <form className="terminal-input" onSubmit={handleSubmit}>
              <span className="prompt">akambire.dev</span>
              <span className="prompt-symbol">$</span>
              <input
                type="text"
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                placeholder="Type a command (help, work, projects, blog, awards, classes, resume, hobbies, theme, clear)"
                aria-label="Terminal command input"
              />
            </form>
          </div>
        ) : viewMode === 'view' ? (
          <div className="view-mode">
            <section
              className="view-intro"
              aria-labelledby="view-intro-heading"
            >
              <h2 id="view-intro-heading" className="view-intro-headline">
                {viewIntro.headline}
              </h2>
              <p className="view-intro-lede">{viewIntro.lede}</p>
            </section>

            <section className="view-section">
              <h2 className="view-section-title">Experience</h2>
              <div className="view-flat-list">
                {workExperiences.map((role) => (
                  <article key={`${role.role}-${role.org}`} className="view-flat-item">
                    <div className="view-flat-header">
                      <h3>{role.role}</h3>
                      <span className="view-flat-meta">{role.period}</span>
                    </div>
                    <p className="view-flat-org">
                      {role.orgUrl ? (
                        <a
                          href={role.orgUrl}
                          className="view-flat-org-link"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {role.org}
                        </a>
                      ) : (
                        role.org
                      )}
                    </p>
                    {role.links && role.links.length > 0 && (
                      <div className="project-links work-experience-view-links">
                        {role.links.map((link) => (
                          <a key={`${link.label}-${link.url}`} href={link.url} target="_blank" rel="noreferrer">
                            {link.label}
                          </a>
                        ))}
                      </div>
                    )}
                    <ul className="view-flat-bullets">
                      {role.highlights.map((h) => (
                        <li key={h}>{h}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>

            <section className="view-section">
              <h2 className="view-section-title">Projects</h2>
              <div className="view-flat-list">
                {projects.map((project) => (
                  <article key={project.title} className="view-flat-item">
                    <h3>{project.title}</h3>
                    <p className="view-flat-desc">{project.description}</p>
                    <p className="project-meta">{project.tags.join(' / ')}</p>
                    {project.links && project.links.length > 0 && (
                      <div className="project-links">
                        {project.links.map((link) => (
                          <a key={link.label} href={link.url} target="_blank" rel="noreferrer">
                            {link.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>

            <section className="view-section">
              <h2 className="view-section-title">Awards & Programs</h2>
              <div className="view-flat-list view-flat-list--awards">
                {awards.map((award) => (
                  <article key={`${award.title}-${award.year}`} className="view-flat-item">
                    <div className="view-flat-header">
                      <h3>{award.title}</h3>
                      <span className="view-flat-meta">{award.year}</span>
                    </div>
                    {award.details && <p className="view-flat-desc">{award.details}</p>}
                  </article>
                ))}
              </div>
            </section>

            <section className="view-section view-section--coursework">
              <h2 className="view-section-title">Coursework</h2>
              <div className="view-course-columns">
                <div className="view-subsection">
                  <h3 className="view-subsection-title">Computer Science</h3>
                  <div className="view-course-grid">
                    {classes.cs.map((course) => (
                      <div key={`${course.code}-${course.term}`} className="view-course">
                        <span className="view-course-code">{course.code}</span>
                        <span className="view-course-name">{course.name}</span>
                        <span className="view-course-term">{course.term}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="view-subsection">
                  <h3 className="view-subsection-title">Mathematics</h3>
                  <div className="view-course-grid">
                    {classes.math.map((course) => (
                      <div key={`${course.code}-${course.term}`} className="view-course">
                        <span className="view-course-code">{course.code}</span>
                        <span className="view-course-name">{course.name}</span>
                        <span className="view-course-term">{course.term}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        ) : (
          <Suspense
            fallback={
              <div className="blog-mode blog-loading" role="status">
                Loading blog…
              </div>
            }
          >
            <BlogMode
              selectedSlug={blogPostSlug}
              onSelectSlug={navigateBlogSlug}
            />
          </Suspense>
        )}

        {(viewMode === 'view' ||
          (viewMode === 'blog' && blogPostSlug === null)) && (
          <footer className="site-footer">
            <p className="site-footer-lead">
              I built most of this website using various (the blog posts and other content are mine though!) I really want to somewhat keep up with the capabilities of
              new AI models so I will be using this website as a playground for that. Ask me about the various insights I've gathered through this mini-experiment if you wish!
            </p>
            <div className="site-footer-columns">
              <div className="site-footer-block">
                <h3 className="site-footer-heading">Models Used</h3>
                <ul className="site-footer-list">
                  {siteAiModels.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="site-footer-block">
                <h3 className="site-footer-heading">Tools &amp; harnesses</h3>
                <ul className="site-footer-list">
                  {siteAiHarnesses.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </footer>
        )}
      </main>
      </div>
    </div>
  )
}

export default App
