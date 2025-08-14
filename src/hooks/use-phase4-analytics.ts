// Phase 4: Advanced Analytics Integration Hook
import { useEffect } from 'react';
import { analyticsEngine } from '../lib/analytics-engine';
import { intelligenceDashboard, getDashboardData, getDashboardSummary } from '../lib/intelligence-dashboard';
import { userBehaviorAnalytics, getBehaviorInsights, trackFeature, trackNavigation, trackInteraction } from '../lib/user-behavior-analytics';
import { performanceIntelligence, getIntelligenceReport, getPerformancePredictions, getOptimizationOpportunities } from '../lib/performance-intelligence';
import { databaseQueryIntelligence, getDatabaseIntelligence, trackQuery } from '../lib/database-query-intelligence';

export const usePhase4Analytics = () => {
  useEffect(() => {
    // Initialize all Phase 4 analytics systems
    console.log('🚀 Phase 4: Advanced Analytics & Insights initialized');
    
    // Track the initialization event
    analyticsEngine.collectMetric('system', {
      event: 'phase4_analytics_initialized',
      timestamp: Date.now(),
      userAgent: navigator.userAgent
    });

    return () => {
      console.log('🔄 Phase 4: Advanced Analytics cleanup');
    };
  }, []);

  // Return comprehensive analytics API
  return {
    // Analytics Engine
    analytics: {
      collectMetric: analyticsEngine.collectMetric.bind(analyticsEngine),
      getInsights: analyticsEngine.getInsights.bind(analyticsEngine),
      clearMetrics: analyticsEngine.clearMetrics.bind(analyticsEngine)
    },

    // Intelligence Dashboard
    dashboard: {
      getSystemHealth: intelligenceDashboard.getSystemHealth.bind(intelligenceDashboard),
      getWidgets: intelligenceDashboard.getWidgets.bind(intelligenceDashboard),
      getActiveAlerts: intelligenceDashboard.getActiveAlerts.bind(intelligenceDashboard),
      getDashboardData,
      getDashboardSummary
    },

    // User Behavior Analytics
    behavior: {
      trackFeature,
      trackNavigation,
      trackInteraction,
      getCurrentSession: userBehaviorAnalytics.getCurrentSession.bind(userBehaviorAnalytics),
      getBehaviorInsights,
      getEngagementMetrics: userBehaviorAnalytics.getEngagementMetrics.bind(userBehaviorAnalytics)
    },

    // Performance Intelligence
    performance: {
      getPredictions: getPerformancePredictions,
      getOptimizationOpportunities,
      getIntelligenceReport,
      getAnomalies: performanceIntelligence.getAnomalies.bind(performanceIntelligence)
    },

    // Database Query Intelligence
    database: {
      trackQuery,
      getDatabaseIntelligence,
      getQueryMetrics: databaseQueryIntelligence.getQueryMetrics.bind(databaseQueryIntelligence),
      getOptimizations: databaseQueryIntelligence.getOptimizations.bind(databaseQueryIntelligence),
      getHotspots: databaseQueryIntelligence.getHotspots.bind(databaseQueryIntelligence)
    },

    // Comprehensive reporting
    getFullReport: () => ({
      analytics: analyticsEngine.getInsights(),
      dashboard: getDashboardSummary(),
      behavior: getBehaviorInsights(),
      performance: getIntelligenceReport(),
      database: getDatabaseIntelligence(),
      timestamp: Date.now()
    })
  };
};

// Auto-tracking hook for route changes
export const useAnalyticsRouteTracking = () => {
  useEffect(() => {
    const handleRouteChange = () => {
      const path = window.location.pathname;
      trackNavigation(path);
      
      // Track route performance
      if (performance.timing) {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        analyticsEngine.collectMetric('performance', {
          operation: 'route_change',
          duration: loadTime,
          route: path
        });
      }
    };

    // Track initial route
    handleRouteChange();

    // Listen for route changes
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);
};

// Auto-tracking hook for feature usage
export const useAnalyticsFeatureTracking = (featureName: string) => {
  useEffect(() => {
    trackFeature(`feature_${featureName}_viewed`);
  }, [featureName]);

  const trackFeatureAction = (action: string, metadata?: Record<string, any>) => {
    trackFeature(`feature_${featureName}_${action}`, metadata);
    trackInteraction(action, featureName, metadata);
  };

  return { trackFeatureAction };
};

// Hook for performance monitoring with analytics
export const useAnalyticsPerformanceMonitoring = () => {
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = frameCount;
        frameCount = 0;
        lastTime = currentTime;
        
        analyticsEngine.collectMetric('performance', {
          metric: 'fps',
          value: fps,
          timestamp: currentTime
        });
      }
      
      requestAnimationFrame(measureFPS);
    };

    requestAnimationFrame(measureFPS);

    // Monitor memory usage
    const memoryInterval = setInterval(() => {
      if ((performance as any).memory) {
        const memory = (performance as any).memory;
        analyticsEngine.collectMetric('performance', {
          metric: 'memory_usage',
          value: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit,
          usageRatio: memory.usedJSHeapSize / memory.jsHeapSizeLimit
        });
      }
    }, 15000);

    return () => {
      clearInterval(memoryInterval);
    };
  }, []);
};