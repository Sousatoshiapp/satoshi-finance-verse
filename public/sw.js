// Simple Service Worker - Mobile Compatible
const CACHE_NAME = 'satoshi-finance-v1';

// Basic installation
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker');
  self.skipWaiting();
});

// Basic activation
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker');
  self.clients.claim();
});

// Simple fetch handler - network first
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    fetch(event.request)
      .then(response => {
        return response;
      })
      .catch(() => {
        // Fallback to cache if network fails
        return caches.match(event.request);
      })
  );
});