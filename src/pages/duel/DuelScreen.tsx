import React, { useEffect, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SimpleDuelQuizEngine } from '@/components/duel/SimpleDuelQuizEngine';
import { LoadingSpinner } from '@/components/shared/ui/loading-spinner';
import { ErrorBoundary } from 'react-error-boundary';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

function DuelErrorFallback({ error, resetErrorBoundary }: any) {
  console.error('🚨 ERRO CRÍTICO NO DUELO:', error);
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-destructive">Erro no Duelo</h1>
        <p className="text-muted-foreground">Algo deu errado ao carregar o duelo.</p>
        <div className="space-x-2">
          <button 
            onClick={resetErrorBoundary}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Tentar Novamente
          </button>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md"
          >
            Voltar ao Dashboard
          </button>
        </div>
        <details className="text-left text-xs bg-muted p-2 rounded">
          <summary>Detalhes do erro</summary>
          <pre>{error.message}</pre>
        </details>
      </div>
    </div>
  );
}

export default function DuelScreen() {
  const { duelId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  console.log('🏁 DuelScreen montado!');
  console.log('📍 URL atual:', window.location.href);
  console.log('🆔 Duel ID:', duelId);

  useEffect(() => {
    if (!user) {
      toast({
        title: "Acesso negado",
        description: "Você precisa estar logado para participar de duelos",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    if (!duelId) {
      toast({
        title: "Erro",
        description: "ID do duelo não encontrado",
        variant: "destructive"
      });
      navigate('/duels');
      return;
    }

    console.log('🎬 DuelScreen useEffect executado');
    performance.mark('duel-screen-start');
    
    return () => {
      performance.mark('duel-screen-end');
      performance.measure('duel-screen-duration', 'duel-screen-start', 'duel-screen-end');
      console.log('🏁 DuelScreen desmontado');
    };
  }, [user, duelId, navigate, toast]);

  const handleDuelComplete = (results: any) => {
    console.log('✅ Duel completed:', results);
    // Navegar para dashboard ou página de resultados
    navigate('/dashboard');
  };

  return (
    <ErrorBoundary
      FallbackComponent={DuelErrorFallback}
      onError={(error) => console.error('🚨 ErrorBoundary capturou erro:', error)}
    >
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner />
          <span className="ml-2">Carregando duelo...</span>
        </div>
      }>
        <div className="min-h-screen">
          <SimpleDuelQuizEngine
            duelId={duelId}
            onComplete={handleDuelComplete}
          />
        </div>
      </Suspense>
    </ErrorBoundary>
  );
}