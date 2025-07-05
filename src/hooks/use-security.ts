import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { globalRateLimiter } from '@/lib/validation';

interface SecurityEvent {
  event_type: string;
  user_id?: string;
  details?: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export function useSecurity() {
  const logSecurityEvent = async (event: SecurityEvent) => {
    try {
      // Log to console for immediate visibility
      console.warn(`SECURITY ${event.severity.toUpperCase()}: ${event.event_type}`, {
        userId: event.user_id,
        timestamp: new Date().toISOString(),
        details: event.details,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
      });

      // Get current user if not provided
      let userId = event.user_id;
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('user_id', user.id)
            .single();
          userId = profile?.id;
        }
      }

      // Log to database if user is authenticated
      if (userId) {
        await supabase.from('activity_feed').insert({
          activity_type: `security_${event.event_type}`,
          user_id: userId,
          activity_data: {
            severity: event.severity,
            details: event.details,
            timestamp: new Date().toISOString(),
            user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
          }
        });
      }
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  };

  const checkRateLimit = (action: string, maxPerMinute: number = 10): boolean => {
    const userId = 'anonymous'; // TODO: Get actual user ID
    return globalRateLimiter.canPerformAction(userId, action, maxPerMinute);
  };

  const detectAnomalousActivity = (activity: string, details: any) => {
    // Simple anomaly detection patterns
    const anomalousPatterns = [
      { pattern: /(.)\1{10,}/, description: 'Repeated character pattern' },
      { pattern: /<[^>]*>/g, description: 'HTML tags detected' },
      { pattern: /javascript:|vbscript:|data:/i, description: 'Script injection attempt' },
      { pattern: /union\s+select|drop\s+table|insert\s+into/i, description: 'SQL injection attempt' }
    ];

    const suspiciousPatterns = anomalousPatterns.filter(({ pattern }) => 
      pattern.test(JSON.stringify(details))
    );

    if (suspiciousPatterns.length > 0) {
      logSecurityEvent({
        event_type: 'anomalous_activity_detected',
        details: {
          activity,
          patterns: suspiciousPatterns.map(p => p.description),
          data: details
        },
        severity: 'high'
      });
      return true;
    }

    return false;
  };

  // Setup security monitoring
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        logSecurityEvent({
          event_type: 'page_hidden',
          details: { url: window.location.href },
          severity: 'low'
        });
      }
    };

    const handleBeforeUnload = () => {
      logSecurityEvent({
        event_type: 'page_unload',
        details: { url: window.location.href },
        severity: 'low'
      });
    };

    // Monitor for potential security issues
    const handleError = (event: ErrorEvent) => {
      if (event.error?.message?.includes('Script error')) {
        logSecurityEvent({
          event_type: 'script_error',
          details: { 
            message: event.message,
            filename: event.filename,
            lineno: event.lineno
          },
          severity: 'medium'
        });
      }
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

  return {
    logSecurityEvent,
    checkRateLimit,
    detectAnomalousActivity
  };
}