import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
const notes = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/notes" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string(),
    date: z.coerce.date().optional(),
    tags: z.array(z.string()).optional(),
    lang: z.enum(["en", "ko"]).optional(),
    canonical: z.string().url().optional(),
    draft: z.boolean().optional(),
  }),
});
export const collections = { notes };
