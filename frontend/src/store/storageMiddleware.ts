/**
 * Redux Middleware - Local Storage Sync
 * Automatically syncs favorites and search history to localStorage
 * on every state change
 */

import { Middleware } from '@reduxjs/toolkit';
import type { RootState } from './store';

export const storageMiddleware: Middleware<{}, RootState> =
    (store) => (next) => (action) => {
        // Call the next middleware
        const result = next(action);

        // Get updated state
        const state = store.getState();

        // Save favorites to localStorage
        try {
            localStorage.setItem('favorites', JSON.stringify(state.ui.favorites));
        } catch (error) {
            console.error('Failed to save favorites to localStorage:', error);
        }

        // Save search history to localStorage
        try {
            localStorage.setItem(
                'searchHistory',
                JSON.stringify(state.ui.searchHistory)
            );
        } catch (error) {
            console.error('Failed to save search history to localStorage:', error);
        }

        return result;
    };