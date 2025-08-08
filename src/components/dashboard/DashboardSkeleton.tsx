// FASE 4: Skeleton-First Rendering - Renderiza em <50ms
import React, { memo } from 'react';
import { Skeleton } from '@/components/shared/ui/skeleton';

interface DashboardSkeletonProps {
  greeting: { text: string; icon: string };
}

// Ultra-fast skeleton that renders immediately
const DashboardSkeleton = memo(({ greeting }: DashboardSkeletonProps) => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="px-4 pt-8 pb-4">
        <div className="max-w-md mx-auto">
          {/* Header with real greeting for immediate content */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                {greeting.icon} {greeting.text}
              </p>
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>

          {/* BTZ Counter Skeleton */}
          <div className="mb-6">
            <div className="p-4 bg-card rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-8 w-24" />
                </div>
                <Skeleton className="h-12 w-12 rounded-full" />
              </div>
            </div>
          </div>

          {/* Progress Skeleton */}
          <div className="mb-6">
            <Skeleton className="h-2 w-full rounded-full mb-2" />
            <div className="flex justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>

          {/* Quick Actions Skeleton */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-4 bg-card rounded-lg border">
              <Skeleton className="h-8 w-8 mb-2" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="p-4 bg-card rounded-lg border">
              <Skeleton className="h-8 w-8 mb-2" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>

          {/* Additional sections skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
});

DashboardSkeleton.displayName = 'DashboardSkeleton';

export { DashboardSkeleton };