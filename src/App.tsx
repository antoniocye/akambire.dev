import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import './App.css'

type Command =
  | 'help'
  | 'projects'
  | 'resume'
  | 'hobbies'
  | 'work'
  | 'awards'
  | 'classes'
  | 'clear'

type HistoryEntry = {
  id: string
  command: string
}

const projects = [
  {
    title: 'evolve(Browser)',
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

const hobbies = [
  {
    title: 'Music (Hip hop & R&B)',
    note: 'Albums I\'ve had on repeat lately.',
    image: '/music.png',
    items: [
      { title: 'Good Kid, m.A.A.d City', detail: 'Kendrick Lamar (2012)' },
      { title: 'Liquid Swords', detail: "GZA (1995)"},
      { title: 'DAYTONA', detail: 'Pusha T (2018)' },
      { title: 'Ipséité', detail: 'Damso (2017)' },
      { title: 'Illmatic', detail: 'Nas (1994)' },
      { title: 'Hell Hath No Fury', detail: 'Clipse (2006)' },
      { title: 'The Blueprint', detail: 'Jay-Z (2001)' },
      { title: 'Let God Sort Em Out', detail: 'Clipse (2025)' },
    ],
  },
  {
    title: 'Not reading the math books I collect',
    note: 'Recent additions to the shelf. I have over 40 math books lol',
    image: '/books.webp',
    items: [
      { title: 'Galois Theory', detail: 'Ian Stewart' },
      { title: 'Numerical Linear Algebra', detail: 'Trefethen & Bau' },
      { title: 'Introduction to Coding Theory', detail: 'van Lint' },
      { title: 'Visual Complex Analysis', detail: 'Needham' },
    ],
  },
  {
    title: 'Board games',
    note: 'The games I like to play most.',
    image: '/games.jpg',
    items: [
      { title: 'Spirit Island', detail: 'Gifted Winter 2025 on Christmas (Thanks Haley ❤️!)' },
      { title: 'Alchemist', detail: 'Gifted Summer 2025 (Thanks Mathcamp!)' },
      { title: 'Cryptid', detail: 'Bought Winter 2025' },
      { title: 'Memoir `44', detail: 'Gifted Fall 2025 (Thanks Nico!)' },
    ],
  },
]

const workExperiences: Array<{
  role: string
  org: string
  period: string
  highlights: string[]
}> = [
  {
    role: "Cryptography Research Intern",
    org: "zkSecurity",
    period: "Incoming - Summer 2026",
    highlights: ["Will work on fun cryptography projects!"]
  },
  {
    role: "Section Leader",
    org: "Computer Science Department",
    period: "Sept. 2024 - Present",
    highlights: ["Course assistant for CS 106A and 106B classes at Stanford",
      "Teaching C++ and Python sections to a dozen students, helping students debug during office hours, and grading assignments and exams."]
  },
  {
    role: "Olympiad Coach",
    org: "Mathematical Community of Burkina",
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
    period: "June 2025 - Aug. 2025",
    highlights: ["Taught a class on the Groth16 zero-knowledge proof system to mathematically gifted high school students.",
      "Served as a residential advisor, helped run day-to-day camp operations, and led activities and field trips."]
  }
]

const awards: Array<{
  title: string
  org: string
  year: string
  details?: string
  links?: Array<{ label: string; url: string }>
}> = [
  {
    title: 'TreeHacks Winner',
    org: 'TreeHacks @ Stanford',
    year: '2026',
    details: 'Won the Y Combinator challenge at TreeHacks 2026.',
    links: [{label: "Devpost", url: "https://devpost.com/software/evolve-browser"}]
  },
  {
    title: 'Rise Fellow',
    org: 'Rise',
    year: '2023',
    details: 'Recipitient of the Rise Fellowship, with a full-ride scholarship at Stanford, and a network of hundreds of talented people from around the world.',
    links: [{label: "Rise Website", url: "https://www.risefortheworld.org/global-winners"}]
  },
  {
    title: 'Atlas Fellow',
    org: 'Atlas',
    year: '2022',
    details: '2022 Atlas Fellow',
    links: [{label: "Atlas Website", url: "https://www.atlasfellowship.org/"}]
  },
]

const classes = {
  cs: [
    { code: 'CS 140E', name: 'Operating systems design and implementation', term: 'Winter 2026'},
    { code: 'CS 356', name: 'Topics in Computer and Network Security', term: 'Fall 2025' },
    { code: 'CS 251', name: 'Cryptocurrencies and blockchain technologies', term: 'Fall 2025' },
    { code: 'CS 258', name: 'Quantum Cryptography', term: 'Fall 2025' },
    { code: 'CS 155', name: 'Computer and Network Security', term: 'Spring 2025' },
    { code: 'CS 355', name: 'Advanced Topics in Cryptography', term: 'Spring 2025' },
    { code: 'CS 255', name: 'Introduction to Cryptography', term: 'Winter 2025' },
    { code: 'CS 229', name: 'Machine Learning', term: 'Winter 2025' },
    { code: 'CS 161', name: 'Design and Analysis of Algorithms', term: 'Fall 2024' },
    { code: 'CS 107E', name: 'Computer Systems from the Ground Up', term: 'Winter 2024' },
    { code: 'CS 103', name: 'Mathematical Foundations of Computing', term: 'Winter 2024' },
  ],
  math: [
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

const commandDescriptions: Record<Command, string> = {
  help: 'List available commands',
  projects: 'Show project cards',
  work: 'Show work experience',
  awards: 'Show awards',
  classes: 'Show coursework',
  resume: 'Open resume viewer',
  hobbies: 'Show hobbies list',
  clear: 'Clear the terminal output',
}

const buildEmail = (user: string, domain: string) => `${user}@${domain}`
const obfuscateEmail = (user: string, domain: string) =>
  `${user} [at] ${domain.replace('.', ' [dot] ')}`
const STORAGE_KEY = 'terminalHistory'

function App() {
  const [inputValue, setInputValue] = useState('')
  const [activeHobby, setActiveHobby] = useState<(typeof hobbies)[number] | null>(null)
  const [expandedImage, setExpandedImage] = useState<{ src: string; alt: string } | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    if (typeof window === 'undefined') {
      return [
        { id: 'init-0', command: 'projects' },
        { id: 'init-1', command: 'help' },
      ]
    }
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return [
        { id: 'init-0', command: 'projects' },
        { id: 'init-1', command: 'help' },
      ]
    }
    try {
      const parsed = JSON.parse(stored) as HistoryEntry[]
      return Array.isArray(parsed) && parsed.length > 0
        ? parsed
        : [
            { id: 'init-0', command: 'projects' },
            { id: 'init-1', command: 'help' },
          ]
    } catch {
      return [
        { id: 'init-0', command: 'projects' },
        { id: 'init-1', command: 'help' },
      ]
    }
  })
  const terminalBodyRef = useRef<HTMLDivElement | null>(null)

  const commandEntries = useMemo(() => {
    return history.map((entry) => {
      const normalized = entry.command.trim().toLowerCase() as Command
      const isKnown = (
        [
          'help',
          'projects',
          'resume',
          'hobbies',
          'work',
          'awards',
          'classes',
          'clear',
        ] as Command[]
      ).includes(normalized)
      return {
        ...entry,
        normalized,
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
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  }, [history])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = inputValue.trim().toLowerCase()
    if (!trimmed) {
      return
    }

    if (trimmed === 'clear') {
      setHistory([])
      setInputValue('')
      return
    }

    setHistory((prev) => [
      ...prev,
      { id: `${Date.now()}-${prev.length}`, command: trimmed },
    ])
    setInputValue('')
  }

  const primaryEmail = buildEmail('akambire', 'stanford.edu')
  const secondaryEmail = buildEmail('antoniokambire', 'gmail.com')
  const primaryEmailLabel = obfuscateEmail('akambire', 'stanford.edu')
  const secondaryEmailLabel = obfuscateEmail('antoniokambire', 'gmail.com')

  return (
    <div className="page">
      <aside className="sidebar">
        <div className="profile">
          <div className="profile-image-wrapper">
            <img
              src="/profile.jpg"
              alt="Antonio Kambire"
              className="profile-image"
            />
          </div>
          <h1 className="profile-name">Antonio Kambiré</h1>
          <div className="profile-education">
            <p>Stanford University</p>
            <ul>
              <li>Mathematics B.S. (2023–2027)</li>
              <li>Prospective CS coterm</li>
            </ul>
          </div>
        </div>

        <section className="sidebar-section">
          <h2>Who am I?</h2>
          <p>
            A Junior at Stanford interested in cryptography, mathematics, and AI safety.
          </p>
          <div className="location-lines">
            <span>From Burkina Faso 🇧🇫</span>
            <span>Currently in California, U.S. 🐻</span>
          </div>
        </section>

        <section className="sidebar-section">
          <h2>Skills</h2>
          <ul className="skills-list">
            <li>Mathematics</li>
            <li>Modern cryptography</li>
            <li>Machine learning</li>
            <li>Zero knowledge proofs</li>
            <li>C, C++ &amp; Rust</li>
          </ul>
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

      <main className="terminal-panel">
        <header className="terminal-header">
          <div className="terminal-dots">
            <span className="dot red" />
            <span className="dot yellow" />
            <span className="dot green" />
          </div>
          <div className="terminal-title">akambire.dev</div>
        </header>

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

                  {entry.normalized === 'help' && (
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

                  {entry.normalized === 'projects' && (
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
                            <div className="tag-list">
                              {project.tags.map((tag) => (
                                <span key={tag} className="tag">
                                  {tag}
                                </span>
                              ))}
                            </div>
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

                  {entry.normalized === 'resume' && (
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

                  {entry.normalized === 'hobbies' && (
                    <div className="command-output">
                      <p className="command-title">Hobbies</p>
                      <div className="hobby-grid">
                        {hobbies.map((hobby) => (
                          <article
                            key={hobby.title}
                            className="hobby-card"
                            role="button"
                            tabIndex={0}
                            onClick={() => setActiveHobby(hobby)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault()
                                setActiveHobby(hobby)
                              }
                            }}
                          >
                            <div className="hobby-image hobby-image-card">
                              {hobby.image ? (
                                <>
                                  <img
                                    src={hobby.image}
                                    alt={hobby.title}
                                    className="hobby-image-media"
                                  />
                                  <button
                                    type="button"
                                    className="view-meme-btn view-meme-btn-card"
                                    onClick={e => {
                                      e.stopPropagation()
                                      setExpandedImage({ src: hobby.image!, alt: hobby.title })
                                    }}
                                  >
                                    View meme
                                  </button>
                                </>
                              ) : (
                                'Click to view'
                              )}
                            </div>
                            <div>
                              <h3>{hobby.title}</h3>
                              <p>{hobby.note}</p>
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>
                  )}

                  {entry.normalized === 'work' && (
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
                                <span>{role.org}</span>
                              </div>
                              <p className="work-period">{role.period}</p>
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

                  {entry.normalized === 'awards' && (
                    <div className="command-output">
                      <p className="command-title">Awards</p>
                      <div className="awards-list">
                        {awards.map((award) => (
                          <article key={`${award.title}-${award.year}`}>
                            <div className="awards-heading">
                              <h3>{award.title}</h3>
                              <span>{award.year}</span>
                            </div>
                            <p className="awards-org">{award.org}</p>
                            {award.details && (
                              <p className="awards-details">{award.details}</p>
                            )}
                            {award.links && award.links.length > 0 && (
                              <div className="awards-links">
                                {award.links.map((link) => (
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

                  {entry.normalized === 'classes' && (
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
              placeholder="Type a command (help, projects, work, awards, classes, resume, hobbies, clear)"
              aria-label="Terminal command input"
            />
          </form>
        </div>
      </main>
      {activeHobby && (
        <div className="hobby-modal" role="dialog" aria-modal="true">
          <div className="hobby-modal-backdrop" onClick={() => setActiveHobby(null)} />
          <div className="hobby-modal-content">
            <div className="hobby-modal-header">
              <h3>{activeHobby.title}</h3>
              <button type="button" onClick={() => setActiveHobby(null)}>
                Close
              </button>
            </div>
            {activeHobby.image && (
              <div className="hobby-modal-image-wrap">
                <img
                  src={activeHobby.image}
                  alt={activeHobby.title}
                  className="hobby-modal-image"
                />
                <button
                  type="button"
                  className="view-meme-btn view-meme-btn-centered"
                  onClick={() => setExpandedImage({ src: activeHobby.image!, alt: activeHobby.title })}
                >
                  View meme
                </button>
              </div>
            )}
            <p>{activeHobby.note}</p>
            <ul>
              {activeHobby.items.map((item) => (
                <li key={`${item.title}-${item.detail}`}>
                  <strong>{item.title}</strong>
                  <span className="hobby-item-detail">{item.detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {expandedImage && (
        <div
          className="expanded-meme-backdrop"
          onClick={() => setExpandedImage(null)}
        >
          <div
            className="expanded-meme-content"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={expandedImage.src}
              alt={expandedImage.alt}
              className="expanded-meme-image"
            />
            <button
              type="button"
              className="expanded-meme-close-button"
              onClick={() => setExpandedImage(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
