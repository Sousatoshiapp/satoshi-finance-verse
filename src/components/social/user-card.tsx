import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SocialButton } from "./social-button";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, MessageCircle } from "lucide-react";

interface UserCardProps {
  user: {
    id: string;
    nickname: string;
    profile_image_url?: string;
    level?: number;
    xp?: number;
    follower_count?: number;
    following_count?: number;
    avatar?: {
      id: string;
      name: string;
      image_url: string;
    };
  };
  showSocialStats?: boolean;
  compact?: boolean;
  onStartConversation?: (userId: string) => void;
  onClick?: (userId: string) => void;
}

export function UserCard({ user, showSocialStats = true, compact = false, onStartConversation, onClick }: UserCardProps) {
  if (compact) {
    return (
      <div 
        className="flex items-center gap-3 p-2 cursor-pointer hover:bg-muted/50 rounded-lg transition-colors"
        onClick={() => onClick?.(user.id)}
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.avatar?.image_url || user.profile_image_url} />
          <AvatarFallback>{user.nickname.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{user.nickname}</p>
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary" 
              className="text-xs bg-orange-500 text-white"
            >
              Nível {user.level || 1}
            </Badge>
            {user.avatar && (
              <span className="text-xs text-muted-foreground truncate">
                {user.avatar.name}
              </span>
            )}
          </div>
        </div>
        <SocialButton
          targetType="profile"
          targetId={user.id}
          targetUserId={user.id}
          actionType="follow"
          size="sm"
        />
      </div>
    );
  }

  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClick?.(user.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatar?.image_url || user.profile_image_url} />
            <AvatarFallback>{user.nickname.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">{user.nickname}</h3>
              <Badge 
                variant="secondary" 
                className="text-xs bg-orange-500 text-white"
              >
                Nível {user.level || 1}
              </Badge>
            </div>
            
            {user.avatar && (
              <p className="text-xs text-muted-foreground mb-2">
                {user.avatar.name}
              </p>
            )}
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {user.xp || 0} XP
              </div>
              
              {showSocialStats && (
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {user.follower_count || 0} seguidores
                </div>
              )}
            </div>
            
            <div 
              className="flex gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <SocialButton
                targetType="profile"
                targetId={user.id}
                targetUserId={user.id}
                actionType="follow"
                size="sm"
                variant="outline"
              />
              <SocialButton
                targetType="profile"
                targetId={user.id}
                targetUserId={user.id}
                actionType="like"
                size="sm"
                variant="ghost"
                showCount
              />
              {onStartConversation && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onStartConversation(user.id)}
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}