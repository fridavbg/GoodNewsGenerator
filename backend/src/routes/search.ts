import { Router, Request, Response } from 'express';
import { searchNews, toArticle } from '../services/newsService';
import { analyzeArticle, filterPositiveNews } from '../services/claudeService';
import { asyncHandler, BadRequestError, AppError } from '../middleware/errorMiddleware';
import { SearchRequestSchema, type SearchResponse } from '@goodnews/shared';

const router = Router();

/**
 * POST /api/search
 * Fetch articles for a topic, keep the positive ones, and have Claude explain why each is good news.
 * @param req - Body matching SearchRequestSchema: `topic` (required), `limit` (1–100, default 10)
 * @param res - Responds with a SearchResponse: `{ topic, count, results: Article[], message? }`,
 *   where each Article's `whyGood` is Claude's explanation, or null if analysis failed
 * @throws BadRequestError if the request body fails validation
 * @throws AppError on NewsAPI or other unexpected failures (a single failed analysis does not fail the request)
 *
 * @example
 * // Request
 * { "topic": "climate solutions", "limit": 5 }
 * // Response
 * {
 *   "topic": "climate solutions",
 *   "count": 3,
 *   "results": [{ "id": "a1b2c3d4e5f6", "title": "...", "url": "...", "whyGood": "..." }]
 * }
 */
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = SearchRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues.map((i) => i.message).join(', '));
    }
    const { topic, limit } = parsed.data;

    console.log(`[POST /api/search] Request:`, { topic, limit });

    try {
      console.log(`[search] Step 1: Fetching articles from NewsAPI...`);
      const articles = await searchNews(topic, limit);

      if (articles.length === 0) {
        console.warn(`[search] No articles found for topic: "${topic}"`);

        const body: SearchResponse = {
          topic,
          count: 0,
          results: [],
          message: 'No articles found for this topic',
        };
        res.json(body);
        return;
      }

      console.log(`[search] Step 2: Filtering for positive news...`);
      const positiveArticles = filterPositiveNews(articles);

      if (positiveArticles.length === 0) {
        console.warn(`[search] No positive articles found after filtering`);
        const body: SearchResponse = {
          topic,
          count: 0,
          results: [],
          message: 'No positive news found for this topic',
        };
        res.json(body);
        return;
      }

      console.log(`[search] Step 3: Analyzing ${positiveArticles.length} articles...`);
      const results = await Promise.all(
        positiveArticles.map(async (article) => {
          try {
            const analysis = await analyzeArticle(article, topic);
            return toArticle(article, analysis);
          } catch (analyzeError) {
            console.error(`[search] Error analyzing article "${article.title}":`, analyzeError);
            return toArticle(article, null);
          }
        })
      );

      console.log(`[search] ✓ Successfully processed ${results.length} articles`);

      const body: SearchResponse = { topic, count: results.length, results };
      res.json(body);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500
      );
    }
  })
);

export default router;
