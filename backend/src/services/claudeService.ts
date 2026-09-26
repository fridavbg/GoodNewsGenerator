import Anthropic from '@anthropic-ai/sdk';

const MOCK_MODE = process.env.MOCK_CLAUDE === 'true';
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface Article {
  title: string;
  description: string;
  url: string;
  source: { name: string };
  urlToImage?: string;
  publishedAt: string;
}

export async function analyzeArticle(article: Article): Promise<string> {
  if (MOCK_MODE) {
    // Mock response (free, instant)
    return `Why this is good news: This article demonstrates positive progress in ${article.title.toLowerCase()}. It highlights constructive solutions and real-world improvements.`;
  }

  // Real Claude API call (costs money, only in Phase 4)
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 300,
    messages: [
      {
        role: 'user',
        content: `Analyze this news article and explain why it represents positive/constructive news. Be concise (2-3 sentences).

Title: ${article.title}
Content: ${article.description}

Format: "Why this is good news: [explanation]"`,
      },
    ],
  });

  const textContent = message.content.find((block) => block.type === 'text');
  return textContent && 'text' in textContent ? textContent.text : 'Unable to analyze';
}

export async function filterPositiveNews(articles: Article[]): Promise<Article[]> {
  // Filter articles that are likely positive (heuristic)
  const positiveKeywords = [
    'breakthrough',
    'success',
    'progress',
    'innovation',
    'recovery',
    'achievement',
    'growth',
    'improvement',
    'solution',
    'hope',
    'advance',
    'develop',
    'new',
    'technology',
  ];

  return articles.filter((article) => {
    const text = `${article.title} ${article.description}`.toLowerCase();
    return positiveKeywords.some((keyword) => text.includes(keyword));
  });
}