import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
const notes = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/notes" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string(),
    date: z
      .preprocess(
        (value) =>
          value instanceof Date && !Number.isNaN(value.valueOf())
            ? value.toISOString().slice(0, 10)
            : value,
        z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .refine((value) => {
            const date = new Date(`${value}T00:00:00Z`);
            return (
              !Number.isNaN(date.valueOf()) &&
              date.toISOString().slice(0, 10) === value
            );
          }, "Use a real calendar date in YYYY-MM-DD format"),
      )
      .optional(),
    tags: z
      .array(z.string().trim().min(1))
      .transform((tags) => [...new Set(tags)])
      .optional(),
    lang: z.enum(["en", "ko"]).optional(),
    canonical: z.url().optional(),
    draft: z.boolean().optional(),
    republished: z
      .array(
        z.object({
          name: z.string().trim().min(1),
          url: z.url({
            protocol: /^https$/,
            error: "Republication URLs must use absolute HTTPS URLs",
          }),
        }),
      )
      .optional(),
  }),
});
export const collections = { notes };
