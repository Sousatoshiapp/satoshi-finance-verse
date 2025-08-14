import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorHandler } from '@/utils/error-handling';
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/shared/ui/button';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  showDetails: boolean;
  recoveryAttempted: boolean;
}

interface EnhancedErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  maxRetries?: number;
  enableAutoRecovery?: boolean;
  recoveryStrategies?: Array<() => Promise<boolean>>;
}

export class EnhancedErrorBoundary extends Component<
  EnhancedErrorBoundaryProps,
  ErrorBoundaryState
> {
  private logger = ErrorHandler.createLogger('EnhancedErrorBoundary');
  private retryTimeout: NodeJS.Timeout | null = null;

  constructor(props: EnhancedErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      showDetails: false,
      recoveryAttempted: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Log error with context
    this.logger.error('Error boundary caught error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      retryCount: this.state.retryCount,
      timestamp: new Date().toISOString()
    });

    // Dispatch custom event for monitoring
    window.dispatchEvent(new CustomEvent('error-boundary-caught', {
      detail: { error, errorInfo }
    }));

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    // Attempt auto-recovery if enabled
    if (this.props.enableAutoRecovery && this.state.retryCount < (this.props.maxRetries || 3)) {
      this.attemptAutoRecovery();
    }
  }

  private async attemptAutoRecovery(): Promise<void> {
    const { recoveryStrategies = [] } = this.props;
    
    this.setState({ recoveryAttempted: true });
    
    // Try built-in recovery strategies first
    const builtInStrategies = [
      this.clearCacheRecovery.bind(this),
      this.memoryCleanupRecovery.bind(this),
      this.componentResetRecovery.bind(this)
    ];

    const allStrategies = [...builtInStrategies, ...recoveryStrategies];

    for (const strategy of allStrategies) {
      try {
        const recovered = await strategy();
        if (recovered) {
          this.logger.info('Auto-recovery successful');
          this.handleRetry();
          return;
        }
      } catch (recoveryError) {
        this.logger.error('Recovery strategy failed', recoveryError);
      }
    }

    // If all strategies fail, wait before allowing manual retry
    this.retryTimeout = setTimeout(() => {
      this.setState({ recoveryAttempted: false });
    }, 5000);
  }

  private async clearCacheRecovery(): Promise<boolean> {
    try {
      // Clear browser caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(name => caches.delete(name))
        );
      }
      return true;
    } catch {
      return false;
    }
  }

  private async memoryCleanupRecovery(): Promise<boolean> {
    try {
      // Force garbage collection if available
      if ('gc' in window) {
        (window as any).gc();
      }
      
      // Clear temporary data
      const keysToRemove = Object.keys(sessionStorage).filter(
        key => key.includes('temp_') || key.includes('cache_')
      );
      keysToRemove.forEach(key => sessionStorage.removeItem(key));
      
      return true;
    } catch {
      return false;
    }
  }

  private async componentResetRecovery(): Promise<boolean> {
    // This recovery strategy resets component state
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(true);
      }, 1000);
    });
  }

  private handleRetry = (): void => {
    const { maxRetries = 3 } = this.props;
    
    if (this.state.retryCount >= maxRetries) {
      this.logger.warn('Maximum retry attempts reached');
      return;
    }

    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
      showDetails: false,
      recoveryAttempted: false
    }));

    this.logger.info('Retrying component render', { 
      retryCount: this.state.retryCount + 1 
    });
  };

  private handleReload = (): void => {
    window.location.reload();
  };

  private toggleDetails = (): void => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails
    }));
  };

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback } = this.props;
      
      if (Fallback && this.state.error) {
        return <Fallback error={this.state.error} retry={this.handleRetry} />;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-lg w-full space-y-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <AlertTriangle className="h-16 w-16 text-destructive" />
              </div>
              
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">
                  Algo deu errado
                </h1>
                <p className="text-muted-foreground">
                  Ocorreu um erro inesperado. Tentativas de recuperação automática foram realizadas.
                </p>
              </div>

              {this.state.recoveryAttempted && (
                <div className="bg-muted/50 border border-border rounded-lg p-3">
                  <p className="text-sm text-muted-foreground">
                    🔄 Tentativa de recuperação automática em andamento...
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={this.handleRetry} 
                  variant="default"
                  disabled={this.state.retryCount >= (this.props.maxRetries || 3) || this.state.recoveryAttempted}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar novamente ({this.state.retryCount}/{this.props.maxRetries || 3})
                </Button>
                <Button onClick={this.handleReload} variant="outline">
                  Recarregar página
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && (
                <div className="space-y-2">
                  <Button
                    onClick={this.toggleDetails}
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                  >
                    {this.state.showDetails ? <ChevronUp /> : <ChevronDown />}
                    Detalhes do erro
                  </Button>
                  
                  {this.state.showDetails && (
                    <div className="bg-muted p-4 rounded-lg text-left">
                      <h3 className="font-semibold text-sm mb-2">Informações de debug:</h3>
                      <pre className="text-xs text-muted-foreground overflow-auto max-h-40">
                        {this.state.error?.message}
                        {this.state.error?.stack && '\n\nStack:\n' + this.state.error.stack}
                        {this.state.errorInfo?.componentStack && '\n\nComponent Stack:\n' + this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Se o problema persistir, recarregue a página ou entre em contato com o suporte.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for easy wrapping of components
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<EnhancedErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <EnhancedErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </EnhancedErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

// Hook for programmatic error recovery
export function useErrorRecovery() {
  const retry = React.useCallback(() => {
    window.location.reload();
  }, []);

  const reportError = React.useCallback((error: Error, context?: string) => {
    const logger = ErrorHandler.createLogger('ErrorRecovery');
    logger.error('Manual error report', { error: error.message, context });
  }, []);

  return { retry, reportError };
}