// PHASE 5: Production Hardened Service Worker
const CACHE_VERSION = 'satoshi-finance-v2-production';
const CACHE_NAMES = {
  static: `${CACHE_VERSION}-static`,
  dynamic: `${CACHE_VERSION}-dynamic`,
  api: `${CACHE_VERSION}-api`,
  offline: `${CACHE_VERSION}-offline`
};

const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/offline.html',
  '/lovable-uploads/360967fa-b367-4de6-a8a1-bcd4545eaa61.png'
];

// Production hardening features
const NETWORK_TIMEOUT = 3000;
const MAX_CACHE_ENTRIES = 100;
const CACHE_EXPIRATION = 7 * 24 * 60 * 60 * 1000; // 7 days

self.addEventListener('install', (event) => {
  console.log('Service Worker: Production Install');
  
  event.waitUntil(
    caches.open(CACHE_NAMES.static)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
      .catch(error => {
        console.error('SW Install Error:', error);
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Production Activate');
  
  event.waitUntil(
    Promise.all([
      // Clean old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (!Object.values(CACHE_NAMES).includes(cacheName)) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Claim clients
      clients.claim()
    ]).catch(error => {
      console.error('SW Activate Error:', error);
    })
  );
});

self.addEventListener('push', (event) => {
  console.log('Service Worker: Push Received', event);

  if (!event.data) {
    console.log('Push event but no data');
    return;
  }

  let data;
  try {
    data = event.data.json();
  } catch (error) {
    console.error('Error parsing push data:', error);
    data = {
      title: 'Nova Notificação',
      body: event.data.text() || 'Você tem uma nova notificação',
      icon: '/lovable-uploads/360967fa-b367-4de6-a8a1-bcd4545eaa61.png',
      badge: '/lovable-uploads/360967fa-b367-4de6-a8a1-bcd4545eaa61.png',
    };
  }

  const options = {
    body: data.body || 'Você tem uma nova notificação',
    icon: data.icon || '/lovable-uploads/360967fa-b367-4de6-a8a1-bcd4545eaa61.png',
    badge: data.badge || '/lovable-uploads/360967fa-b367-4de6-a8a1-bcd4545eaa61.png',
    image: data.image,
    tag: data.tag || 'satoshi-finance',
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false,
    vibrate: data.vibrate || [200, 100, 200],
    data: data.data || {},
    actions: data.actions || [],
    timestamp: Date.now(),
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Satoshi Finance', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification Click', event);

  event.notification.close();

  const notificationData = event.notification.data || {};
  let urlToOpen = '/dashboard';

  // Determinar URL baseada no tipo de notificação
  switch (notificationData.type) {
    case 'duel_invite':
      urlToOpen = '/duels';
      break;
    case 'duel_result':
      urlToOpen = '/duels';
      break;
    case 'achievement':
      urlToOpen = '/profile';
      break;
    case 'emergency':
      urlToOpen = '/dashboard';
      break;
    case 'mission':
      urlToOpen = '/missions';
      break;
    default:
      urlToOpen = notificationData.url || '/dashboard';
  }

  // Se clicou em uma ação específica
  if (event.action) {
    switch (event.action) {
      case 'accept_duel':
        urlToOpen = `/duels/${notificationData.duelId}`;
        break;
      case 'view_achievement':
        urlToOpen = '/profile';
        break;
      case 'contribute_emergency':
        urlToOpen = '/dashboard';
        break;
    }
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Procurar por uma janela já aberta
      const client = clientList.find((c) => c.url.includes(new URL(urlToOpen, self.location.origin).pathname));
      
      if (client) {
        // Focar na janela existente
        return client.focus();
      }
      
      // Abrir nova janela
      return clients.openWindow(new URL(urlToOpen, self.location.origin).href);
    })
  );
});

self.addEventListener('notificationclose', (event) => {
  console.log('Service Worker: Notification Closed', event);
  
  // Opcional: Enviar analítica sobre notificação fechada
  const notificationData = event.notification.data || {};
  if (notificationData.trackClose) {
    // Aqui você pode enviar dados de analítica
    console.log('Tracking notification close:', notificationData);
  }
});

// Handle push subscription changes
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('Service Worker: Push Subscription Changed', event);
  
  event.waitUntil(
    // Resubscrever automaticamente
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: event.oldSubscription?.options?.applicationServerKey
    }).then((newSubscription) => {
      // Enviar nova subscription para o servidor
      return fetch('/api/push/update-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oldEndpoint: event.oldSubscription?.endpoint,
          newSubscription: newSubscription.toJSON(),
        }),
      });
    }).catch((error) => {
      console.error('Failed to resubscribe:', error);
    })
  );
});

// Handle errors
self.addEventListener('error', (event) => {
  console.error('Service Worker Error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker Unhandled Rejection:', event.reason);
});

// PHASE 5: Advanced Cache Management with Production Hardening
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
  
  // API requests - Cache with network first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(event.request));
  }
  // Static assets - Cache first strategy
  else if (isStaticAsset(event.request)) {
    event.respondWith(handleStaticAsset(event.request));
  }
  // Dynamic content - Network first with fallback
  else if (url.origin === location.origin) {
    event.respondWith(handleDynamicContent(event.request));
  }
});

async function handleApiRequest(request) {
  try {
    // Network first with timeout
    const networkResponse = await Promise.race([
      fetch(request),
      timeoutPromise(NETWORK_TIMEOUT)
    ]);
    
    if (networkResponse && networkResponse.ok) {
      // Cache successful API responses
      const cache = await caches.open(CACHE_NAMES.api);
      cache.put(request, networkResponse.clone());
      await cleanupCache(cache, MAX_CACHE_ENTRIES);
    }
    
    return networkResponse;
  } catch (error) {
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('Serving API from cache:', request.url);
      return cachedResponse;
    }
    
    // Return offline response for critical endpoints
    return new Response(JSON.stringify({
      error: 'Offline',
      message: 'Network unavailable, please try again when online'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleStaticAsset(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
      const cache = await caches.open(CACHE_NAMES.static);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Failed to fetch static asset:', request.url);
    throw error;
  }
}

async function handleDynamicContent(request) {
  try {
    const networkResponse = await Promise.race([
      fetch(request),
      timeoutPromise(NETWORK_TIMEOUT)
    ]);
    
    if (networkResponse && networkResponse.ok) {
      const cache = await caches.open(CACHE_NAMES.dynamic);
      cache.put(request, networkResponse.clone());
      await cleanupCache(cache, MAX_CACHE_ENTRIES);
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html') || new Response('Offline', { status: 503 });
    }
    
    throw error;
  }
}

function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.pathname.includes('/assets/') ||
         url.pathname.includes('.css') ||
         url.pathname.includes('.js') ||
         url.pathname.includes('.ico') ||
         url.pathname.includes('.png') ||
         url.pathname.includes('.jpg') ||
         url.pathname.includes('.svg');
}

function timeoutPromise(timeout) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Network timeout')), timeout);
  });
}

async function cleanupCache(cache, maxEntries) {
  const keys = await cache.keys();
  if (keys.length > maxEntries) {
    const entriesToDelete = keys.slice(0, keys.length - maxEntries);
    await Promise.all(entriesToDelete.map(key => cache.delete(key)));
  }
}

// Background Sync for offline operations
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background Sync', event.tag);
  
  if (event.tag === 'offline-data-sync') {
    event.waitUntil(syncOfflineData());
  }
});

async function syncOfflineData() {
  try {
    // Notify main thread to sync offline data
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_OFFLINE_DATA',
        timestamp: Date.now()
      });
    });
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Periodic cleanup
setInterval(() => {
  cleanupExpiredCaches();
}, 60 * 60 * 1000); // Every hour

async function cleanupExpiredCaches() {
  try {
    const cacheNames = await caches.keys();
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      
      for (const request of keys) {
        const response = await cache.match(request);
        if (response) {
          const dateHeader = response.headers.get('date');
          if (dateHeader) {
            const cacheDate = new Date(dateHeader);
            if (Date.now() - cacheDate.getTime() > CACHE_EXPIRATION) {
              await cache.delete(request);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Cache cleanup failed:', error);
  }
}