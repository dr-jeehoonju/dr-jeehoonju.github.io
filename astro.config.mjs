import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import rehypeNotes from "./src/lib/rehype-notes.mjs";
export default defineConfig({
  site: "https://jeehoonju.com",
  output: "static",
  trailingSlash: "always",
  markdown: { rehypePlugins: [rehypeNotes] },
  integrations: [
    react(),
    mdx(),
    sitemap({ filter: (url) => !url.includes("/book/received/") }),
  ],
});
