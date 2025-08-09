import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';

interface QuizErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function QuizErrorFallback({ error, resetErrorBoundary }: QuizErrorFallbackProps) {
  console.error('🚨 QUIZ ERROR BOUNDARY ATIVADO:', error);
  
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <AlertTriangle className="h-16 w-16 text-destructive" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Ops! Algo deu errado</h1>
          <p className="text-muted-foreground">
            Ocorreu um erro inesperado no quiz. Tente novamente ou volte ao dashboard.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button 
            onClick={resetErrorBoundary} 
            className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Tentar Novamente
          </button>
          
          <button 
            onClick={() => window.location.href = '/dashboard'} 
            className="flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
          >
            <Home className="h-4 w-4" />
            Voltar ao Dashboard
          </button>
        </div>

        <details className="text-left bg-muted p-4 rounded-lg text-sm">
          <summary className="cursor-pointer font-medium mb-2">
            Detalhes técnicos
          </summary>
          <div className="space-y-2">
            <p><strong>Erro:</strong> {error.message}</p>
            <p><strong>URL:</strong> {window.location.href}</p>
            <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
            {error.stack && (
              <div>
                <strong>Stack:</strong>
                <pre className="text-xs mt-1 overflow-auto max-h-32 bg-background p-2 rounded border">
                  {error.stack}
                </pre>
              </div>
            )}
          </div>
        </details>
      </div>
    </div>
  );
}

interface QuizErrorBoundaryProps {
  children: React.ReactNode;
}

export function QuizErrorBoundary({ children }: QuizErrorBoundaryProps) {
  return (
    <ErrorBoundary
      FallbackComponent={QuizErrorFallback}
      onError={(error, errorInfo) => {
        console.error('🚨 QuizErrorBoundary capturou erro:', error);
        console.error('🔍 Informações adicionais:', errorInfo);
        
        // Log performance se disponível
        try {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          console.log('📊 Performance da navegação:', {
            loadEventEnd: navigation.loadEventEnd,
            domContentLoadedEventEnd: navigation.domContentLoadedEventEnd,
            redirectCount: navigation.redirectCount
          });
        } catch (e) {
          console.log('📊 Performance data não disponível');
        }
      }}
      onReset={() => {
        console.log('🔄 Quiz Error Boundary resetado');
        // Limpar qualquer estado corrompido
        performance.mark('quiz-error-boundary-reset');
      }}
    >
      {children}
    </ErrorBoundary>
  );
}