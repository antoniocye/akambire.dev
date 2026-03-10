---
title: Welcome to the blog
date: 2026-03-10
updated: 2026-03-10
description: A quick overview of how the Finder-style blog works and where new markdown notes should live.
tags:
  - notes
  - website
  - finder
---

# Welcome

This blog lives inside the same app as the terminal.

## How it works

- The **Finder** view reads markdown files from `src/content/blog/`
- The **Terminal** view has an `ls` command that lists those same files
- Clicking a file from either view opens the post in `/blog/<slug>`

## Obsidian-friendly workflow

You can drop normal markdown notes in the folder and they will render here.

```md
---
title: My post title
date: 2026-03-10
updated: 2026-03-10
tags:
  - cryptography
  - notes
---
```

> The theme stays synced with the rest of the portfolio, so the Finder and Terminal always share the same palette.

| Feature | Where |
| --- | --- |
| File list | Finder sidebar |
| Sorting | Finder toolbar |
| Quick open | `ls` in Terminal |
