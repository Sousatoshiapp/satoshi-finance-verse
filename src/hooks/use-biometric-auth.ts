import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { usePlatformDetection } from './use-platform-detection';

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
    checkBiometricAvailability();
  }, [isNative]);

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
      
      // Check if biometric is enabled in user preferences
      const enabled = localStorage.getItem('biometric_auth_enabled') === 'true';
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

      // Get stored credentials
      const storedEmail = localStorage.getItem('biometric_user_email');
      const storedSession = localStorage.getItem('biometric_session_token');
      
      if (storedEmail && storedSession) {
        // Restore session
        const { data, error } = await supabase.auth.setSession({
          access_token: storedSession,
          refresh_token: localStorage.getItem('biometric_refresh_token') || ''
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

      // Store credentials securely
      localStorage.setItem('biometric_user_email', email);
      localStorage.setItem('biometric_session_token', session.access_token);
      localStorage.setItem('biometric_refresh_token', session.refresh_token || '');
      localStorage.setItem('biometric_auth_enabled', 'true');
      
      setState(prev => ({ ...prev, isEnabled: true }));
      return true;
    } catch (error) {
      console.error('Failed to enable biometric auth:', error);
      return false;
    }
  };

  const disableBiometricAuth = () => {
    localStorage.removeItem('biometric_user_email');
    localStorage.removeItem('biometric_session_token');
    localStorage.removeItem('biometric_refresh_token');
    localStorage.setItem('biometric_auth_enabled', 'false');
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