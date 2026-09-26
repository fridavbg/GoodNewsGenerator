import { config } from '../config';
import Anthropic from '@anthropic-ai/sdk';
import { ExternalApiError } from '../middleware/errorMiddleware';

const client = new Anthropic({
  apiKey: config.ANTHROPIC_API_KEY,
});

export interface Article {
  title: string;
  description: string;
  url: string;
  source: { name: string };
  urlToImage?: string;
  publishedAt: string;
}


/**
 * Analyze a single article using Claude API
 * @param article - The article to analyze
 * @param topic - The search topic for context
 * @returns Analysis string explaining why this is good news
 */
export async function analyzeArticle(
  article: Article,
  topic: string
): Promise<string> {
    try {
      if (config.MOCK_MODE) {
        console.log(`[MOCK] Analyzing article: "${article.title}" for topic: "${topic}"`);
        return generateMockAnalysis(article, topic);
      }

      console.log(`[CLAUDE API] Analyzing article: "${article.title}"`);

      const prompt = `
      Article Title: ${article.title}
      Description: ${article.description}
 
      User searched for: "${topic}"
 
      Briefly explain (1-2 sentences) why this article is positive news and relevant to "${topic}".
      Focus on progress, solutions, breakthroughs, or hopeful developments.
    `;

      const message = await client.messages.create({
        model: config.CLAUDE_MODEL,
        max_tokens: 150,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const analysis = message.content
        .filter((block) => block.type === 'text')
        .map((block) => (block as { type: 'text'; text: string }).text)
        .join('\n')
        .trim();

      if (!analysis) {
        throw new ExternalApiError(
          'Claude returned empty response',
          'Anthropic',
        );
      }

      console.log(`[CLAUDE API] ✓ Analysis complete for: "${article.title}"`);
      return analysis;
    } catch (error) {
      console.error(`[ERROR] Claude API error:`, error);

      if (error instanceof Error) {
        if (error.message.includes('401')) {
          throw new ExternalApiError(
            'Invalid Anthropic API key',
            'Anthropic',
            error,
          );
        }
        if (error.message.includes('429')) {
          throw new ExternalApiError(
            'Claude API rate limit exceeded. Try again later.',
            'Anthropic',
            error,
          );
        }
        if (error.message.includes('timeout')) {
          throw new ExternalApiError(
            'Claude API request timed out. Try again.',
            'Anthropic',
            error,
          );
        }
      }

      throw new ExternalApiError(
        'Failed to analyze article with Claude API',
        'Anthropic',
        error,
      );
    }
}
/**
 * Filter articles to only positive/good news using keyword heuristics
 * @param articles - Articles to filter
 * @returns Filtered articles matching positive news keywords
 */
export function filterPositiveNews(articles: Article[]): Article[] {
  const positiveKeywords = [
    'breakthrough',
    'success',
    'innovation',
    'progress',
    'recovery',
    'advance',
    'develop',
    'new',
    'technology',
    'solution',
    'award',
    'discover',
    'improve',
    'record',
    'growth',
    'expand',
    'launch',
    'invest',
    'partnership',
    'milestone',
    'achievement',
    'positive',
    'opportunity',
    'hope',
    'better',
    'renewable',
    'sustainable',
    'eco-friendly',
  ];

  const filtered = articles.filter((article) => {
    const titleLower = article.title.toLowerCase();
    const descriptionLower = (article.description || '').toLowerCase();
    const combined = `${titleLower} ${descriptionLower}`;

    return positiveKeywords.some((keyword) => combined.includes(keyword));
  });

  console.log(
    `[FILTER] Found ${filtered.length} positive articles from ${articles.length} total`,
  );
  return filtered;
}

/**
 * Generate mock analysis for testing/development
 */
function generateMockAnalysis(article: Article, topic: string): string {
  const mockAnalyses = [
    `This article demonstrates real progress in ${topic}, highlighting innovative solutions that are making a tangible difference in the field.`,
    `Exciting developments in ${topic} show how collaboration and forward-thinking approaches are creating positive outcomes.`,
    `This breakthrough in ${topic} represents a significant step forward, demonstrating the power of sustained effort and research.`,
    `Evidence of growth and positive momentum in ${topic}, showing that meaningful change is possible.`,
    `This story exemplifies the kind of innovation in ${topic} that gives hope for a better future.`,
  ];

  const random = Math.floor(Math.random() * mockAnalyses.length);
  return mockAnalyses[random];
}
