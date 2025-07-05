import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SocialButton } from "./social-button";
import { Users, TrendingUp } from "lucide-react";

interface UserCardProps {
  user: {
    id: string;
    nickname: string;
    profile_image_url?: string;
    level?: number;
    xp?: number;
    follower_count?: number;
    following_count?: number;
  };
  showSocialStats?: boolean;
  compact?: boolean;
}

export function UserCard({ user, showSocialStats = true, compact = false }: UserCardProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-3 p-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.profile_image_url} />
          <AvatarFallback>{user.nickname.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{user.nickname}</p>
          <p className="text-xs text-muted-foreground">Nível {user.level || 1}</p>
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
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.profile_image_url} />
            <AvatarFallback>{user.nickname.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">{user.nickname}</h3>
              <Badge variant="secondary" className="text-xs">
                Nível {user.level || 1}
              </Badge>
            </div>
            
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
            
            <div className="flex gap-2">
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
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}