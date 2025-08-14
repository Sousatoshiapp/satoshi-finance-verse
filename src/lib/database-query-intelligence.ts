// Phase 4: Database Query Intelligence - Advanced Query Analytics
import { trackDatabaseEvent } from './analytics-engine';

interface QueryMetric {
  queryId: string;
  queryPattern: string;
  executionTime: number;
  frequency: number;
  lastExecuted: number;
  tables: string[];
  operations: string[];
  impact: number;
  parameters?: Record<string, any>;
}

interface QueryOptimization {
  queryId: string;
  issue: 'slow_execution' | 'frequent_execution' | 'missing_index' | 'inefficient_join' | 'large_result_set';
  severity: 'low' | 'medium' | 'high' | 'critical';
  impact: number; // Performance impact score
  suggestion: string;
  estimatedImprovement: string;
  implementation: string[];
}

interface IndexRecommendation {
  table: string;
  columns: string[];
  type: 'single' | 'composite' | 'partial' | 'unique';
  reason: string;
  queryPatterns: string[];
  estimatedSpeedup: string;
}

interface CacheStrategy {
  queryPattern: string;
  cacheKey: string;
  ttl: number; // Time to live in seconds
  invalidationTriggers: string[];
  hitRate: number;
  effectiveness: 'low' | 'medium' | 'high';
}

interface HotspotAnalysis {
  table: string;
  readCount: number;
  writeCount: number;
  avgReadTime: number;
  avgWriteTime: number;
  peakUsageHours: number[];
  optimizationPriority: 'low' | 'medium' | 'high' | 'critical';
}

class DatabaseQueryIntelligence {
  private queryMetrics: Map<string, QueryMetric> = new Map();
  private optimizations: QueryOptimization[] = [];
  private indexRecommendations: IndexRecommendation[] = [];
  private cacheStrategies: Map<string, CacheStrategy> = new Map();
  private hotspots: Map<string, HotspotAnalysis> = new Map();
  private queryPatterns: Map<string, number> = new Map();

  constructor() {
    this.initializeIntelligence();
  }

  private initializeIntelligence() {
    this.startQueryAnalysis();
    this.startOptimizationEngine();
    this.startHotspotAnalysis();
    this.startCacheOptimization();
  }

  private startQueryAnalysis() {
    // Analyze queries every minute
    setInterval(() => {
      this.analyzeQueries();
    }, 60000);

    // Generate recommendations every 5 minutes
    setInterval(() => {
      this.generateRecommendations();
    }, 300000);
  }

  private startOptimizationEngine() {
    // Check for optimization opportunities every 2 minutes
    setInterval(() => {
      this.identifyOptimizationOpportunities();
    }, 120000);

    // Update optimization priorities every 10 minutes
    setInterval(() => {
      this.updateOptimizationPriorities();
    }, 600000);
  }

  private startHotspotAnalysis() {
    // Analyze data hotspots every 5 minutes
    setInterval(() => {
      this.analyzeDataHotspots();
    }, 300000);

    // Update hotspot rankings every 15 minutes
    setInterval(() => {
      this.updateHotspotRankings();
    }, 900000);
  }

  private startCacheOptimization() {
    // Optimize cache strategies every 10 minutes
    setInterval(() => {
      this.optimizeCacheStrategies();
    }, 600000);

    // Update cache effectiveness every hour
    setInterval(() => {
      this.updateCacheEffectiveness();
    }, 3600000);
  }

  // Public tracking methods
  trackQuery(query: string, executionTime: number, tables: string[] = [], metadata?: Record<string, any>) {
    const queryPattern = this.extractQueryPattern(query);
    const queryId = this.generateQueryId(queryPattern);

    // Track in analytics engine
    trackDatabaseEvent(queryPattern, executionTime, {
      tables,
      queryId,
      ...metadata
    });

    // Update local metrics
    this.updateQueryMetrics(queryId, queryPattern, executionTime, tables);

    // Immediate analysis for critical queries
    if (executionTime > 5000) { // Queries slower than 5 seconds
      this.flagSlowQuery(queryId, executionTime);
    }
  }

  trackConnection(poolSize: number, activeConnections: number, queueLength: number) {
    trackDatabaseEvent('connection_pool_status', 0, {
      poolSize,
      activeConnections,
      queueLength,
      utilization: activeConnections / poolSize
    });

    this.analyzeConnectionUsage(activeConnections, poolSize, queueLength);
  }

  trackCacheHit(queryPattern: string, cacheKey: string) {
    const strategy = this.cacheStrategies.get(queryPattern);
    if (strategy) {
      strategy.hitRate = (strategy.hitRate + 1) / 2; // Simple moving average
    }

    trackDatabaseEvent('cache_hit', 0, {
      queryPattern,
      cacheKey
    });
  }

  trackCacheMiss(queryPattern: string, cacheKey: string, executionTime: number) {
    const strategy = this.cacheStrategies.get(queryPattern);
    if (strategy) {
      strategy.hitRate = strategy.hitRate / 2; // Decrease hit rate
    }

    trackDatabaseEvent('cache_miss', executionTime, {
      queryPattern,
      cacheKey
    });
  }

  // Analysis methods
  private extractQueryPattern(query: string): string {
    // Extract query pattern by removing specific values
    return query
      .replace(/\b\d+\b/g, '?') // Replace numbers with placeholders
      .replace(/'[^']*'/g, '?') // Replace string literals
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .toLowerCase();
  }

  private generateQueryId(pattern: string): string {
    // Generate consistent ID for query patterns
    let hash = 0;
    for (let i = 0; i < pattern.length; i++) {
      const char = pattern.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `query_${Math.abs(hash).toString(36)}`;
  }

  private updateQueryMetrics(queryId: string, pattern: string, executionTime: number, tables: string[]) {
    const existing = this.queryMetrics.get(queryId);

    if (existing) {
      existing.frequency++;
      existing.executionTime = (existing.executionTime + executionTime) / 2; // Average
      existing.lastExecuted = Date.now();
    } else {
      this.queryMetrics.set(queryId, {
        queryId,
        queryPattern: pattern,
        executionTime,
        frequency: 1,
        lastExecuted: Date.now(),
        tables,
        operations: this.extractOperations(pattern),
        impact: this.calculateImpact(executionTime, 1)
      });
    }

    // Update pattern frequency
    const currentCount = this.queryPatterns.get(pattern) || 0;
    this.queryPatterns.set(pattern, currentCount + 1);
  }

  private extractOperations(pattern: string): string[] {
    const operations = [];
    if (pattern.includes('select')) operations.push('SELECT');
    if (pattern.includes('insert')) operations.push('INSERT');
    if (pattern.includes('update')) operations.push('UPDATE');
    if (pattern.includes('delete')) operations.push('DELETE');
    if (pattern.includes('join')) operations.push('JOIN');
    if (pattern.includes('order by')) operations.push('ORDER_BY');
    if (pattern.includes('group by')) operations.push('GROUP_BY');
    return operations;
  }

  private flagSlowQuery(queryId: string, executionTime: number) {
    const metric = this.queryMetrics.get(queryId);
    if (!metric) return;

    const optimization: QueryOptimization = {
      queryId,
      issue: 'slow_execution',
      severity: this.calculateSeverity(executionTime),
      impact: this.calculateImpact(executionTime, metric.frequency),
      suggestion: this.generateOptimizationSuggestion(metric),
      estimatedImprovement: this.estimateImprovement(metric),
      implementation: this.generateImplementationSteps(metric)
    };

    this.optimizations.push(optimization);
    console.warn('🐌 Database Intelligence: Slow query detected', optimization);
  }

  private calculateSeverity(executionTime: number): 'low' | 'medium' | 'high' | 'critical' {
    if (executionTime > 10000) return 'critical';
    if (executionTime > 5000) return 'high';
    if (executionTime > 2000) return 'medium';
    return 'low';
  }

  private calculateImpact(executionTime: number, frequency: number): number {
    // Impact score based on execution time and frequency
    const timeScore = Math.min(executionTime / 1000, 10); // Max 10 points for time
    const frequencyScore = Math.min(frequency / 10, 10); // Max 10 points for frequency
    return Math.round((timeScore + frequencyScore) / 2);
  }

  private generateOptimizationSuggestion(metric: QueryMetric): string {
    const suggestions = [];

    if (metric.operations.includes('JOIN')) {
      suggestions.push('Optimize JOIN operations with proper indexes');
    }

    if (metric.operations.includes('ORDER_BY')) {
      suggestions.push('Add index for ORDER BY columns');
    }

    if (metric.operations.includes('GROUP_BY')) {
      suggestions.push('Consider materialized views for complex aggregations');
    }

    if (metric.executionTime > 5000) {
      suggestions.push('Consider query result caching');
    }

    if (metric.frequency > 100) {
      suggestions.push('Implement query result caching for frequently executed query');
    }

    return suggestions[0] || 'Analyze query execution plan for optimization opportunities';
  }

  private estimateImprovement(metric: QueryMetric): string {
    if (metric.executionTime > 5000) {
      return '50-80% performance improvement';
    }
    if (metric.executionTime > 2000) {
      return '30-60% performance improvement';
    }
    return '20-40% performance improvement';
  }

  private generateImplementationSteps(metric: QueryMetric): string[] {
    const steps = [];

    if (metric.operations.includes('SELECT') && metric.tables.length > 0) {
      steps.push(`EXPLAIN ANALYZE the query for table ${metric.tables[0]}`);
      steps.push(`Check for missing indexes on ${metric.tables.join(', ')}`);
    }

    if (metric.operations.includes('JOIN')) {
      steps.push('Ensure foreign key columns are indexed');
      steps.push('Consider denormalization for frequently joined tables');
    }

    if (metric.frequency > 50) {
      steps.push('Implement query result caching');
      steps.push('Set appropriate cache TTL based on data update frequency');
    }

    return steps.length > 0 ? steps : ['Analyze query execution plan', 'Identify bottlenecks', 'Apply appropriate optimizations'];
  }

  private analyzeQueries() {
    const slowQueries = Array.from(this.queryMetrics.values())
      .filter(metric => metric.executionTime > 1000)
      .sort((a, b) => b.impact - a.impact);

    if (slowQueries.length > 0) {
      console.log('🔍 Database Intelligence: Slow queries detected', slowQueries.slice(0, 5));
    }

    // Identify frequent queries
    const frequentQueries = Array.from(this.queryMetrics.values())
      .filter(metric => metric.frequency > 10)
      .sort((a, b) => b.frequency - a.frequency);

    if (frequentQueries.length > 0) {
      this.suggestCachingStrategies(frequentQueries.slice(0, 10));
    }
  }

  private suggestCachingStrategies(frequentQueries: QueryMetric[]) {
    frequentQueries.forEach(metric => {
      if (!this.cacheStrategies.has(metric.queryPattern)) {
        const strategy: CacheStrategy = {
          queryPattern: metric.queryPattern,
          cacheKey: this.generateCacheKey(metric),
          ttl: this.calculateOptimalTTL(metric),
          invalidationTriggers: this.identifyInvalidationTriggers(metric),
          hitRate: 0,
          effectiveness: 'medium'
        };

        this.cacheStrategies.set(metric.queryPattern, strategy);
        console.log('💾 Database Intelligence: Cache strategy suggested', strategy);
      }
    });
  }

  private generateCacheKey(metric: QueryMetric): string {
    return `query_cache_${metric.queryId}`;
  }

  private calculateOptimalTTL(metric: QueryMetric): number {
    // Calculate TTL based on query characteristics
    if (metric.operations.includes('SELECT') && !metric.operations.includes('ORDER_BY')) {
      return 300; // 5 minutes for simple selects
    }
    if (metric.operations.includes('GROUP_BY')) {
      return 600; // 10 minutes for aggregations
    }
    return 180; // 3 minutes default
  }

  private identifyInvalidationTriggers(metric: QueryMetric): string[] {
    const triggers = [];
    
    metric.tables.forEach(table => {
      triggers.push(`INSERT:${table}`);
      triggers.push(`UPDATE:${table}`);
      triggers.push(`DELETE:${table}`);
    });

    return triggers;
  }

  private generateRecommendations() {
    this.generateIndexRecommendations();
    this.identifyOptimizationOpportunities();
  }

  private generateIndexRecommendations() {
    const frequentQueries = Array.from(this.queryMetrics.values())
      .filter(metric => metric.frequency > 5);

    const indexNeeds = new Map<string, { columns: Set<string>; reasons: string[] }>();

    frequentQueries.forEach(metric => {
      if (metric.operations.includes('JOIN')) {
        metric.tables.forEach(table => {
          if (!indexNeeds.has(table)) {
            indexNeeds.set(table, { columns: new Set(), reasons: [] });
          }
          indexNeeds.get(table)!.reasons.push(`Frequent JOINs on ${table}`);
        });
      }

      if (metric.operations.includes('ORDER_BY') && metric.executionTime > 1000) {
        metric.tables.forEach(table => {
          if (!indexNeeds.has(table)) {
            indexNeeds.set(table, { columns: new Set(), reasons: [] });
          }
          indexNeeds.get(table)!.reasons.push(`Slow ORDER BY operations on ${table}`);
        });
      }
    });

    indexNeeds.forEach((need, table) => {
      const recommendation: IndexRecommendation = {
        table,
        columns: Array.from(need.columns),
        type: need.columns.size > 1 ? 'composite' : 'single',
        reason: need.reasons.join(', '),
        queryPatterns: frequentQueries
          .filter(m => m.tables.includes(table))
          .map(m => m.queryPattern),
        estimatedSpeedup: '40-70% faster query execution'
      };

      this.indexRecommendations.push(recommendation);
    });
  }

  private identifyOptimizationOpportunities() {
    // Clear old optimizations
    this.optimizations = [];

    this.queryMetrics.forEach(metric => {
      // Slow queries
      if (metric.executionTime > 2000) {
        this.optimizations.push({
          queryId: metric.queryId,
          issue: 'slow_execution',
          severity: this.calculateSeverity(metric.executionTime),
          impact: this.calculateImpact(metric.executionTime, metric.frequency),
          suggestion: this.generateOptimizationSuggestion(metric),
          estimatedImprovement: this.estimateImprovement(metric),
          implementation: this.generateImplementationSteps(metric)
        });
      }

      // Frequent queries without caching
      if (metric.frequency > 20 && !this.cacheStrategies.has(metric.queryPattern)) {
        this.optimizations.push({
          queryId: metric.queryId,
          issue: 'frequent_execution',
          severity: 'medium',
          impact: Math.min(metric.frequency / 10, 10),
          suggestion: 'Implement query result caching',
          estimatedImprovement: '60-90% reduction in database load',
          implementation: [
            'Set up Redis or in-memory cache',
            'Implement cache invalidation strategy',
            'Monitor cache hit rates'
          ]
        });
      }
    });
  }

  private updateOptimizationPriorities() {
    // Sort optimizations by impact and severity
    this.optimizations.sort((a, b) => {
      const severityWeight = { low: 1, medium: 2, high: 3, critical: 4 };
      const scoreA = a.impact * severityWeight[a.severity];
      const scoreB = b.impact * severityWeight[b.severity];
      return scoreB - scoreA;
    });
  }

  private analyzeDataHotspots() {
    // Analyze which tables are accessed most frequently
    const tableAccess = new Map<string, { reads: number; writes: number; totalTime: number }>();

    this.queryMetrics.forEach(metric => {
      metric.tables.forEach(table => {
        const access = tableAccess.get(table) || { reads: 0, writes: 0, totalTime: 0 };
        
        if (metric.operations.includes('SELECT')) {
          access.reads += metric.frequency;
        } else {
          access.writes += metric.frequency;
        }
        
        access.totalTime += metric.executionTime * metric.frequency;
        tableAccess.set(table, access);
      });
    });

    // Convert to hotspot analysis
    tableAccess.forEach((access, table) => {
      const hotspot: HotspotAnalysis = {
        table,
        readCount: access.reads,
        writeCount: access.writes,
        avgReadTime: access.reads > 0 ? access.totalTime / access.reads : 0,
        avgWriteTime: access.writes > 0 ? access.totalTime / access.writes : 0,
        peakUsageHours: this.calculatePeakHours(table),
        optimizationPriority: this.calculateHotspotPriority(access)
      };

      this.hotspots.set(table, hotspot);
    });
  }

  private calculatePeakHours(table: string): number[] {
    // Simplified peak hours calculation
    // In a real implementation, this would analyze historical access patterns
    return [9, 10, 11, 14, 15, 16]; // Business hours
  }

  private calculateHotspotPriority(access: { reads: number; writes: number; totalTime: number }): 'low' | 'medium' | 'high' | 'critical' {
    const totalOps = access.reads + access.writes;
    const avgTime = totalOps > 0 ? access.totalTime / totalOps : 0;

    if (totalOps > 1000 && avgTime > 1000) return 'critical';
    if (totalOps > 500 || avgTime > 500) return 'high';
    if (totalOps > 100 || avgTime > 200) return 'medium';
    return 'low';
  }

  private updateHotspotRankings() {
    // Sort hotspots by priority and impact
    const sortedHotspots = Array.from(this.hotspots.entries())
      .sort(([,a], [,b]) => {
        const priorityWeight = { low: 1, medium: 2, high: 3, critical: 4 };
        return priorityWeight[b.optimizationPriority] - priorityWeight[a.optimizationPriority];
      });

    console.log('🔥 Database Intelligence: Data hotspots ranked', sortedHotspots.slice(0, 5));
  }

  private optimizeCacheStrategies() {
    this.cacheStrategies.forEach((strategy, pattern) => {
      // Update effectiveness based on hit rate
      if (strategy.hitRate > 0.8) {
        strategy.effectiveness = 'high';
      } else if (strategy.hitRate > 0.5) {
        strategy.effectiveness = 'medium';
      } else {
        strategy.effectiveness = 'low';
      }

      // Adjust TTL based on effectiveness
      if (strategy.effectiveness === 'low') {
        strategy.ttl = Math.max(60, strategy.ttl * 0.8); // Reduce TTL
      } else if (strategy.effectiveness === 'high') {
        strategy.ttl = Math.min(1800, strategy.ttl * 1.2); // Increase TTL
      }
    });
  }

  private updateCacheEffectiveness() {
    console.log('💾 Database Intelligence: Cache effectiveness updated', 
      Array.from(this.cacheStrategies.entries()).map(([pattern, strategy]) => ({
        pattern,
        hitRate: strategy.hitRate,
        effectiveness: strategy.effectiveness
      }))
    );
  }

  private analyzeConnectionUsage(active: number, total: number, queueLength: number) {
    const utilization = active / total;
    
    if (utilization > 0.9) {
      console.warn('🔗 Database Intelligence: High connection pool utilization', {
        utilization: `${Math.round(utilization * 100)}%`,
        active,
        total,
        queueLength
      });
    }

    if (queueLength > 10) {
      console.warn('🔗 Database Intelligence: High connection queue length', {
        queueLength,
        suggestion: 'Consider increasing connection pool size'
      });
    }
  }

  // Public API
  getQueryMetrics(): QueryMetric[] {
    return Array.from(this.queryMetrics.values());
  }

  getOptimizations(): QueryOptimization[] {
    return [...this.optimizations];
  }

  getIndexRecommendations(): IndexRecommendation[] {
    return [...this.indexRecommendations];
  }

  getCacheStrategies(): CacheStrategy[] {
    return Array.from(this.cacheStrategies.values());
  }

  getHotspots(): HotspotAnalysis[] {
    return Array.from(this.hotspots.values());
  }

  getIntelligenceReport() {
    return {
      totalQueries: this.queryMetrics.size,
      slowQueries: Array.from(this.queryMetrics.values()).filter(m => m.executionTime > 1000).length,
      optimizations: this.optimizations.length,
      indexRecommendations: this.indexRecommendations.length,
      cacheStrategies: this.cacheStrategies.size,
      hotspots: this.hotspots.size,
      topIssues: this.optimizations.slice(0, 5),
      topHotspots: Array.from(this.hotspots.values()).slice(0, 5)
    };
  }

  clearMetrics() {
    this.queryMetrics.clear();
    this.optimizations = [];
    this.indexRecommendations = [];
    this.cacheStrategies.clear();
    this.hotspots.clear();
    this.queryPatterns.clear();
  }
}

export const databaseQueryIntelligence = new DatabaseQueryIntelligence();

// Convenience functions for easy integration
export const trackQuery = (query: string, executionTime: number, tables?: string[], metadata?: Record<string, any>) => {
  databaseQueryIntelligence.trackQuery(query, executionTime, tables, metadata);
};

export const trackConnectionPool = (poolSize: number, activeConnections: number, queueLength: number) => {
  databaseQueryIntelligence.trackConnection(poolSize, activeConnections, queueLength);
};

export const trackCacheHit = (queryPattern: string, cacheKey: string) => {
  databaseQueryIntelligence.trackCacheHit(queryPattern, cacheKey);
};

export const trackCacheMiss = (queryPattern: string, cacheKey: string, executionTime: number) => {
  databaseQueryIntelligence.trackCacheMiss(queryPattern, cacheKey, executionTime);
};

export const getDatabaseIntelligence = () => databaseQueryIntelligence.getIntelligenceReport();