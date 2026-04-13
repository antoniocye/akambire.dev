Drop PDF files here (e.g. notes.pdf).

Then add an entry to src/content/blog/pdf-posts.json with:
- slug: URL-safe id (used in #blog/your-slug)
- title, date, file: must match the filename in this folder

The site serves them at /blog/your-file.pdf. From the blog index, a PDF card opens that URL in a new browser tab (no in-app reader).
