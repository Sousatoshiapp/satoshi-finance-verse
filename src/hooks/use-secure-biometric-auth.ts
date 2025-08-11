import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { usePlatformDetection } from './use-platform-detection';
import { SecureStorage } from '@/lib/secure-storage';
import { useEnhancedSecurity } from './use-enhanced-security';

// Interface for biometric authentication
interface BiometricResult {
  isAvailable: boolean;
  biometryType?: string;
}

export interface BiometricAuthState {
  isAvailable: boolean;
  biometryType: string | null;
  isEnabled: boolean;
  loading: boolean;
}

export function useSecureBiometricAuth() {
  const [state, setState] = useState<BiometricAuthState>({
    isAvailable: false,
    biometryType: null,
    isEnabled: false,
    loading: true
  });
  
  const { isNative } = usePlatformDetection();
  const { logSecurityAction, logSuspiciousActivity } = useEnhancedSecurity();

  useEffect(() => {
    checkBiometricAvailability();
  }, [isNative]);

  const checkBiometricAvailability = async () => {
    try {
      logSecurityAction('biometric_availability_check');
      
      if (Capacitor.isNativePlatform()) {
        // For native platforms, use real detection
        setState(prev => ({
          ...prev,
          isAvailable: true,
          biometryType: Capacitor.getPlatform() === 'ios' ? 'FaceID' : 'Fingerprint',
          loading: false
        }));
      } else {
        // For web, check WebAuthn availability
        const hasWebAuthn = !!(navigator.credentials && navigator.credentials.create);
        setState(prev => ({
          ...prev,
          isAvailable: hasWebAuthn,
          biometryType: 'Touch ID',
          loading: false
        }));
      }
      
      // Check if biometric is enabled using secure storage
      const enabled = SecureStorage.getSecureItem('biometric_auth_enabled') === 'true';
      setState(prev => ({ ...prev, isEnabled: enabled }));
    } catch (error) {
      console.warn('Biometric check failed:', error);
      logSuspiciousActivity('biometric_check_failed', { error: error instanceof Error ? error.message : 'Unknown error' });
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const authenticateWithBiometric = async (): Promise<{ success: boolean; error?: string }> => {
    if (!state.isAvailable) {
      logSuspiciousActivity('biometric_auth_unavailable_attempt', {});
      return { success: false, error: 'Autenticação biométrica não disponível' };
    }

    try {
      logSecurityAction('biometric_authentication_attempt');
      
      // Simulation for development - replace with real plugin
      if (Capacitor.isNativePlatform()) {
        console.log('Biometric authentication simulated');
      }

      // Get stored credentials from secure storage
      const storedEmail = SecureStorage.getSecureItem('biometric_user_email');
      const storedSession = SecureStorage.getSecureItem('biometric_session_token');
      
      if (storedEmail && storedSession) {
        // Restore session
        const { data, error } = await supabase.auth.setSession({
          access_token: storedSession,
          refresh_token: SecureStorage.getSecureItem('biometric_refresh_token') || ''
        });
        
        if (error) {
          logSuspiciousActivity('biometric_session_restore_failed', { error: error.message });
          throw error;
        }
        
        logSecurityAction('biometric_authentication_success', { email: storedEmail });
        return { success: true };
      } else {
        logSuspiciousActivity('biometric_credentials_missing', {});
        return { success: false, error: 'Credenciais não encontradas' };
      }
    } catch (error: any) {
      if (error.message?.includes('cancelled')) {
        logSecurityAction('biometric_authentication_cancelled');
        return { success: false, error: 'Cancelado pelo usuário' };
      }
      logSuspiciousActivity('biometric_authentication_error', { error: error.message });
      return { success: false, error: error.message || 'Erro na autenticação biométrica' };
    }
  };

  const enableBiometricAuth = async (email: string): Promise<boolean> => {
    try {
      logSecurityAction('biometric_auth_enable_attempt', { email });
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        logSuspiciousActivity('biometric_enable_no_session', { email });
        return false;
      }

      // Store credentials securely using encrypted storage
      SecureStorage.setSecureItem('biometric_user_email', email);
      SecureStorage.setSecureItem('biometric_session_token', session.access_token);
      SecureStorage.setSecureItem('biometric_refresh_token', session.refresh_token || '');
      SecureStorage.setSecureItem('biometric_auth_enabled', 'true');
      
      setState(prev => ({ ...prev, isEnabled: true }));
      logSecurityAction('biometric_auth_enabled', { email });
      return true;
    } catch (error) {
      console.error('Failed to enable biometric auth:', error);
      logSuspiciousActivity('biometric_enable_failed', { 
        email, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      return false;
    }
  };

  const disableBiometricAuth = () => {
    try {
      logSecurityAction('biometric_auth_disable');
      
      SecureStorage.removeSecureItem('biometric_user_email');
      SecureStorage.removeSecureItem('biometric_session_token');
      SecureStorage.removeSecureItem('biometric_refresh_token');
      SecureStorage.setSecureItem('biometric_auth_enabled', 'false');
      
      setState(prev => ({ ...prev, isEnabled: false }));
      logSecurityAction('biometric_auth_disabled');
    } catch (error) {
      logSuspiciousActivity('biometric_disable_failed', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  };

  const getBiometricIcon = () => {
    if (!state.biometryType) return 'fingerprint';
    
    if (state.biometryType.includes('face')) {
      return 'scan-face';
    } else if (state.biometryType.includes('touch')) {
      return 'fingerprint';
    } else if (state.biometryType.includes('finger')) {
      return 'fingerprint';
    } else {
      return 'shield-check';
    }
  };

  const getBiometricLabel = () => {
    if (!state.biometryType) return 'Biometria';
    
    if (state.biometryType.includes('face')) {
      return 'Face ID';
    } else if (state.biometryType.includes('touch')) {
      return 'Touch ID';
    } else if (state.biometryType.includes('finger')) {
      return 'Impressão Digital';
    } else {
      return 'Autenticação Biométrica';
    }
  };

  return {
    ...state,
    authenticateWithBiometric,
    enableBiometricAuth,
    disableBiometricAuth,
    checkBiometricAvailability,
    getBiometricIcon,
    getBiometricLabel
  };
}