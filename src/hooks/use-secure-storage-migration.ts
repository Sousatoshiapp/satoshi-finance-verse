import { useEffect } from 'react';
import { SecureStorage } from '@/lib/secure-storage';
import { useEnhancedSecurity } from './use-enhanced-security';

// Keys that contain sensitive data and should be migrated to secure storage
const SENSITIVE_KEYS = [
  'biometric_user_email',
  'biometric_session_token', 
  'biometric_refresh_token',
  'biometric_auth_enabled',
  'admin_access_granted',
  'satoshi_user',
  'user_session_data',
  'auth_tokens',
  'user_preferences_secure'
];

// Keys that are safe to keep in localStorage (non-sensitive UI state)
const SAFE_KEYS = [
  'btz-visibility',
  'btc-tutorial-seen',
  'crisis-banner-dismissed',
  'crisis-contributed',
  'enableSounds',
  'enableHaptics',
  'last-optimization',
  'notifiedPlayers',
  'activePowerups',
  'satoshi_settings' // Contains only UI preferences
];

export function useSecureStorageMigration() {
  const { logSecurityAction, logSuspiciousActivity } = useEnhancedSecurity();

  useEffect(() => {
    migrateToSecureStorage();
  }, []);

  const migrateToSecureStorage = () => {
    try {
      logSecurityAction('storage_migration_started');
      let migratedCount = 0;
      let errors = 0;

      // Migrate sensitive data from localStorage to secure storage
      SENSITIVE_KEYS.forEach(key => {
        try {
          const value = localStorage.getItem(key);
          if (value !== null) {
            // Store in secure storage
            SecureStorage.setSecureItem(key, value);
            // Remove from localStorage
            localStorage.removeItem(key);
            migratedCount++;
            
            logSecurityAction('storage_item_migrated', { key });
          }
        } catch (error) {
          console.error(`Failed to migrate ${key}:`, error);
          errors++;
          logSuspiciousActivity('storage_migration_error', { 
            key, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
        }
      });

      // Audit localStorage for any remaining sensitive data
      auditRemainingLocalStorage();

      logSecurityAction('storage_migration_completed', { 
        migratedCount, 
        errors,
        timestamp: Date.now()
      });

    } catch (error) {
      console.error('Storage migration failed:', error);
      logSuspiciousActivity('storage_migration_critical_failure', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  };

  const auditRemainingLocalStorage = () => {
    try {
      const remainingKeys = Object.keys(localStorage);
      const suspiciousKeys = remainingKeys.filter(key => 
        !SAFE_KEYS.includes(key) && 
        (key.includes('auth') || 
         key.includes('token') || 
         key.includes('session') || 
         key.includes('password') ||
         key.includes('user') ||
         key.includes('admin'))
      );

      if (suspiciousKeys.length > 0) {
        logSuspiciousActivity('suspicious_localstorage_data_found', { 
          keys: suspiciousKeys 
        });
        
        // Log warning for developers
        console.warn('⚠️ SECURITY WARNING: Potentially sensitive data found in localStorage:', suspiciousKeys);
      }

      logSecurityAction('localstorage_audit_completed', { 
        totalKeys: remainingKeys.length,
        suspiciousKeys: suspiciousKeys.length
      });

    } catch (error) {
      logSuspiciousActivity('localstorage_audit_failed', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  };

  const cleanupExpiredSecureData = () => {
    try {
      // This will be handled by SecureStorage internally
      // when expired data is accessed
      logSecurityAction('expired_data_cleanup_triggered');
    } catch (error) {
      logSuspiciousActivity('cleanup_failed', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  };

  return {
    migrateToSecureStorage,
    auditRemainingLocalStorage,
    cleanupExpiredSecureData
  };
}
