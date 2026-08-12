Drop PDF files here (e.g. notes.pdf).

Then add an entry to src/content/blog/pdf-posts.json with:
- slug: URL-safe id (used in #blog/your-slug)
- title, date, file: must match the filename in this folder

The site serves them at /blog/your-file.pdf. From the blog index, a PDF card opens that URL in a new browser tab (no in-app reader).

Interactive HTML posts live in their own folders under public/blog/.

Then add an entry to src/content/blog/interactive-posts.json with:
- slug: URL-safe id (used in #blog/your-slug)
- title, date, path: relative path under public/blog/
- description: short text for the blog card

The blog index opens an interactive post in a new browser tab so that its full layout and controls remain intact.
