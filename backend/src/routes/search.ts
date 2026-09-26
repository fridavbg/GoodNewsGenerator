import { Router, Request, Response } from 'express';
import { searchNews } from '../services/newsService';
import { analyzeArticle, filterPositiveNews } from '../services/claudeService';
import { asyncHandler, BadRequestError, AppError } from '../middleware/errorMiddleware';

const router = Router();

interface SearchRequest {
  topic?: string;
  limit?: number;
}

/**
 * POST /api/search
 * Search for positive news articles and analyze with Claude
 *
 * Request body:
 * {
 *   "topic": "climate solutions",
 *   "limit": 5
 * }
 *
 * Response:
 * {
 *   "topic": "climate solutions",
 *   "count": 3,
 *   "results": [
 *     {
 *       "article": { title, description, url, ... },
 *       "analysis": "Why this is good news..."
 *     }
 *   ]
 * }
 */
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { topic, limit = 10 } = req.body as SearchRequest;

    console.log(`[POST /api/search] Request:`, { topic, limit });

    // Validate input
    if (!topic || typeof topic !== 'string') {
      throw new BadRequestError('Topic is required and must be a string');
    }

    if (typeof limit !== 'number' || limit < 1 || limit > 100) {
      throw new BadRequestError('Limit must be a number between 1 and 100');
    }

    try {
      // Step 1: Fetch articles from NewsAPI
      console.log(`[search] Step 1: Fetching articles from NewsAPI...`);
      const articles = await searchNews(topic, limit);

      if (articles.length === 0) {
        console.warn(`[search] No articles found for topic: "${topic}"`);
        return res.json({
          topic,
          count: 0,
          results: [],
          message: 'No articles found for this topic',
        });
      }

      // Step 2: Filter for positive news
      console.log(`[search] Step 2: Filtering for positive news...`);
      const positiveArticles = filterPositiveNews(articles);

      if (positiveArticles.length === 0) {
        console.warn(`[search] No positive articles found after filtering`);
        return res.json({
          topic,
          count: 0,
          results: [],
          message: 'No positive news found for this topic',
        });
      }

      // Step 3: Analyze each article with Claude
      console.log(`[search] Step 3: Analyzing ${positiveArticles.length} articles...`);
      const results = await Promise.all(
        positiveArticles.map(async (article) => {
          try {
            const analysis = await analyzeArticle(article, topic);
            return {
              article,
              analysis,
            };
          } catch (analyzeError) {
            console.error(`[search] Error analyzing article "${article.title}":`, analyzeError);
            // Continue with other articles even if one fails
            return {
              article,
              analysis: 'Analysis unavailable (API error)',
              error: analyzeError instanceof Error ? analyzeError.message : 'Unknown error',
            };
          }
        }),
      );

      console.log(`[search] ✓ Successfully processed ${results.length} articles`);

      res.json({
        topic,
        count: results.length,
        results,
      });
    } catch (error) {
      // Re-throw to be caught by error middleware
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500,
      );
    }
  }),
);


export default router;
