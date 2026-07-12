import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element (#root) not found in index.html');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register the offline-shell service worker in production only, so local
// dev always sees fresh code instead of a stale cached bundle.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/matchday-copilot/sw.js').catch((err) => {
      console.warn('Service worker registration failed:', err);
    });
  });
}
