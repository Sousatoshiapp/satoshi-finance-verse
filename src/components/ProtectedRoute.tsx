import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, session, loading } = useAuth();
  const [authCheckComplete, setAuthCheckComplete] = useState(false);

  useEffect(() => {
    // Delay auth check to avoid race conditions
    const checkAuth = async () => {
      // Wait a bit for auth to settle
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const currentPath = window.location.pathname;
      const hasSupabaseUser = !!user;
      const hasSupabaseSession = !!session;
      const localUser = localStorage.getItem('satoshi_user');
      const hasLocalUser = !!localUser;

      console.log('🛡️ DETAILED PROTECTION CHECK:', {
        path: currentPath,
        loading,
        hasSupabaseUser,
        hasSupabaseSession,
        hasLocalUser,
        userId: user?.id,
        sessionExpiry: session?.expires_at,
        timestamp: new Date().toISOString()
      });

      if (loading) {
        console.log('⏳ Auth still loading, waiting...');
        return;
      }

      // If authenticated via Supabase
      if (hasSupabaseUser && hasSupabaseSession) {
        console.log('✅ SUPABASE AUTH VALID - allowing access');
        setAuthCheckComplete(true);
        return;
      }

      // Enhanced localStorage validation - only allow if valid structure
      if (!hasSupabaseUser && hasLocalUser) {
        try {
          const userData = JSON.parse(localUser);
          // Validate localStorage structure and require essential fields
          if (userData && userData.id && userData.email && typeof userData.id === 'string') {
            console.log(`📱 FALLBACK TO LOCALSTORAGE - allowing access with validation`);
            setAuthCheckComplete(true);
            return;
          } else {
            console.log(`🚫 INVALID LOCALSTORAGE DATA - removing and redirecting`);
            localStorage.removeItem('satoshi_user');
          }
        } catch (error) {
          console.log(`🚫 CORRUPTED LOCALSTORAGE DATA - removing and redirecting`);
          localStorage.removeItem('satoshi_user');
        }
      }

      // No valid authentication found
      console.log(`🚫 NO VALID AUTH FOUND - redirecting from ${currentPath}`);
      console.log('Attempting redirect to /welcome...');
      
      // Use window.location.replace to avoid history issues
      window.location.replace('/welcome');
    };

    if (!authCheckComplete) {
      checkAuth();
    }
  }, [user, session, loading, authCheckComplete]);

  // Show loading while auth is being checked
  if (loading || !authCheckComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Verificando autenticação...</p>
          <p className="text-xs text-gray-500 mt-2">
            Loading: {loading.toString()}, Complete: {authCheckComplete.toString()}
          </p>
        </div>
      </div>
    );
  }

  console.log('✅ RENDERING PROTECTED CONTENT');
  return <>{children}</>;
}