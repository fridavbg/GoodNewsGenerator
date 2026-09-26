import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store/store';
import App from './App';

/**
 * Root App Component with Redux Provider
 * Redux store handles all state and localStorage persistence
 */
export default function AppWithRedux() {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
}