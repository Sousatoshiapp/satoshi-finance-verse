import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/shared/ui/loading-spinner';
import { useOnboardingStatus } from '@/hooks/use-onboarding-status';

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
  const { isOnboardingCompleted, loading: onboardingLoading } = useOnboardingStatus();
  const location = useLocation();


  if (loading || onboardingLoading) {
    return <LoadingSpinner />;
  }

  // Enhanced security: Only rely on proper Supabase session
  const hasValidAuth = user && session;
  const isOnRootPath = location.pathname === '/' || location.pathname === '' || window.location.hash === '#';
  const isOnOnboardingPath = location.pathname === '/onboarding';
  
  if (hasValidAuth && isOnRootPath) {
    // Redirect to onboarding if not completed, otherwise to dashboard
    if (isOnboardingCompleted === false) {
      return <Navigate to="/onboarding" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  if (requiresAuth) {
    
    if (!hasValidAuth) {
      return <Navigate to="/welcome" state={{ from: location }} replace />;
    }
    
    // Check onboarding status for authenticated users
    if (hasValidAuth && !isOnOnboardingPath && isOnboardingCompleted === false) {
      return <Navigate to="/onboarding" replace />;
    }
    
    // If user has valid auth but is on welcome/auth pages, redirect appropriately
    const publicPages = ['/welcome', '/auth'];
    const isOnPublicPage = publicPages.includes(location.pathname);
    
    if (hasValidAuth && isOnPublicPage) {
      if (isOnboardingCompleted === false) {
        return <Navigate to="/onboarding" replace />;
      }
      return <Navigate to="/dashboard" replace />;
    }
    
    // If onboarding is completed but user is on onboarding page, redirect to dashboard
    if (hasValidAuth && isOnOnboardingPath && isOnboardingCompleted === true) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  if (adminOnly && (!user || user.role !== 'admin')) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
