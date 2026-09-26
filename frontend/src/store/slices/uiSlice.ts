/**
 * Redux UI Slice
 * Manages UI state: favorites and search history
 * Includes localStorage persistence
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Article } from './newsSlice';

export interface UIState {
    favorites: Article[];
    searchHistory: string[];
}

const initialState: UIState = {
    favorites: [],
    searchHistory: [],
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        /**
         * Toggle favorite status for an article
         * Adds if not present, removes if already present
         */
        toggleFavorite: (state, action: PayloadAction<Article>) => {
            const article = action.payload;
            const index = state.favorites.findIndex((fav) => fav.id === article.id);

            if (index >= 0) {
                // Remove if already favorite
                state.favorites.splice(index, 1);
            } else {
                // Add if not favorite
                state.favorites.push(article);
            }
        },

        /**
         * Remove specific favorite by article ID
         */
        removeFavorite: (state, action: PayloadAction<string>) => {
            state.favorites = state.favorites.filter(
                (fav) => fav.id !== action.payload
            );
        },

        /**
         * Clear all favorites
         */
        clearFavorites: (state) => {
            state.favorites = [];
        },

        /**
         * Add topic to search history
         * Auto-deduplicates (removes if exists, adds to end)
         * Maintains max 10 items
         */
        addToHistory: (state, action: PayloadAction<string>) => {
            const topic = action.payload.trim();

            if (!topic) return;

            // Remove if already exists
            state.searchHistory = state.searchHistory.filter((t) => t !== topic);

            // Add to end
            state.searchHistory.push(topic);

            // Keep only last 10
            if (state.searchHistory.length > 10) {
                state.searchHistory = state.searchHistory.slice(-10);
            }
        },

        /**
         * Remove specific topic from history
         */
        removeFromHistory: (state, action: PayloadAction<string>) => {
            state.searchHistory = state.searchHistory.filter(
                (topic) => topic !== action.payload
            );
        },

        /**
         * Clear all search history
         */
        clearHistory: (state) => {
            state.searchHistory = [];
        },

        /**
         * Set favorites from localStorage (hydration)
         */
        setFavorites: (state, action: PayloadAction<Article[]>) => {
            state.favorites = action.payload;
        },

        /**
         * Set search history from localStorage (hydration)
         */
        setSearchHistory: (state, action: PayloadAction<string[]>) => {
            state.searchHistory = action.payload;
        },

        /**
         * Reset all UI state to initial
         */
        resetUI: () => initialState,
    },
});

export const {
    toggleFavorite,
    removeFavorite,
    clearFavorites,
    addToHistory,
    removeFromHistory,
    clearHistory,
    setFavorites,
    setSearchHistory,
    resetUI,
} = uiSlice.actions;

export default uiSlice.reducer;