import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [hasRedirected, setHasRedirected] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    // Debug information
    const debug = `Route: ${location.pathname}, User: ${user ? 'authenticated' : 'null'}, Loading: ${loading}, HasRedirected: ${hasRedirected}`;
    setDebugInfo(debug);
    console.log('ProtectedRoute Debug:', debug);

    // Only redirect if not loading, no user, and haven't redirected yet
    if (!loading && !user && !hasRedirected) {
      console.log(`🔒 ProtectedRoute: Redirecting from ${location.pathname} to /welcome`);
      
      // Check if we have localStorage user data (offline mode)
      const localUser = localStorage.getItem('satoshi_user');
      if (localUser) {
        console.log('📱 Found local user data, allowing access');
        return;
      }
      
      setHasRedirected(true);
      navigate("/welcome", { replace: true });
    }
  }, [user, loading, navigate, location.pathname, hasRedirected]);

  // Reset redirect flag when user becomes available
  useEffect(() => {
    if (user && hasRedirected) {
      console.log('✅ User authenticated, resetting redirect flag');
      setHasRedirected(false);
    }
  }, [user, hasRedirected]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Carregando Satoshi City...</p>
          <p className="text-xs text-gray-500 mt-2">{debugInfo}</p>
        </div>
      </div>
    );
  }

  // If no user but we have local data, allow access
  const localUser = localStorage.getItem('satoshi_user');
  if (!user && localUser) {
    console.log('🏠 Using localStorage auth, allowing access');
    return <>{children}</>;
  }

  if (!user) {
    console.log('🚫 No user found, preventing access');
    return null;
  }

  console.log('✅ User authenticated, rendering children');
  return <>{children}</>;
}