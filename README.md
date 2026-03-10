# akambire.dev — Codebase Reference

Personal portfolio for **Antonio Kambiré** (Stanford Mathematics, 2023–2027). Built as a single-page app with two interactive "apps" — a fake terminal and a macOS-Finder-style blog browser — living side by side.

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Bundler | Vite 7 | Fast HMR, native ESM, `import.meta.glob` for blog auto-discovery |
| UI | React 19 + TypeScript 5.9 | Strict mode, React Compiler for auto-memoization |
| Routing | react-router-dom v7 | Client-side `/` ↔ `/blog` ↔ `/blog/:slug` navigation |
| Markdown | react-markdown + remark-gfm + remark-math + rehype-katex | GFM tables/strikethrough + KaTeX LaTeX rendering |
| Styling | Vanilla CSS with custom properties | Zero runtime cost, 6 switchable themes via `data-theme` |
| React Compiler | babel-plugin-react-compiler | Automatic memoization — don't add `useMemo`/`useCallback` unless for non-rendering purposes (like ref callbacks) |

No CSS framework, no state management library, no component library.

---

## File Structure

```
src/
├── main.tsx          — React entry point; wraps app in <BrowserRouter>
├── App.tsx           — Root component: sidebar, routing, terminal logic, dock
├── Finder.tsx        — Blog file browser (the "Finder" app)
├── BlogPost.tsx      — Markdown post reader with LaTeX + fullscreen mode
├── blogUtils.ts      — Frontmatter parser, post loader, date/size formatters
├── App.css           — All styles; 6 theme definitions via [data-theme]
├── index.css         — Global reset / base
└── blog/             — Drop .md files here to publish
    ├── introduction-to-zk-proofs.md
    ├── phantom-dependencies.md
    └── teaching-groth16-at-mathcamp.md

public/               — Static assets served at root (profile.jpg, resume.pdf, etc.)
index.html            — Vite HTML shell
vite.config.ts        — Vite + React Compiler config
tsconfig.app.json     — Strict TS: noUnusedLocals, erasableSyntaxOnly, verbatimModuleSyntax
```

---

## Routing

```
/              → Terminal app (the fake shell)
/blog          → Finder app (blog post list)
/blog/:slug    → Blog post reader (slug = filename without .md)
```

`BrowserRouter` lives in `main.tsx`. All three routes are declared inside `App.tsx` via `<Routes>/<Route>`. The sidebar and dock are rendered outside `<Routes>` so they persist across navigations.

---

## How Blog Posts Work

### Adding a post

1. Create a `.md` file in `src/blog/`. The filename becomes the URL slug.
2. Add YAML frontmatter at the top:

```markdown
---
title: "My Post Title"
date: "2025-03-10"
description: "One-line summary shown in the Finder list."
tags: [cryptography, math, zk-proofs]
---

Your content here...
```

3. Rebuild (`npm run build`) or save during `npm run dev` — Vite picks it up automatically via `import.meta.glob`.

### How posts are loaded (`blogUtils.ts`)

`loadBlogPosts()` uses Vite's `import.meta.glob` with `{ query: '?raw', import: 'default', eager: true }` to bundle all `src/blog/*.md` files as raw strings at build time. It then:

1. Parses the YAML frontmatter with a simple `---`-delimited regex parser
2. Derives the slug from the filename (`my-post.md` → `my-post`)
3. Returns an array of `BlogPost` objects sorted newest-first by `date`

### Markdown features

- **GFM**: tables, strikethrough, task lists (`remark-gfm`)
- **Inline LaTeX**: `$x^2 + y^2 = z^2$`
- **Display LaTeX**: `$$\int_0^\infty e^{-x}\,dx = 1$$` — renders centered, uses KaTeX
- **Code blocks**: styled with theme CSS variables (no syntax highlighting library — theme-adaptive by design)
- **Obsidian compatibility**: standard frontmatter and math syntax work out of the box; wikilinks `[[...]]` render as plain text

---

## Themes

Six themes are defined in `App.css` via `[data-theme]` attribute on `<html>`:

| Name | Base bg | Accent | Strong accent |
|---|---|---|---|
| `dark` (default) | `#1f2430` Ayu Mirage | cyan | orange |
| `light` | `#f4f6fb` | sky blue | violet |
| `purple` | `#170f24` | ice blue | pink |
| `red` | `#251112` | salmon | gold |
| `blue` | `#0f1729` | steel blue | lavender |
| `green` | `#101d16` | mint | lime |

Every colour in the UI uses a CSS custom property (`--bg-page`, `--accent`, `--text-muted`, etc.) so all components are automatically theme-adaptive. Never hardcode a colour directly in a component.

**Switching theme at runtime:** type `theme [name]` in the terminal (e.g. `theme purple`). The choice is persisted in `localStorage` under `preferredTheme`.

---

## Terminal Commands

Commands are defined in `App.tsx`. To add a new command:

1. Add its name to the `KnownCommand` union type
2. Add it to `KNOWN_COMMANDS` (controls the `isKnownCommand` check)
3. Add a description to `commandDescriptions` (shown by `help`)
4. Add a `{entry.baseCommand === 'yourcommand' && (...)}` block inside the terminal output map

Current commands:

| Command | Output |
|---|---|
| `help` | Lists all commands |
| `ls` | Lists blog posts as clickable filenames (ls -l style) |
| `projects` | Project cards grid |
| `work` | Work experience cards |
| `awards` | Award cards |
| `classes` | CS + Math coursework |
| `resume` | Inline PDF viewer + download |
| `hobbies` | Hobby cards (click to expand modal) |
| `clear` | Clears history |
| `theme [name\|toggle\|current\|help]` | Switches color theme |

### Terminal state

| State | Persisted? | Purpose |
|---|---|---|
| `history: HistoryEntry[]` | `localStorage` (`terminalHistory`) | Ordered list of entered commands |
| `theme: ThemeScheme` | `localStorage` (`preferredTheme`) | Active color theme |
| `activeHobby` | No | Which hobby modal is open |
| `expandedImage` | No | Which image lightbox is open |

The terminal body uses a **ref callback** (`mountTerminalBody`) instead of a plain `useRef`. This is intentional: when the user navigates away to `/blog` and back to `/`, the terminal DOM unmounts and remounts, resetting the scroll position. The ref callback fires on remount and scrolls to `scrollHeight`, restoring the view to the last command.

---

## Component Architecture

```
main.tsx
└── BrowserRouter
    └── App                    (sidebar + routes + dock + modals)
        ├── <aside>.sidebar    (always rendered, all routes)
        ├── .app-column
        │   ├── .app-view
        │   │   └── <Routes>
        │   │       ├── /           → terminal JSX (inline in App)
        │   │       ├── /blog       → <Finder />
        │   │       └── /blog/:slug → <BlogPost />
        │   └── <Dock />       (useLocation + useNavigate)
        └── modals             (hobby modal, image lightbox — portal-style fixed overlays)
```

`Finder` and `BlogPost` each call `loadBlogPosts()` at **module level** (outside the component), so the glob import runs once at bundle time and never on re-render.

`BlogPost` uses `createPortal(…, document.body)` for its fullscreen overlay, so it renders above the sidebar/dock without needing z-index hacks in the layout.

---

## Dock

Two app icons sit at the bottom of the right panel:

- **Terminal** — navigates to `/`
- **Blog** — navigates to `/blog`

The active app gets a highlighted background (`--accent-soft` + `--accent-soft-border`). The icons are inline SVGs with props-driven fill/stroke so active vs. inactive state is controlled directly in JSX without CSS class mutations.

---

## TypeScript Notes

- `verbatimModuleSyntax: true` — type-only imports **must** use `import type { … }`
- `erasableSyntaxOnly: true` — no `const enum`, no `namespace`
- `noUnusedLocals` + `noUnusedParameters` — every variable and parameter must be used
- The React Compiler (`babel-plugin-react-compiler`) runs on all source files; follow [Rules of React](https://react.dev/reference/rules) strictly

---

## Development

```bash
npm run dev      # Start dev server (http://localhost:5173)
npm run build    # Type-check + bundle for production
npm run lint     # ESLint
npm run preview  # Preview production build locally
```

For production deployment, configure your host to redirect all paths to `index.html` (standard SPA routing). On Netlify: add `_redirects` with `/* /index.html 200`. On Vercel: add `vercel.json` with rewrites.
