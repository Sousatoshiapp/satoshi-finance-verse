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
        if ('geolocation' in navigator) {
          try {
            const permission = await navigator.permissions.query({name: 'geolocation'});
            setPermissionStatus(permission.state as 'prompt' | 'granted' | 'denied');
            return permission.state === 'granted';
          } catch {
            return new Promise((resolve) => {
              navigator.geolocation.getCurrentPosition(
                () => {
                  setPermissionStatus('granted');
                  resolve(true);
                },
                () => {
                  setPermissionStatus('denied');
                  resolve(false);
                },
                { timeout: 5000 }
              );
            });
          }
        }
        return false;
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
      // Temporarily disabled - requires user_locations table
      console.log('Location update: user_locations table not available');
    } catch (error) {
      console.error('Erro ao atualizar localização:', error);
    }
  };

  const findNearbyPlayers = async (userLat: number, userLng: number) => {
    try {
      // Temporarily disabled - requires user_locations table
      console.log('Find nearby players: user_locations table not available');
      setNearbyPlayers([]);
      return [];
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
      // Temporarily disabled - requires proximity_notifications table
      console.log('Check notification: proximity_notifications table not available');
      return false;
    } catch {
      return false;
    }
  };

  const markPlayerAsNotified = async (opponentId: string) => {
    try {
      // Temporarily disabled - requires proximity_notifications table
      console.log('Mark notified: proximity_notifications table not available');
    } catch (error) {
      console.error('Erro ao marcar notificação:', error);
    }
  };

  const detectNearbyPlayers = async () => {
    if (!isLocationEnabled || !isVisible) return;

    try {
      const location = await getCurrentLocation();
      setCurrentLocation(location);
        
      await updateLocationInDatabase(location.lat, location.lng);
      const nearby = await findNearbyPlayers(location.lat, location.lng);
        
      await cleanOldNotifications();

    } catch (error) {
      console.error('Erro na detecção de proximidade:', error);
    }
  };

  const startProximityDetection = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return;

    setIsLocationEnabled(true);
      
    await detectNearbyPlayers();
      
    intervalRef.current = setInterval(detectNearbyPlayers, 30000);
  };

  const stopProximityDetection = () => {
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
