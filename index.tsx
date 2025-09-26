

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  const registerServiceWorker = () => {
    // Construct an absolute URL to avoid cross-origin issues in sandboxed environments
    const swUrl = `${location.origin}/service-worker.js`;
    navigator.serviceWorker.register(swUrl)
      .then(registration => {
        console.log('[GARVIS PWA] Service Worker registered successfully. Scope:', registration.scope);
      })
      .catch(error => {
        console.error('[GARVIS PWA] Service Worker registration failed:', error);
      });
  };

  // Check if the page is already loaded.
  if (document.readyState === 'complete') {
    registerServiceWorker();
  } else {
    window.addEventListener('load', registerServiceWorker);
  }
}