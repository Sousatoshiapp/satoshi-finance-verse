// Service Worker para Cache Agressivo e Performance Extrema
const CACHE_NAME = 'satoshi-finance-v1';
const STATIC_CACHE = 'static-v1';
const API_CACHE = 'api-v1';
const IMAGE_CACHE = 'images-v1';

// Recursos críticos para cache imediato
const CRITICAL_RESOURCES = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/index.css',
  'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap'
];

// Estratégias de cache por tipo de recurso
const CACHE_STRATEGIES = {
  // Cache First para recursos estáticos
  static: ['js', 'css', 'woff2', 'woff', 'ttf'],
  // Network First para dados da API
  api: ['/api/', '/functions/'],
  // Stale While Revalidate para imagens
  images: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
  // Network Only para autenticação
  auth: ['/auth/', '/login', '/logout']
};

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker');
  
  event.waitUntil(
    Promise.all([
      // Cache recursos críticos
      caches.open(CACHE_NAME).then(cache => {
        console.log('[SW] Caching critical resources');
        return cache.addAll(CRITICAL_RESOURCES);
      }),
      // Skip waiting para ativação imediata
      self.skipWaiting()
    ])
  );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker');
  
  event.waitUntil(
    Promise.all([
      // Limpar caches antigos
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== STATIC_CACHE && 
                cacheName !== API_CACHE && 
                cacheName !== IMAGE_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Reivindicar controle de todas as páginas
      self.clients.claim()
    ])
  );
});

// Interceptação de requests com estratégias otimizadas
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorar requests não-GET e extensões do browser
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }
  
  event.respondWith(handleRequest(request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const extension = getFileExtension(url.pathname);
  
  try {
    // Estratégia Cache First para recursos estáticos
    if (CACHE_STRATEGIES.static.includes(extension)) {
      return await cacheFirst(request, STATIC_CACHE);
    }
    
    // Estratégia Network First para APIs
    if (CACHE_STRATEGIES.api.some(pattern => url.pathname.includes(pattern))) {
      return await networkFirst(request, API_CACHE);
    }
    
    // Estratégia Stale While Revalidate para imagens
    if (CACHE_STRATEGIES.images.includes(extension)) {
      return await staleWhileRevalidate(request, IMAGE_CACHE);
    }
    
    // Estratégia Network Only para autenticação
    if (CACHE_STRATEGIES.auth.some(pattern => url.pathname.includes(pattern))) {
      return await fetch(request);
    }
    
    // Estratégia padrão: Cache First com fallback
    return await cacheFirst(request, CACHE_NAME);
    
  } catch (error) {
    console.error('[SW] Request failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Cache First: Busca no cache primeiro, rede como fallback
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    // Background update para recursos críticos
    if (CRITICAL_RESOURCES.includes(request.url)) {
      fetch(request).then(response => {
        if (response.ok) {
          cache.put(request, response.clone());
        }
      }).catch(() => {});
    }
    return cached;
  }
  
  const response = await fetch(request);
  if (response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

// Network First: Busca na rede primeiro, cache como fallback
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      // Cache apenas responses de sucesso
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

// Stale While Revalidate: Retorna cache e atualiza em background
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  // Background fetch para atualizar cache
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => {});
  
  // Retorna cache se disponível, senão aguarda network
  return cached || await fetchPromise;
}

// Background Sync para requests offline
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Processar requests pendentes quando online
  const cache = await caches.open('pending-requests');
  const requests = await cache.keys();
  
  for (const request of requests) {
    try {
      await fetch(request);
      await cache.delete(request);
    } catch (error) {
      console.log('[SW] Background sync failed:', error);
    }
  }
}

// Push notifications para engajamento
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Nova atualização disponível!',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Abrir App',
        icon: '/favicon.ico'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/favicon.ico'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Satoshi Finance', options)
  );
});

// Utility functions
function getFileExtension(pathname) {
  const parts = pathname.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

// Performance monitoring
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PERFORMANCE_METRICS') {
    // Log performance metrics
    console.log('[SW] Performance metrics:', event.data.metrics);
  }
});