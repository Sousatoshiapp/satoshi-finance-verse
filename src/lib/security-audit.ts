import { supabase } from "@/integrations/supabase/client";

export interface SecurityEvent {
  event_type: string;
  user_id?: string;
  event_data?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export class SecurityAudit {
  static async logEvent(event: SecurityEvent) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const auditEntry = {
        event_type: event.event_type,
        user_id: event.user_id || user?.id,
        event_data: event.event_data || {},
        ip_address: event.ip_address,
        user_agent: event.user_agent || navigator.userAgent.substring(0, 500),
        severity: event.severity || 'low'
      };

      // Log to security audit table
      await supabase
        .from('security_audit_log')
        .insert(auditEntry);

      // Also log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[SECURITY AUDIT] ${event.severity?.toUpperCase()}: ${event.event_type}`, auditEntry);
      }
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  // Specific security event loggers
  static async logSuspiciousLogin(details: Record<string, any>) {
    await this.logEvent({
      event_type: 'suspicious_login_attempt',
      event_data: details,
      severity: 'high'
    });
  }

  static async logPaymentSecurityEvent(details: Record<string, any>) {
    await this.logEvent({
      event_type: 'payment_security_event',
      event_data: details,
      severity: 'medium'
    });
  }

  static async logDataValidationFailure(details: Record<string, any>) {
    await this.logEvent({
      event_type: 'data_validation_failure',
      event_data: details,
      severity: 'medium'
    });
  }

  static async logUnauthorizedAccess(details: Record<string, any>) {
    await this.logEvent({
      event_type: 'unauthorized_access_attempt',
      event_data: details,
      severity: 'critical'
    });
  }
}