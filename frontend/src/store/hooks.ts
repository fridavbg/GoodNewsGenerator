/**
 * Redux Hooks
 * Pre-typed useAppDispatch and useAppSelector for type safety
 */

import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './store';

/**
 * Pre-typed useAppDispatch hook
 * Use this instead of useDispatch() to get full type safety
 * @example const dispatch = useAppDispatch();
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * Pre-typed useAppSelector hook
 * Use this instead of useSelector() to get full type safety
 * @example const articles = useAppSelector(state => state.news.articles);
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;