import { memo, lazy, Suspense } from 'react';
import { ProfileStyleLoader } from '@/components/shared/ui/profile-style-loader';

// Lazy load the BTZ counter for better performance
const BTZCounterInternal = lazy(() => 
  import('@/components/features/quiz/btz-counter').then(module => ({
    default: module.BTZCounter
  }))
);

const BTZCounterLoader = memo(() => (
  <ProfileStyleLoader size="sm" />
));

interface LazyBTZCounterProps {
  className?: string;
}

export const LazyBTZCounter = memo(({ className }: LazyBTZCounterProps) => {
  return (
    <Suspense fallback={<BTZCounterLoader />}>
      <BTZCounterInternal className={className} />
    </Suspense>
  );
});

LazyBTZCounter.displayName = 'LazyBTZCounter';