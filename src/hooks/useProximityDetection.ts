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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, nickname')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      await supabase
        .from('user_locations')
        .upsert({
          user_id: profile.id,
          nickname: profile.nickname,
          latitude: lat,
          longitude: lng,
          is_visible: isVisible,
          updated_at: new Date().toISOString()
        });

    } catch (error) {
      console.error('Erro ao atualizar localização:', error);
    }
  };

  const findNearbyPlayers = async (userLat: number, userLng: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

      const { data: locations } = await supabase
        .from('user_locations')
        .select('*')
        .eq('is_visible', true)
        .neq('user_id', profile.id)
        .gte('updated_at', fiveMinutesAgo);

      if (!locations) return;

      const nearby = locations
        .map(location => ({
          ...location,
          distance: calculateDistance(userLat, userLng, location.latitude, location.longitude)
        }))
        .filter(player => player.distance <= 500)
        .sort((a, b) => a.distance - b.distance);

      setNearbyPlayers(nearby);
      return nearby;

    } catch (error) {
      console.error('Erro ao buscar jogadores próximos:', error);
      return [];
    }
  };

  const cleanOldNotifications = async () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    await supabase
      .from('proximity_notifications')
      .delete()
      .lt('notified_at', twoHoursAgo);
  };

  const wasPlayerNotified = async (opponentId: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return true;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return true;

      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

      const { data } = await supabase
        .from('proximity_notifications')
        .select('id')
        .eq('challenger_id', profile.id)
        .eq('opponent_id', opponentId)
        .gte('notified_at', twoHoursAgo)
        .single();

      return !!data;
    } catch {
      return false;
    }
  };

  const markPlayerAsNotified = async (opponentId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      await supabase
        .from('proximity_notifications')
        .upsert({
          challenger_id: profile.id,
          opponent_id: opponentId,
          notified_at: new Date().toISOString()
        });
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
