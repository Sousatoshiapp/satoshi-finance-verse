import { supabase } from "@/integrations/supabase/client";

interface SecurityLogEntry {
  user_id: string;
  action: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

export class SecurityLogger {
  static async logAction(entry: Omit<SecurityLogEntry, 'user_id'>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      // Log to activity feed for audit trail
      await supabase
        .from('activity_feed')
        .insert({
          user_id: profile.id,
          activity_type: 'security_log',
          activity_data: {
            action: entry.action,
            details: entry.details,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent.substring(0, 200) // Truncate to prevent overflow
          }
        });

      // Also log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Security Log] ${entry.action}:`, entry.details);
      }
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  static async logPortfolioCreation(portfolioId: string, portfolioName: string) {
    await this.logAction({
      action: 'portfolio_created',
      details: { portfolioId, portfolioName }
    });
  }

  static async logSocialAction(action: string, targetId: string, targetType: string) {
    await this.logAction({
      action: `social_${action}`,
      details: { targetId, targetType }
    });
  }

  static async logSuspiciousActivity(reason: string, details: Record<string, any>) {
    await this.logAction({
      action: 'suspicious_activity',
      details: { reason, ...details }
    });
  }
}