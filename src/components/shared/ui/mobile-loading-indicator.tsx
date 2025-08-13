import React from 'react';
import { Loader2, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileLoadingIndicatorProps {
  isLoading: boolean;
  className?: string;
  type?: 'posts' | 'messages' | 'generic';
}

export function MobileLoadingIndicator({ 
  isLoading, 
  className,
  type = 'generic'
}: MobileLoadingIndicatorProps) {
  if (!isLoading) return null;

  const getIcon = () => {
    switch (type) {
      case 'posts':
        return <TrendingUp className="h-5 w-5" />;
      default:
        return <Loader2 className="h-5 w-5" />;
    }
  };

  const getText = () => {
    switch (type) {
      case 'posts':
        return 'Carregando mais posts...';
      case 'messages':
        return 'Carregando mensagens...';
      default:
        return 'Carregando...';
    }
  };

  return (
    <div className={cn(
      "flex items-center justify-center py-6 space-x-3",
      "bg-gradient-to-t from-background/80 to-transparent backdrop-blur-sm",
      className
    )}>
      <div className={cn(
        "animate-spin text-primary",
        type === 'posts' && "animate-bounce"
      )}>
        {getIcon()}
      </div>
      <p className="text-sm text-muted-foreground font-medium">
        {getText()}
      </p>
    </div>
  );
}