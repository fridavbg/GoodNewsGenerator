import express, { Router, Request, Response } from 'express';
import { searchNews } from '../services/newsService';
import { analyzeArticle, filterPositiveNews } from '../services/claudeService';
import { NewsResult } from '../types';

const router = Router();

router.post('/search', async (req: Request, res: Response) => {
  try {
    const { topic, limit = 5 } = req.body;

    if (!topic) {
      res.status(400).json({ error: 'Topic is required' });
      return;
    }

    // Get news
    const articles = await searchNews(topic, limit);

    if (articles.length === 0) {
      res.status(404).json({ error: 'No articles found' });
      return;
    }

    // Filter positive news
    const positiveArticles = await filterPositiveNews(articles);

    // Analyze each article with Claude
    const results: NewsResult[] = await Promise.all(
      positiveArticles.slice(0, 5).map(async (article) => ({
        article,
        analysis: await analyzeArticle(article),
      }))
    );

    res.json({
      topic,
      count: results.length,
      results,
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
