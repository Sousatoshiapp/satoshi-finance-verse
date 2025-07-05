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

  useEffect(() => {
    // Only redirect once and avoid redirect loops
    if (!loading && !user && !hasRedirected) {
      console.log(`ProtectedRoute: Redirecting from ${location.pathname} to /welcome`);
      setHasRedirected(true);
      navigate("/welcome", { replace: true });
    }
  }, [user, loading, navigate, location.pathname, hasRedirected]);

  // Reset redirect flag when user becomes available
  useEffect(() => {
    if (user && hasRedirected) {
      setHasRedirected(false);
    }
  }, [user, hasRedirected]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Carregando Satoshi City...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}