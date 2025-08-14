import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/shared/ui/loading-spinner';
// import { useOnboardingStatus } from '@/hooks/use-onboarding-status';

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
  // const { isOnboardingCompleted, loading: onboardingLoading } = useOnboardingStatus();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  // Enhanced security: Only rely on proper Supabase session
  const hasValidAuth = user && session;
  const isOnRootPath = location.pathname === '/' || location.pathname === '' || window.location.hash === '#';
  
  if (hasValidAuth && isOnRootPath) {
    // Redirect directly to dashboard (onboarding disabled)
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
