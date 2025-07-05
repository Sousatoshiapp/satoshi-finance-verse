import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PushNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  tag?: string;
  requireInteraction?: boolean;
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkSupport();
    checkPermission();
    loadSubscriptionStatus();
  }, []);

  const checkSupport = () => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setIsSupported(supported);
  };

  const checkPermission = () => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  };

  const loadSubscriptionStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const { data: settings } = await supabase
        .from('push_notification_settings')
        .select('enabled, endpoint')
        .eq('user_id', profile.id)
        .single();

      setIsSubscribed(settings?.enabled && !!settings?.endpoint);
    } catch (error) {
      console.error('Error loading subscription status:', error);
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      toast({
        title: "Não suportado",
        description: "Seu navegador não suporta notificações push",
        variant: "destructive"
      });
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      
      if (permission === 'granted') {
        toast({
          title: "Permissão concedida",
          description: "Notificações ativadas com sucesso!"
        });
        return true;
      } else {
        toast({
          title: "Permissão negada",
          description: "Não foi possível ativar as notificações",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      toast({
        title: "Erro",
        description: "Erro ao solicitar permissão para notificações",
        variant: "destructive"
      });
      return false;
    }
  };

  const subscribe = async (): Promise<boolean> => {
    if (!isSupported || permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return false;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return false;

      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          // VAPID public key - you'll need to generate this
          'your-vapid-public-key-here'
        )
      });

      // Save subscription to database
      const { error } = await supabase
        .from('push_notification_settings')
        .upsert({
          user_id: profile.id,
          enabled: true,
          endpoint: subscription.endpoint,
          p256dh_key: arrayBufferToBase64(subscription.getKey('p256dh')),
          auth_key: arrayBufferToBase64(subscription.getKey('auth')),
          user_agent: navigator.userAgent
        });

      if (error) throw error;

      setIsSubscribed(true);
      toast({
        title: "Sucesso",
        description: "Notificações push ativadas!"
      });
      return true;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      toast({
        title: "Erro",
        description: "Não foi possível ativar as notificações push",
        variant: "destructive"
      });
      return false;
    }
  };

  const unsubscribe = async (): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return false;

      // Update database
      const { error } = await supabase
        .from('push_notification_settings')
        .update({
          enabled: false,
          endpoint: null,
          p256dh_key: null,
          auth_key: null
        })
        .eq('user_id', profile.id);

      if (error) throw error;

      setIsSubscribed(false);
      toast({
        title: "Sucesso",
        description: "Notificações push desativadas"
      });
      return true;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      toast({
        title: "Erro",
        description: "Erro ao desativar notificações push",
        variant: "destructive"
      });
      return false;
    }
  };

  const sendLocalNotification = (options: PushNotificationOptions) => {
    if (permission === 'granted') {
      new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/icon-192.png',
        badge: options.badge || '/badge.png',
        data: options.data,
        tag: options.tag,
        requireInteraction: options.requireInteraction
      });
    }
  };

  return {
    isSupported,
    permission,
    isSubscribed,
    requestPermission,
    subscribe,
    unsubscribe,
    sendLocalNotification
  };
}

// Helper functions
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
  if (!buffer) return '';
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach((b) => binary += String.fromCharCode(b));
  return window.btoa(binary);
}