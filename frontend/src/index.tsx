import React from 'react';
import ReactDOM from 'react-dom/client';
import AppWithRedux from './AppRedux';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <AppWithRedux />
  </React.StrictMode>
);