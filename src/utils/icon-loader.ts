// Optimized icon loading system to reduce bundle size
import { LucideIcon } from 'lucide-react';
import { lazy, ComponentType } from 'react';

// Define commonly used icons for immediate loading
export const CommonIcons = {
  // Navigation
  ArrowLeft: lazy(() => import('lucide-react/dist/esm/icons/arrow-left').then(m => ({ default: m.default }))),
  ArrowRight: lazy(() => import('lucide-react/dist/esm/icons/arrow-right').then(m => ({ default: m.default }))),
  Home: lazy(() => import('lucide-react/dist/esm/icons/home').then(m => ({ default: m.default }))),
  Menu: lazy(() => import('lucide-react/dist/esm/icons/menu').then(m => ({ default: m.default }))),
  X: lazy(() => import('lucide-react/dist/esm/icons/x').then(m => ({ default: m.default }))),
  
  // User Interface
  User: lazy(() => import('lucide-react/dist/esm/icons/user').then(m => ({ default: m.default }))),
  Users: lazy(() => import('lucide-react/dist/esm/icons/users').then(m => ({ default: m.default }))),
  Settings: lazy(() => import('lucide-react/dist/esm/icons/settings').then(m => ({ default: m.default }))),
  Bell: lazy(() => import('lucide-react/dist/esm/icons/bell').then(m => ({ default: m.default }))),
  Search: lazy(() => import('lucide-react/dist/esm/icons/search').then(m => ({ default: m.default }))),
  
  // Actions
  Check: lazy(() => import('lucide-react/dist/esm/icons/check').then(m => ({ default: m.default }))),
  CheckCircle: lazy(() => import('lucide-react/dist/esm/icons/check-circle').then(m => ({ default: m.default }))),
  XCircle: lazy(() => import('lucide-react/dist/esm/icons/x-circle').then(m => ({ default: m.default }))),
  Play: lazy(() => import('lucide-react/dist/esm/icons/play').then(m => ({ default: m.default }))),
  Pause: lazy(() => import('lucide-react/dist/esm/icons/pause').then(m => ({ default: m.default }))),
  
  // Status
  Clock: lazy(() => import('lucide-react/dist/esm/icons/clock').then(m => ({ default: m.default }))),
  AlertTriangle: lazy(() => import('lucide-react/dist/esm/icons/alert-triangle').then(m => ({ default: m.default }))),
  Trophy: lazy(() => import('lucide-react/dist/esm/icons/trophy').then(m => ({ default: m.default }))),
  Zap: lazy(() => import('lucide-react/dist/esm/icons/zap').then(m => ({ default: m.default }))),
  Target: lazy(() => import('lucide-react/dist/esm/icons/target').then(m => ({ default: m.default }))),
  
  // Finance/Gaming
  Coins: lazy(() => import('lucide-react/dist/esm/icons/coins').then(m => ({ default: m.default }))),
  Bitcoin: lazy(() => import('lucide-react/dist/esm/icons/bitcoin').then(m => ({ default: m.default }))),
  TrendingUp: lazy(() => import('lucide-react/dist/esm/icons/trending-up').then(m => ({ default: m.default }))),
  Swords: lazy(() => import('lucide-react/dist/esm/icons/swords').then(m => ({ default: m.default }))),
  
  // Loading states
  Loader2: lazy(() => import('lucide-react/dist/esm/icons/loader-2').then(m => ({ default: m.default }))),
  RefreshCw: lazy(() => import('lucide-react/dist/esm/icons/refresh-cw').then(m => ({ default: m.default }))),
} as const;

// Admin-specific icons (lazy loaded)
export const AdminIcons = {
  // Admin tools
  BarChart3: lazy(() => import('lucide-react/dist/esm/icons/bar-chart-3').then(m => ({ default: m.default }))),
  Database: lazy(() => import('lucide-react/dist/esm/icons/database').then(m => ({ default: m.default }))),
  FileText: lazy(() => import('lucide-react/dist/esm/icons/file-text').then(m => ({ default: m.default }))),
  Upload: lazy(() => import('lucide-react/dist/esm/icons/upload').then(m => ({ default: m.default }))),
  Download: lazy(() => import('lucide-react/dist/esm/icons/download').then(m => ({ default: m.default }))),
  Edit: lazy(() => import('lucide-react/dist/esm/icons/edit').then(m => ({ default: m.default }))),
  Trash2: lazy(() => import('lucide-react/dist/esm/icons/trash-2').then(m => ({ default: m.default }))),
  
  // Analytics
  Activity: lazy(() => import('lucide-react/dist/esm/icons/activity').then(m => ({ default: m.default }))),
  PieChart: lazy(() => import('lucide-react/dist/esm/icons/pie-chart').then(m => ({ default: m.default }))),
  TrendingDown: lazy(() => import('lucide-react/dist/esm/icons/trending-down').then(m => ({ default: m.default }))),
  
  // System
  Shield: lazy(() => import('lucide-react/dist/esm/icons/shield').then(m => ({ default: m.default }))),
  Lock: lazy(() => import('lucide-react/dist/esm/icons/lock').then(m => ({ default: m.default }))),
  Unlock: lazy(() => import('lucide-react/dist/esm/icons/unlock').then(m => ({ default: m.default }))),
} as const;

// Dynamic icon loader for runtime icon loading
export const loadIcon = async (iconName: string): Promise<ComponentType<any>> => {
  try {
    const iconModule = await import(`lucide-react/dist/esm/icons/${iconName.toLowerCase().replace(/([A-Z])/g, '-$1').substring(1)}`);
    return iconModule.default;
  } catch (error) {
    console.warn(`Failed to load icon: ${iconName}`, error);
    // Return a fallback icon
    const fallbackModule = await import('lucide-react/dist/esm/icons/help-circle');
    return fallbackModule.default;
  }
};

// Icon preloader for better UX
export const preloadIcons = (iconNames: (keyof typeof CommonIcons)[]): void => {
  iconNames.forEach(iconName => {
    if (CommonIcons[iconName]) {
      // Trigger lazy loading
      CommonIcons[iconName];
    }
  });
};

// Performance monitoring for icon loading
export const monitorIconLoading = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const iconLoadTimes: Record<string, number> = {};
    
    // Icon loading performance tracking
    
    // Track icon loading performance
    const trackIconLoad = (iconPath: string) => {
      const startTime = performance.now();
      return {
        finish: () => {
          const endTime = performance.now();
          iconLoadTimes[iconPath] = endTime - startTime;
          
          if (endTime - startTime > 100) {
            console.warn(`Slow icon load: ${iconPath} took ${endTime - startTime}ms`);
          }
        }
      };
    };
    
    return { iconLoadTimes, trackIconLoad };
  }
  
  return { iconLoadTimes: {}, trackIconLoad: () => ({ finish: () => {} }) };
};

export type CommonIconNames = keyof typeof CommonIcons;
export type AdminIconNames = keyof typeof AdminIcons;