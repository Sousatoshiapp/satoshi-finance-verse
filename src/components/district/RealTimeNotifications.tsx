import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";
import { Bell, X, Swords, Users, Trophy, Zap, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  data: any;
  is_read: boolean;
  created_at: string;
  district_id: string;
}

interface RealTimeNotificationsProps {
  currentProfile: any;
  districtId: string;
}

export function RealTimeNotifications({ currentProfile, districtId }: RealTimeNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!currentProfile) return;

    loadNotifications();
    setupRealtimeSubscription();
  }, [currentProfile, districtId]);

  const loadNotifications = async () => {
    if (!currentProfile) return;

    try {
      const { data, error } = await supabase
        .from('district_notifications')
        .select('*')
        .or(`user_id.eq.${currentProfile.id},district_id.eq.${districtId}`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`district_notifications_${districtId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'district_notifications',
          filter: `district_id=eq.${districtId}`
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          
          // Add notification to list
          setNotifications(prev => [newNotification, ...prev.slice(0, 19)]);
          setUnreadCount(prev => prev + 1);

          // Show toast for important notifications
          if (newNotification.notification_type === 'battle_started') {
            toast({
              title: newNotification.title,
              description: newNotification.message,
            });
          }

          // Trigger visual effects based on notification type
          triggerNotificationEffect(newNotification.notification_type);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const triggerNotificationEffect = (type: string) => {
    // Add visual effects based on notification type
    const body = document.body;
    
    switch (type) {
      case 'battle_started':
        body.style.animation = 'battle-alert 0.5s ease-in-out';
        setTimeout(() => body.style.animation = '', 500);
        break;
      case 'power_change':
        body.style.animation = 'power-pulse 0.3s ease-in-out';
        setTimeout(() => body.style.animation = '', 300);
        break;
      case 'achievement':
        body.style.animation = 'achievement-glow 1s ease-in-out';
        setTimeout(() => body.style.animation = '', 1000);
        break;
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('district_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'battle_started': return <Swords className="w-4 h-4 text-red-400" />;
      case 'new_member': return <Users className="w-4 h-4 text-blue-400" />;
      case 'achievement': return <Trophy className="w-4 h-4 text-yellow-400" />;
      case 'power_change': return <Zap className="w-4 h-4 text-purple-400" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <>
      {/* Notification Bell */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="relative text-white hover:bg-slate-700"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs animate-pulse"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>

        {/* Notifications Panel */}
        {isOpen && (
          <Card className="absolute right-0 top-full mt-2 w-96 bg-slate-800/95 backdrop-blur-sm border-slate-600 z-50 max-h-96 overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-4 border-b border-slate-600">
                <h3 className="font-semibold text-white">Notificações</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-slate-700 transition-all duration-200 hover:bg-slate-700/50 ${
                        !notification.is_read ? 'bg-blue-500/10 border-l-4 border-l-blue-400' : ''
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="mt-1">
                          {getNotificationIcon(notification.notification_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-white truncate">
                            {notification.title}
                          </h4>
                          <p className="text-sm text-gray-300 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(notification.created_at).toLocaleString()}
                          </p>
                        </div>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-400">
                    <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma notificação</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add CSS animations to index.css instead */}
    </>
  );
}
