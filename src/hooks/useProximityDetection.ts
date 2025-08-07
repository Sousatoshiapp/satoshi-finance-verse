import { useState, useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { supabase } from '@/integrations/supabase/client';

interface NearbyPlayer {
  id: string;
  user_id: string;
  nickname: string;
  latitude: number;
  longitude: number;
  distance: number;
}

export const useProximityDetection = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [nearbyPlayers, setNearbyPlayers] = useState<NearbyPlayer[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000; // Raio da Terra em metros
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      if (Capacitor.isNativePlatform()) {
        const permissions = await Geolocation.requestPermissions();
        const granted = permissions.location === 'granted';
        setPermissionStatus(granted ? 'granted' : 'denied');
        return granted;
      } else {
        // Para web, sempre tentar obter permissão via getCurrentPosition
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            () => {
              setPermissionStatus('granted');
              resolve(true);
            },
            (error) => {
              console.log('Geolocation error:', error);
              setPermissionStatus('denied');
              resolve(false);
            },
            { 
              timeout: 10000,
              enableHighAccuracy: false, // Menos restritivo para primeira tentativa
              maximumAge: 60000
            }
          );
        });
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão de localização:', error);
      setPermissionStatus('denied');
      return false;
    }
  };

  const getCurrentLocation = async (): Promise<{lat: number, lng: number}> => {
    try {
      if (Capacitor.isNativePlatform()) {
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000
        });
        return {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
      } else {
        return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                lat: position.coords.latitude,
                lng: position.coords.longitude
              });
            },
            (error) => reject(error),
            { 
              enableHighAccuracy: true, 
              timeout: 15000, 
              maximumAge: 10000 
            }
          );
        });
      }
    } catch (error) {
      console.error('Erro ao obter localização:', error);
      throw error;
    }
  };

  const updateLocationInDatabase = async (lat: number, lng: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      // For now, just log the location update since we don't have user_locations table
      console.log(`Location updated for user ${profile.id}: ${lat}, ${lng}`);
    } catch (error) {
      console.error('Erro ao atualizar localização:', error);
    }
  };

  const findNearbyPlayers = async (userLat: number, userLng: number) => {
    try {
      // Simulate finding a nearby player for testing
      const mockPlayers: NearbyPlayer[] = [
        {
          id: 'mock-1',
          user_id: 'mock-user-1',
          nickname: 'Warren Buffet',
          latitude: userLat + 0.001,
          longitude: userLng + 0.001,
          distance: 150
        },
        {
          id: 'mock-2', 
          user_id: 'mock-user-2',
          nickname: 'Elon Musk',
          latitude: userLat + 0.002,
          longitude: userLng + 0.002,
          distance: 300
        }
      ];
      
      // Only return players if the user is visible and detection is enabled
      if (isVisible && isLocationEnabled) {
        setNearbyPlayers(mockPlayers);
        return mockPlayers;
      } else {
        setNearbyPlayers([]);
        return [];
      }
    } catch (error) {
      console.error('Erro ao buscar jogadores próximos:', error);
      return [];
    }
  };

  const cleanOldNotifications = async () => {
    // Temporarily disabled - requires proximity_notifications table
    console.log('Clean notifications: proximity_notifications table not available');
  };

  const wasPlayerNotified = async (opponentId: string): Promise<boolean> => {
    try {
      // Simple localStorage check for demo
      const notifiedPlayers = JSON.parse(localStorage.getItem('notifiedPlayers') || '{}');
      const lastNotified = notifiedPlayers[opponentId];
      
      if (!lastNotified) return false;
      
      // Check if 2 hours have passed since last notification
      const twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000);
      return new Date(lastNotified).getTime() > twoHoursAgo;
    } catch {
      return false;
    }
  };

  const markPlayerAsNotified = async (opponentId: string) => {
    try {
      // Simple localStorage storage for demo
      const notifiedPlayers = JSON.parse(localStorage.getItem('notifiedPlayers') || '{}');
      notifiedPlayers[opponentId] = new Date().toISOString();
      localStorage.setItem('notifiedPlayers', JSON.stringify(notifiedPlayers));
    } catch (error) {
      console.error('Erro ao marcar notificação:', error);
    }
  };

  const detectNearbyPlayers = async () => {
    console.log('🔧 detectNearbyPlayers called, isLocationEnabled:', isLocationEnabled, 'isVisible:', isVisible);
    
    if (!isLocationEnabled || !isVisible) {
      console.log('🔧 Detection not enabled or not visible, returning');
      return;
    }

    try {
      console.log('🔧 Getting current location...');
      const location = await getCurrentLocation();
      console.log('🔧 Location obtained:', location);
      setCurrentLocation(location);
        
      await updateLocationInDatabase(location.lat, location.lng);
      
      console.log('🔧 Finding nearby players...');
      const nearby = await findNearbyPlayers(location.lat, location.lng);
      console.log('🔧 Found players:', nearby);
        
      await cleanOldNotifications();

    } catch (error) {
      console.error('🔧 Erro na detecção de proximidade:', error);
    }
  };

  const startProximityDetection = async () => {
    console.log('🔧 startProximityDetection called');
    
    // Primeiro, mostrar feedback visual imediato
    setIsLocationEnabled(true);
    
    const hasPermission = await requestLocationPermission();
    console.log('🔧 Permission result:', hasPermission);
    
    if (!hasPermission) {
      console.log('🔧 No permission, reverting state');
      setIsLocationEnabled(false);
      return;
    }

    console.log('🔧 Starting first detection...');
    await detectNearbyPlayers();
      
    console.log('🔧 Setting up interval');
    intervalRef.current = setInterval(detectNearbyPlayers, 30000);
  };

  const stopProximityDetection = () => {
    console.log('🔧 stopProximityDetection called');
    setIsLocationEnabled(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const toggleVisibility = async (visible: boolean) => {
    setIsVisible(visible);
    if (currentLocation) {
      await updateLocationInDatabase(currentLocation.lat, currentLocation.lng);
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isVisible,
    nearbyPlayers,
    currentLocation,
    isLocationEnabled,
    permissionStatus,
    startProximityDetection,
    stopProximityDetection,
    toggleVisibility,
    wasPlayerNotified,
    markPlayerAsNotified
  };
};
