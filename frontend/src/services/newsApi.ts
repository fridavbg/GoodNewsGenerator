/**
 * NewsAPI Service
 * Axios instance and API functions for fetching news articles
 */

import axios from 'axios';
import { NewsApiResponse, NormalizedArticle, NewsApiArticle } from './types';

const API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const BASE_URL = 'https://newsapi.org/v2';

if (!API_KEY) {
    console.warn('VITE_NEWS_API_KEY is not set in environment variables');
}

/**
 * Axios instance with base configuration
 */
const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 10000, // 10 second timeout
    params: {
        apiKey: API_KEY,
    },
});

/**
 * Response interceptor for error handling
 */
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        throw new Error(
            error.response?.data?.message ||
            error.message ||
            'Failed to fetch news articles'
        );
    }
);

/**
 * Transform NewsAPI article to normalized format
 */
function normalizeArticle(article: NewsApiArticle, index: number): NormalizedArticle {
    return {
        id: `${article.source.name}-${article.publishedAt}-${index}`,
        title: article.title,
        description: article.description || undefined,
        url: article.url,
        imageUrl: article.urlToImage || undefined,
        source: article.source.name,
        author: article.author || undefined,
        publishedAt: article.publishedAt,
        sentiment: undefined, // Can be populated by sentiment analysis later
        summary: undefined, // Can be populated by summarization later
    };
}

/**
 * Fetch top headlines by country
 */
export async function getTopHeadlines(country: string = 'us'): Promise<NormalizedArticle[]> {
    try {
        const response = await apiClient.get<NewsApiResponse>('/top-headlines', {
            params: {
                country,
                pageSize: 20,
            },
        });

        if (response.data.status === 'error') {
            throw new Error(response.data.message || 'API returned an error');
        }

        return response.data.articles.map((article, index) =>
            normalizeArticle(article, index)
        );
    } catch (error) {
        console.error('Error fetching top headlines:', error);
        throw error;
    }
}

/**
 * Search articles by query
 */
export async function searchArticles(
    query: string,
    sortBy: 'relevancy' | 'popularity' | 'publishedAt' = 'publishedAt',
    pageSize: number = 20
): Promise<NormalizedArticle[]> {
    try {
        const response = await apiClient.get<NewsApiResponse>('/everything', {
            params: {
                q: query,
                sortBy,
                pageSize,
                language: 'en',
            },
        });

        if (response.data.status === 'error') {
            throw new Error(response.data.message || 'API returned an error');
        }

        return response.data.articles.map((article, index) =>
            normalizeArticle(article, index)
        );
    } catch (error) {
        console.error('Error searching articles:', error);
        throw error;
    }
}

/**
 * Fetch articles by category
 */
export async function getArticlesByCategory(
    category: 'business' | 'entertainment' | 'general' | 'health' | 'science' | 'sports' | 'technology',
    country: string = 'us'
): Promise<NormalizedArticle[]> {
    try {
        const response = await apiClient.get<NewsApiResponse>('/top-headlines', {
            params: {
                category,
                country,
                pageSize: 20,
            },
        });

        if (response.data.status === 'error') {
            throw new Error(response.data.message || 'API returned an error');
        }

        return response.data.articles.map((article, index) =>
            normalizeArticle(article, index)
        );
    } catch (error) {
        console.error(`Error fetching ${category} articles:`, error);
        throw error;
    }
}

/**
 * Fetch articles from a specific source
 */
export async function getArticlesBySource(
    sourceId: string,
    pageSize: number = 20
): Promise<NormalizedArticle[]> {
    try {
        const response = await apiClient.get<NewsApiResponse>('/top-headlines', {
            params: {
                sources: sourceId,
                pageSize,
            },
        });

        if (response.data.status === 'error') {
            throw new Error(response.data.message || 'API returned an error');
        }

        return response.data.articles.map((article, index) =>
            normalizeArticle(article, index)
        );
    } catch (error) {
        console.error(`Error fetching articles from source ${sourceId}:`, error);
        throw error;
    }
}

export default apiClient;
