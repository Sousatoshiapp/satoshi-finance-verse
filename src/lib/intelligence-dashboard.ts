// Phase 4: Intelligence Dashboard - Backend Analytics System
import { analyticsEngine } from './analytics-engine';

interface DashboardWidget {
  id: string;
  title: string;
  type: 'chart' | 'metric' | 'alert' | 'trend';
  data: any;
  status: 'healthy' | 'warning' | 'critical';
  lastUpdated: number;
}

interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'critical';
  performance: number; // 0-100
  memory: number; // 0-100
  database: number; // 0-100
  network: number; // 0-100
  errors: number; // count
}

interface PerformanceReport {
  period: string;
  averageLoadTime: number;
  errorRate: number;
  userSatisfaction: number;
  recommendations: string[];
  trends: {
    performance: 'improving' | 'stable' | 'degrading';
    memory: 'improving' | 'stable' | 'degrading';
    errors: 'improving' | 'stable' | 'degrading';
  };
}

class IntelligenceDashboard {
  private widgets: Map<string, DashboardWidget> = new Map();
  private healthMetrics: SystemHealth = {
    overall: 'healthy',
    performance: 95,
    memory: 80,
    database: 90,
    network: 85,
    errors: 0
  };
  private reports: PerformanceReport[] = [];
  private alerts: Array<{
    id: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp: number;
    resolved: boolean;
  }> = [];

  constructor() {
    this.initializeDashboard();
  }

  private initializeDashboard() {
    this.setupDefaultWidgets();
    this.startHealthMonitoring();
    this.startReportGeneration();
    this.startAlertSystem();
  }

  private setupDefaultWidgets() {
    // Performance Overview Widget
    this.addWidget({
      id: 'performance-overview',
      title: 'Performance Overview',
      type: 'chart',
      data: { load_times: [], response_times: [], error_rates: [] },
      status: 'healthy',
      lastUpdated: Date.now()
    });

    // Memory Usage Widget
    this.addWidget({
      id: 'memory-usage',
      title: 'Memory Usage',
      type: 'metric',
      data: { current: 0, peak: 0, average: 0 },
      status: 'healthy',
      lastUpdated: Date.now()
    });

    // Database Performance Widget
    this.addWidget({
      id: 'database-performance',
      title: 'Database Performance',
      type: 'chart',
      data: { query_times: [], connection_pool: [], slow_queries: [] },
      status: 'healthy',
      lastUpdated: Date.now()
    });

    // User Behavior Widget
    this.addWidget({
      id: 'user-behavior',
      title: 'User Behavior Analytics',
      type: 'trend',
      data: { navigation_patterns: [], feature_usage: [], error_encounters: [] },
      status: 'healthy',
      lastUpdated: Date.now()
    });

    // System Alerts Widget
    this.addWidget({
      id: 'system-alerts',
      title: 'System Alerts',
      type: 'alert',
      data: { active_alerts: 0, resolved_today: 0, trending_issues: [] },
      status: 'healthy',
      lastUpdated: Date.now()
    });
  }

  private addWidget(widget: DashboardWidget) {
    this.widgets.set(widget.id, widget);
  }

  private startHealthMonitoring() {
    setInterval(() => {
      this.updateSystemHealth();
    }, 30000); // Every 30 seconds
  }

  private startReportGeneration() {
    // Generate reports every hour
    setInterval(() => {
      this.generatePerformanceReport();
    }, 3600000);

    // Generate daily summary
    setInterval(() => {
      this.generateDailySummary();
    }, 86400000);
  }

  private startAlertSystem() {
    setInterval(() => {
      this.checkForAlerts();
    }, 10000); // Every 10 seconds
  }

  private updateSystemHealth() {
    const performanceMetrics = analyticsEngine.getMetricsByType('performance');
    const systemMetrics = analyticsEngine.getMetricsByType('system');
    const dbMetrics = analyticsEngine.getMetricsByType('database');

    // Calculate performance score
    this.healthMetrics.performance = this.calculatePerformanceScore(performanceMetrics);
    
    // Calculate memory score
    this.healthMetrics.memory = this.calculateMemoryScore(systemMetrics);
    
    // Calculate database score
    this.healthMetrics.database = this.calculateDatabaseScore(dbMetrics);
    
    // Calculate network score
    this.healthMetrics.network = this.calculateNetworkScore(systemMetrics);
    
    // Update overall health
    this.healthMetrics.overall = this.calculateOverallHealth();

    // Update widgets
    this.updateWidgets();

    // Log health status
    console.log('📊 Intelligence Dashboard: System health updated', this.healthMetrics);
  }

  private calculatePerformanceScore(metrics: any[]): number {
    if (metrics.length === 0) return 95;

    const recentMetrics = metrics.slice(-10);
    const avgDuration = recentMetrics
      .map(m => m.data.duration || 0)
      .reduce((a, b) => a + b, 0) / recentMetrics.length;

    // Score based on average duration (lower is better)
    if (avgDuration < 100) return 100;
    if (avgDuration < 500) return 90;
    if (avgDuration < 1000) return 80;
    if (avgDuration < 2000) return 70;
    return 60;
  }

  private calculateMemoryScore(metrics: any[]): number {
    if (metrics.length === 0) return 85;

    const latestMetric = metrics[metrics.length - 1];
    if (!latestMetric?.data?.memory) return 85;

    const memoryUsage = latestMetric.data.memory.used / latestMetric.data.memory.limit;
    
    if (memoryUsage < 0.5) return 100;
    if (memoryUsage < 0.7) return 90;
    if (memoryUsage < 0.8) return 80;
    if (memoryUsage < 0.9) return 70;
    return 50;
  }

  private calculateDatabaseScore(metrics: any[]): number {
    if (metrics.length === 0) return 90;

    const slowQueries = metrics.filter(m => m.data.duration > 1000).length;
    const totalQueries = metrics.length;
    const slowQueryRatio = slowQueries / totalQueries;

    if (slowQueryRatio < 0.01) return 100;
    if (slowQueryRatio < 0.05) return 90;
    if (slowQueryRatio < 0.1) return 80;
    if (slowQueryRatio < 0.2) return 70;
    return 60;
  }

  private calculateNetworkScore(metrics: any[]): number {
    // Simple network score calculation
    return 85; // Placeholder
  }

  private calculateOverallHealth(): 'healthy' | 'degraded' | 'critical' {
    const avgScore = (
      this.healthMetrics.performance +
      this.healthMetrics.memory +
      this.healthMetrics.database +
      this.healthMetrics.network
    ) / 4;

    if (avgScore >= 90) return 'healthy';
    if (avgScore >= 70) return 'degraded';
    return 'critical';
  }

  private updateWidgets() {
    // Update Performance Overview
    const perfWidget = this.widgets.get('performance-overview');
    if (perfWidget) {
      perfWidget.data = this.getPerformanceData();
      perfWidget.status = this.healthMetrics.performance >= 80 ? 'healthy' : 'warning';
      perfWidget.lastUpdated = Date.now();
    }

    // Update Memory Usage
    const memWidget = this.widgets.get('memory-usage');
    if (memWidget) {
      memWidget.data = this.getMemoryData();
      memWidget.status = this.healthMetrics.memory >= 80 ? 'healthy' : 'warning';
      memWidget.lastUpdated = Date.now();
    }

    // Update Database Performance
    const dbWidget = this.widgets.get('database-performance');
    if (dbWidget) {
      dbWidget.data = this.getDatabaseData();
      dbWidget.status = this.healthMetrics.database >= 80 ? 'healthy' : 'warning';
      dbWidget.lastUpdated = Date.now();
    }

    // Update User Behavior
    const behaviorWidget = this.widgets.get('user-behavior');
    if (behaviorWidget) {
      behaviorWidget.data = this.getUserBehaviorData();
      behaviorWidget.lastUpdated = Date.now();
    }

    // Update System Alerts
    const alertWidget = this.widgets.get('system-alerts');
    if (alertWidget) {
      alertWidget.data = {
        active_alerts: this.alerts.filter(a => !a.resolved).length,
        resolved_today: this.alerts.filter(a => a.resolved && a.timestamp > Date.now() - 86400000).length,
        trending_issues: this.getTrendingIssues()
      };
      alertWidget.lastUpdated = Date.now();
    }
  }

  private getPerformanceData() {
    const metrics = analyticsEngine.getMetricsByType('performance');
    return {
      load_times: metrics.map(m => ({ time: m.timestamp, value: m.data.duration || 0 })),
      response_times: metrics.map(m => ({ time: m.timestamp, value: m.data.responseTime || 0 })),
      error_rates: [] // Placeholder
    };
  }

  private getMemoryData() {
    const metrics = analyticsEngine.getMetricsByType('system');
    const memoryMetrics = metrics.filter(m => m.data.memory);
    
    if (memoryMetrics.length === 0) return { current: 0, peak: 0, average: 0 };

    const latest = memoryMetrics[memoryMetrics.length - 1];
    const peak = Math.max(...memoryMetrics.map(m => m.data.memory.used));
    const average = memoryMetrics.reduce((sum, m) => sum + m.data.memory.used, 0) / memoryMetrics.length;

    return {
      current: latest.data.memory.used,
      peak,
      average
    };
  }

  private getDatabaseData() {
    const metrics = analyticsEngine.getMetricsByType('database');
    return {
      query_times: metrics.map(m => ({ time: m.timestamp, value: m.data.duration || 0 })),
      connection_pool: [], // Placeholder
      slow_queries: metrics.filter(m => m.data.duration > 1000).length
    };
  }

  private getUserBehaviorData() {
    const metrics = analyticsEngine.getMetricsByType('user_behavior');
    return {
      navigation_patterns: this.analyzeNavigationPatterns(metrics),
      feature_usage: this.analyzeFeatureUsage(metrics),
      error_encounters: metrics.filter(m => m.data.error).length
    };
  }

  private analyzeNavigationPatterns(metrics: any[]) {
    // Analyze user navigation patterns
    const routes = metrics
      .filter(m => m.data.route)
      .map(m => m.data.route);
    
    const routeCounts = routes.reduce((acc, route) => {
      acc[route] = (acc[route] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(routeCounts)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 10);
  }

  private analyzeFeatureUsage(metrics: any[]) {
    // Analyze feature usage patterns
    const features = metrics
      .filter(m => m.data.feature)
      .map(m => m.data.feature);
    
    const featureCounts = features.reduce((acc, feature) => {
      acc[feature] = (acc[feature] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(featureCounts)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 10);
  }

  private getTrendingIssues() {
    // Analyze trending issues
    return this.alerts
      .filter(a => !a.resolved)
      .map(a => a.message)
      .slice(0, 5);
  }

  private generatePerformanceReport() {
    const report: PerformanceReport = {
      period: `${new Date().toISOString().split('T')[0]} ${new Date().getHours()}:00`,
      averageLoadTime: this.calculateAverageLoadTime(),
      errorRate: this.calculateErrorRate(),
      userSatisfaction: this.calculateUserSatisfaction(),
      recommendations: this.generateRecommendations(),
      trends: {
        performance: this.analyzeTrend('performance'),
        memory: this.analyzeTrend('memory'),
        errors: this.analyzeTrend('errors')
      }
    };

    this.reports.push(report);
    
    // Keep only last 24 reports (24 hours)
    if (this.reports.length > 24) {
      this.reports = this.reports.slice(-24);
    }

    console.log('📊 Intelligence Dashboard: Performance report generated', report);
  }

  private generateDailySummary() {
    const summary = {
      date: new Date().toISOString().split('T')[0],
      systemHealth: this.healthMetrics,
      totalAlerts: this.alerts.length,
      resolvedAlerts: this.alerts.filter(a => a.resolved).length,
      criticalIssues: this.alerts.filter(a => a.severity === 'critical' && !a.resolved).length,
      insights: analyticsEngine.getInsights()
    };

    console.log('📊 Intelligence Dashboard: Daily summary generated', summary);
  }

  private calculateAverageLoadTime(): number {
    const perfMetrics = analyticsEngine.getMetricsByType('performance');
    if (perfMetrics.length === 0) return 0;

    const loadTimes = perfMetrics.map(m => m.data.duration || 0);
    return loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length;
  }

  private calculateErrorRate(): number {
    const totalMetrics = analyticsEngine.getMetricsByType('user_behavior').length;
    const errorMetrics = analyticsEngine.getMetricsByType('user_behavior')
      .filter(m => m.data.error).length;
    
    return totalMetrics > 0 ? (errorMetrics / totalMetrics) * 100 : 0;
  }

  private calculateUserSatisfaction(): number {
    // Simple satisfaction calculation based on performance
    return Math.max(0, 100 - (this.calculateAverageLoadTime() / 50));
  }

  private generateRecommendations(): string[] {
    const recommendations = [];

    if (this.healthMetrics.performance < 80) {
      recommendations.push('Consider optimizing slow operations and reducing bundle size');
    }

    if (this.healthMetrics.memory < 80) {
      recommendations.push('Implement memory cleanup strategies and reduce memory footprint');
    }

    if (this.healthMetrics.database < 80) {
      recommendations.push('Optimize database queries and consider adding indexes');
    }

    return recommendations;
  }

  private analyzeTrend(metric: 'performance' | 'memory' | 'errors'): 'improving' | 'stable' | 'degrading' {
    // Simple trend analysis
    return 'stable'; // Placeholder
  }

  private checkForAlerts() {
    // Check for performance alerts
    if (this.healthMetrics.performance < 70) {
      this.addAlert('high', `Performance degraded to ${this.healthMetrics.performance}%`);
    }

    // Check for memory alerts
    if (this.healthMetrics.memory < 60) {
      this.addAlert('critical', `Memory usage critical at ${this.healthMetrics.memory}%`);
    }

    // Check for database alerts
    if (this.healthMetrics.database < 70) {
      this.addAlert('medium', `Database performance degraded to ${this.healthMetrics.database}%`);
    }
  }

  private addAlert(severity: 'low' | 'medium' | 'high' | 'critical', message: string) {
    // Check if similar alert already exists
    const existingAlert = this.alerts.find(a => 
      a.message === message && !a.resolved && 
      Date.now() - a.timestamp < 300000 // 5 minutes
    );

    if (existingAlert) return;

    const alert = {
      id: crypto.randomUUID(),
      severity,
      message,
      timestamp: Date.now(),
      resolved: false
    };

    this.alerts.push(alert);
    console.warn(`🚨 Intelligence Dashboard: ${severity.toUpperCase()} alert - ${message}`);

    // Auto-resolve low severity alerts after 30 minutes
    if (severity === 'low') {
      setTimeout(() => {
        alert.resolved = true;
      }, 1800000);
    }
  }

  // Public API for accessing dashboard data
  getSystemHealth(): SystemHealth {
    return { ...this.healthMetrics };
  }

  getWidgets(): DashboardWidget[] {
    return Array.from(this.widgets.values());
  }

  getWidget(id: string): DashboardWidget | undefined {
    return this.widgets.get(id);
  }

  getReports(): PerformanceReport[] {
    return [...this.reports];
  }

  getActiveAlerts() {
    return this.alerts.filter(a => !a.resolved);
  }

  getAllAlerts() {
    return [...this.alerts];
  }

  resolveAlert(alertId: string) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      console.log('✅ Intelligence Dashboard: Alert resolved', alert.message);
    }
  }
}

export const intelligenceDashboard = new IntelligenceDashboard();

// Utility functions for easy access
export const getDashboardData = () => ({
  health: intelligenceDashboard.getSystemHealth(),
  widgets: intelligenceDashboard.getWidgets(),
  alerts: intelligenceDashboard.getActiveAlerts(),
  reports: intelligenceDashboard.getReports().slice(-5) // Last 5 reports
});

export const getDashboardSummary = () => ({
  overallHealth: intelligenceDashboard.getSystemHealth().overall,
  activeAlerts: intelligenceDashboard.getActiveAlerts().length,
  criticalIssues: intelligenceDashboard.getActiveAlerts().filter(a => a.severity === 'critical').length,
  performanceScore: intelligenceDashboard.getSystemHealth().performance
});
