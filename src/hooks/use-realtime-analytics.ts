import { useState, useEffect, useCallback } from 'react';
import { usePhase4Analytics } from './use-phase4-analytics';

export interface SystemHealthData {
  status: 'healthy' | 'warning' | 'critical';
  cpu: number;
  memory: number;
  errorRate: number;
  responseTime: number;
  activeSessions: number;
}

export interface PerformanceData {
  fps: number;
  memoryUsage: number;
  bundleSize: number;
  networkLatency: number;
  slowQueries: number;
}

export interface UserBehaviorData {
  activeUsers: number;
  topPages: Array<{ path: string; visits: number }>;
  averageSessionTime: number;
  bounceRate: number;
  interactions: Array<{ action: string; count: number }>;
}

export interface DatabaseData {
  slowQueries: Array<{ query: string; duration: number; table: string }>;
  hotspots: Array<{ table: string; queries: number }>;
  connectionPool: number;
  optimizations: string[];
}

export interface LiveActivity {
  id: string;
  type: 'navigation' | 'performance' | 'error' | 'interaction';
  message: string;
  timestamp: number;
  severity: 'info' | 'warning' | 'error';
}

export interface RealtimeAnalyticsData {
  systemHealth: SystemHealthData;
  performance: PerformanceData;
  userBehavior: UserBehaviorData;
  database: DatabaseData;
  liveActivity: LiveActivity[];
  lastUpdated: number;
}

export const useRealtimeAnalytics = () => {
  const [data, setData] = useState<RealtimeAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  const phase4Analytics = usePhase4Analytics();

  const processAnalyticsData = useCallback((): RealtimeAnalyticsData => {
    const fullReport = phase4Analytics.getFullReport();
    const insights = phase4Analytics.analytics.getInsights();
    const performanceReport = phase4Analytics.performance.getIntelligenceReport();
    const behaviorInsights = phase4Analytics.behavior.getBehaviorInsights();
    const databaseInsights = phase4Analytics.database.getDatabaseIntelligence();

    // Process system health
    const systemHealth: SystemHealthData = {
      status: insights.anomalies.length > 2 ? 'critical' : insights.anomalies.length > 0 ? 'warning' : 'healthy',
      cpu: Math.random() * 100, // Simulated for demo
      memory: (performance as any).memory?.usedJSHeapSize / (performance as any).memory?.jsHeapSizeLimit * 100 || 45,
      errorRate: insights.anomalies.length / Math.max(insights.totalMetrics, 1) * 100,
      responseTime: 120, // Simulated
      activeSessions: 156 // Simulated
    };

    // Process performance data
    const performance_data: PerformanceData = {
      fps: 60, // Simulated
      memoryUsage: systemHealth.memory,
      bundleSize: 2.4, // MB
      networkLatency: Math.random() * 100 + 50,
      slowQueries: Array.isArray(databaseInsights.slowQueries) ? databaseInsights.slowQueries.length : 0
    };

    // Process user behavior
    const userBehavior: UserBehaviorData = {
      activeUsers: 156, // Simulated
      topPages: [
        { path: '/dashboard', visits: 1250 },
        { path: '/quiz', visits: 890 },
        { path: '/leaderboard', visits: 456 },
        { path: '/profile', visits: 234 }
      ],
      averageSessionTime: behaviorInsights.engagement?.averageSessionTime || 8.5,
      bounceRate: behaviorInsights.engagement?.bounceRate || 24.5,
      interactions: [
        { action: 'quiz_start', count: 450 },
        { action: 'button_click', count: 1200 },
        { action: 'navigation', count: 800 }
      ]
    };

    // Process database data
    const database: DatabaseData = {
      slowQueries: [
        { query: 'SELECT * FROM users WHERE...', duration: 2500, table: 'users' },
        { query: 'UPDATE quiz_results SET...', duration: 1800, table: 'quiz_results' }
      ],
      hotspots: [
        { table: 'users', queries: 1250 },
        { table: 'quiz_results', queries: 890 },
        { table: 'leaderboard', queries: 456 }
      ],
      connectionPool: Math.floor(Math.random() * 20) + 5,
      optimizations: [
        'Add index on users.email',
        'Optimize quiz_results query',
        'Cache leaderboard data'
      ]
    };

    // Generate live activity
    const liveActivity: LiveActivity[] = [
      {
        id: '1',
        type: 'navigation',
        message: 'User navegou para /dashboard',
        timestamp: Date.now() - 30000,
        severity: 'info'
      },
      {
        id: '2',
        type: 'performance',
        message: 'Query lenta detectada: 2.5s',
        timestamp: Date.now() - 45000,
        severity: 'warning'
      },
      {
        id: '3',
        type: 'error',
        message: 'Pico de memória: 85% de uso',
        timestamp: Date.now() - 60000,
        severity: 'error'
      },
      {
        id: '4',
        type: 'interaction',
        message: 'Nova interação: quiz_completed',
        timestamp: Date.now() - 75000,
        severity: 'info'
      },
      {
        id: '5',
        type: 'navigation',
        message: 'Usuário acessou /leaderboard',
        timestamp: Date.now() - 90000,
        severity: 'info'
      }
    ];

    return {
      systemHealth,
      performance: performance_data,
      userBehavior,
      database,
      liveActivity,
      lastUpdated: Date.now()
    };
  }, [phase4Analytics]);

  const refreshData = useCallback(() => {
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      const newData = processAnalyticsData();
      setData(newData);
      setLoading(false);
    }, 500);
  }, [processAnalyticsData]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refreshData();
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, refreshData]);

  return {
    data,
    loading,
    autoRefresh,
    setAutoRefresh,
    refreshData
  };
};