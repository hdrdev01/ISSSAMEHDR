import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppProvider } from './context/AppContext';
import { BookmarkProvider } from './context/BookmarkContext';
import './utils/i18n';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider>
      <BookmarkProvider>
        <App />
      </BookmarkProvider>
    </AppProvider>
  </React.StrictMode>
);
