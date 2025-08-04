import { useState, useCallback, useRef, useEffect } from 'react';
// Mock Bluetooth implementation for web demonstration
// In production, you would use @capacitor/bluetooth-le
import { useProfile } from './use-profile';
import { useToast } from './use-toast';
import { useI18n } from './use-i18n';

// Service UUID for Satoshi Finance Verse BTZ transfers
const SATOSHI_SERVICE_UUID = '12345678-1234-1234-1234-123456789abc';
const USER_DATA_CHARACTERISTIC_UUID = '87654321-4321-4321-4321-cba987654321';

interface NearbyUser {
  id: string;
  nickname: string;
  avatar_url?: string;
  deviceId: string;
  rssi?: number;
}

interface BluetoothProximityOptions {
  onUserDetected: (user: NearbyUser) => void;
  onUserLost: (userId: string) => void;
}

export function useBluetoothProximityTransfer(options: BluetoothProximityOptions) {
  const [isScanning, setIsScanning] = useState(false);
  const [isAdvertising, setIsAdvertising] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  
  const { profile } = useProfile();
  const { toast } = useToast();
  const { t } = useI18n();
  const scanTimeoutRef = useRef<NodeJS.Timeout>();
  const detectedDevicesRef = useRef<Map<string, NearbyUser>>(new Map());

  const requestPermissions = async () => {
    try {
      // Mock implementation - in production would use BleClient.initialize()
      console.log('Requesting Bluetooth permissions...');
      return true;
    } catch (err) {
      console.error('Bluetooth permissions failed:', err);
      setError(t('bluetooth.permissionDenied'));
      return false;
    }
  };

  const startAdvertising = useCallback(async () => {
    if (!profile?.id) return;

    try {
      const userPayload = {
        id: profile.id,
        nickname: profile.nickname || 'Unknown',
        avatar_url: (profile as any).avatar_url || null,
        app_id: 'satoshi_finance_verse'
      };

      // Mock implementation - in production would use BleClient advertising
      setIsAdvertising(true);
      console.log('Started advertising with payload:', userPayload);
      
      // Simulate finding nearby users for demo
      setTimeout(() => {
        const mockUser: NearbyUser = {
          id: 'demo-user-123',
          nickname: 'Demo User',
          deviceId: 'mock-device-123',
          rssi: -45
        };
        options.onUserDetected(mockUser);
      }, 3000);
    } catch (err) {
      console.error('Failed to start advertising:', err);
      setError(t('bluetooth.advertisingFailed'));
    }
  }, [profile, t]);

  const startScanning = useCallback(async () => {
    if (!profile?.id) return;

    try {
      setIsScanning(true);
      setError(null);

      // Mock implementation - in production would use BleClient.requestLEScan
      console.log('Started scanning for devices...');

      // Stop scanning after 30 seconds
      scanTimeoutRef.current = setTimeout(() => {
        stopScanning();
      }, 30000);

    } catch (err) {
      console.error('Failed to start scanning:', err);
      setError(t('bluetooth.scanningFailed'));
      setIsScanning(false);
    }
  }, [profile, options, t]);

  const readUserDataFromDevice = async (deviceId: string) => {
    // Mock implementation - in production would use BleClient to read device data
    return {
      id: 'demo-user-123',
      nickname: 'Demo User',
      avatar_url: null,
      app_id: 'satoshi_finance_verse'
    };
  };

  const stopScanning = useCallback(async () => {
    try {
      // Mock implementation - in production would use BleClient.stopLEScan()
      setIsScanning(false);
      
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    } catch (err) {
      console.error('Failed to stop scanning:', err);
    }
  }, []);

  const stopAdvertising = useCallback(async () => {
    try {
      setIsAdvertising(false);
      console.log('Stopped advertising');
    } catch (err) {
      console.error('Failed to stop advertising:', err);
    }
  }, []);

  const startProximityDetection = useCallback(async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    await startAdvertising();
    await startScanning();
  }, [startAdvertising, startScanning]);

  const stopProximityDetection = useCallback(async () => {
    await stopScanning();
    await stopAdvertising();
    detectedDevicesRef.current.clear();
    setNearbyUsers([]);
  }, [stopScanning, stopAdvertising]);

  const sendTransferRequest = useCallback(async (deviceId: string, amount: number) => {
    try {
      const transferRequest = {
        type: 'transfer_request',
        from: profile?.id,
        amount: amount,
        timestamp: Date.now()
      };

      // Mock implementation - in production would use BleClient to send data
      console.log('Sending transfer request:', transferRequest);
      
      toast({
        title: t('bluetooth.transferRequestSent'),
        description: t('bluetooth.transferRequestSentDesc'),
      });
    } catch (err) {
      console.error('Failed to send transfer request:', err);
      setError(t('bluetooth.transferRequestFailed'));
    }
  }, [profile, toast, t]);

  // Update nearby users state when detected devices change
  useEffect(() => {
    const users = Array.from(detectedDevicesRef.current.values());
    setNearbyUsers(users);
  }, []);

  return {
    isScanning,
    isAdvertising,
    nearbyUsers,
    startProximityDetection,
    stopProximityDetection,
    sendTransferRequest,
    error
  };
}