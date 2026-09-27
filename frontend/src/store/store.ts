/**
 * Redux Store Configuration - Updated with Storage Middleware
 * Configures Redux store with newsSlice and uiSlice
 * Includes localStorage persistence via middleware
 */

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import newsReducer from './slices/newsSlice';
import uiReducer from './slices/uiSlice';
import { storageMiddleware } from './storageMiddleware';

const rootReducer = combineReducers({
    news: newsReducer,
    ui: uiReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

// Derived from the reducer (not the store) so middleware can reference it without a circular type
export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore localStorage serialization checks for Article objects
                ignoredActions: ['ui/setFavorites', 'ui/setSearchHistory', 'ui/toggleFavorite'],
                ignoredPaths: ['ui.favorites'],
            },
        }).concat(storageMiddleware),
    devTools: import.meta.env.DEV,
});

export type AppDispatch = typeof store.dispatch;
