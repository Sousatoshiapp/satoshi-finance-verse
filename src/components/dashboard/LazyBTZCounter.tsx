import { memo, lazy, Suspense } from 'react';
import { Skeleton } from '@/components/shared/ui/skeleton';

// Lazy load the BTZ counter for better performance
const BTZCounterInternal = lazy(() => 
  import('@/components/features/quiz/btz-counter').then(module => ({
    default: module.BTZCounter
  }))
);

const BTZCounterSkeleton = memo(() => (
  <div className="flex items-center gap-3">
    <Skeleton className="h-12 w-48 rounded-lg" />
    <div className="flex gap-1">
      <Skeleton className="h-8 w-8 rounded-full" />
      <Skeleton className="h-8 w-8 rounded-full" />
    </div>
  </div>
));

interface LazyBTZCounterProps {
  className?: string;
}

export const LazyBTZCounter = memo(({ className }: LazyBTZCounterProps) => {
  return (
    <Suspense fallback={<BTZCounterSkeleton />}>
      <BTZCounterInternal className={className} />
    </Suspense>
  );
});

LazyBTZCounter.displayName = 'LazyBTZCounter';