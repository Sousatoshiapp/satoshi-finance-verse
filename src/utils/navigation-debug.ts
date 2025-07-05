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
      userId: user?.id || 'none'
    });
  },
  
  logProtectedRoute: (path: string, userState: any) => {
    console.log(`🛡️ ProtectedRoute [${path}]:`, {
      hasUser: !!userState.user,
      loading: userState.loading,
      hasLocalData: !!localStorage.getItem('satoshi_user')
    });
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