import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Button } from '@/components/shared/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { clearDashboardCache } from '@/hooks/use-ultra-dashboard-query';

interface DashboardErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function DashboardErrorFallback({ error, resetErrorBoundary }: DashboardErrorFallbackProps) {
  const handleReset = () => {
    // Clear all dashboard-related cache
    clearDashboardCache();
    
    // Reset the error boundary
    resetErrorBoundary();
    
    // Force page reload as last resort
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h2 className="text-xl font-semibold mb-2">Erro no Dashboard</h2>
      <p className="text-muted-foreground mb-4 max-w-md">
        Ocorreu um erro ao carregar o dashboard. Vamos tentar corrigir isso.
      </p>
      <div className="text-sm text-muted-foreground mb-6 p-3 bg-muted rounded-lg max-w-md">
        <strong>Detalhes:</strong> {error.message}
      </div>
      <Button onClick={handleReset} className="flex items-center gap-2">
        <RefreshCw className="h-4 w-4" />
        Recarregar Dashboard
      </Button>
    </div>
  );
}

interface DashboardErrorBoundaryProps {
  children: React.ReactNode;
}

export function DashboardErrorBoundary({ children }: DashboardErrorBoundaryProps) {
  return (
    <ErrorBoundary
      FallbackComponent={DashboardErrorFallback}
      onError={(error, errorInfo) => {
        console.error('🚨 Dashboard Error Boundary caught error:', error);
        console.error('Error info:', errorInfo);
      }}
      onReset={() => {
        console.log('🔄 Dashboard Error Boundary reset');
      }}
    >
      {children}
    </ErrorBoundary>
  );
}