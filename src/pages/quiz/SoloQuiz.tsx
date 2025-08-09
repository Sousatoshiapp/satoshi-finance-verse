import React, { useEffect, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import { QuizEngine } from '@/components/features/quiz/quiz-engine';
import { LoadingSpinner } from '@/components/shared/ui/loading-spinner';
import { ErrorBoundary } from 'react-error-boundary';

function QuizErrorFallback({ error, resetErrorBoundary }: any) {
  console.error('🚨 ERRO CRÍTICO NO QUIZ:', error);
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-destructive">Erro no Quiz</h1>
        <p className="text-muted-foreground">Algo deu errado ao carregar o quiz.</p>
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

export default function SoloQuiz() {
  const [searchParams] = useSearchParams();
  
  console.log('🏁 SoloQuiz montado!');
  console.log('📍 URL atual:', window.location.href);
  console.log('🔍 SearchParams:', Object.fromEntries(searchParams.entries()));
  
  const category = searchParams.get('category') || undefined;
  const difficulty = searchParams.get('difficulty') as 'facil' | 'medio' | 'dificil' | 'muito_dificil' || undefined;
  const questionsCount = parseInt(searchParams.get('count') || '10');
  const mode = searchParams.get('mode') as 'practice' | 'study' | 'adaptive' || 'adaptive';

  console.log('⚙️ Parâmetros extraídos:', {
    category,
    difficulty,
    questionsCount,
    mode
  });

  useEffect(() => {
    console.log('🎬 SoloQuiz useEffect executado');
    performance.mark('solo-quiz-start');
    
    return () => {
      performance.mark('solo-quiz-end');
      performance.measure('solo-quiz-duration', 'solo-quiz-start', 'solo-quiz-end');
      console.log('🏁 SoloQuiz desmontado');
    };
  }, []);

  const handleQuizComplete = (results: any) => {
    console.log('✅ Quiz completed:', results);
    // Aqui você pode salvar os resultados ou navegar para uma página de resultados
  };

  return (
    <ErrorBoundary
      FallbackComponent={QuizErrorFallback}
      onError={(error) => console.error('🚨 ErrorBoundary capturou erro:', error)}
    >
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner />
          <span className="ml-2">Carregando quiz...</span>
        </div>
      }>
        <div className="min-h-screen">
          <QuizEngine
            mode="solo"
            questionsCount={questionsCount}
            onComplete={handleQuizComplete}
          />
        </div>
      </Suspense>
    </ErrorBoundary>
  );
}