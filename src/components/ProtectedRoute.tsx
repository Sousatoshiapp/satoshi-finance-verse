import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, session, loading } = useAuth();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (loading) return; // Still loading auth state

    const hasValidAuth = (user && session) || localStorage.getItem('satoshi_user');
    
    if (!hasValidAuth) {
      console.log('🚫 No valid authentication found - redirecting to welcome');
      setRedirecting(true);
      // Small delay to prevent flash
      setTimeout(() => {
        window.location.replace('/welcome');
      }, 100);
      return;
    }

    console.log('✅ Authentication valid - rendering protected content');
  }, [user, session, loading]);

  // Show loading while auth is being checked or while redirecting
  if (loading || redirecting) {
    return <LoadingSpinner />;
  }

  // Render children if we have valid authentication
  if ((user && session) || localStorage.getItem('satoshi_user')) {
    return <>{children}</>;
  }

  // Fallback loading (shouldn't reach here normally)
  return <LoadingSpinner />;
}