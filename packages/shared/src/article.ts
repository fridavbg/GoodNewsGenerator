import { z } from 'zod';

export const ArticleSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  url: z.url(),
  imageUrl: z.string().nullable(),
  source: z.string(),
  author: z.string().nullable(),
  publishedAt: z.string(),
  whyGood: z.string().nullable(),
});

export type Article = z.infer<typeof ArticleSchema>;
