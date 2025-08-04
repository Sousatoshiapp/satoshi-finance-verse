import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/shared/ui/loading-spinner';

interface AuthMiddlewareProps {
  children: React.ReactNode;
  requiresAuth?: boolean;
  adminOnly?: boolean;
}

export const AuthMiddleware: React.FC<AuthMiddlewareProps> = ({
  children,
  requiresAuth = true,
  adminOnly = false,
}) => {
  const { user, session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (requiresAuth) {
    const hasValidAuth = (user && session) || localStorage.getItem('satoshi_user');
    
    console.log('🔍 AuthMiddleware Check:', { 
      hasUser: !!user, 
      hasSession: !!session, 
      hasLocalStorage: !!localStorage.getItem('satoshi_user'),
      userEmail: user?.email,
      currentPath: location.pathname,
      currentHash: location.hash,
      fullLocation: window.location.href,
      sessionExpiry: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : 'none'
    });
    
    if (!hasValidAuth) {
      console.log('🚫 AuthMiddleware: No valid authentication found - redirecting to welcome');
      return <Navigate to="/welcome" state={{ from: location }} replace />;
    }
    
    // If user has valid auth but is on welcome/auth pages, redirect to dashboard
    const publicPages = ['/welcome', '/auth', '/', '/#'];
    const isOnPublicPage = publicPages.includes(location.pathname) || location.pathname === '/' || window.location.hash === '#';
    
    if (hasValidAuth && isOnPublicPage) {
      console.log('✅ AuthMiddleware: Valid auth detected on public page - redirecting to dashboard', {
        pathname: location.pathname,
        hash: location.hash,
        redirectingTo: '/dashboard'
      });
      return <Navigate to="/dashboard" replace />;
    }
  }

  if (adminOnly && (!user || user.role !== 'admin')) {
    return <Navigate to="/dashboard" replace />;
  }

  console.log('✅ AuthMiddleware: Authentication valid - rendering protected content');
  return <>{children}</>;
};
