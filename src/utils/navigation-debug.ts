// Debug utility for navigation issues
export const debugNavigation = {
  log: (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.log(`🔍 [${timestamp}] Navigation Debug: ${message}`, data || '');
  },
  
  logRouteChange: (from: string, to: string, reason?: string) => {
    console.log(`🚀 Route Change: ${from} → ${to}${reason ? ` (${reason})` : ''}`);
  },
  
  logAuthState: (user: any, session: any, loading: boolean) => {
    console.log('🔐 Auth State:', {
      hasUser: !!user,
      hasSession: !!session,
      loading,
      userId: user?.id || 'none',
      sessionValid: session ? !!(session.expires_at && new Date(session.expires_at * 1000) > new Date()) : false,
      expiresAt: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : 'none'
    });
  },
  
  logProtectedRoute: (path: string, userState: any) => {
    console.log(`🛡️ ProtectedRoute [${path}]:`, {
      hasUser: !!userState.user,
      hasSession: !!userState.session,
      loading: userState.loading,
      hasLocalData: !!localStorage.getItem('satoshi_user'),
      sessionExpiry: userState.session?.expires_at
    });
  },

  logCriticalError: (error: string, context: any) => {
    console.error(`❌ CRITICAL ERROR: ${error}`, context);
  }
};

// Monitor navigation changes
if (typeof window !== 'undefined') {
  let lastPath = window.location.pathname;
  
  const observer = new MutationObserver(() => {
    const currentPath = window.location.pathname;
    if (currentPath !== lastPath) {
      debugNavigation.logRouteChange(lastPath, currentPath, 'DOM change');
      lastPath = currentPath;
    }
  });
  
  observer.observe(document, { subtree: true, childList: true });
}