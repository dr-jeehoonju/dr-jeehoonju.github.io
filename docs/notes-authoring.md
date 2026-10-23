# Notes authoring

Add Markdown (`.md`) or MDX (`.mdx`) files in `src/content/notes/`. The file's id remains its `/notes/{id}/` address. Drafts are excluded from both the archive and generated article routes.

Use `title`, `description`, and `category`. Preserve compound category names: filters use the complete value. Add `lang: en` or `lang: ko`, a publication `date` in `YYYY-MM-DD` format, and `tags` for new writing. Quote dates so invalid calendar dates can be caught before YAML normalizes them. Tags are trimmed and deduplicated without changing case. Existing notes have no verified publication dates; they display “Undated” and follow dated entries. Equal dates use the entry id as a stable tie breaker. Dates are formatted in UTC.

`canonical` is an optional absolute URL. Without it, the article uses its own site URL. `republished` is an optional array of `{name, url}` objects; every URL must use HTTPS and point to an actual published article. Omit it until a destination is published. There are no default destinations or publication claims.

For a captioned image, import the figure component in MDX:

```mdx
import NoteFigure from "../../components/NoteFigure.astro";

<NoteFigure
  src="/images/clinic.webp"
  alt="Seating and a low table in the waiting space"
  width={960}
  height={640}
  caption="The waiting space in Seoul."
/>
```

Use intrinsic dimensions and useful alt text distinct from the caption. The component preserves aspect ratio and loads lazily. Do not use image alt text as a caption.

Markdown tables receive column scopes and a named, keyboard-focusable scroll wrapper at build time. For an explicit caption and row headers, use a semantic MDX `<table>` with `<caption>` and `scope="col"` / `scope="row"` on its headers; it receives the same scroll wrapper. Fenced code receives a language label and keyboard-focusable local scrolling. Prefer fenced code to raw `<pre>` markup.

Normalize Obsidian wikilinks and embeds before adding content. Korean articles use native Korean fonts, keep-all word boundaries, and independent `lang="ko"` pages; independent essays have no translation relationship.
