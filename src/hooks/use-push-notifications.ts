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
  
  // Detectar plataforma para orientações específicas
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

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

      const { data: settings, error } = await supabase
        .from('push_notification_settings')
        .select('enabled, endpoint')
        .eq('user_id', profile.id)
        .single();

      if (error) {
        console.warn('Push notification settings not available:', error.message, error.code);
        setIsSubscribed(false);
        return;
      }

      setIsSubscribed(settings?.enabled && !!settings?.endpoint);
    } catch (error) {
      console.warn('Error loading subscription status:', error);
      setIsSubscribed(false);
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
      // Verificar se permissão já foi negada permanentemente
      if (permission === 'denied') {
        toast({
          title: "Permissão bloqueada",
          description: "Notificações foram bloqueadas. Vá em Configurações > Site > Notificações para reativar.",
          variant: "destructive"
        });
        return false;
      }

      const newPermission = await Notification.requestPermission();
      setPermission(newPermission);
      
      if (newPermission === 'granted') {
        toast({
          title: "Permissão concedida",
          description: "Notificações ativadas com sucesso!"
        });
        return true;
      } else if (newPermission === 'denied') {
        toast({
          title: "Permissão negada",
          description: "Para ativar notificações: Configurações do navegador > Site > Notificações > Permitir",
          variant: "destructive"
        });
        return false;
      } else {
        toast({
          title: "Permissão pendente",
          description: "Clique no ícone de notificação na barra de endereços para permitir",
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
    // Verificar se VAPID key está configurada
    const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || 'BP7t8LC0ZOH-NrYQQ6L9t9D2lJ2qQa5G9X4j6F5qR0t5lO-JzY8FtDvKO8Q8dN4NqL5sO9rV3W0J8Q2pR5xF2Ks';
    
    if (vapidKey === 'your-vapid-public-key-here') {
      // Para desenvolvimento, usar chave simulada
      console.warn('Using placeholder VAPID key for development');
    }

    if (!isSupported) {
      toast({
        title: "Não suportado",
        description: "Seu dispositivo não suporta notificações push",
        variant: "destructive"
      });
      return false;
    }

    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return false;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive"
        });
        return false;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        toast({
          title: "Erro",
          description: "Perfil do usuário não encontrado",
          variant: "destructive"
        });
        return false;
      }

      // Verificar se service worker está disponível
      if (!('serviceWorker' in navigator)) {
        toast({
          title: "Não suportado",
          description: "Service Worker não suportado neste navegador",
          variant: "destructive"
        });
        return false;
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      await registration.update(); // Força atualização
      
      // Aguardar service worker estar ativo
      if (registration.installing) {
        await new Promise((resolve) => {
          registration.installing!.addEventListener('statechange', () => {
            if (registration.installing!.state === 'activated') {
              resolve(undefined);
            }
          });
        });
      }

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey)
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

      if (error) {
        console.warn('Failed to save push notification settings:', error.message, error.code);
        toast({
          title: "Aviso",
          description: "Notificações ativadas, mas configurações não foram salvas",
          variant: "destructive"
        });
      }

      setIsSubscribed(true);
      toast({
        title: "Sucesso",
        description: "Notificações push ativadas!"
      });
      return true;
    } catch (error: any) {
      console.error('Error subscribing to push notifications:', error);
      
      let errorMessage = "Não foi possível ativar as notificações push";
      
      if (error.name === 'NotAllowedError') {
        errorMessage = "Permissão negada. Verifique as configurações do navegador.";
      } else if (error.name === 'NotSupportedError') {
        errorMessage = "Notificações push não suportadas neste dispositivo.";
      } else if (error.message?.includes('VAPID')) {
        errorMessage = "Erro de configuração do servidor. Contacte o suporte.";
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
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

      if (error) {
        console.warn('Failed to update push notification settings:', error.message, error.code);
      }

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

  // Função para obter orientações específicas da plataforma
  const getPlatformGuidance = () => {
    if (isMobile) {
      if (isIOS) {
        return "Configurações > Safari > Notificações > Permitir";
      } else if (isAndroid) {
        return "Configurações > Apps > Navegador > Notificações > Permitir";
      } else {
        return "Configurações do dispositivo > Notificações > Permitir para este site";
      }
    } else {
      // Desktop
      return "Clique no ícone na barra de endereços > Permitir notificações";
    }
  };

  return {
    isSupported,
    permission,
    isSubscribed,
    requestPermission,
    subscribe,
    unsubscribe,
    sendLocalNotification,
    getPlatformGuidance
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
