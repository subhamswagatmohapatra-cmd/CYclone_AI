import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

// Manage Service Worker registration safely
if ('serviceWorker' in navigator) {
  if (import.meta.env.DEV) {
    // In local development, unregister any active service worker to prevent caching Vite modules
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().catch(() => {});
      }
    });
  } else if (window.location.protocol.startsWith('http')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then(
        (reg) => {
          console.log('CycloneAI ServiceWorker registered:', reg.scope);
        },
        (err) => {
          console.log('CycloneAI ServiceWorker notice:', err);
        }
      );
    });
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
} else {
  console.error('Fatal: root element not found in document DOM');
}
