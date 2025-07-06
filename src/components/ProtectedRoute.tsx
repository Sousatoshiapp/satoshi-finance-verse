import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  console.log('🛡️ ProtectedRoute check:', { 
    hasUser: !!user, 
    loading, 
    path: window.location.pathname 
  });

  // Show loading while auth is initializing
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

  // If user is authenticated, allow access
  if (user) {
    console.log('✅ User authenticated, allowing access');
    return <>{children}</>;
  }

  // If no user, check localStorage as fallback
  const localUser = localStorage.getItem('satoshi_user');
  if (localUser) {
    console.log('🏠 Using localStorage fallback, allowing access');
    return <>{children}</>;
  }

  // No user found, redirect to welcome
  console.log('🚫 No authentication found, redirecting to welcome');
  window.location.href = '/welcome';
  return null;
}