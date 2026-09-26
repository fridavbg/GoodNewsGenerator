/**
 * useApi Hook
 * Custom React hook for fetching news data and managing loading/error states
 * Dispatches results to Redux store
 */

import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
    setArticles,
    setLoading,
    setError,
    setCurrentTopic,
} from '../store/slices/newsSlice';
import { addToHistory } from '../store/slices/uiSlice';
import {
    getTopHeadlines,
    searchArticles,
    getArticlesByCategory,
    getArticlesBySource,
} from '../services/newsApi';
import { NormalizedArticle } from '../services/types';

export interface UseApiOptions {
    autoFetch?: boolean; // Auto-fetch on mount
    addToSearchHistory?: boolean; // Auto-add query to search history
}

/**
 * Hook for fetching top headlines
 */
export function useTopHeadlines(country: string = 'us', options: UseApiOptions = {}) {
    const { autoFetch = true, addToSearchHistory = false } = options;
    const dispatch = useAppDispatch();
    const articles = useAppSelector((state) => state.news.articles);
    const loading = useAppSelector((state) => state.news.loading);
    const error = useAppSelector((state) => state.news.error);

    const fetch = useCallback(async () => {
        dispatch(setLoading(true));
        dispatch(setError(null));
        try {
            const data = await getTopHeadlines(country);
            dispatch(setArticles(data));
            dispatch(setCurrentTopic(`Top Headlines - ${country.toUpperCase()}`));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            dispatch(setError(errorMessage));
            console.error('useTopHeadlines error:', err);
        } finally {
            dispatch(setLoading(false));
        }
    }, [country, dispatch]);

    useEffect(() => {
        if (autoFetch) {
            fetch();
        }
    }, [autoFetch, fetch]);

    return { articles, loading, error, refetch: fetch };
}

/**
 * Hook for searching articles
 */
export function useSearchArticles(
    query: string,
    options: UseApiOptions = {}
) {
    const { autoFetch = false, addToSearchHistory = true } = options;
    const dispatch = useAppDispatch();
    const articles = useAppSelector((state) => state.news.articles);
    const loading = useAppSelector((state) => state.news.loading);
    const error = useAppSelector((state) => state.news.error);

    const fetch = useCallback(async () => {
        if (!query.trim()) {
            dispatch(setError('Search query cannot be empty'));
            return;
        }

        dispatch(setLoading(true));
        dispatch(setError(null));

        try {
            const data = await searchArticles(query);
            dispatch(setArticles(data));
            dispatch(setCurrentTopic(`Search: ${query}`));

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
        if (autoFetch && query.trim()) {
            fetch();
        }
    }, [autoFetch, query, fetch]);

    return { articles, loading, error, refetch: fetch };
}

/**
 * Hook for fetching articles by category
 */
export function useArticlesByCategory(
    category: 'business' | 'entertainment' | 'general' | 'health' | 'science' | 'sports' | 'technology',
    country: string = 'us',
    options: UseApiOptions = {}
) {
    const { autoFetch = true, addToSearchHistory = false } = options;
    const dispatch = useAppDispatch();
    const articles = useAppSelector((state) => state.news.articles);
    const loading = useAppSelector((state) => state.news.loading);
    const error = useAppSelector((state) => state.news.error);

    const fetch = useCallback(async () => {
        dispatch(setLoading(true));
        dispatch(setError(null));

        try {
            const data = await getArticlesByCategory(category, country);
            dispatch(setArticles(data));
            dispatch(setCurrentTopic(`${category.charAt(0).toUpperCase() + category.slice(1)}`));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            dispatch(setError(errorMessage));
            console.error('useArticlesByCategory error:', err);
        } finally {
            dispatch(setLoading(false));
        }
    }, [category, country, dispatch]);

    useEffect(() => {
        if (autoFetch) {
            fetch();
        }
    }, [autoFetch, fetch]);

    return { articles, loading, error, refetch: fetch };
}

/**
 * Hook for fetching articles by source
 */
export function useArticlesBySource(
    sourceId: string,
    options: UseApiOptions = {}
) {
    const { autoFetch = true, addToSearchHistory = false } = options;
    const dispatch = useAppDispatch();
    const articles = useAppSelector((state) => state.news.articles);
    const loading = useAppSelector((state) => state.news.loading);
    const error = useAppSelector((state) => state.news.error);

    const fetch = useCallback(async () => {
        if (!sourceId.trim()) {
            dispatch(setError('Source ID cannot be empty'));
            return;
        }

        dispatch(setLoading(true));
        dispatch(setError(null));

        try {
            const data = await getArticlesBySource(sourceId);
            dispatch(setArticles(data));
            dispatch(setCurrentTopic(`Source: ${sourceId}`));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            dispatch(setError(errorMessage));
            console.error('useArticlesBySource error:', err);
        } finally {
            dispatch(setLoading(false));
        }
    }, [sourceId, dispatch]);

    useEffect(() => {
        if (autoFetch && sourceId.trim()) {
            fetch();
        }
    }, [autoFetch, fetch]);

    return { articles, loading, error, refetch: fetch };
}