/**
 * Redux store
 * Combines the news and UI slices, restores saved favorites/history on startup,
 * and persists them back to localStorage via storageMiddleware.
 */

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import newsReducer from './slices/newsSlice';
import uiReducer, { type UIState } from './slices/uiSlice';
import { storageMiddleware } from './storageMiddleware';

const rootReducer = combineReducers({
    news: newsReducer,
    ui: uiReducer,
});

// Derived from the reducer (not the store) so middleware can reference it without a circular type
export type RootState = ReturnType<typeof rootReducer>;

/**
 * Read saved favorites and search history from localStorage.
 * localStorage is outside our control (old app versions, manual edits),
 * so anything unexpected falls back to empty instead of crashing the app.
 */
function loadUIState(): UIState {
    try {
        const favorites = JSON.parse(localStorage.getItem('favorites') ?? '[]');
        const searchHistory = JSON.parse(localStorage.getItem('searchHistory') ?? '[]');
        return {
            favorites: Array.isArray(favorites) ? favorites : [],
            searchHistory: Array.isArray(searchHistory) ? searchHistory : [],
        };
    } catch {
        return { favorites: [], searchHistory: [] };
    }
}

export const store = configureStore({
    reducer: rootReducer,
    preloadedState: { ui: loadUIState() },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(storageMiddleware),
    devTools: import.meta.env.DEV,
});

export type AppDispatch = typeof store.dispatch;
