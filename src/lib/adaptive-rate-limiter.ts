/**
 * Adaptive Rate Limiter - Sistema inteligente de rate limiting
 * Ajusta automaticamente os limites baseado no comportamento do usuário
 */

interface RateLimitConfig {
  baseLimit: number;
  timeWindow: number; // em ms
  burstAllowance: number;
  adaptiveFactor: number;
}

interface UserBehavior {
  successRate: number;
  averageInterval: number;
  totalRequests: number;
  suspiciousActivity: number;
  accountAge: number; // em dias
}

interface RateLimitEntry {
  timestamps: number[];
  violations: number;
  lastViolation: number;
  adaptedLimit: number;
  behavior: UserBehavior;
}

export class AdaptiveRateLimiter {
  private limitsMap = new Map<string, RateLimitEntry>();
  private configs = new Map<string, RateLimitConfig>();

  constructor() {
    // Configurações padrão para diferentes ações
    this.setConfig('privacy_safe_presence_check', {
      baseLimit: 3, // Reduzido de 10 para 3
      timeWindow: 60000, // 1 minuto
      burstAllowance: 2,
      adaptiveFactor: 0.5
    });

    this.setConfig('send_message', {
      baseLimit: 20,
      timeWindow: 60000,
      burstAllowance: 5,
      adaptiveFactor: 0.7
    });

    this.setConfig('financial_transaction', {
      baseLimit: 5,
      timeWindow: 300000, // 5 minutos
      burstAllowance: 1,
      adaptiveFactor: 0.2
    });

    this.setConfig('quiz_submission', {
      baseLimit: 30,
      timeWindow: 60000,
      burstAllowance: 10,
      adaptiveFactor: 0.8
    });

    // Cleanup automático a cada 5 minutos
    setInterval(() => this.cleanup(), 300000);
  }

  setConfig(action: string, config: RateLimitConfig): void {
    this.configs.set(action, config);
  }

  private getKey(userId: string, action: string): string {
    return `${userId}:${action}`;
  }

  private calculateAdaptiveLimit(
    config: RateLimitConfig, 
    behavior: UserBehavior
  ): number {
    let multiplier = 1.0;

    // Usuários novos têm limites mais baixos
    if (behavior.accountAge < 1) multiplier *= 0.3;
    else if (behavior.accountAge < 7) multiplier *= 0.6;
    else if (behavior.accountAge < 30) multiplier *= 0.8;

    // Alta taxa de sucesso aumenta o limite
    if (behavior.successRate > 0.95) multiplier *= 1.2;
    else if (behavior.successRate < 0.7) multiplier *= 0.5;

    // Atividade suspeita reduz drasticamente
    if (behavior.suspiciousActivity > 0) {
      multiplier *= Math.max(0.1, 1 - (behavior.suspiciousActivity * 0.3));
    }

    // Intervalos muito rápidos são suspeitos
    if (behavior.averageInterval < 1000) { // menos de 1 segundo
      multiplier *= 0.3;
    }

    return Math.max(1, Math.floor(config.baseLimit * multiplier));
  }

  private updateBehavior(
    entry: RateLimitEntry, 
    isSuccess: boolean, 
    accountAge: number
  ): void {
    const now = Date.now();
    
    // Calcular taxa de sucesso
    entry.behavior.totalRequests++;
    if (isSuccess) {
      entry.behavior.successRate = 
        (entry.behavior.successRate * (entry.behavior.totalRequests - 1) + 1) 
        / entry.behavior.totalRequests;
    } else {
      entry.behavior.successRate = 
        (entry.behavior.successRate * (entry.behavior.totalRequests - 1)) 
        / entry.behavior.totalRequests;
    }

    // Calcular intervalo médio
    if (entry.timestamps.length > 1) {
      const intervals = entry.timestamps.slice(-10).reduce((acc, ts, i, arr) => {
        if (i > 0) acc.push(ts - arr[i - 1]);
        return acc;
      }, [] as number[]);
      
      entry.behavior.averageInterval = 
        intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    }

    entry.behavior.accountAge = accountAge;
  }

  canPerformAction(
    userId: string, 
    action: string, 
    accountAge: number = 30,
    isSuccess: boolean = true
  ): boolean {
    const config = this.configs.get(action);
    if (!config) {
      // Fallback para ações não configuradas
      return this.basicRateLimit(userId, action, 10, 60000);
    }

    const key = this.getKey(userId, action);
    const now = Date.now();
    const cutoff = now - config.timeWindow;

    let entry = this.limitsMap.get(key);
    if (!entry) {
      entry = {
        timestamps: [],
        violations: 0,
        lastViolation: 0,
        adaptedLimit: config.baseLimit,
        behavior: {
          successRate: 1.0,
          averageInterval: 5000,
          totalRequests: 0,
          suspiciousActivity: 0,
          accountAge
        }
      };
      this.limitsMap.set(key, entry);
    }

    // Remover timestamps antigos
    entry.timestamps = entry.timestamps.filter(ts => ts > cutoff);

    // Atualizar comportamento
    this.updateBehavior(entry, isSuccess, accountAge);

    // Recalcular limite adaptativo
    entry.adaptedLimit = this.calculateAdaptiveLimit(config, entry.behavior);

    // Verificar violação
    if (entry.timestamps.length >= entry.adaptedLimit) {
      entry.violations++;
      entry.lastViolation = now;
      entry.behavior.suspiciousActivity++;
      
      // Log da violação com contexto
      console.warn(`[ADAPTIVE RATE LIMIT] Violation detected`, {
        userId,
        action,
        currentLimit: entry.adaptedLimit,
        baseLimit: config.baseLimit,
        accountAge,
        successRate: entry.behavior.successRate,
        violations: entry.violations,
        averageInterval: entry.behavior.averageInterval
      });

      return false;
    }

    // Adicionar timestamp atual
    entry.timestamps.push(now);
    return true;
  }

  private basicRateLimit(
    userId: string, 
    action: string, 
    limit: number, 
    windowMs: number
  ): boolean {
    const key = this.getKey(userId, action);
    const now = Date.now();
    const cutoff = now - windowMs;

    let entry = this.limitsMap.get(key);
    if (!entry) {
      entry = {
        timestamps: [now],
        violations: 0,
        lastViolation: 0,
        adaptedLimit: limit,
        behavior: {
          successRate: 1.0,
          averageInterval: 5000,
          totalRequests: 1,
          suspiciousActivity: 0,
          accountAge: 30
        }
      };
      this.limitsMap.set(key, entry);
      return true;
    }

    entry.timestamps = entry.timestamps.filter(ts => ts > cutoff);
    
    if (entry.timestamps.length >= limit) {
      return false;
    }

    entry.timestamps.push(now);
    return true;
  }

  // Obter estatísticas para monitoramento
  getStats(userId: string, action: string): any {
    const key = this.getKey(userId, action);
    const entry = this.limitsMap.get(key);
    
    if (!entry) return null;

    return {
      currentLimit: entry.adaptedLimit,
      violations: entry.violations,
      successRate: entry.behavior.successRate,
      totalRequests: entry.behavior.totalRequests,
      averageInterval: entry.behavior.averageInterval,
      accountAge: entry.behavior.accountAge,
      suspiciousActivity: entry.behavior.suspiciousActivity
    };
  }

  // Limpar entradas antigas
  private cleanup(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas

    for (const [key, entry] of this.limitsMap.entries()) {
      // Remover entradas muito antigas
      if (entry.timestamps.length === 0 || 
          (now - Math.max(...entry.timestamps)) > maxAge) {
        this.limitsMap.delete(key);
      }
    }
  }

  // Reset manual para usuário específico (para admins)
  resetUser(userId: string): void {
    for (const key of this.limitsMap.keys()) {
      if (key.startsWith(userId + ':')) {
        this.limitsMap.delete(key);
      }
    }
  }
}

export const adaptiveRateLimiter = new AdaptiveRateLimiter();