// Phase 4: User Behavior Analytics - Anonymous Intelligence System
import { trackUserBehavior } from './analytics-engine';

interface UserSession {
  sessionId: string;
  startTime: number;
  lastActivity: number;
  pageViews: number;
  interactions: number;
  errors: number;
  navigationPath: string[];
  features: string[];
  anonymous: boolean;
}

interface BehaviorPattern {
  id: string;
  type: 'navigation' | 'interaction' | 'feature_usage' | 'error_pattern';
  frequency: number;
  confidence: number;
  description: string;
  actionable: boolean;
  recommendation?: string;
}

interface UserFlow {
  flowId: string;
  steps: string[];
  frequency: number;
  dropOffPoints: number[];
  completionRate: number;
  averageTime: number;
}

interface FrictionPoint {
  location: string;
  type: 'slow_load' | 'high_error_rate' | 'high_abandon_rate' | 'usability_issue';
  severity: 'low' | 'medium' | 'high' | 'critical';
  frequency: number;
  impact: number;
  suggestion: string;
}

class UserBehaviorAnalytics {
  private currentSession: UserSession | null = null;
  private behaviorPatterns: Map<string, BehaviorPattern> = new Map();
  private userFlows: Map<string, UserFlow> = new Map();
  private frictionPoints: Map<string, FrictionPoint> = new Map();
  private heatmapData: Map<string, { clicks: number; time: number; }> = new Map();
  private engagementMetrics = {
    averageSessionTime: 0,
    bounceRate: 0,
    pageViewsPerSession: 0,
    interactionRate: 0
  };

  constructor() {
    this.initializeAnalytics();
  }

  private initializeAnalytics() {
    this.startSession();
    this.setupEventListeners();
    this.startAnalysisEngine();
  }

  private startSession() {
    this.currentSession = {
      sessionId: crypto.randomUUID(),
      startTime: Date.now(),
      lastActivity: Date.now(),
      pageViews: 0,
      interactions: 0,
      errors: 0,
      navigationPath: [],
      features: [],
      anonymous: true
    };

    // Track session start
    trackUserBehavior('session_start', {
      sessionId: this.currentSession.sessionId,
      timestamp: this.currentSession.startTime,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'unknown'
    });
  }

  private setupEventListeners() {
    if (typeof window === 'undefined') return;

    // Track page navigation
    window.addEventListener('popstate', () => {
      this.trackPageView(window.location.pathname);
    });

    // Track clicks for heatmap
    document.addEventListener('click', (event: MouseEvent) => {
      this.trackClick(event);
    });

    // Track scroll behavior
    let scrollTimeout: NodeJS.Timeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.trackScrollBehavior();
      }, 150);
    });

    // Track visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackSessionPause();
      } else {
        this.trackSessionResume();
      }
    });

    // Track beforeunload for session end
    window.addEventListener('beforeunload', () => {
      this.endSession();
    });

    // Track errors
    window.addEventListener('error', (event) => {
      this.trackError(event.error);
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError(event.reason);
    });
  }

  private startAnalysisEngine() {
    // Run analysis every 30 seconds
    setInterval(() => {
      this.analyzeUserBehavior();
    }, 30000);

    // Generate insights every 5 minutes
    setInterval(() => {
      this.generateInsights();
    }, 300000);

    // Update engagement metrics every minute
    setInterval(() => {
      this.updateEngagementMetrics();
    }, 60000);
  }

  // Public tracking methods
  trackPageView(path: string) {
    if (!this.currentSession) return;

    this.currentSession.pageViews++;
    this.currentSession.lastActivity = Date.now();
    this.currentSession.navigationPath.push(path);

    trackUserBehavior('page_view', {
      path,
      sessionId: this.currentSession.sessionId,
      pageViewCount: this.currentSession.pageViews,
      timestamp: Date.now()
    });

    this.analyzeNavigationPattern(path);
  }

  trackFeatureUsage(feature: string, metadata?: Record<string, any>) {
    if (!this.currentSession) return;

    this.currentSession.interactions++;
    this.currentSession.lastActivity = Date.now();
    
    if (!this.currentSession.features.includes(feature)) {
      this.currentSession.features.push(feature);
    }

    trackUserBehavior('feature_usage', {
      feature,
      sessionId: this.currentSession.sessionId,
      metadata,
      timestamp: Date.now()
    });

    this.analyzeFeaturePattern(feature);
  }

  trackUserInteraction(interaction: string, element?: string, metadata?: Record<string, any>) {
    if (!this.currentSession) return;

    this.currentSession.interactions++;
    this.currentSession.lastActivity = Date.now();

    trackUserBehavior('user_interaction', {
      interaction,
      element,
      sessionId: this.currentSession.sessionId,
      metadata,
      timestamp: Date.now()
    });
  }

  trackError(error: any) {
    if (!this.currentSession) return;

    this.currentSession.errors++;
    this.currentSession.lastActivity = Date.now();

    const errorData = {
      message: error?.message || 'Unknown error',
      stack: error?.stack?.substring(0, 500) || 'No stack trace',
      sessionId: this.currentSession.sessionId,
      currentPath: window.location.pathname,
      timestamp: Date.now()
    };

    trackUserBehavior('error_encounter', errorData);

    this.analyzeFrictionPoint('error', window.location.pathname, {
      errorType: error?.name || 'Unknown',
      frequency: 1
    });
  }

  private trackClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const selector = this.getElementSelector(target);
    
    // Update heatmap data
    const existing = this.heatmapData.get(selector);
    if (existing) {
      existing.clicks++;
    } else {
      this.heatmapData.set(selector, { clicks: 1, time: Date.now() });
    }

    this.trackUserInteraction('click', selector, {
      x: event.clientX,
      y: event.clientY,
      tagName: target.tagName,
      className: target.className
    });
  }

  private trackScrollBehavior() {
    const scrollPercent = Math.round(
      (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
    );

    this.trackUserInteraction('scroll', 'page', {
      scrollPercent,
      path: window.location.pathname
    });
  }

  private trackSessionPause() {
    trackUserBehavior('session_pause', {
      sessionId: this.currentSession?.sessionId,
      timestamp: Date.now()
    });
  }

  private trackSessionResume() {
    if (this.currentSession) {
      this.currentSession.lastActivity = Date.now();
    }

    trackUserBehavior('session_resume', {
      sessionId: this.currentSession?.sessionId,
      timestamp: Date.now()
    });
  }

  private endSession() {
    if (!this.currentSession) return;

    const sessionDuration = Date.now() - this.currentSession.startTime;

    trackUserBehavior('session_end', {
      sessionId: this.currentSession.sessionId,
      duration: sessionDuration,
      pageViews: this.currentSession.pageViews,
      interactions: this.currentSession.interactions,
      errors: this.currentSession.errors,
      featuresUsed: this.currentSession.features.length,
      navigationDepth: this.currentSession.navigationPath.length
    });

    this.analyzeSessionCompletion();
    this.currentSession = null;
  }

  // Analysis methods
  private analyzeNavigationPattern(currentPath: string) {
    if (!this.currentSession || this.currentSession.navigationPath.length < 2) return;

    const path = this.currentSession.navigationPath;
    const flowId = path.slice(-3).join(' → '); // Last 3 pages

    const existing = this.userFlows.get(flowId);
    if (existing) {
      existing.frequency++;
    } else {
      this.userFlows.set(flowId, {
        flowId,
        steps: path.slice(-3),
        frequency: 1,
        dropOffPoints: [],
        completionRate: 0,
        averageTime: 0
      });
    }
  }

  private analyzeFeaturePattern(feature: string) {
    const patternId = `feature_${feature}`;
    const existing = this.behaviorPatterns.get(patternId);

    if (existing) {
      existing.frequency++;
      existing.confidence = Math.min(existing.frequency / 100, 1);
    } else {
      this.behaviorPatterns.set(patternId, {
        id: patternId,
        type: 'feature_usage',
        frequency: 1,
        confidence: 0.01,
        description: `User frequently uses ${feature} feature`,
        actionable: false
      });
    }
  }

  private analyzeFrictionPoint(type: string, location: string, metadata: any) {
    const frictionId = `${type}_${location}`;
    const existing = this.frictionPoints.get(frictionId);

    if (existing) {
      existing.frequency++;
      existing.impact = this.calculateImpact(existing.frequency);
    } else {
      this.frictionPoints.set(frictionId, {
        location,
        type: type as any,
        severity: this.calculateSeverity(metadata),
        frequency: 1,
        impact: 1,
        suggestion: this.generateFrictionSuggestion(type, metadata)
      });
    }
  }

  private analyzeSessionCompletion() {
    if (!this.currentSession) return;

    const sessionDuration = Date.now() - this.currentSession.startTime;
    const isQualitySession = sessionDuration > 30000 && this.currentSession.interactions > 3;

    if (isQualitySession) {
      // Analyze successful patterns
      this.currentSession.navigationPath.forEach((path, index) => {
        if (index > 0) {
          const patternId = `successful_nav_${this.currentSession!.navigationPath[index - 1]}_to_${path}`;
          const existing = this.behaviorPatterns.get(patternId);
          
          if (existing) {
            existing.frequency++;
          } else {
            this.behaviorPatterns.set(patternId, {
              id: patternId,
              type: 'navigation',
              frequency: 1,
              confidence: 0.1,
              description: `Successful navigation pattern`,
              actionable: true,
              recommendation: 'Consider optimizing this navigation path'
            });
          }
        }
      });
    }
  }

  private analyzeUserBehavior() {
    // Analyze patterns and update metrics
    this.identifyNewPatterns();
    this.updatePatternConfidence();
    this.detectAnomalies();
  }

  private identifyNewPatterns() {
    // Machine learning-like pattern detection
    const recentPatterns = Array.from(this.behaviorPatterns.values())
      .filter(p => p.frequency >= 5 && p.confidence < 0.5);

    recentPatterns.forEach(pattern => {
      if (pattern.frequency >= 10) {
        pattern.actionable = true;
        pattern.recommendation = this.generateRecommendation(pattern);
      }
    });
  }

  private updatePatternConfidence() {
    this.behaviorPatterns.forEach(pattern => {
      pattern.confidence = Math.min(pattern.frequency / 50, 1);
    });
  }

  private detectAnomalies() {
    if (!this.currentSession) return;

    // Detect unusual behavior
    const sessionTime = Date.now() - this.currentSession.startTime;
    
    // Very long session with no interactions (potential bot)
    if (sessionTime > 3600000 && this.currentSession.interactions < 5) {
      trackUserBehavior('anomaly_detected', {
        type: 'suspicious_long_session',
        sessionId: this.currentSession.sessionId,
        duration: sessionTime,
        interactions: this.currentSession.interactions
      });
    }

    // Too many errors in short time
    if (this.currentSession.errors > 5 && sessionTime < 300000) {
      trackUserBehavior('anomaly_detected', {
        type: 'high_error_rate',
        sessionId: this.currentSession.sessionId,
        errors: this.currentSession.errors,
        duration: sessionTime
      });
    }
  }

  private generateInsights() {
    const insights = {
      topNavigationPaths: this.getTopUserFlows(),
      mostUsedFeatures: this.getMostUsedFeatures(),
      majorFrictionPoints: this.getMajorFrictionPoints(),
      engagementMetrics: this.engagementMetrics,
      behaviorPatterns: Array.from(this.behaviorPatterns.values())
        .filter(p => p.actionable)
        .slice(0, 10)
    };

    console.log('🧠 User Behavior Analytics: Insights generated', insights);
  }

  private updateEngagementMetrics() {
    // Update engagement metrics based on collected data
    // This is a simplified calculation
    if (this.currentSession) {
      const sessionTime = Date.now() - this.currentSession.startTime;
      this.engagementMetrics.averageSessionTime = sessionTime;
      this.engagementMetrics.pageViewsPerSession = this.currentSession.pageViews;
      this.engagementMetrics.interactionRate = this.currentSession.interactions / Math.max(1, this.currentSession.pageViews);
    }
  }

  // Utility methods
  private getElementSelector(element: HTMLElement): string {
    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(' ')[0]}`;
    return element.tagName.toLowerCase();
  }

  private calculateSeverity(metadata: any): 'low' | 'medium' | 'high' | 'critical' {
    if (metadata.errorType === 'TypeError' || metadata.errorType === 'ReferenceError') return 'high';
    if (metadata.frequency > 10) return 'critical';
    if (metadata.frequency > 5) return 'high';
    if (metadata.frequency > 2) return 'medium';
    return 'low';
  }

  private calculateImpact(frequency: number): number {
    return Math.min(frequency / 10, 10);
  }

  private generateFrictionSuggestion(type: string, metadata: any): string {
    switch (type) {
      case 'error':
        return 'Investigate and fix this recurring error to improve user experience';
      case 'slow_load':
        return 'Optimize loading performance for this page or component';
      default:
        return 'Analyze this friction point and implement improvements';
    }
  }

  private generateRecommendation(pattern: BehaviorPattern): string {
    switch (pattern.type) {
      case 'navigation':
        return 'Consider simplifying or optimizing this navigation pattern';
      case 'feature_usage':
        return 'Consider making this popular feature more prominent';
      case 'interaction':
        return 'Analyze this interaction pattern for optimization opportunities';
      default:
        return 'Review this pattern for potential improvements';
    }
  }

  // Public API
  getTopUserFlows(): UserFlow[] {
    return Array.from(this.userFlows.values())
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);
  }

  getMostUsedFeatures(): Array<{ feature: string; usage: number }> {
    const featureUsage = Array.from(this.behaviorPatterns.values())
      .filter(p => p.type === 'feature_usage')
      .map(p => ({
        feature: p.id.replace('feature_', ''),
        usage: p.frequency
      }))
      .sort((a, b) => b.usage - a.usage);

    return featureUsage.slice(0, 10);
  }

  getMajorFrictionPoints(): FrictionPoint[] {
    return Array.from(this.frictionPoints.values())
      .filter(f => f.severity === 'high' || f.severity === 'critical')
      .sort((a, b) => b.impact - a.impact);
  }

  getCurrentSession(): UserSession | null {
    return this.currentSession;
  }

  getBehaviorPatterns(): BehaviorPattern[] {
    return Array.from(this.behaviorPatterns.values());
  }

  getHeatmapData(): Map<string, { clicks: number; time: number; }> {
    return new Map(this.heatmapData);
  }

  getEngagementMetrics() {
    return { ...this.engagementMetrics };
  }

  // Reset methods for testing/debugging
  clearData() {
    this.behaviorPatterns.clear();
    this.userFlows.clear();
    this.frictionPoints.clear();
    this.heatmapData.clear();
  }
}

export const userBehaviorAnalytics = new UserBehaviorAnalytics();

// Convenience functions for components
export const trackFeature = (feature: string, metadata?: Record<string, any>) => {
  userBehaviorAnalytics.trackFeatureUsage(feature, metadata);
};

export const trackInteraction = (interaction: string, element?: string, metadata?: Record<string, any>) => {
  userBehaviorAnalytics.trackUserInteraction(interaction, element, metadata);
};

export const trackNavigation = (path: string) => {
  userBehaviorAnalytics.trackPageView(path);
};

export const getBehaviorInsights = () => ({
  topFlows: userBehaviorAnalytics.getTopUserFlows(),
  mostUsedFeatures: userBehaviorAnalytics.getMostUsedFeatures(),
  frictionPoints: userBehaviorAnalytics.getMajorFrictionPoints(),
  engagement: userBehaviorAnalytics.getEngagementMetrics(),
  currentSession: userBehaviorAnalytics.getCurrentSession()
});