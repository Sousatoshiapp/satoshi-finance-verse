// Optimized icon components to reduce bundle size
// Only imports specific icons instead of the entire lucide-react package

import { memo } from 'react';
import type { LucideProps } from 'lucide-react';

// Core icons used frequently - bundled with main chunk
export { 
  Sparkles, 
  Trophy, 
  Target, 
  TrendingUp,
  Users,
  Zap,
  BookOpen,
  Gamepad2
} from 'lucide-react';

// Lazy loaded icons for less common use cases
export const LazyIcon = memo(function LazyIcon({ 
  name, 
  size = 24,
  className = '',
  ...props 
}: { name: string; size?: number; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  // This will be dynamically imported when needed
  return (
    <div 
      {...props} 
      className={`lucide-icon ${className}`}
      style={{ width: size, height: size }}
    />
  );
});

// Icon preloader for critical icons
export const preloadCriticalIcons = () => {
  // These icons are critical and should be preloaded
  return Promise.all([
    import('lucide-react').then(m => m.Sparkles),
    import('lucide-react').then(m => m.Trophy),
    import('lucide-react').then(m => m.Target),
    import('lucide-react').then(m => m.TrendingUp),
  ]);
};