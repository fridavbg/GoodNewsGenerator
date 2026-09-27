import { config } from '../config';
import Anthropic from '@anthropic-ai/sdk';
import { ExternalApiError } from '../middleware/errorMiddleware';
import type { NewsApiArticle } from '../types/newsApi';

/**
 * Shared Anthropic client for all Claude requests.
 * @remarks Authenticated with ANTHROPIC_API_KEY from config
 */
const client = new Anthropic({
  apiKey: config.ANTHROPIC_API_KEY,
});

/**
 * Ask Claude to explain in 1–2 sentences why an article is good news for a topic.
 * @param article - Raw NewsAPI article to analyze
 * @param topic - Search topic the explanation should relate to
 * @returns Short explanation of why the article is good news (mock text in MOCK_MODE)
 * @throws ExternalApiError on Claude failures (bad key, rate limit, timeout, empty response)
 */
export async function analyzeArticle(article: NewsApiArticle, topic: string): Promise<string> {
  try {
    if (config.MOCK_MODE) {
      console.log(`[MOCK] Analyzing article: "${article.title}" for topic: "${topic}"`);
      return generateMockAnalysis(article, topic);
    }

    console.log(`[CLAUDE API] Analyzing article: "${article.title}"`);

    const descriptionLine = article.description ? `Description: ${article.description}\n` : '';

    const prompt = `
      Article Title: ${article.title}
      ${descriptionLine}
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
      throw new ExternalApiError('Claude returned empty response', 'Anthropic');
    }

    console.log(`[CLAUDE API] ✓ Analysis complete for: "${article.title}"`);
    return analysis;
  } catch (error) {
    console.error(`[ERROR] Claude API error:`, error);

    if (error instanceof Error) {
      if (error.message.includes('401')) {
        throw new ExternalApiError('Invalid Anthropic API key', 'Anthropic', error);
      }
      if (error.message.includes('429')) {
        throw new ExternalApiError(
          'Claude API rate limit exceeded. Try again later.',
          'Anthropic',
          error
        );
      }
      if (error.message.includes('timeout')) {
        throw new ExternalApiError('Claude API request timed out. Try again.', 'Anthropic', error);
      }
    }

    throw new ExternalApiError('Failed to analyze article with Claude API', 'Anthropic', error);
  }
}

/**
 * Keep only articles whose title or description contains a positive keyword.
 * @param articles - Raw NewsAPI articles to filter
 * @returns Articles matching at least one keyword (case-insensitive)
 */
export function filterPositiveNews(articles: NewsApiArticle[]): NewsApiArticle[] {
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

  console.log(`[FILTER] Found ${filtered.length} positive articles from ${articles.length} total`);
  return filtered;
}

/**
 * Return a random canned analysis so development can run without calling Claude.
 * @param article - Article being analyzed (currently unused)
 * @param topic - Search topic inserted into the mock text
 * @returns One of several fixed explanations mentioning the topic
 */
function generateMockAnalysis(article: NewsApiArticle, topic: string): string {
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
