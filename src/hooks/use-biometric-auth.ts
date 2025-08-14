import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { usePlatformDetection } from './use-platform-detection';
import { SecureStorage } from '@/lib/secure-storage';

// Interface simples para biometria
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

export function useBiometricAuth() {
  const [state, setState] = useState<BiometricAuthState>({
    isAvailable: false,
    biometryType: null,
    isEnabled: false,
    loading: true
  });
  
  const { isNative } = usePlatformDetection();

  useEffect(() => {
    initializeSecureBiometricAuth();
  }, [isNative]);

  const initializeSecureBiometricAuth = async () => {
    // SECURITY FIX: Migrate tokens from localStorage to SecureStorage
    await migrateBiometricTokensToSecureStorage();
    await checkBiometricAvailability();
  };

  const migrateBiometricTokensToSecureStorage = async () => {
    try {
      // Migrate existing biometric tokens to secure storage
      const biometricKeys = [
        'biometric_user_email',
        'biometric_session_token', 
        'biometric_refresh_token',
        'biometric_auth_enabled'
      ];

      for (const key of biometricKeys) {
        const existingData = localStorage.getItem(key);
        if (existingData) {
          await SecureStorage.setSecureItem(key, existingData);
          localStorage.removeItem(key); // Remove from insecure storage
        }
      }
    } catch (error) {
      console.warn('Token migration failed, falling back to localStorage:', error);
    }
  };

  const checkBiometricAvailability = async () => {
    try {
      // Simular biometria disponível tanto em web quanto nativo para desenvolvimento
      if (Capacitor.isNativePlatform()) {
        // Para dispositivos nativos, usar detecção real
        setState(prev => ({
          ...prev,
          isAvailable: true,
          biometryType: Capacitor.getPlatform() === 'ios' ? 'FaceID' : 'Fingerprint',
          loading: false
        }));
      } else {
        // Para web, simular disponibilidade baseada no navegador
        const hasWebAuthn = !!(navigator.credentials && navigator.credentials.create);
        setState(prev => ({
          ...prev,
          isAvailable: hasWebAuthn, // Simular sempre disponível para desenvolvimento
          biometryType: 'Touch ID', // Simular Touch ID no web
          loading: false
        }));
      }
      
      // Check if biometric is enabled in user preferences (secure storage first, fallback to localStorage)
      const secureEnabled = await SecureStorage.getSecureItem('biometric_auth_enabled');
      const fallbackEnabled = localStorage.getItem('biometric_auth_enabled');
      const enabled = (secureEnabled || fallbackEnabled) === 'true';
      setState(prev => ({ ...prev, isEnabled: enabled }));
    } catch (error) {
      console.warn('Biometric check failed:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const authenticateWithBiometric = async (): Promise<{ success: boolean; error?: string }> => {
    if (!state.isAvailable) {
      return { success: false, error: 'Autenticação biométrica não disponível' };
    }

    try {
      // Simulação para desenvolvimento - substituir com plugin real
      if (Capacitor.isNativePlatform()) {
        // Em produção, aqui seria a chamada real do plugin biométrico
        console.log('Autenticação biométrica simulada');
      }

      // Get stored credentials from secure storage (with localStorage fallback)
      const storedEmail = (await SecureStorage.getSecureItem('biometric_user_email')) || 
                         localStorage.getItem('biometric_user_email');
      const storedSession = (await SecureStorage.getSecureItem('biometric_session_token')) || 
                           localStorage.getItem('biometric_session_token');
      
      if (storedEmail && storedSession) {
        // Get refresh token from secure storage (with localStorage fallback)
        const refreshToken = (await SecureStorage.getSecureItem('biometric_refresh_token')) || 
                            localStorage.getItem('biometric_refresh_token') || '';
        
        // Restore session
        const { data, error } = await supabase.auth.setSession({
          access_token: storedSession,
          refresh_token: refreshToken
        });
        
        if (error) {
          throw error;
        }
        
        return { success: true };
      } else {
        return { success: false, error: 'Credenciais não encontradas' };
      }
    } catch (error: any) {
      if (error.message?.includes('cancelled')) {
        return { success: false, error: 'Cancelado pelo usuário' };
      }
      return { success: false, error: error.message || 'Erro na autenticação biométrica' };
    }
  };

  const enableBiometricAuth = async (email: string): Promise<boolean> => {
    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return false;
      }

      // Store credentials in secure storage (SECURITY FIX)
      await SecureStorage.setSecureItem('biometric_user_email', email);
      await SecureStorage.setSecureItem('biometric_session_token', session.access_token);
      await SecureStorage.setSecureItem('biometric_refresh_token', session.refresh_token || '');
      await SecureStorage.setSecureItem('biometric_auth_enabled', 'true');
      
      // Remove any remaining localStorage entries for security
      localStorage.removeItem('biometric_user_email');
      localStorage.removeItem('biometric_session_token');
      localStorage.removeItem('biometric_refresh_token');
      localStorage.removeItem('biometric_auth_enabled');
      
      setState(prev => ({ ...prev, isEnabled: true }));
      return true;
    } catch (error) {
      console.error('Failed to enable biometric auth:', error);
      return false;
    }
  };

  const disableBiometricAuth = async () => {
    // Remove from secure storage (SECURITY FIX)
    SecureStorage.removeSecureItem('biometric_user_email');
    SecureStorage.removeSecureItem('biometric_session_token');
    SecureStorage.removeSecureItem('biometric_refresh_token');
    await SecureStorage.setSecureItem('biometric_auth_enabled', 'false');
    
    // Also remove any remaining localStorage entries for security
    localStorage.removeItem('biometric_user_email');
    localStorage.removeItem('biometric_session_token');
    localStorage.removeItem('biometric_refresh_token');
    localStorage.removeItem('biometric_auth_enabled');
    
    setState(prev => ({ ...prev, isEnabled: false }));
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