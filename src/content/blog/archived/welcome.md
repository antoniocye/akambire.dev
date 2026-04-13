---
title: Welcome to the blog
date: 2026-04-13
summary: Math, a code block, and how this thing works.
---

This post lives at `src/content/blog/posts/welcome.md`. Add more `.md` files in that folder — they are picked up automatically at build time.

Inline math: Euler says $e^{i\pi} + 1 = 0$.

Display math:

$$
\int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt{\pi}
$$

A little code:

```python
def greet(name: str) -> str:
    return f"hello, {name}"
```

**PDF posts** go in `public/blog/` and are registered in `src/content/blog/pdf-posts.json` (see that file for the shape).
