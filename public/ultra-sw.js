// FASE 2: Service Worker Ultra-Otimizado para cache agressivo
const CACHE_NAME = 'ultra-cache-v1';
const CRITICAL_CACHE = 'ultra-critical-v1';
const QUERY_CACHE = 'ultra-queries-v1';

// Recursos críticos para cache instantâneo
const CRITICAL_RESOURCES = [
  '/',
  '/dashboard',
  '/social',
  '/profile',
  '/manifest.json',
  '/placeholder.svg'
];

// Recursos estáticos para cache longo
const STATIC_RESOURCES = [
  '/assets/index.css',
  '/assets/index.js'
];

// Instalar service worker e cache crítico
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      // Cache crítico para recursos essenciais
      caches.open(CRITICAL_CACHE).then((cache) => {
        return cache.addAll(CRITICAL_RESOURCES);
      }),
      // Cache estático para assets
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(STATIC_RESOURCES);
      })
    ])
  );
  self.skipWaiting();
});

// Ativar e limpar caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME && 
                   cacheName !== CRITICAL_CACHE && 
                   cacheName !== QUERY_CACHE;
          })
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
  self.clients.claim();
});

// Estratégia de cache inteligente
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Rotas críticas - Cache First com fallback
  if (CRITICAL_RESOURCES.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Atualizar cache em background
          fetch(request).then((response) => {
            if (response.status === 200) {
              caches.open(CRITICAL_CACHE).then((cache) => {
                cache.put(request, response.clone());
              });
            }
          }).catch(() => {});
          
          return cachedResponse;
        }
        
        return fetch(request).then((response) => {
          if (response.status === 200) {
            caches.open(CRITICAL_CACHE).then((cache) => {
              cache.put(request, response.clone());
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // APIs Supabase - Cache com TTL
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(
      handleSupabaseRequest(request)
    );
    return;
  }

  // Assets estáticos - Cache First
  if (request.destination === 'script' || 
      request.destination === 'style' || 
      request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        return cachedResponse || fetch(request).then((response) => {
          if (response.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, response.clone());
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // Outras requests - Network First
  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request);
    })
  );
});

// Handler especial para Supabase com cache inteligente
async function handleSupabaseRequest(request) {
  const url = new URL(request.url);
  
  // Dashboard data - cache por 5 minutos
  if (url.pathname.includes('rpc/get_dashboard_data_optimized')) {
    const cacheKey = 'dashboard-' + extractUserIdFromRequest(request);
    const cached = await getCachedWithTTL(cacheKey, 5 * 60 * 1000); // 5 min
    
    if (cached) {
      return new Response(JSON.stringify(cached), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    try {
      const response = await fetch(request);
      if (response.ok) {
        const data = await response.clone().json();
        await setCachedWithTTL(cacheKey, data, 5 * 60 * 1000);
      }
      return response;
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Network error' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // Request normal
  try {
    const response = await fetch(request);
    if (response.ok && request.method === 'GET') {
      const data = await response.clone().json();
      await setCachedWithTTL(request.url, data, 2 * 60 * 1000);
    }
    return response;
  } catch (error) {
    const cached = await getCachedWithTTL(request.url);
    if (cached) {
      return new Response(JSON.stringify(cached), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    throw error;
  }
}

// Cache com TTL usando Cache API
async function getCachedWithTTL(key, ttl = Infinity) {
  try {
    const cache = await caches.open(QUERY_CACHE);
    const response = await cache.match(key);
    
    if (response) {
      const cached = await response.json();
      const age = Date.now() - cached.timestamp;
      
      if (age < ttl) {
        return cached.data;
      } else {
        cache.delete(key);
      }
    }
  } catch (error) {
    console.debug('Cache read error:', error);
  }
  return null;
}

async function setCachedWithTTL(key, data, ttl) {
  try {
    const cache = await caches.open(QUERY_CACHE);
    const cacheData = {
      data,
      timestamp: Date.now(),
      ttl
    };
    
    const response = new Response(JSON.stringify(cacheData), {
      headers: { 'Content-Type': 'application/json' }
    });
    
    await cache.put(key, response);
  } catch (error) {
    console.debug('Cache write error:', error);
  }
}

// Helper para extrair user ID das requests
function extractUserIdFromRequest(request) {
  try {
    const url = new URL(request.url);
    const params = url.searchParams;
    return params.get('target_user_id') || 'anonymous';
  } catch {
    return 'anonymous';
  }
}