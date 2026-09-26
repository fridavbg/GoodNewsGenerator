import { z } from 'zod';
import { ArticleSchema } from './article';

export const SearchRequestSchema = z.object({
  topic: z.string().trim().min(1, 'Topic is required'),
  limit: z.number().int().min(1).max(100).default(10),
});

export const SearchResponseSchema = z.object({
  topic: z.string(),
  count: z.number(),
  results: z.array(ArticleSchema),
  message: z.string().optional(),
});

export type SearchRequest = z.infer<typeof SearchRequestSchema>;
export type SearchResponse = z.infer<typeof SearchResponseSchema>;
