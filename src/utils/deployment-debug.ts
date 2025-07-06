// Deployment-specific debugging utility
export const deploymentDebug = {
  init: () => {
    if (typeof window === 'undefined') return;
    
    console.log('🚀 DEPLOYMENT DEBUG INITIALIZED');
    console.log('📍 Current Environment:', {
      host: window.location.host,
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      origin: window.location.origin,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });
    
    // Monitor localStorage changes
    deploymentDebug.monitorLocalStorage();
    
    // Monitor URL changes
    deploymentDebug.monitorUrlChanges();
    
    // Monitor Supabase auth changes
    deploymentDebug.monitorSupabaseAuth();
  },
  
  monitorLocalStorage: () => {
    const originalSetItem = localStorage.setItem;
    const originalRemoveItem = localStorage.removeItem;
    
    localStorage.setItem = function(key: string, value: string) {
      if (key.includes('satoshi') || key.includes('supabase')) {
        console.log('💾 LocalStorage SET:', { key, value: value.substring(0, 100) + '...' });
      }
      originalSetItem.call(this, key, value);
    };
    
    localStorage.removeItem = function(key: string) {
      if (key.includes('satoshi') || key.includes('supabase')) {
        console.log('🗑️ LocalStorage REMOVE:', { key });
      }
      originalRemoveItem.call(this, key);
    };
  },
  
  monitorUrlChanges: () => {
    let currentUrl = window.location.href;
    
    const checkUrlChange = () => {
      if (window.location.href !== currentUrl) {
        console.log('🔄 URL CHANGE DETECTED:', {
          from: currentUrl,
          to: window.location.href,
          timestamp: new Date().toISOString()
        });
        currentUrl = window.location.href;
      }
    };
    
    // Check every second
    setInterval(checkUrlChange, 1000);
    
    // Also listen to popstate
    window.addEventListener('popstate', (event) => {
      console.log('⬅️ POPSTATE EVENT:', {
        state: event.state,
        url: window.location.href,
        timestamp: new Date().toISOString()
      });
    });
  },
  
  monitorSupabaseAuth: () => {
    // Monitor auth token in localStorage
    const monitorAuthToken = () => {
      const authToken = localStorage.getItem('sb-uabdmohhzsertxfishoh-auth-token');
      if (authToken) {
        try {
          const parsed = JSON.parse(authToken);
          console.log('🔑 SUPABASE AUTH TOKEN STATUS:', {
            hasAccessToken: !!parsed?.access_token,
            hasRefreshToken: !!parsed?.refresh_token,
            expiresAt: parsed?.expires_at,
            isExpired: parsed?.expires_at ? new Date(parsed.expires_at * 1000) < new Date() : 'unknown',
            timestamp: new Date().toISOString()
          });
        } catch (e) {
          console.log('❌ Error parsing auth token:', e);
        }
      } else {
        console.log('❌ NO SUPABASE AUTH TOKEN FOUND');
      }
    };
    
    // Check token status every 10 seconds
    setInterval(monitorAuthToken, 10000);
    
    // Initial check
    monitorAuthToken();
  },
  
  logNavigationAttempt: (from: string, to: string, method: string) => {
    console.log('🧭 NAVIGATION ATTEMPT:', {
      from,
      to,
      method,
      timestamp: new Date().toISOString(),
      stackTrace: new Error().stack?.split('\n').slice(0, 5)
    });
  },
  
  logAuthFailure: (reason: string, details: any) => {
    console.error('🚨 AUTH FAILURE:', {
      reason,
      details,
      url: window.location.href,
      localStorage: {
        satoshiUser: !!localStorage.getItem('satoshi_user'),
        supabaseAuth: !!localStorage.getItem('sb-uabdmohhzsertxfishoh-auth-token')
      },
      timestamp: new Date().toISOString()
    });
  }
};

// Initialize on module load
if (typeof window !== 'undefined') {
  deploymentDebug.init();
}