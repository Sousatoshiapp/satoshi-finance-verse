import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '@/components/shared/ui/loading-spinner';
import { ErrorBoundary } from 'react-error-boundary';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useDuelData } from '@/hooks/use-duel-data';

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

export default function DuelScreenIntermediate() {
  const { duelId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { duel, loading, error } = useDuelData(duelId);
  
  console.log('🔬 DuelScreenIntermediate montado!');
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

    console.log('🎬 DuelScreenIntermediate useEffect executado');
    performance.mark('duel-screen-intermediate-start');
    
    return () => {
      performance.mark('duel-screen-intermediate-end');
      performance.measure('duel-screen-intermediate-duration', 'duel-screen-intermediate-start', 'duel-screen-intermediate-end');
      console.log('🏁 DuelScreenIntermediate desmontado');
    };
  }, [user, duelId, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
        <span className="ml-2">Carregando dados do duelo...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">Erro ao Carregar Duelo</h1>
          <p className="text-muted-foreground">{error}</p>
          <button 
            onClick={() => navigate('/duels')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Voltar aos Duelos
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary
      FallbackComponent={DuelErrorFallback}
      onError={(error) => console.error('🚨 ErrorBoundary capturou erro:', error)}
    >
      <div className="min-h-screen p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-primary">🔬 Teste Intermediário - Duelo</h1>
            <p className="text-muted-foreground">
              Testando carregamento de dados do duelo sem DuelQuizEngine
            </p>
          </div>
          
          <div className="bg-card rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold">Dados do Duelo</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong>ID:</strong> {duelId}
              </div>
              <div>
                <strong>Status:</strong> {duel?.status || 'N/A'}
              </div>
              <div>
                <strong>Aposta:</strong> {duel?.bet_amount || 0} BTZ
              </div>
              <div>
                <strong>Data:</strong> {duel?.created_at ? new Date(duel.created_at).toLocaleString() : 'N/A'}
              </div>
            </div>
          </div>

          {duel && (
            <div className="bg-card rounded-lg p-6 space-y-4">
              <h2 className="text-xl font-semibold">Participantes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Jogador 1</h3>
                  <p>{duel.player1_profile?.nickname || 'Carregando...'}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Jogador 2</h3>
                  <p>{duel.player2_profile?.nickname || 'Carregando...'}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-card rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Próximos Passos</h2>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>✅ Rota funcionando</p>
              <p>✅ Autenticação funcionando</p>
              <p>{duel ? '✅' : '❌'} Carregamento de dados do duelo</p>
              <p>⏳ Próximo: Adicionar DuelQuizEngine gradualmente</p>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <button 
              onClick={() => navigate('/duels')}
              className="px-6 py-2 bg-secondary text-secondary-foreground rounded-md"
            >
              Voltar aos Duelos
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Recarregar Teste
            </button>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}