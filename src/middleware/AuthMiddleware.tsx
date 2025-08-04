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

  // Always check for auto-redirect on root path, regardless of requiresAuth
  const hasValidAuth = (user && session) || localStorage.getItem('satoshi_user');
  const isOnRootPath = location.pathname === '/' || location.pathname === '' || window.location.hash === '#';
  
  if (hasValidAuth && isOnRootPath) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requiresAuth) {
    
    if (!hasValidAuth) {
      return <Navigate to="/welcome" state={{ from: location }} replace />;
    }
    
    // If user has valid auth but is on welcome/auth pages, redirect to dashboard
    const publicPages = ['/welcome', '/auth'];
    const isOnPublicPage = publicPages.includes(location.pathname);
    
    if (hasValidAuth && isOnPublicPage) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  if (adminOnly && (!user || user.role !== 'admin')) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
