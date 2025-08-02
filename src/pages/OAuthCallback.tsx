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

        if (session) {
          console.log('✅ OAuth Callback: Session found, redirecting to dashboard');
          navigate('/dashboard', { replace: true });
        } else {
          console.log('🚫 OAuth Callback: No session found, redirecting to auth');
          navigate('/auth?mode=login', { replace: true });
        }
      } catch (error) {
        console.error('🚫 OAuth Callback Exception:', error);
        navigate('/auth?mode=login', { replace: true });
      }
    };

    // Small delay to ensure auth state is properly processed
    const timer = setTimeout(handleAuthCallback, 100);
    
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