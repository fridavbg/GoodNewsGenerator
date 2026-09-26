import dotenv from 'dotenv';
import axios from 'axios';
import { ExternalApiError, BadRequestError } from '../middleware/errorMiddleware';
import { Article } from './claudeService';
dotenv.config();

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';

// Create axios instance with logging
const newsApiClient = axios.create({
  baseURL: NEWS_API_BASE_URL,
  timeout: 10000, // 10 second timeout
});

// Request interceptor - log outgoing requests
newsApiClient.interceptors.request.use(
  (config) => {
    console.log(`[NewsAPI] → ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[NewsAPI] Request error:', error.message);
    return Promise.reject(error);
  },
);


// Response interceptor - log responses and handle errors
newsApiClient.interceptors.response.use(
  (response) => {
    console.log(`[NewsAPI] ← ${response.status} OK (${response.data.articles?.length || 0} articles)`);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(
        `[NewsAPI] Error: ${error.response.status} - ${error.response.data?.message || error.message}`,
      );
    } else if (error.request) {
      console.error(`[NewsAPI] No response from server:`, error.message);
    } else {
      console.error(`[NewsAPI] Error:`, error.message);
    }
    return Promise.reject(error);
  },
);

/**
 * Search for news articles by topic
 * @param topic - Search term (e.g., "climate solutions")
 * @param limit - Number of results to return (default 10)
 * @returns Array of articles
 */
export async function searchNews(topic: string, limit: number = 10): Promise<Article[]> {
  try {
    // Validate inputs
    if (!topic || topic.trim().length === 0) {
      throw new BadRequestError('Search topic cannot be empty');
    }

    if (limit < 1 || limit > 100) {
      throw new BadRequestError('Limit must be between 1 and 100');
    }

    if (!NEWS_API_KEY) {
      throw new Error('NEWS_API_KEY not configured');
    }

    console.log(`[searchNews] Searching for "${topic}" with limit ${limit}`);

    const response = await newsApiClient.get('/everything', {
      params: {
        q: topic,
        sortBy: 'publishedAt',
        language: 'en',
        pageSize: limit,
        apiKey: NEWS_API_KEY,
      },
    });

    const articles = response.data.articles || [];
    console.log(`[searchNews] ✓ Found ${articles.length} articles for "${topic}"`);

    return articles;
  } catch (error) {
    console.error(`[ERROR] searchNews failed:`, error);

    // Handle specific error cases
    if (error instanceof BadRequestError) {
      throw error;
    }

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new ExternalApiError(
          'Invalid NewsAPI key. Check your API_KEY in .env',
          'NewsAPI',
          error,
        );
      }

      if (error.response?.status === 429) {
        throw new ExternalApiError(
          'NewsAPI rate limit exceeded. Try again in a few minutes.',
          'NewsAPI',
          error,
        );
      }

      if (error.code === 'ECONNABORTED') {
        throw new ExternalApiError(
          'NewsAPI request timed out. Try again.',
          'NewsAPI',
          error,
        );
      }

      if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
        throw new ExternalApiError(
          'Could not connect to NewsAPI. Check your internet connection.',
          'NewsAPI',
          error,
        );
      }
    }

    if (error instanceof Error && error.message.includes('NEWS_API_KEY')) {
      throw new ExternalApiError(
        'NEWS_API_KEY environment variable is not set',
        'NewsAPI',
        error,
      );
    }

    throw new ExternalApiError(
      `Failed to fetch news from NewsAPI: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'NewsAPI',
      error,
    );
  }
}