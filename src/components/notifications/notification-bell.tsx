import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useSocialNotifications } from "@/hooks/use-social-notifications";
import { 
  Bell, 
  BellOff, 
  Heart, 
  MessageCircle, 
  UserPlus, 
  Trophy, 
  Award,
  Settings,
  Check,
  X,
  MoreHorizontal
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const notificationIcons = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
  message: MessageCircle,
  challenge: Trophy,
  badge: Award,
  system: Settings,
  mention: MessageCircle
};

const notificationColors = {
  like: "text-red-500",
  comment: "text-blue-500",
  follow: "text-green-500",
  message: "text-purple-500",
  challenge: "text-orange-500",
  badge: "text-yellow-500",
  system: "text-gray-500",
  mention: "text-cyan-500"
};

export function NotificationBell() {
  const { 
    notifications, 
    unreadCounts, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useSocialNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleNotificationClick = (notification: any) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    if (notification.action_url) {
      navigate(notification.action_url);
      setIsOpen(false);
    }
  };

  const recentNotifications = notifications.slice(0, 5);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          {unreadCounts.total > 0 ? (
            <Bell className="h-5 w-5" />
          ) : (
            <BellOff className="h-5 w-5" />
          )}
          {unreadCounts.total > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCounts.total > 99 ? '99+' : unreadCounts.total}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notificações</CardTitle>
              {unreadCounts.total > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Marcar todas como lidas
                </Button>
              )}
            </div>
            
            {/* Unread Counts Summary */}
            {(unreadCounts.messages > 0 || unreadCounts.social > 0 || unreadCounts.system > 0) && (
              <div className="flex gap-2 text-xs">
                {unreadCounts.messages > 0 && (
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                    {unreadCounts.messages} mensagens
                  </Badge>
                )}
                {unreadCounts.social > 0 && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    {unreadCounts.social} sociais
                  </Badge>
                )}
                {unreadCounts.system > 0 && (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                    {unreadCounts.system} sistema
                  </Badge>
                )}
              </div>
            )}
          </CardHeader>
          
          <Separator />
          
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              {loading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="h-8 w-8 bg-muted rounded-full" />
                      <div className="flex-1">
                        <div className="h-3 bg-muted rounded w-full mb-1" />
                        <div className="h-2 bg-muted rounded w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <BellOff className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <h3 className="font-semibold mb-2">Nenhuma notificação</h3>
                  <p className="text-sm text-muted-foreground">
                    Suas notificações aparecerão aqui
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {recentNotifications.map((notification) => {
                    const IconComponent = notificationIcons[notification.type as keyof typeof notificationIcons] || Bell;
                    const iconColor = notificationColors[notification.type as keyof typeof notificationColors] || "text-gray-500";
                    
                    return (
                      <div
                        key={notification.id}
                        className={cn(
                          "p-3 hover:bg-muted/50 cursor-pointer transition-colors relative group",
                          !notification.is_read && "bg-primary/5 border-l-4 border-l-primary"
                        )}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "p-1.5 rounded-full bg-muted flex-shrink-0",
                            !notification.is_read && "bg-primary/10"
                          )}>
                            <IconComponent className={cn("h-4 w-4", iconColor)} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className={cn(
                              "text-sm leading-tight mb-1",
                              !notification.is_read && "font-semibold"
                            )}>
                              {notification.title}
                            </h4>
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(notification.created_at), {
                                addSuffix: true,
                                locale: ptBR
                              })}
                            </p>
                          </div>

                          {/* Unread indicator */}
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                          )}

                          {/* Action buttons */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            {!notification.is_read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {notifications.length > 5 && (
                    <div className="p-3 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigate('/notifications');
                          setIsOpen(false);
                        }}
                        className="text-xs"
                      >
                        Ver todas as notificações
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}