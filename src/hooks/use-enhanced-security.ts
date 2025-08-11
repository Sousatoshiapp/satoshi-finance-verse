import { useState, useEffect } from 'react';
import { SecurityAudit } from '@/lib/security-audit';
import { SecurityValidation } from '@/lib/security-validation';
import { SecureStorage } from '@/lib/secure-storage';
import { useAuth } from '@/contexts/AuthContext';

export function useEnhancedSecurity() {
  const { user } = useAuth();
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [securityEvents, setSecurityEvents] = useState<any[]>([]);

  useEffect(() => {
    // Migrate existing data to secure storage
    SecureStorage.migrateToSecureStorage();

    // Generate CSRF token using secure storage
    const token = SecureStorage.generateCSRFToken();
    setCsrfToken(token);

    // Set up security monitoring
    const handleSecurityEvent = (event: Event) => {
      SecurityAudit.logEvent({
        event_type: 'browser_security_event',
        event_data: { type: event.type, timestamp: Date.now() },
        severity: 'low'
      });
    };

    // Monitor for potential security issues
    const handleVisibilityChange = () => {
      if (document.hidden) {
        SecurityAudit.logEvent({
          event_type: 'page_hidden',
          severity: 'low'
        });
      }
    };

    const handleBeforeUnload = () => {
      SecurityAudit.logEvent({
        event_type: 'page_unload',
        severity: 'low'
      });
    };

    const handleError = (event: ErrorEvent) => {
      SecurityAudit.logEvent({
        event_type: 'javascript_error',
        event_data: {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno
        },
        severity: 'medium'
      });
    };

    // Monitor for suspicious network activity
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
      const url = args[0] as string;
      
      // Log suspicious requests
      if (url.includes('admin') || url.includes('password') || url.includes('token')) {
        SecurityAudit.logEvent({
          event_type: 'sensitive_api_call',
          event_data: { 
            url: url.substring(0, 100), // Truncate for privacy
            timestamp: Date.now() 
          },
          severity: 'medium'
        });
      }
      
      return originalFetch.apply(this, args);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('error', handleError);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('error', handleError);
      // Restore original fetch
      window.fetch = originalFetch;
    };
  }, []);

  const logSecurityAction = async (action: string, details?: any) => {
    // Add rate limiting for security actions
    if (!user || !SecurityValidation.checkRateLimit(action, user.id)) {
      SecurityAudit.logEvent({
        event_type: 'rate_limit_exceeded',
        event_data: { action, userId: user?.id },
        severity: 'high'
      });
      return false;
    }

    SecurityAudit.logEvent({
      event_type: action,
      event_data: details,
      severity: 'low'
    });
    return true;
  };

  const validateAction = (action: string): boolean => {
    if (!user) return false;
    
    return SecurityValidation.checkRateLimit(action, user.id);
  };

  const validateCSRF = (token: string): boolean => {
    return SecureStorage.validateCSRFToken(token);
  };

  const logSuspiciousActivity = (reason: string, details: any) => {
    SecurityAudit.logEvent({
      event_type: 'suspicious_activity',
      event_data: {
        reason,
        ...details,
        timestamp: Date.now(),
        userAgent: navigator.userAgent.substring(0, 200)
      },
      severity: 'high'
    });
  };

  // Enhanced financial transaction validation
  const validateFinancialTransaction = (amount: number, recipientId: string): boolean => {
    if (!user) return false;

    // Validate amount
    if (amount <= 0 || amount > 1000000) { // Max 1M BTZ per transaction
      logSuspiciousActivity('invalid_transaction_amount', { amount, recipientId });
      return false;
    }

    // Check rate limiting for financial transactions
    if (!SecurityValidation.checkRateLimit('financial_transaction', user.id, 10)) {
      logSuspiciousActivity('financial_transaction_rate_limit', { amount, recipientId });
      return false;
    }

    // Validate recipient
    if (!recipientId || recipientId === user.id) {
      logSuspiciousActivity('invalid_transaction_recipient', { amount, recipientId });
      return false;
    }

    return true;
  };

  return {
    csrfToken,
    logSecurityAction,
    validateAction,
    validateCSRF,
    logSuspiciousActivity,
    validateFinancialTransaction,
    securityEvents
  };
}