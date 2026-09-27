/**
 * useApi Hook
 * Custom React hook for fetching news data and managing loading/error states
 * Dispatches results to Redux store
 */

import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
    setArticles,
    setLoading,
    setError,
    setCurrentTopic,
} from '../store/slices/newsSlice';
import { addToHistory } from '../store/slices/uiSlice';
import { searchGoodNews } from '../services/newsApi';

export interface UseApiOptions {
    autoFetch?: boolean;
    addToSearchHistory?: boolean;
}

/**
 * Hook for searching articles
 */
export function useSearchArticles(
    query: string,
    options: UseApiOptions = {}
) {
    const { autoFetch = false, addToSearchHistory = false } = options;
    const dispatch = useAppDispatch();
    const articles = useAppSelector((state) => state.news.articles);
    const loading = useAppSelector((state) => state.news.loading);
    const error = useAppSelector((state) => state.news.error);

    const load = useCallback(async () => {
        if (!query.trim()) {
            dispatch(setError('Search query cannot be empty'));
            return;
        }

        dispatch(setLoading(true));
        dispatch(setError(null));

        try {
            const data = await searchGoodNews(query);
            dispatch(setArticles(data.results));
            dispatch(setCurrentTopic(`Search: ${data.topic}`));

            // Add to search history if enabled
            if (addToSearchHistory) {
                dispatch(addToHistory(query));
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            dispatch(setError(errorMessage));
            console.error('useSearchArticles error:', err);
        } finally {
            dispatch(setLoading(false));
        }
    }, [query, dispatch, addToSearchHistory]);

    useEffect(() => {
        if (autoFetch) {
            load();
        }
    }, [autoFetch, load]);

    return { articles, loading, error, refetch: load };
}
