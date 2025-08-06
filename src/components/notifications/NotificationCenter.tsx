import { useState, useEffect } from "react";
import { Button } from "@/components/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { Switch } from "@/components/shared/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Bell, 
  BellOff, 
  Settings, 
  Trophy, 
  BookOpen, 
  Target,
  Clock,
  MessageSquare,
  Coins
} from "lucide-react";

interface NotificationSetting {
  id: string;
  type: string;
  title: string;
  description: string;
  enabled: boolean;
  icon: React.ReactNode;
}

interface PushNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  created_at: string;
  is_read: boolean;
  action_url?: string;
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'study_reminders',
      type: 'study_reminders',
      title: 'Lembretes de Estudo',
      description: 'Receba lembretes para manter sua rotina de estudos',
      enabled: true,
      icon: <BookOpen className="h-4 w-4" />
    },
    {
      id: 'achievements',
      type: 'achievements',
      title: 'Conquistas',
      description: 'Notificações quando ganhar novos badges e troféus',
      enabled: true,
      icon: <Trophy className="h-4 w-4" />
    },
    {
      id: 'daily_missions',
      type: 'daily_missions',
      title: 'Missões Diárias',
      description: 'Lembretes sobre missões diárias disponíveis',
      enabled: true,
      icon: <Target className="h-4 w-4" />
    },
    {
      id: 'streak_warnings',
      type: 'streak_warnings',
      title: 'Avisos de Sequência',
      description: 'Alertas quando sua sequência estiver em risco',
      enabled: true,
      icon: <Clock className="h-4 w-4" />
    },
    {
      id: 'p2p_transfers',
      type: 'p2p_transfers',
      title: 'Transferências P2P',
      description: 'Notificações quando receber BTZ de outros usuários',
      enabled: true,
      icon: <Coins className="h-4 w-4" />
    },
    {
      id: 'social_updates',
      type: 'social_updates',
      title: 'Atualizações Sociais',
      description: 'Notificações de duelos, mensagens e atividades de amigos',
      enabled: false,
      icon: <MessageSquare className="h-4 w-4" />
    }
  ]);
  const [loading, setLoading] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const { toast } = useToast();

  useEffect(() => {
    loadNotifications();
    loadNotificationSettings();
    checkNotificationPermission();
  }, []);

  const checkNotificationPermission = () => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      try {
        const permission = await Notification.requestPermission();
        setPermissionStatus(permission);
        
        if (permission === 'granted') {
          toast({
            title: "✅ Notificações Ativadas",
            description: "Você receberá notificações importantes sobre seu progresso",
          });
          
          // Register service worker for push notifications
          await registerServiceWorker();
        } else {
          toast({
            title: "❌ Permissão Negada",
            description: "Ative as notificações nas configurações do navegador para receber alertas",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error requesting notification permission:', error);
      }
    }
  };

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      
      // Get push subscription
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.VAPID_PUBLIC_KEY || '')
      });

      // Save subscription to database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          try {
            await supabase
              .from('push_notification_settings')
              .upsert({
                user_id: profile.id,
                endpoint: subscription.endpoint,
                p256dh_key: subscription.getKey('p256dh') ? 
                  btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))) : null,
                auth_key: subscription.getKey('auth') ? 
                  btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))) : null,
                enabled: true,
                user_agent: navigator.userAgent
              });
          } catch (dbError) {
            console.warn('Failed to save push subscription to database:', dbError);
          }
        }
      }
    } catch (error) {
      console.error('Error registering service worker:', error);
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return new Uint8Array([...rawData].map(char => char.charCodeAt(0)));
  };

  const loadNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotificationSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const { data, error } = await supabase
        .from('push_notification_settings')
        .select('*')
        .eq('user_id', profile.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('No push notification settings found for user');
        } else {
          console.warn('Failed to load push notification settings:', error.message, error.code);
        }
        return;
      }

      // Update settings based on database preferences
      if (data) {
        // Here you could load more granular settings from a settings table
        console.log('Loaded notification settings:', data);
      }
    } catch (error) {
      console.warn('Error loading notification settings:', error);
    }
  };

  const updateNotificationSetting = async (settingId: string, enabled: boolean) => {
    try {
      setSettings(prev => 
        prev.map(setting => 
          setting.id === settingId ? { ...setting, enabled } : setting
        )
      );

      // Update in database
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      // Here you could update a more detailed notification preferences table
      toast({
        title: enabled ? "✅ Notificação Ativada" : "❌ Notificação Desativada",
        description: `${settings.find(s => s.id === settingId)?.title} ${enabled ? 'ativada' : 'desativada'}`,
      });
    } catch (error) {
      console.error('Error updating notification setting:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
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
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', profile.id)
        .eq('is_read', false);

      setNotifications(prev =>
        prev.map(notification => ({ ...notification, is_read: true }))
      );

      toast({
        title: "✅ Todas as notificações marcadas como lidas",
        description: "Sua central de notificações foi limpa",
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'achievement': return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 'study_reminder': return <BookOpen className="h-4 w-4 text-blue-500" />;
      case 'mission': return <Target className="h-4 w-4 text-green-500" />;
      case 'streak_warning': return <Clock className="h-4 w-4 text-red-500" />;
      case 'social': return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case 'p2p_received': return <Coins className="h-4 w-4 text-green-600" />;
      default: return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const sendTestNotification = () => {
    if (permissionStatus === 'granted') {
      new Notification('🎯 BeetzQuiz', {
        body: 'Esta é uma notificação de teste! Seu sistema está funcionando perfeitamente.',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'test-notification'
      });
      
      toast({
        title: "🔔 Notificação de Teste Enviada",
        description: "Verifique se a notificação apareceu na sua área de trabalho",
      });
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Central de Notificações
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </h2>
          <p className="text-muted-foreground">
            Configure suas preferências e veja suas notificações recentes
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline">
            Marcar Todas como Lidas
          </Button>
        )}
      </div>

      {/* Permission Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Status das Notificações Push
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Permissão do Navegador</h4>
              <p className="text-sm text-muted-foreground">
                {permissionStatus === 'granted' && 'Notificações ativadas e funcionando'}
                {permissionStatus === 'denied' && 'Notificações bloqueadas pelo navegador'}
                {permissionStatus === 'default' && 'Permissão ainda não solicitada'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {permissionStatus === 'granted' ? (
                <Badge variant="default" className="bg-green-500">
                  <Bell className="h-3 w-3 mr-1" />
                  Ativo
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <BellOff className="h-3 w-3 mr-1" />
                  Inativo
                </Badge>
              )}
              {permissionStatus !== 'granted' && (
                <Button onClick={requestNotificationPermission} size="sm">
                  Ativar Notificações
                </Button>
              )}
              {permissionStatus === 'granted' && (
                <Button onClick={sendTestNotification} size="sm" variant="outline">
                  Teste
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Preferências de Notificação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings.map((setting) => (
            <div key={setting.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  {setting.icon}
                </div>
                <div>
                  <h4 className="font-medium">{setting.title}</h4>
                  <p className="text-sm text-muted-foreground">{setting.description}</p>
                </div>
              </div>
              <Switch
                checked={setting.enabled}
                onCheckedChange={(enabled) => updateNotificationSetting(setting.id, enabled)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notificações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    !notification.is_read 
                      ? 'bg-primary/5 border-primary/20' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => !notification.is_read && markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{notification.title}</h4>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-primary rounded-full" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma notificação ainda</p>
              <p className="text-sm text-muted-foreground">
                Suas notificações aparecerão aqui quando disponíveis
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
