import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/shared/ui/loading-spinner';

export default function OAuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔄 OAuth Callback: Processing authentication...');
        
        // Get the session from the URL hash
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('🚫 OAuth Callback Error:', error);
          navigate('/auth?mode=login', { replace: true });
          return;
        }

        if (session?.user) {
          console.log('✅ OAuth Callback: Session found, user authenticated');
          
          // Store user data in localStorage as backup for AuthMiddleware
          localStorage.setItem('satoshi_user', JSON.stringify({
            id: session.user.id,
            email: session.user.email,
            authenticated_at: new Date().toISOString()
          }));
          
          console.log('✅ OAuth Callback: Redirecting to dashboard');
          navigate('/dashboard', { replace: true });
        } else {
          console.log('🚫 OAuth Callback: No valid session found, redirecting to auth');
          localStorage.removeItem('satoshi_user');
          navigate('/auth?mode=login', { replace: true });
        }
      } catch (error) {
        console.error('🚫 OAuth Callback Exception:', error);
        localStorage.removeItem('satoshi_user');
        navigate('/auth?mode=login', { replace: true });
      }
    };

    // Increase delay to ensure Supabase auth state is fully processed
    const timer = setTimeout(handleAuthCallback, 500);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="text-center">
        <LoadingSpinner />
        <p className="mt-4 text-muted-foreground">Processando autenticação...</p>
      </div>
    </div>
  );
}