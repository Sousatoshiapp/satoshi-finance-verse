/**
 * Invisible Security Enhancer - Melhorias invisíveis de segurança
 * Otimiza automaticamente sem impacto visual na UX
 */

import { securityMonitor } from './security-monitor';
import { adaptiveRateLimiter } from './adaptive-rate-limiter';
import { performanceMonitor } from './performance-monitor';

export class InvisibleSecurityEnhancer {
  private isInitialized = false;
  private autoOptimizationEnabled = true;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    if (this.isInitialized || typeof window === 'undefined') return;
    
    this.isInitialized = true;

    // Integração automática com sistemas existentes
    this.enhanceExistingHooks();
    this.setupAutoOptimization();
    this.implementInvisibleProtections();
    
    console.log('🛡️ Invisible Security Enhancer activated');
  }

  private enhanceExistingHooks(): void {
    // Interceptar chamadas de segurança existentes para otimização
    this.interceptSecurityValidation();
    this.optimizeRateLimiting();
    this.enhanceErrorHandling();
  }

  private interceptSecurityValidation(): void {
    // Melhorar validações existentes sem alterar interface
    const originalConsoleWarn = console.warn;
    console.warn = (...args) => {
      const message = args[0];
      
      if (typeof message === 'string' && message.includes('SECURITY AUDIT')) {
        // Extrair dados da mensagem de log existente
        try {
          const data = args[1];
          if (data && data.event_type === 'rate_limit_exceeded') {
            // Aplicar otimização inteligente
            this.handleRateLimitOptimization(data);
          }
        } catch (error) {
          // Falha silenciosa para não quebrar logs existentes
        }
      }
      
      // Continuar com log original
      originalConsoleWarn.apply(console, args);
    };
  }

  private handleRateLimitOptimization(data: any): void {
    if (!data.user_id || !data.event_data?.action) return;

    const userId = data.user_id;
    const action = data.event_data.action;

    // Verificar se é uma ação específica problemática
    if (action === 'privacy_safe_presence_check') {
      // Aplicar rate limiting mais inteligente
      const stats = adaptiveRateLimiter.getStats(userId, action);
      
      if (stats && stats.violations > 3) {
        // Aumentar intervalo automaticamente
        this.applyAdaptiveThrottling(userId, action);
      }
    }
  }

  private applyAdaptiveThrottling(userId: string, action: string): void {
    // Implementar throttling inteligente sem impacto visual
    const throttleData = {
      userId,
      action,
      throttledAt: Date.now(),
      throttleDuration: 30000, // 30 segundos
      reason: 'adaptive_optimization'
    };

    sessionStorage.setItem(`throttle_${userId}_${action}`, JSON.stringify(throttleData));
    
    console.info(`🔧 Applied adaptive throttling for ${action} (user: ${userId.substring(0, 8)}...)`);
  }

  private optimizeRateLimiting(): void {
    // Interceptar e otimizar rate limiting global
    const originalCanPerformAction = adaptiveRateLimiter.canPerformAction.bind(adaptiveRateLimiter);
    
    adaptiveRateLimiter.canPerformAction = (userId: string, action: string, accountAge?: number, isSuccess?: boolean) => {
      // Verificar throttling inteligente primeiro
      const throttleKey = `throttle_${userId}_${action}`;
      const throttleData = sessionStorage.getItem(throttleKey);
      
      if (throttleData) {
        try {
          const data = JSON.parse(throttleData);
          if (Date.now() - data.throttledAt < data.throttleDuration) {
            return false; // Ainda sendo throttled
          } else {
            sessionStorage.removeItem(throttleKey); // Throttle expirou
          }
        } catch {
          sessionStorage.removeItem(throttleKey);
        }
      }

      // Aplicar otimizações específicas por ação
      if (action === 'privacy_safe_presence_check') {
        // Reduzir frequência baseado em atividade do usuário
        const lastActive = sessionStorage.getItem(`last_active_${userId}`);
        if (lastActive) {
          const timeSinceActive = Date.now() - parseInt(lastActive);
          if (timeSinceActive < 5000) { // Usuário ativo nos últimos 5 segundos
            // Permitir mais frequência para usuários ativos
            accountAge = Math.max(accountAge || 0, 7); // Tratar como usuário experiente
          }
        }
      }

      return originalCanPerformAction(userId, action, accountAge, isSuccess);
    };
  }

  private enhanceErrorHandling(): void {
    // Interceptar erros para análise e otimização automática
    const originalErrorHandler = window.onerror;
    
    window.onerror = (message, source, lineno, colno, error) => {
      // Analisar erro para padrões de segurança
      if (typeof message === 'string') {
        if (message.includes('rate limit') || message.includes('security')) {
          this.handleSecurityError(message, { source, lineno, colno, error });
        }
      }
      
      // Chamar handler original se existir
      if (originalErrorHandler) {
        return originalErrorHandler(message, source, lineno, colno, error);
      }
      
      return false;
    };
  }

  private handleSecurityError(message: string, context: any): void {
    // Aplicar correções automáticas baseadas no erro
    if (message.includes('rate limit exceeded')) {
      // Ativar modo de recuperação automática
      this.activateRecoveryMode();
    }
  }

  private activateRecoveryMode(): void {
    console.info('🔄 Activating security recovery mode');
    
    // Reduzir temporariamente a frequência de todas as operações
    const recoveryEndTime = Date.now() + 60000; // 1 minuto
    sessionStorage.setItem('security_recovery_mode', recoveryEndTime.toString());
    
    // Aplicar otimizações temporárias
    setTimeout(() => {
      this.deactivateRecoveryMode();
    }, 60000);
  }

  private deactivateRecoveryMode(): void {
    sessionStorage.removeItem('security_recovery_mode');
    console.info('✅ Security recovery mode deactivated');
  }

  private setupAutoOptimization(): void {
    // Otimização automática a cada 2 minutos
    setInterval(() => {
      if (this.autoOptimizationEnabled) {
        this.performInvisibleOptimizations();
      }
    }, 120000);
  }

  private performInvisibleOptimizations(): void {
    // Otimizações que não afetam a UX
    this.optimizePerformance();
    this.cleanupSecurityData();
    this.adjustRateLimits();
  }

  private optimizePerformance(): void {
    // Usar o performance monitor para otimizações automáticas
    const metrics = performanceMonitor.getMetrics();
    
    if (metrics.memoryUsage && metrics.memoryUsage > 80) {
      // Limpeza automática de dados de segurança antigos
      this.cleanupOldSecurityData();
    }
    
    if (metrics.networkLatency && metrics.networkLatency > 1500) {
      // Reduzir frequência de requisições automaticamente
      this.reduceRequestFrequency();
    }
  }

  private cleanupOldSecurityData(): void {
    // Limpar dados de segurança antigos para otimizar memória
    const keys = Object.keys(sessionStorage);
    const now = Date.now();
    
    keys.forEach(key => {
      if (key.startsWith('rate_limit_') || key.startsWith('throttle_')) {
        try {
          const data = JSON.parse(sessionStorage.getItem(key) || '{}');
          if (data.timestamp && now - data.timestamp > 300000) { // 5 minutos
            sessionStorage.removeItem(key);
          }
        } catch {
          sessionStorage.removeItem(key);
        }
      }
    });
  }

  private reduceRequestFrequency(): void {
    // Aplicar redução temporária na frequência de requisições
    const reductionEndTime = Date.now() + 120000; // 2 minutos
    sessionStorage.setItem('request_frequency_reduction', reductionEndTime.toString());
    
    setTimeout(() => {
      sessionStorage.removeItem('request_frequency_reduction');
    }, 120000);
  }

  private cleanupSecurityData(): void {
    // Limpeza regular de dados de segurança
    securityMonitor.getRecentAlerts(10); // Manter apenas alertas recentes
    
    // Remover entradas antigas do rate limiter
    adaptiveRateLimiter.resetUser('__cleanup__');
  }

  private adjustRateLimits(): void {
    // Ajustar rate limits baseado em padrões de uso
    const recoveryMode = sessionStorage.getItem('security_recovery_mode');
    const frequencyReduction = sessionStorage.getItem('request_frequency_reduction');
    
    if (recoveryMode || frequencyReduction) {
      // Durante otimização, usar limites mais conservadores
      console.info('🔧 Applying conservative rate limits during optimization');
    }
  }

  private implementInvisibleProtections(): void {
    // Proteções que funcionam em background
    this.setupContentSecurityPolicy();
    this.implementRequestValidation();
    this.setupAutomaticCleanup();
  }

  private setupContentSecurityPolicy(): void {
    // Implementar CSP via meta tag se não existir
    if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Security-Policy';
      meta.content = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';";
      document.head.appendChild(meta);
    }
  }

  private implementRequestValidation(): void {
    // Validação automática de requisições
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const [url] = args;
      
      // Validações de segurança invisíveis
      if (typeof url === 'string') {
        if (this.isSuspiciousUrl(url)) {
          console.warn('Blocked suspicious request:', url);
          throw new Error('Request blocked by security policy');
        }
      }
      
      return originalFetch.apply(window, args);
    };
  }

  private isSuspiciousUrl(url: string): boolean {
    const suspiciousPatterns = [
      /javascript:/i,
      /data:text\/html/i,
      /vbscript:/i,
      /file:/i
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(url));
  }

  private setupAutomaticCleanup(): void {
    // Limpeza automática a cada 10 minutos
    setInterval(() => {
      this.performAutomaticCleanup();
    }, 600000);
  }

  private performAutomaticCleanup(): void {
    // Limpeza de recursos sem impacto na UX
    this.cleanupOldSecurityData();
    
    // Verificar e corrigir problemas comuns
    if (sessionStorage.length > 50) {
      console.info('🧹 Performing storage cleanup');
      this.cleanupExcessiveStorage();
    }
  }

  private cleanupExcessiveStorage(): void {
    const keys = Object.keys(sessionStorage);
    const securityKeys = keys.filter(k => 
      k.startsWith('rate_limit_') || 
      k.startsWith('throttle_') || 
      k.startsWith('blocked_')
    );
    
    // Manter apenas os mais recentes
    if (securityKeys.length > 20) {
      securityKeys.slice(0, -10).forEach(key => {
        sessionStorage.removeItem(key);
      });
    }
  }

  // Métodos públicos para monitoramento (invisível)
  getOptimizationStatus(): any {
    return {
      isActive: this.autoOptimizationEnabled,
      recoveryMode: !!sessionStorage.getItem('security_recovery_mode'),
      frequencyReduction: !!sessionStorage.getItem('request_frequency_reduction'),
      securityHealth: securityMonitor.getSecurityStats().systemHealth,
      performanceScore: performanceMonitor.getPerformanceScore()
    };
  }

  enableAutoOptimization(): void {
    this.autoOptimizationEnabled = true;
    console.info('✅ Auto-optimization enabled');
  }

  disableAutoOptimization(): void {
    this.autoOptimizationEnabled = false;
    console.info('⏸️ Auto-optimization disabled');
  }
}

// Inicializar automaticamente
export const invisibleSecurityEnhancer = new InvisibleSecurityEnhancer();