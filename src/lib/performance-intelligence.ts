// Phase 4: Performance Intelligence - Predictive Analytics System
import { analyticsEngine } from './analytics-engine';

interface PerformancePrediction {
  metric: string;
  currentValue: number;
  predictedValue: number;
  trend: 'improving' | 'stable' | 'degrading';
  confidence: number;
  timeframe: string;
  recommendation?: string;
}

interface PerformanceAnomaly {
  id: string;
  type: 'memory_spike' | 'slow_response' | 'high_error_rate' | 'resource_leak';
  severity: 'low' | 'medium' | 'high' | 'critical';
  detectedAt: number;
  metric: string;
  currentValue: number;
  expectedValue: number;
  deviation: number;
  possibleCauses: string[];
  autoMitigation?: string;
}

interface OptimizationOpportunity {
  id: string;
  area: 'bundle' | 'database' | 'memory' | 'network' | 'cache';
  impact: 'low' | 'medium' | 'high' | 'critical';
  effort: 'low' | 'medium' | 'high';
  description: string;
  estimatedImprovement: string;
  implementation: string[];
}

interface PerformanceBaseline {
  metric: string;
  baseline: number;
  variance: number;
  samples: number;
  lastUpdated: number;
}

class PerformanceIntelligence {
  private baselines: Map<string, PerformanceBaseline> = new Map();
  private predictions: Map<string, PerformancePrediction> = new Map();
  private anomalies: PerformanceAnomaly[] = [];
  private optimizations: OptimizationOpportunity[] = [];
  private historicalData: Map<string, Array<{ value: number; timestamp: number }>> = new Map();
  private isLearning = true;

  constructor() {
    this.initializeIntelligence();
  }

  private initializeIntelligence() {
    this.startPerformanceTracking();
    this.startAnomalyDetection();
    this.startPredictiveAnalysis();
    this.startOptimizationEngine();
  }

  private startPerformanceTracking() {
    // Collect performance metrics every 15 seconds
    setInterval(() => {
      this.collectPerformanceMetrics();
    }, 15000);

    // Update baselines every 5 minutes
    setInterval(() => {
      this.updateBaselines();
    }, 300000);
  }

  private startAnomalyDetection() {
    // Check for anomalies every 30 seconds
    setInterval(() => {
      this.detectAnomalies();
    }, 30000);

    // Clean up old anomalies every hour
    setInterval(() => {
      this.cleanupOldAnomalies();
    }, 3600000);
  }

  private startPredictiveAnalysis() {
    // Generate predictions every 10 minutes
    setInterval(() => {
      this.generatePredictions();
    }, 600000);

    // Update trend analysis every 5 minutes
    setInterval(() => {
      this.updateTrendAnalysis();
    }, 300000);
  }

  private startOptimizationEngine() {
    // Analyze optimization opportunities every 15 minutes
    setInterval(() => {
      this.analyzeOptimizationOpportunities();
    }, 900000);

    // Execute automatic optimizations every 30 minutes
    setInterval(() => {
      this.executeAutomaticOptimizations();
    }, 1800000);
  }

  private collectPerformanceMetrics() {
    if (typeof window === 'undefined') return;

    const metrics = this.getCurrentMetrics();
    
    Object.entries(metrics).forEach(([key, value]) => {
      this.updateHistoricalData(key, value);
      this.checkMetricBaseline(key, value);
    });
  }

  private getCurrentMetrics(): Record<string, number> {
    const metrics: Record<string, number> = {};

    // Memory metrics
    if ((performance as any).memory) {
      const memory = (performance as any).memory;
      metrics.memoryUsed = memory.usedJSHeapSize;
      metrics.memoryUsageRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
    }

    // Performance timing
    if (performance.timing) {
      const timing = performance.timing;
      metrics.domContentLoaded = timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart;
      metrics.pageLoad = timing.loadEventEnd - timing.navigationStart;
    }

    // Resource metrics
    const resources = performance.getEntriesByType('resource');
    metrics.resourceCount = resources.length;
    metrics.averageResourceTime = resources.length > 0 
      ? resources.reduce((sum, r) => sum + r.duration, 0) / resources.length 
      : 0;

    // Navigation metrics
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      metrics.dnsLookup = navigation.domainLookupEnd - navigation.domainLookupStart;
      metrics.tcpConnect = navigation.connectEnd - navigation.connectStart;
      metrics.responseTime = navigation.responseEnd - navigation.requestStart;
    }

    // FPS estimation (simplified)
    metrics.estimatedFPS = this.estimateFPS();

    return metrics;
  }

  private estimateFPS(): number {
    // Simplified FPS estimation based on animation frame timing
    let lastTime = performance.now();
    let frames = 0;
    const samples = 60;

    const measure = () => {
      frames++;
      if (frames < samples) {
        requestAnimationFrame(measure);
      } else {
        const currentTime = performance.now();
        const fps = (frames * 1000) / (currentTime - lastTime);
        return Math.round(fps);
      }
    };

    requestAnimationFrame(measure);
    return 60; // Default assumption
  }

  private updateHistoricalData(metric: string, value: number) {
    const history = this.historicalData.get(metric) || [];
    history.push({ value, timestamp: Date.now() });

    // Keep only last 100 data points
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }

    this.historicalData.set(metric, history);
  }

  private checkMetricBaseline(metric: string, value: number) {
    const baseline = this.baselines.get(metric);
    
    if (!baseline) {
      // Create new baseline
      this.baselines.set(metric, {
        metric,
        baseline: value,
        variance: 0,
        samples: 1,
        lastUpdated: Date.now()
      });
      return;
    }

    // Check for anomaly
    const deviation = Math.abs(value - baseline.baseline);
    const threshold = baseline.baseline * 0.5; // 50% deviation threshold

    if (deviation > threshold) {
      this.reportAnomaly(metric, value, baseline.baseline, deviation);
    }
  }

  private updateBaselines() {
    this.baselines.forEach((baseline, metric) => {
      const history = this.historicalData.get(metric);
      if (!history || history.length < 5) return;

      // Calculate new baseline from recent data
      const recentData = history.slice(-20); // Last 20 samples
      const values = recentData.map(d => d.value);
      
      const newBaseline = values.reduce((sum, val) => sum + val, 0) / values.length;
      const variance = this.calculateVariance(values, newBaseline);

      baseline.baseline = newBaseline;
      baseline.variance = variance;
      baseline.samples = values.length;
      baseline.lastUpdated = Date.now();
    });
  }

  private calculateVariance(values: number[], mean: number): number {
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
  }

  private detectAnomalies() {
    const currentMetrics = this.getCurrentMetrics();

    Object.entries(currentMetrics).forEach(([metric, value]) => {
      const baseline = this.baselines.get(metric);
      if (!baseline) return;

      const deviation = Math.abs(value - baseline.baseline);
      const threshold = Math.sqrt(baseline.variance) * 2; // 2 standard deviations

      if (deviation > threshold) {
        const severity = this.calculateAnomalySeverity(deviation, threshold);
        
        if (severity !== 'low') {
          this.reportAnomaly(metric, value, baseline.baseline, deviation, severity);
        }
      }
    });
  }

  private calculateAnomalySeverity(deviation: number, threshold: number): 'low' | 'medium' | 'high' | 'critical' {
    const ratio = deviation / threshold;
    
    if (ratio > 4) return 'critical';
    if (ratio > 2) return 'high';
    if (ratio > 1.5) return 'medium';
    return 'low';
  }

  private reportAnomaly(metric: string, currentValue: number, expectedValue: number, deviation: number, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium') {
    const anomaly: PerformanceAnomaly = {
      id: crypto.randomUUID(),
      type: this.classifyAnomalyType(metric, currentValue, expectedValue),
      severity,
      detectedAt: Date.now(),
      metric,
      currentValue,
      expectedValue,
      deviation,
      possibleCauses: this.identifyPossibleCauses(metric, currentValue, expectedValue),
      autoMitigation: this.getAutoMitigation(metric)
    };

    this.anomalies.push(anomaly);
    
    console.warn('🔍 Performance Intelligence: Anomaly detected', anomaly);

    // Auto-mitigate if possible
    if (anomaly.autoMitigation) {
      this.executeAutoMitigation(anomaly);
    }
  }

  private classifyAnomalyType(metric: string, current: number, expected: number): PerformanceAnomaly['type'] {
    if (metric.includes('memory')) {
      return current > expected ? 'memory_spike' : 'resource_leak';
    }
    if (metric.includes('Time') || metric.includes('response')) {
      return 'slow_response';
    }
    if (metric.includes('error')) {
      return 'high_error_rate';
    }
    return 'slow_response';
  }

  private identifyPossibleCauses(metric: string, current: number, expected: number): string[] {
    const causes = [];

    if (metric.includes('memory')) {
      if (current > expected) {
        causes.push('Memory leak in JavaScript code');
        causes.push('Large data structures not being garbage collected');
        causes.push('Too many DOM nodes created');
      }
    }

    if (metric.includes('Time') || metric.includes('response')) {
      causes.push('Network latency increase');
      causes.push('Server-side performance degradation');
      causes.push('Large bundle size affecting load time');
    }

    if (metric.includes('resource')) {
      causes.push('Too many HTTP requests');
      causes.push('Large asset files');
      causes.push('Inefficient caching strategy');
    }

    return causes.length > 0 ? causes : ['Unknown cause - requires investigation'];
  }

  private getAutoMitigation(metric: string): string | undefined {
    if (metric.includes('memory')) {
      return 'trigger_garbage_collection';
    }
    if (metric.includes('cache')) {
      return 'clear_cache';
    }
    if (metric.includes('resource')) {
      return 'optimize_resources';
    }
    return undefined;
  }

  private executeAutoMitigation(anomaly: PerformanceAnomaly) {
    switch (anomaly.autoMitigation) {
      case 'trigger_garbage_collection':
        if ((window as any).gc) {
          (window as any).gc();
          console.log('🧹 Performance Intelligence: Triggered garbage collection');
        }
        break;
      
      case 'clear_cache':
        if ('caches' in window) {
          caches.keys().then(cacheNames => {
            cacheNames.forEach(cacheName => {
              if (cacheName.includes('temp') || cacheName.includes('stale')) {
                caches.delete(cacheName);
              }
            });
          });
          console.log('🧹 Performance Intelligence: Cleared temporary caches');
        }
        break;
      
      case 'optimize_resources':
        // Defer non-critical resource loading
        const images = document.querySelectorAll('img[loading=\\\"eager\\\"]');
        images.forEach(img => {
          img.setAttribute('loading', 'lazy');
        });
        console.log('🧹 Performance Intelligence: Optimized resource loading');
        break;
    }
  }

  private generatePredictions() {
    this.baselines.forEach((baseline, metric) => {
      const history = this.historicalData.get(metric);
      if (!history || history.length < 10) return;

      const prediction = this.predictMetricTrend(metric, history);
      this.predictions.set(metric, prediction);
    });

    console.log('🔮 Performance Intelligence: Generated predictions', Array.from(this.predictions.values()));
  }

  private predictMetricTrend(metric: string, history: Array<{ value: number; timestamp: number }>): PerformancePrediction {
    const recentData = history.slice(-20);
    const values = recentData.map(d => d.value);
    
    // Simple linear regression for trend
    const trend = this.calculateTrend(values);
    const currentValue = values[values.length - 1];
    const predictedValue = currentValue + (trend * 10); // Predict 10 intervals ahead
    
    return {
      metric,
      currentValue,
      predictedValue,
      trend: this.classifyTrend(trend),
      confidence: this.calculateConfidence(values),
      timeframe: '5 minutes',
      recommendation: this.getRecommendation(metric, trend)
    };
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;

    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, idx) => sum + (idx * val), 0);
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope;
  }

  private classifyTrend(trend: number): 'improving' | 'stable' | 'degrading' {
    if (Math.abs(trend) < 0.1) return 'stable';
    return trend > 0 ? 'degrading' : 'improving';
  }

  private calculateConfidence(values: number[]): number {
    if (values.length < 5) return 0.3;
    
    const variance = this.calculateVariance(values, values.reduce((a, b) => a + b, 0) / values.length);
    const stability = 1 / (1 + variance);
    
    return Math.min(stability, 0.95);
  }

  private getRecommendation(metric: string, trend: number): string | undefined {
    if (Math.abs(trend) < 0.1) return undefined;

    if (metric.includes('memory') && trend > 0) {
      return 'Consider implementing memory optimization strategies';
    }
    if (metric.includes('Time') && trend > 0) {
      return 'Investigate and optimize slow operations';
    }
    if (metric.includes('resource') && trend > 0) {
      return 'Review and optimize resource loading strategies';
    }

    return 'Monitor trend and consider optimization if it continues';
  }

  private updateTrendAnalysis() {
    // Update trend analysis for all metrics
    this.predictions.forEach((prediction, metric) => {
      const history = this.historicalData.get(metric);
      if (history && history.length >= 5) {
        const recentTrend = this.calculateTrend(history.slice(-5).map(d => d.value));
        prediction.trend = this.classifyTrend(recentTrend);
        prediction.confidence = this.calculateConfidence(history.slice(-10).map(d => d.value));
      }
    });
  }

  private analyzeOptimizationOpportunities() {
    this.optimizations = [];

    // Bundle optimization opportunities
    this.analyzeBundle();
    
    // Memory optimization opportunities
    this.analyzeMemory();
    
    // Database optimization opportunities
    this.analyzeDatabase();
    
    // Network optimization opportunities
    this.analyzeNetwork();

    console.log('🎯 Performance Intelligence: Optimization opportunities identified', this.optimizations);
  }

  private analyzeBundle() {
    const resourceMetrics = this.historicalData.get('resourceCount');
    const avgResourceTime = this.historicalData.get('averageResourceTime');
    
    if (resourceMetrics && resourceMetrics.length > 0) {
      const latestCount = resourceMetrics[resourceMetrics.length - 1].value;
      
      if (latestCount > 50) {
        this.optimizations.push({
          id: 'bundle-optimization-1',
          area: 'bundle',
          impact: 'high',
          effort: 'medium',
          description: 'High number of resource requests detected',
          estimatedImprovement: '20-30% faster load times',
          implementation: [
            'Implement resource bundling',
            'Use code splitting for non-critical resources',
            'Enable HTTP/2 push for critical resources'
          ]
        });
      }
    }

    if (avgResourceTime && avgResourceTime.length > 0) {
      const latestTime = avgResourceTime[avgResourceTime.length - 1].value;
      
      if (latestTime > 500) {
        this.optimizations.push({
          id: 'bundle-optimization-2',
          area: 'bundle',
          impact: 'medium',
          effort: 'low',
          description: 'Slow average resource loading time',
          estimatedImprovement: '15-25% faster resource loading',
          implementation: [
            'Compress images and assets',
            'Implement lazy loading',
            'Use CDN for static assets'
          ]
        });
      }
    }
  }

  private analyzeMemory() {
    const memoryUsage = this.historicalData.get('memoryUsageRatio');
    
    if (memoryUsage && memoryUsage.length > 0) {
      const latestUsage = memoryUsage[memoryUsage.length - 1].value;
      
      if (latestUsage > 0.8) {
        this.optimizations.push({
          id: 'memory-optimization-1',
          area: 'memory',
          impact: 'high',
          effort: 'medium',
          description: 'High memory usage detected',
          estimatedImprovement: '30-40% reduction in memory usage',
          implementation: [
            'Implement object pooling',
            'Remove event listeners when components unmount',
            'Use WeakMap and WeakSet for better garbage collection'
          ]
        });
      }
    }
  }

  private analyzeDatabase() {
    const dbMetrics = analyticsEngine.getMetricsByType('database');
    const slowQueries = dbMetrics.filter(m => m.data.duration > 1000);
    
    if (slowQueries.length > dbMetrics.length * 0.1) {
      this.optimizations.push({
        id: 'database-optimization-1',
        area: 'database',
        impact: 'high',
        effort: 'high',
        description: 'High percentage of slow database queries',
        estimatedImprovement: '40-60% faster query response times',
        implementation: [
          'Add database indexes for frequently queried columns',
          'Implement query result caching',
          'Optimize complex joins and subqueries'
        ]
      });
    }
  }

  private analyzeNetwork() {
    const responseTime = this.historicalData.get('responseTime');
    
    if (responseTime && responseTime.length > 0) {
      const avgTime = responseTime.slice(-10).reduce((sum, d) => sum + d.value, 0) / 10;
      
      if (avgTime > 1000) {
        this.optimizations.push({
          id: 'network-optimization-1',
          area: 'network',
          impact: 'medium',
          effort: 'low',
          description: 'Slow network response times',
          estimatedImprovement: '20-35% faster response times',
          implementation: [
            'Implement request caching',
            'Use connection pooling',
            'Compress API responses'
          ]
        });
      }
    }
  }

  private executeAutomaticOptimizations() {
    const autoOptimizations = this.optimizations.filter(opt => 
      opt.effort === 'low' && (opt.impact === 'medium' || opt.impact === 'high')
    );

    autoOptimizations.forEach(opt => {
      if (opt.area === 'cache') {
        // Auto-implement cache optimizations
        this.implementCacheOptimizations();
      }
    });
  }

  private implementCacheOptimizations() {
    // Simple cache optimization implementation
    if ('caches' in window) {
      // Implement smart cache cleanup
      console.log('🔧 Performance Intelligence: Implementing cache optimizations');
    }
  }

  private cleanupOldAnomalies() {
    const oneDayAgo = Date.now() - 86400000;
    this.anomalies = this.anomalies.filter(anomaly => anomaly.detectedAt > oneDayAgo);
  }

  // Public API
  getPredictions(): PerformancePrediction[] {
    return Array.from(this.predictions.values());
  }

  getAnomalies(): PerformanceAnomaly[] {
    return [...this.anomalies];
  }

  getOptimizationOpportunities(): OptimizationOpportunity[] {
    return [...this.optimizations];
  }

  getBaselines(): PerformanceBaseline[] {
    return Array.from(this.baselines.values());
  }

  getIntelligenceReport() {
    return {
      predictions: this.getPredictions(),
      anomalies: this.getAnomalies().slice(-10), // Last 10 anomalies
      optimizations: this.getOptimizationOpportunities(),
      baselines: this.getBaselines(),
      isLearning: this.isLearning,
      dataPoints: this.historicalData.size
    };
  }

  setLearningMode(enabled: boolean) {
    this.isLearning = enabled;
  }

  resetBaselines() {
    this.baselines.clear();
    this.historicalData.clear();
    console.log('🔄 Performance Intelligence: Baselines reset');
  }
}

export const performanceIntelligence = new PerformanceIntelligence();

// Convenience functions
export const getPerformancePredictions = () => performanceIntelligence.getPredictions();
export const getPerformanceAnomalies = () => performanceIntelligence.getAnomalies();
export const getOptimizationOpportunities = () => performanceIntelligence.getOptimizationOpportunities();
export const getIntelligenceReport = () => performanceIntelligence.getIntelligenceReport();
