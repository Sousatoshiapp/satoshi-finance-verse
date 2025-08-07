import { useState, useEffect, useCallback } from 'react';
import { SecurityAudit } from '@/lib/security-audit';
import { SecurityValidation } from '@/lib/security-validation';
import { useAuth } from '@/contexts/AuthContext';

export function useEnhancedSecurity() {
  const { user } = useAuth();
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [securityEvents, setSecurityEvents] = useState<any[]>([]);

  useEffect(() => {
    // Generate CSRF token on mount
    const token = SecurityValidation.generateCSRFToken();
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

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('error', handleError);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('error', handleError);
    };
  }, []);

  const logSecurityAction = useCallback((action: string, details?: any) => {
    SecurityAudit.logEvent({
      event_type: action,
      event_data: details,
      severity: 'low'
    });
  }, []);

  const validateAction = useCallback((action: string): boolean => {
    if (!user) return false;
    
    return SecurityValidation.checkRateLimit(action, user.id);
  }, [user]);

  const validateCSRF = useCallback((token: string): boolean => {
    return SecurityValidation.validateCSRFToken(token);
  }, []);

  const logSuspiciousActivity = useCallback((reason: string, details: any) => {
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
  }, []);

  return {
    csrfToken,
    logSecurityAction,
    validateAction,
    validateCSRF,
    logSuspiciousActivity,
    securityEvents
  };
}