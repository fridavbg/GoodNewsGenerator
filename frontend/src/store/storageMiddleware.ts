/**
 * Redux Middleware - Local Storage Sync
 * Automatically syncs favorites and search history to localStorage
 * on every state change
 */

import { Middleware } from '@reduxjs/toolkit';
import type { RootState } from './store';

export const storageMiddleware: Middleware<{}, RootState> = (store) => (next) => (action) => {
    const prevUi = store.getState().ui;
    const result = next(action);
    const nextUi = store.getState().ui;

    // Redux state is immutable: a changed slice is a new object, so !== means "something changed"
    if (nextUi === prevUi) {
        return result;
    }

    try {
        localStorage.setItem('favorites', JSON.stringify(nextUi.favorites));
        localStorage.setItem('searchHistory', JSON.stringify(nextUi.searchHistory));
    } catch (error) {
        // e.g. storage full or disabled in private browsing
        console.error('Failed to save UI state to localStorage:', error);
    }

    return result;
};
