import DOMPurify from 'dompurify';
import { 
  portfolioNameSchema,
  portfolioDescriptionSchema,
  assetQuantitySchema,
  assetPriceSchema,
  initialBalanceSchema,
  messageContentSchema,
  nicknameSchema
} from '@/schemas';

export const sanitizeText = (input: string): string => {
  return DOMPurify.sanitize(input.trim(), { ALLOWED_TAGS: [] });
};

export const sanitizeHTML = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: []
  });
};

export const validatePortfolioName = (name: string): string | null => {
  const clean = sanitizeText(name);
  const result = portfolioNameSchema.safeParse(clean);
  return result.success ? null : result.error.errors[0]?.message || 'Erro de validação';
};

export const validatePortfolioDescription = (description: string): string | null => {
  const clean = sanitizeText(description);
  const result = portfolioDescriptionSchema.safeParse(clean);
  return result.success ? null : result.error.errors[0]?.message || 'Erro de validação';
};

export const validateAssetQuantity = (quantity: number): string | null => {
  if (isNaN(quantity) || quantity <= 0) return 'Quantidade deve ser maior que zero';
  const result = assetQuantitySchema.safeParse(quantity);
  return result.success ? null : result.error.errors[0]?.message || 'Erro de validação';
};

export const validateAssetPrice = (price: number): string | null => {
  if (isNaN(price) || price <= 0) return 'Preço deve ser maior que zero';
  const result = assetPriceSchema.safeParse(price);
  return result.success ? null : result.error.errors[0]?.message || 'Erro de validação';
};

export const validateInitialBalance = (balance: number): string | null => {
  if (isNaN(balance) || balance <= 0) return 'Saldo deve ser maior que zero';
  const result = initialBalanceSchema.safeParse(balance);
  return result.success ? null : result.error.errors[0]?.message || 'Erro de validação';
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

export const validateMessageContent = (content: string): string | null => {
  const clean = sanitizeText(content);
  const result = messageContentSchema.safeParse(clean);
  return result.success ? null : result.error.errors[0]?.message || 'Erro de validação';
};

export const validateNickname = (nickname: string): string | null => {
  const clean = sanitizeText(nickname);
  const result = nicknameSchema.safeParse(clean);
  return result.success ? null : result.error.errors[0]?.message || 'Erro de validação';
};

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
