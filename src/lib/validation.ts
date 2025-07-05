import DOMPurify from 'dompurify';

// Input sanitization
export const sanitizeText = (input: string): string => {
  return DOMPurify.sanitize(input.trim(), { ALLOWED_TAGS: [] });
};

export const sanitizeHTML = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: []
  });
};

// Validation rules
export const ValidationRules = {
  portfolioName: {
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-_.áéíóúàèìòùâêîôûãõç]+$/i
  },
  portfolioDescription: {
    maxLength: 500
  },
  assetQuantity: {
    min: 0.000001,
    max: 1000000
  },
  assetPrice: {
    min: 0.01,
    max: 1000000
  },
  initialBalance: {
    min: 100,
    max: 10000000
  }
};

// Validation functions
export const validatePortfolioName = (name: string): string | null => {
  const clean = sanitizeText(name);
  
  if (!clean) return 'Nome é obrigatório';
  if (clean.length < ValidationRules.portfolioName.minLength) 
    return `Nome deve ter pelo menos ${ValidationRules.portfolioName.minLength} caracteres`;
  if (clean.length > ValidationRules.portfolioName.maxLength) 
    return `Nome deve ter no máximo ${ValidationRules.portfolioName.maxLength} caracteres`;
  if (!ValidationRules.portfolioName.pattern.test(clean)) 
    return 'Nome contém caracteres inválidos';
  
  return null;
};

export const validatePortfolioDescription = (description: string): string | null => {
  const clean = sanitizeText(description);
  
  if (clean.length > ValidationRules.portfolioDescription.maxLength) 
    return `Descrição deve ter no máximo ${ValidationRules.portfolioDescription.maxLength} caracteres`;
  
  return null;
};

export const validateAssetQuantity = (quantity: number): string | null => {
  if (isNaN(quantity) || quantity <= 0) return 'Quantidade deve ser maior que zero';
  if (quantity < ValidationRules.assetQuantity.min) return 'Quantidade muito pequena';
  if (quantity > ValidationRules.assetQuantity.max) return 'Quantidade muito grande';
  
  return null;
};

export const validateAssetPrice = (price: number): string | null => {
  if (isNaN(price) || price <= 0) return 'Preço deve ser maior que zero';
  if (price < ValidationRules.assetPrice.min) return 'Preço muito baixo';
  if (price > ValidationRules.assetPrice.max) return 'Preço muito alto';
  
  return null;
};

export const validateInitialBalance = (balance: number): string | null => {
  if (isNaN(balance) || balance <= 0) return 'Saldo deve ser maior que zero';
  if (balance < ValidationRules.initialBalance.min) return `Saldo mínimo: R$ ${ValidationRules.initialBalance.min}`;
  if (balance > ValidationRules.initialBalance.max) return `Saldo máximo: R$ ${ValidationRules.initialBalance.max.toLocaleString('pt-BR')}`;
  
  return null;
};

// Rate limiting helper
export class RateLimiter {
  private actions: Map<string, number[]> = new Map();

  canPerformAction(userId: string, action: string, maxPerMinute: number = 10): boolean {
    const key = `${userId}:${action}`;
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Get existing timestamps for this user+action
    const timestamps = this.actions.get(key) || [];
    
    // Remove old timestamps
    const recentTimestamps = timestamps.filter(ts => ts > oneMinuteAgo);
    
    // Check if under limit
    if (recentTimestamps.length >= maxPerMinute) {
      return false;
    }

    // Add current timestamp
    recentTimestamps.push(now);
    this.actions.set(key, recentTimestamps);
    
    return true;
  }

  // Enhanced security logging
  logSecurityEvent(event: string, userId: string, details?: any) {
    console.warn(`SECURITY EVENT: ${event}`, {
      userId,
      timestamp: new Date().toISOString(),
      details,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
    });
  }
}

export const globalRateLimiter = new RateLimiter();

// Enhanced validation with length limits
export const validateMessageContent = (content: string): string | null => {
  const clean = sanitizeText(content);
  
  if (!clean) return 'Mensagem não pode estar vazia';
  if (clean.length > 1000) return 'Mensagem muito longa (máximo 1000 caracteres)';
  if (clean.length < 1) return 'Mensagem muito curta';
  
  return null;
};

export const validateNickname = (nickname: string): string | null => {
  const clean = sanitizeText(nickname);
  
  if (!clean) return 'Nome é obrigatório';
  if (clean.length < 2) return 'Nome deve ter pelo menos 2 caracteres';
  if (clean.length > 50) return 'Nome deve ter no máximo 50 caracteres';
  if (!/^[a-zA-Z0-9\s\-_.áéíóúàèìòùâêîôûãõç]+$/i.test(clean)) 
    return 'Nome contém caracteres inválidos';
  
  return null;
};

// Content security validation
export const detectSuspiciousContent = (content: string): boolean => {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /vbscript:/i,
    /on\w+\s*=/i,
    /data:text\/html/i,
    /eval\(/i,
    /expression\(/i
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(content));
};