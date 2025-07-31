import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/shared/ui/button';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  const isDevelopment = import.meta.env.DEV;

  const handleReload = () => {
    window.location.reload();
  };

  const handleReportError = () => {
    console.error('Global Error Boundary caught error:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
  };

  React.useEffect(() => {
    handleReportError();
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <AlertTriangle className="h-16 w-16 text-destructive" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Ops! Algo deu errado
          </h1>
          <p className="text-muted-foreground">
            Ocorreu um erro inesperado na aplicação. Nossa equipe foi notificada.
          </p>
        </div>

        {isDevelopment && (
          <div className="bg-muted p-4 rounded-lg text-left">
            <h3 className="font-semibold text-sm mb-2">Detalhes do erro (desenvolvimento):</h3>
            <pre className="text-xs text-muted-foreground overflow-auto">
              {error.message}
            </pre>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={resetErrorBoundary} variant="default">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
          <Button onClick={handleReload} variant="outline">
            Recarregar página
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Se o problema persistir, entre em contato com o suporte.
        </p>
      </div>
    </div>
  );
};

interface GlobalErrorBoundaryProps {
  children: React.ReactNode;
}

export const GlobalErrorBoundary: React.FC<GlobalErrorBoundaryProps> = ({ children }) => {
  const handleError = (error: Error, errorInfo: { componentStack: string }) => {
    console.error('Global Error Boundary caught error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });

    if (!import.meta.env.DEV) {
    }
  };

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={handleError}
      onReset={() => {
        window.location.reload();
      }}
    >
      {children}
    </ErrorBoundary>
  );
};
