/**
 * Security Monitor - Sistema de monitoramento automático de segurança
 * Detecta e responde automaticamente a ameaças em tempo real
 */

import { supabase } from '@/integrations/supabase/client';
import { SecurityAudit } from './security-audit';
import { adaptiveRateLimiter } from './adaptive-rate-limiter';

interface SecurityPattern {
  id: string;
  name: string;
  description: string;
  pattern: RegExp | ((data: any) => boolean);
  severity: 'low' | 'medium' | 'high' | 'critical';
  action: 'log' | 'block' | 'throttle' | 'alert';
  threshold: number;
}

interface SecurityAlert {
  id: string;
  timestamp: number;
  userId?: string;
  type: string;
  severity: string;
  details: any;
  resolved: boolean;
}

interface SecurityMetrics {
  totalRequests: number;
  blockedRequests: number;
  suspiciousActivities: number;
  activeThreats: number;
  avgResponseTime: number;
  errorRate: number;
}

export class SecurityMonitor {
  private patterns: SecurityPattern[] = [];
  private alerts: SecurityAlert[] = [];
  private metrics: SecurityMetrics = {
    totalRequests: 0,
    blockedRequests: 0,
    suspiciousActivities: 0,
    activeThreats: 0,
    avgResponseTime: 0,
    errorRate: 0
  };
  private requestTimes: number[] = [];

  constructor() {
    this.initializePatterns();
    this.startPerformanceMonitoring();
    
    // Cleanup automático de alertas antigos
    setInterval(() => this.cleanupOldAlerts(), 300000); // 5 minutos
  }

  private initializePatterns(): void {
    this.patterns = [
      {
        id: 'rapid_requests',
        name: 'Requisições Muito Rápidas',
        description: 'Detecta requisições em intervalos suspeitos',
        pattern: (data: any) => {
          if (!data.interval) return false;
          return data.interval < 100; // Menos de 100ms entre requisições
        },
        severity: 'high',
        action: 'throttle',
        threshold: 5
      },
      {
        id: 'multiple_failures',
        name: 'Múltiplas Falhas Consecutivas',
        description: 'Detecta muitas falhas em sequência',
        pattern: (data: any) => {
          return data.consecutiveFailures > 5;
        },
        severity: 'medium',
        action: 'block',
        threshold: 3
      },
      {
        id: 'suspicious_user_agent',
        name: 'User Agent Suspeito',
        description: 'Detecta user agents de bots ou ferramentas maliciosas',
        pattern: /bot|crawler|spider|scraper|curl|wget|automated/i,
        severity: 'medium',
        action: 'log',
        threshold: 1
      },
      {
        id: 'sql_injection_attempt',
        name: 'Tentativa de SQL Injection',
        description: 'Detecta padrões de SQL injection',
        pattern: /union\s+select|drop\s+table|insert\s+into|delete\s+from|update\s+set/i,
        severity: 'critical',
        action: 'block',
        threshold: 1
      },
      {
        id: 'xss_attempt',
        name: 'Tentativa de XSS',
        description: 'Detecta tentativas de Cross-Site Scripting',
        pattern: /<script|javascript:|on\w+\s*=|eval\(|expression\(/i,
        severity: 'high',
        action: 'block',
        threshold: 1
      },
      {
        id: 'excessive_rate_limit_violations',
        name: 'Violações Excessivas de Rate Limit',
        description: 'Detecta usuários que constantemente violam rate limits',
        pattern: (data: any) => {
          return data.rateLimitViolations > 10;
        },
        severity: 'high',
        action: 'block',
        threshold: 1
      },
      {
        id: 'unusual_login_pattern',
        name: 'Padrão de Login Incomum',
        description: 'Detecta tentativas de login em horários ou locais suspeitos',
        pattern: (data: any) => {
          const hour = new Date().getHours();
          return (hour < 6 || hour > 23) && data.failedAttempts > 3;
        },
        severity: 'medium',
        action: 'alert',
        threshold: 3
      }
    ];
  }

  private startPerformanceMonitoring(): void {
    // Monitorar performance a cada 30 segundos
    setInterval(() => {
      this.updatePerformanceMetrics();
    }, 30000);

    // Monitorar memória a cada minuto
    setInterval(() => {
      this.checkMemoryUsage();
    }, 60000);
  }

  private updatePerformanceMetrics(): void {
    if (this.requestTimes.length > 0) {
      const avgTime = this.requestTimes.reduce((a, b) => a + b, 0) / this.requestTimes.length;
      this.metrics.avgResponseTime = avgTime;
      
      // Log se performance estiver degradada
      if (avgTime > 2000) { // Mais de 2 segundos
        this.createAlert({
          type: 'performance_degradation',
          severity: 'medium',
          details: {
            avgResponseTime: avgTime,
            requestCount: this.requestTimes.length
          }
        });
      }
      
      // Limitar histórico de tempos
      if (this.requestTimes.length > 100) {
        this.requestTimes = this.requestTimes.slice(-50);
      }
    }
  }

  private checkMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedPercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
      
      if (usedPercent > 90) {
        this.createAlert({
          type: 'high_memory_usage',
          severity: 'high',
          details: {
            usedPercent,
            usedMB: Math.round(memory.usedJSHeapSize / 1024 / 1024),
            limitMB: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
          }
        });
      }
    }
  }

  // Verificar requisição contra padrões de segurança
  checkRequest(data: {
    userId?: string;
    action: string;
    userAgent?: string;
    requestTime: number;
    content?: string;
    success: boolean;
  }): boolean {
    this.metrics.totalRequests++;
    this.requestTimes.push(Date.now() - data.requestTime);

    let blocked = false;

    for (const pattern of this.patterns) {
      let match = false;

      if (pattern.pattern instanceof RegExp) {
        const testString = `${data.userAgent || ''} ${data.content || ''}`;
        match = pattern.pattern.test(testString);
      } else if (typeof pattern.pattern === 'function') {
        match = pattern.pattern(data);
      }

      if (match) {
        this.handlePatternMatch(pattern, data);
        
        if (pattern.action === 'block') {
          blocked = true;
          this.metrics.blockedRequests++;
        }
      }
    }

    if (!data.success) {
      this.metrics.errorRate = 
        (this.metrics.errorRate * (this.metrics.totalRequests - 1) + 1) 
        / this.metrics.totalRequests;
    }

    return !blocked;
  }

  private handlePatternMatch(pattern: SecurityPattern, data: any): void {
    this.metrics.suspiciousActivities++;

    const alertData = {
      type: pattern.id,
      severity: pattern.severity,
      details: {
        pattern: pattern.name,
        description: pattern.description,
        requestData: data,
        timestamp: Date.now(),
        userId: data.userId
      }
    };

    this.createAlert(alertData);

    // Executar ação baseada no padrão
    switch (pattern.action) {
      case 'block':
        this.blockUser(data.userId, pattern.id, 300000); // 5 minutos
        break;
      case 'throttle':
        this.throttleUser(data.userId, pattern.id);
        break;
      case 'alert':
        this.sendSecurityAlert(alertData);
        break;
    }

    // Log para auditoria
    SecurityAudit.logEvent({
      event_type: `security_pattern_${pattern.id}`,
      user_id: data.userId,
      event_data: alertData.details,
      severity: pattern.severity as any
    });
  }

  private createAlert(data: {
    type: string;
    severity: string;
    details: any;
    userId?: string;
  }): void {
    const alert: SecurityAlert = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      userId: data.userId,
      type: data.type,
      severity: data.severity,
      details: data.details,
      resolved: false
    };

    this.alerts.push(alert);
    
    // Manter apenas os últimos 1000 alertas
    if (this.alerts.length > 1000) {
      this.alerts = this.alerts.slice(-500);
    }

    // Auto-resolver alertas de baixa severidade após 1 hora
    if (data.severity === 'low') {
      setTimeout(() => {
        this.resolveAlert(alert.id);
      }, 3600000);
    }
  }

  private blockUser(userId?: string, reason?: string, duration: number = 300000): void {
    if (!userId) return;

    console.warn(`[SECURITY MONITOR] Blocking user ${userId} for ${reason}`);
    
    // Implementar bloqueio temporário via localStorage
    const blockData = {
      userId,
      reason,
      blockedAt: Date.now(),
      duration
    };
    
    sessionStorage.setItem(`blocked_${userId}`, JSON.stringify(blockData));
  }

  private throttleUser(userId?: string, reason?: string): void {
    if (!userId) return;

    console.warn(`[SECURITY MONITOR] Throttling user ${userId} for ${reason}`);
    
    // Reset rate limiter para esse usuário com limites mais restritivos
    adaptiveRateLimiter.resetUser(userId);
  }

  private sendSecurityAlert(alert: any): void {
    // Enviar alerta para sistema de monitoramento
    console.error(`[SECURITY ALERT] ${alert.severity.toUpperCase()}: ${alert.type}`, alert.details);
    
    // Aqui poderia integrar com serviços de alerta externos
    // como Slack, email, SMS, etc.
  }

  private cleanupOldAlerts(): void {
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    this.alerts = this.alerts.filter(alert => 
      alert.timestamp > oneDayAgo || !alert.resolved
    );
  }

  // Métodos públicos para monitoramento
  getMetrics(): SecurityMetrics {
    return { ...this.metrics };
  }

  getRecentAlerts(limit: number = 50): SecurityAlert[] {
    return this.alerts
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  getCriticalAlerts(): SecurityAlert[] {
    return this.alerts.filter(alert => 
      alert.severity === 'critical' && !alert.resolved
    );
  }

  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
    }
  }

  // Verificar se usuário está bloqueado
  isUserBlocked(userId: string): boolean {
    const blockData = sessionStorage.getItem(`blocked_${userId}`);
    if (!blockData) return false;

    try {
      const block = JSON.parse(blockData);
      const now = Date.now();
      
      if (now - block.blockedAt > block.duration) {
        sessionStorage.removeItem(`blocked_${userId}`);
        return false;
      }
      
      return true;
    } catch {
      sessionStorage.removeItem(`blocked_${userId}`);
      return false;
    }
  }

  // Estatísticas para dashboard admin
  getSecurityStats(): any {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const recentAlerts = this.alerts.filter(a => now - a.timestamp < oneHour);
    
    return {
      ...this.metrics,
      recentAlerts: recentAlerts.length,
      criticalAlerts: this.getCriticalAlerts().length,
      blockedUsers: this.getBlockedUsersCount(),
      systemHealth: this.getSystemHealth()
    };
  }

  private getBlockedUsersCount(): number {
    let count = 0;
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith('blocked_')) {
        count++;
      }
    }
    return count;
  }

  private getSystemHealth(): 'healthy' | 'warning' | 'critical' {
    const criticalAlerts = this.getCriticalAlerts().length;
    const errorRate = this.metrics.errorRate;
    const avgResponseTime = this.metrics.avgResponseTime;

    if (criticalAlerts > 0 || errorRate > 0.1 || avgResponseTime > 5000) {
      return 'critical';
    }
    if (errorRate > 0.05 || avgResponseTime > 2000) {
      return 'warning';
    }
    return 'healthy';
  }
}

export const securityMonitor = new SecurityMonitor();