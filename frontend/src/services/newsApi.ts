/**
 * Backend API client.
 * All news comes from our own backend; no third-party keys live in the browser.
 */
import axios from 'axios';
import type { SearchResponse } from '@goodnews/shared';

/**
 * Shared axios client for all backend requests.
 * @remarks Uses VITE_API_URL as base URL and a 30s timeout
 */
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 30000, // Claude analysis can take several seconds
});

/**
 * Normalize every failed request into a plain Error.
 * @param response - Successful responses pass through unchanged
 * @throws Error with the backend's `message`, falling back to axios's message or "Request failed"
 */
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message ?? error.message ?? 'Request failed';
        return Promise.reject(new Error(message));
    }
);

/**
 * Ask the backend for positive news about a topic.
 * @param topic - Search term (e.g., "climate solutions")
 * @param limit - Number of articles to fetch, 1–100 (default 10)
 * @returns SearchResponse with articles and Claude's `whyGood` explanations
 * @throws Error with the backend's message if the request fails
 */
export async function searchGoodNews(topic: string, limit = 10): Promise<SearchResponse> {
    const response = await apiClient.post<SearchResponse>('/api/search', { topic, limit });
    return response.data;
}
