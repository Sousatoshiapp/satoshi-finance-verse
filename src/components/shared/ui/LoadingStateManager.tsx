import React from 'react';
import { LoadingSpinner } from '@/components/shared/ui/loading-spinner';

interface LoadingSkeletonProps {
  variant?: 'card' | 'list' | 'text' | 'avatar' | 'button';
  className?: string;
  count?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  variant = 'card', 
  className = '',
  count = 1 
}) => {
  const getSkeletonClass = () => {
    const baseClass = 'animate-pulse bg-muted/20 rounded-lg';
    
    switch (variant) {
      case 'card':
        return `${baseClass} h-48 w-full`;
      case 'list':
        return `${baseClass} h-16 w-full`;
      case 'text':
        return `${baseClass} h-4 w-3/4`;
      case 'avatar':
        return `${baseClass} h-10 w-10 rounded-full`;
      case 'button':
        return `${baseClass} h-10 w-24`;
      default:
        return `${baseClass} h-48 w-full`;
    }
  };

  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={getSkeletonClass()} />
      ))}
    </div>
  );
};

interface LoadingStateManagerProps {
  isLoading: boolean;
  skeleton?: React.ReactNode;
  spinner?: boolean;
  children: React.ReactNode;
}

export const LoadingStateManager: React.FC<LoadingStateManagerProps> = ({
  isLoading,
  skeleton,
  spinner = false,
  children
}) => {
  if (isLoading) {
    if (skeleton) {
      return <>{skeleton}</>;
    }
    
    if (spinner) {
      return <LoadingSpinner />;
    }
    
    return <LoadingSkeleton />;
  }

  return <>{children}</>;
};
