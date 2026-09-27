import { createHash } from 'crypto';
import axios from 'axios';
import type { Article } from '@goodnews/shared';
import { config } from '../config';
import { ExternalApiError, BadRequestError } from '../middleware/errorMiddleware';
import type { NewsApiArticle } from '../types/newsApi';

const NEWS_API_BASE_URL = 'https://newsapi.org/v2';

/**
 * Shared axios client for all NewsAPI requests.
 * @remarks Presets the base URL, a 10s timeout and the X-Api-Key header
 */
const newsApiClient = axios.create({
  baseURL: NEWS_API_BASE_URL,
  timeout: 10000,
  headers: { 'X-Api-Key': config.NEWS_API_KEY },
});

/**
 * Log every outgoing NewsAPI request.
 * @param request - Axios request request (method and URL are logged)
 * @returns The unchanged request request
 * @throws Re-throws request setup errors after logging them
 */
newsApiClient.interceptors.request.use(
  (request) => {
    console.log(`[NewsAPI] → ${request.method?.toUpperCase()} ${request.url}`);
    return request;
  },
  (error) => {
    console.error('[NewsAPI] Request error:', error.message);
    return Promise.reject(error);
  }
);

/**
 * Log every NewsAPI response, including failures.
 * @param response - Axios response (status and article count are logged)
 * @returns The unchanged response
 * @throws Re-throws the error after logging it as a server error, no response, or setup error
 */
newsApiClient.interceptors.response.use(
  (response) => {
    console.log(
      `[NewsAPI] ← ${response.status} OK (${response.data.articles?.length || 0} articles)`
    );
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(
        `[NewsAPI] Error: ${error.response.status} - ${error.response.data?.message || error.message}`
      );
    } else if (error.request) {
      console.error(`[NewsAPI] No response from server:`, error.message);
    } else {
      console.error(`[NewsAPI] Error:`, error.message);
    }
    return Promise.reject(error);
  }
);

/**
 * Search NewsAPI for recent English articles matching a topic, newest first.
 * @param topic - Search term (e.g., "climate solutions")
 * @param limit - Number of results to return, 1–100 (default 10)
 * @returns Raw NewsAPI articles (empty array if none found)
 * @throws BadRequestError if the topic is empty or the limit is out of range
 * @throws ExternalApiError on NewsAPI failures (bad key, rate limit, timeout, network)
 */
export async function searchNews(topic: string, limit: number = 10): Promise<NewsApiArticle[]> {
  try {
    if (!topic || topic.trim().length === 0) {
      throw new BadRequestError('Search topic cannot be empty');
    }

    if (limit < 1 || limit > 100) {
      throw new BadRequestError('Limit must be between 1 and 100');
    }

    console.log(`[searchNews] Searching for "${topic}" with limit ${limit}`);

    const response = await newsApiClient.get<{ articles: NewsApiArticle[] }>('/everything', {
      params: {
        q: topic,
        sortBy: 'publishedAt',
        language: 'en',
        pageSize: limit,
      },
    });

    const articles = (response.data.articles ?? []).filter((a) => a.title !== '[Removed]');
    console.log(`[searchNews] ✓ Found ${articles.length} articles for "${topic}"`);

    return articles;
  } catch (error) {
    console.error(`[ERROR] searchNews failed:`, error);

    if (error instanceof BadRequestError) {
      throw error;
    }

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new ExternalApiError(
          'Invalid NewsAPI key. Check your NEWS_API_KEY in .env',
          'NewsAPI',
          error
        );
      }

      if (error.response?.status === 429) {
        throw new ExternalApiError(
          'NewsAPI rate limit exceeded. Try again in a few minutes.',
          'NewsAPI',
          error
        );
      }

      if (error.code === 'ECONNABORTED') {
        throw new ExternalApiError('NewsAPI request timed out. Try again.', 'NewsAPI', error);
      }

      if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
        throw new ExternalApiError(
          'Could not connect to NewsAPI. Check your internet connection.',
          'NewsAPI',
          error
        );
      }
    }

    throw new ExternalApiError(
      `Failed to fetch news from NewsAPI: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'NewsAPI',
      error
    );
  }
}

/**
 * Convert a raw NewsAPI article into the shared Article shape sent to the frontend.
 * The id is a short SHA-1 hash of the URL, so the same article always gets the same id.
 * @param raw - Article as returned by NewsAPI
 * @param whyGood - Optional explanation of why the article is good news
 * @returns Article ready for the client
 */
export function toArticle(raw: NewsApiArticle, whyGood: string | null = null): Article {
  return {
    id: createHash('sha1').update(raw.url).digest('hex').slice(0, 12),
    title: raw.title,
    description: raw.description,
    url: raw.url,
    imageUrl: raw.urlToImage,
    source: raw.source.name,
    author: raw.author,
    publishedAt: raw.publishedAt,
    whyGood,
  };
}
