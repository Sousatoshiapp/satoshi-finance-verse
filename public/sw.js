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

// Cache management (opcional, para melhor performance)
const CACHE_NAME = 'satoshi-finance-v1';
const urlsToCache = [
  '/',
  '/dashboard',
  '/lovable-uploads/360967fa-b367-4de6-a8a1-bcd4545eaa61.png',
];

self.addEventListener('fetch', (event) => {
  // Só fazer cache de requests importantes
  if (event.request.method === 'GET' && 
      (event.request.url.includes('/assets/') || 
       event.request.url.includes('.ico') ||
       event.request.url.includes('.png'))) {
    
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});