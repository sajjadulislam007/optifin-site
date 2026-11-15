import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { docsLoader, i18nLoader } from "@astrojs/starlight/loaders";
import { docsSchema, i18nSchema } from "@astrojs/starlight/schema";

export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
  i18n: defineCollection({ loader: i18nLoader(), schema: i18nSchema() }),
  guides: defineCollection({
    loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/guides" }),
    schema: z.object({
      title: z.string(),
      description: z.string().max(170),
      published: z.coerce.date(),
      updated: z.coerce.date().optional(),
      readingMinutes: z.number().int().positive(),
      tag: z.string(),
    }),
  }),
};
