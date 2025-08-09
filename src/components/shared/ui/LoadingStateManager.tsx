import React from 'react';
import { ProfileStyleLoader } from '@/components/shared/ui/profile-style-loader';

interface LoadingStateManagerProps {
  isLoading: boolean;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const LoadingStateManager: React.FC<LoadingStateManagerProps> = ({
  isLoading,
  children,
  size = "md",
  className
}) => {
  if (isLoading) {
    return <ProfileStyleLoader size={size} className={className} />;
  }

  return <>{children}</>;
};
