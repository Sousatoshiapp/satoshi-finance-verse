import React from 'react';
import { Skeleton } from '@/components/shared/ui/skeleton';
import { Loader2 } from 'lucide-react';

interface DashboardLoadingStateProps {
  isRetrying?: boolean;
  retryCount?: number;
}

export function DashboardLoadingState({ isRetrying = false, retryCount = 0 }: DashboardLoadingStateProps) {
  return (
    <div className="space-y-6 p-6">
      {/* Status indicator */}
      <div className="flex items-center justify-center py-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>
            {isRetrying 
              ? `Tentativa ${retryCount + 1}/3 - Recarregando dashboard...`
              : 'Carregando dashboard...'
            }
          </span>
        </div>
      </div>
      
      {/* Header skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      
      {/* Stats skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-4 border rounded-lg space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
      
      {/* Progress bar skeleton */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-2 w-full" />
      </div>
      
      {/* Action buttons skeleton */}
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      
      {/* Additional sections skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="grid gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}