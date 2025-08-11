// Service Worker para Push Notifications

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
  event.waitUntil(clients.claim());
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

// Ultra Performance Cache Management
const CACHE_NAME = 'satoshi-ultra-v2';
const STATIC_CACHE = 'satoshi-static-v2';
const DYNAMIC_CACHE = 'satoshi-dynamic-v2';

// Critical resources to cache immediately
const criticalResources = [
  '/',
  '/dashboard',
  '/select-opponent',
  '/src/index.css',
  '/lovable-uploads/360967fa-b367-4de6-a8a1-bcd4545eaa61.png',
  'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap'
];

// Ultra-fast cache-first strategy for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Critical assets - cache first with ultra-fast response
  if (criticalResources.some(resource => request.url.includes(resource)) ||
      request.url.includes('/assets/') ||
      request.url.includes('.woff2') ||
      request.url.includes('.ico') ||
      request.url.includes('.png') ||
      request.url.includes('.jpg') ||
      request.url.includes('.css')) {
    
    event.respondWith(
      caches.open(STATIC_CACHE).then(cache => 
        cache.match(request).then(response => {
          if (response) return response;
          
          return fetch(request).then(fetchResponse => {
            if (fetchResponse && fetchResponse.status === 200) {
              cache.put(request, fetchResponse.clone());
            }
            return fetchResponse;
          }).catch(() => {
            // Ultra-fast fallback for critical images
            if (request.url.includes('.png') || request.url.includes('.jpg')) {
              return new Response('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="#f3f4f6"/></svg>', {
                headers: { 'Content-Type': 'image/svg+xml' }
              });
            }
            return new Response('', { status: 404 });
          });
        })
      )
    );
  }
  
  // Dynamic content - network first with quick fallback
  else if (request.url.includes('/api/') || request.url.includes('supabase.co')) {
    event.respondWith(
      fetch(request, { timeout: 3000 }).then(response => {
        if (response && response.status === 200) {
          caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(request, response.clone());
          });
        }
        return response;
      }).catch(() => {
        return caches.match(request).then(cachedResponse => {
          return cachedResponse || new Response('{"error": "offline"}', {
            headers: { 'Content-Type': 'application/json' }
          });
        });
      })
    );
  }
});

// Aggressive cache cleanup on install
self.addEventListener('install', (event) => {
  console.log('SW: Ultra Performance Install');
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => cache.addAll(criticalResources)),
      self.skipWaiting()
    ])
  );
});

// Ultra-fast cache cleanup on activate
self.addEventListener('activate', (event) => {
  console.log('SW: Ultra Performance Activate');
  event.waitUntil(
    Promise.all([
      // Clean old caches aggressively
      caches.keys().then(cacheNames => 
        Promise.all(
          cacheNames.map(cacheName => {
            if (!cacheName.includes('v2')) {
              return caches.delete(cacheName);
            }
          })
        )
      ),
      // Claim all clients immediately
      clients.claim()
    ])
  );
});