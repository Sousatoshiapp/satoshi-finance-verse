import { Suspense, ComponentType } from 'react';
import { LucideProps } from 'lucide-react';
import { CommonIcons, AdminIcons, CommonIconNames, AdminIconNames } from '@/utils/icon-loader';

interface OptimizedIconProps extends LucideProps {
  name: CommonIconNames | AdminIconNames;
  fallback?: ComponentType<LucideProps>;
}

// Fallback icon component
const IconFallback = ({ size = 24, className, ...props }: LucideProps) => (
  <div 
    style={{ width: size, height: size }} 
    className={`animate-pulse bg-muted rounded ${className || ''}`}
  />
);

export const OptimizedIcon = ({ name, fallback: Fallback = IconFallback, ...props }: OptimizedIconProps) => {
  // Check if icon exists in CommonIcons first, then AdminIcons
  const IconComponent = CommonIcons[name as CommonIconNames] || AdminIcons[name as AdminIconNames];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in icon loader`);
    return <Fallback {...props} />;
  }

  return (
    <Suspense fallback={<Fallback {...props} />}>
      <IconComponent {...props} />
    </Suspense>
  );
};

// Pre-optimized common icon components for immediate use
export const NavIcon = (props: Omit<OptimizedIconProps, 'name'> & { name: 'ArrowLeft' | 'ArrowRight' | 'Home' | 'Menu' | 'X' }) => (
  <OptimizedIcon {...props} />
);

export const UserIcon = (props: Omit<OptimizedIconProps, 'name'> & { name: 'User' | 'Users' | 'Settings' }) => (
  <OptimizedIcon {...props} />
);

export const StatusIcon = (props: Omit<OptimizedIconProps, 'name'> & { name: 'Check' | 'CheckCircle' | 'XCircle' | 'Clock' | 'AlertTriangle' | 'Trophy' }) => (
  <OptimizedIcon {...props} />
);

export const GameIcon = (props: Omit<OptimizedIconProps, 'name'> & { name: 'Zap' | 'Target' | 'Coins' | 'Swords' }) => (
  <OptimizedIcon {...props} />
);

export const LoadingIcon = (props: Omit<OptimizedIconProps, 'name'> & { name: 'Loader2' | 'RefreshCw' }) => (
  <OptimizedIcon {...props} />
);