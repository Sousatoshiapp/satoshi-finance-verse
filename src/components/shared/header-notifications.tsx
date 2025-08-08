import React from 'react';
import { Button } from '@/components/shared/ui/button';
import { Badge } from '@/components/shared/ui/badge';
import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';

export function HeaderNotifications() {
  const navigate = useNavigate();
  const { unreadCount, loading } = useUnreadMessages();

  const handleMessagesClick = () => {
    navigate('/messages');
  };

  if (loading) return null;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleMessagesClick}
        className="h-9 w-9 relative"
      >
        <MessageCircle className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>
    </div>
  );
}