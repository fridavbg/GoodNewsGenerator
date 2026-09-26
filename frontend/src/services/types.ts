/**
 * API Response Types
 * Type definitions for NewsAPI responses
 */

export interface NewsApiArticle {
    source: {
        id: string | null;
        name: string;
    };
    author: string | null;
    title: string;
    description: string | null;
    url: string;
    urlToImage: string | null;
    publishedAt: string;
    content: string | null;
}

export interface NewsApiResponse {
    message: string;
    status: 'ok' | 'error';
    totalResults: number;
    articles: NewsApiArticle[];
}

export interface NewsApiError {
    status: 'error';
    code: string;
    message: string;
}

/**
 * Normalized Article type (matches Redux Article interface)
 * Transforms NewsAPI response into app-specific format
 */
export interface NormalizedArticle {
    id: string;
    title: string;
    description?: string;
    url: string;
    imageUrl?: string;
    source: string;
    author?: string;
    publishedAt: string;
    sentiment?: 'positive' | 'neutral' | 'negative';
    summary?: string;
}