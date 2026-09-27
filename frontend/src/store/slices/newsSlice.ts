import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Article } from '@goodnews/shared';
export type { Article };

export interface NewsState {
    articles: Article[];
    loading: boolean;
    error: string | null;
    currentTopic: string | null;
}

const initialState: NewsState = {
    articles: [],
    loading: false,
    error: null,
    currentTopic: null,
};

const newsSlice = createSlice({
    name: 'news',
    initialState,
    reducers: {
        /**
         * Set articles list
         * @param articles - Array of articles from API
         */
        setArticles: (state, action: PayloadAction<Article[]>) => {
            state.articles = action.payload;
            state.error = null;
        },

        /**
         * Set loading state
         * @param loading - Loading boolean
         */
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },

        /**
         * Set error message
         * @param error - Error message string
         */
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
            state.loading = false;
        },

        /**
         * Set current search topic
         * @param topic - Topic string
         */
        setCurrentTopic: (state, action: PayloadAction<string>) => {
            state.currentTopic = action.payload;
        },

        /**
         * Clear articles list
         */
        clearArticles: (state) => {
            state.articles = [];
        },

        /**
         * Clear error state
         */
        clearError: (state) => {
            state.error = null;
        },

        /**
         * Reset all news state to initial
         */
        resetNews: () => initialState,
    },
});

export const {
    setArticles,
    setLoading,
    setError,
    setCurrentTopic,
    clearArticles,
    clearError,
    resetNews,
} = newsSlice.actions;

export default newsSlice.reducer;
