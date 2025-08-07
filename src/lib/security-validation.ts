import { SecurityAudit } from './security-audit';

// Enhanced validation with security logging
export class SecurityValidation {
  
  // Password strength validation
  static validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('Password must contain at least one special character (@$!%*?&)');
    }
    
    // Check for common weak patterns
    const weakPatterns = [
      /(.)\1{2,}/, // Repeated characters
      /123456|password|qwerty|admin/i, // Common weak passwords
      /^[a-z]+$/i, // Only letters
      /^\d+$/, // Only numbers
    ];
    
    if (weakPatterns.some(pattern => pattern.test(password))) {
      errors.push('Password contains weak patterns');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  // Email validation with security checks
  static validateEmail(email: string): { isValid: boolean; error?: string } {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Invalid email format' };
    }
    
    // Check for suspicious patterns
    if (email.includes('..') || email.includes('+')) {
      SecurityAudit.logEvent({
        event_type: 'suspicious_email_format',
        event_data: { email, reason: 'Email contains suspicious patterns' },
        severity: 'medium'
      });
    }
    
    return { isValid: true };
  }
  
  // Input sanitization with XSS protection
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  }
  
  // Rate limiting check
  static checkRateLimit(action: string, userId: string, maxAttempts: number = 5): boolean {
    const key = `${action}:${userId}`;
    const attempts = this.getAttempts(key);
    
    if (attempts >= maxAttempts) {
      SecurityAudit.logEvent({
        event_type: 'rate_limit_exceeded',
        event_data: { action, userId, attempts, reason: 'Rate limit exceeded' },
        severity: 'high'
      });
      return false;
    }
    
    this.incrementAttempts(key);
    return true;
  }
  
  private static getAttempts(key: string): number {
    const stored = localStorage.getItem(`rate_limit_${key}`);
    if (!stored) return 0;
    
    const data = JSON.parse(stored);
    const now = Date.now();
    
    // Reset if older than 15 minutes
    if (now - data.timestamp > 15 * 60 * 1000) {
      localStorage.removeItem(`rate_limit_${key}`);
      return 0;
    }
    
    return data.count;
  }
  
  private static incrementAttempts(key: string): void {
    const current = this.getAttempts(key);
    const data = {
      count: current + 1,
      timestamp: Date.now()
    };
    localStorage.setItem(`rate_limit_${key}`, JSON.stringify(data));
  }
  
  // CSRF token generation and validation
  static generateCSRFToken(): string {
    const token = crypto.getRandomValues(new Uint8Array(32));
    const tokenString = Array.from(token, byte => byte.toString(16).padStart(2, '0')).join('');
    sessionStorage.setItem('csrf_token', tokenString);
    return tokenString;
  }
  
  static validateCSRFToken(token: string): boolean {
    const storedToken = sessionStorage.getItem('csrf_token');
    return storedToken === token;
  }
  
  // Admin session validation
  static async validateAdminSession(sessionToken?: string): Promise<boolean> {
    if (!sessionToken) return false;
    
    try {
      const { data, error } = await import('@/integrations/supabase/client')
        .then(module => module.supabase.rpc('verify_admin_session', { session_token: sessionToken }));
      
      if (error) {
        SecurityAudit.logEvent({
          event_type: 'admin_session_validation_failed',
          event_data: {
            sessionToken: sessionToken.substring(0, 8) + '...',
            error: error.message
          },
          severity: 'high'
        });
        return false;
      }
      
      return data === true;
    } catch (error) {
      SecurityAudit.logEvent({
        event_type: 'admin_session_validation_error',
        event_data: {
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        severity: 'critical'
      });
      return false;
    }
  }
}