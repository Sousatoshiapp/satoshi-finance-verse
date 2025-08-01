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
    
    if (!hasValidAuth) {
      console.log('🚫 AuthMiddleware: No valid authentication found - redirecting to welcome');
      return <Navigate to="/welcome" state={{ from: location }} replace />;
    }
  }

  if (adminOnly && (!user || user.role !== 'admin')) {
    return <Navigate to="/dashboard" replace />;
  }

  console.log('✅ AuthMiddleware: Authentication valid - rendering protected content');
  return <>{children}</>;
};
