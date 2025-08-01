import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { Trophy, Star, Flame, Target, Crown, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface UserBadge {
  id: string;
  badge_name: string;
  badge_type: string;
  badge_description: string;
  earned_at: string;
  metadata?: any;
}

interface BadgeShowcaseProps {
  userId?: string;
  limit?: number;
  className?: string;
  showTitle?: boolean;
}

const badgeIcons = {
  level: Crown,
  streak: Flame,
  quiz: Trophy,
  social: Star,
  achievement: Award,
  default: Target
};

const badgeColors = {
  level: "text-purple-500 bg-purple-100",
  streak: "text-orange-500 bg-orange-100", 
  quiz: "text-blue-500 bg-blue-100",
  social: "text-pink-500 bg-pink-100",
  achievement: "text-green-500 bg-green-100",
  default: "text-gray-500 bg-gray-100"
};

export function BadgeShowcase({ userId, limit = 6, className, showTitle = true }: BadgeShowcaseProps) {
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserBadges();
  }, [userId]);

  const loadUserBadges = async () => {
    try {
      let query = supabase
        .from('user_badges')
        .select('*')
        .order('earned_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      } else {
        // Get current user's badges
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('user_id', user.id)
            .single();
          
          if (profile) {
            query = query.eq('user_id', profile.id);
          }
        }
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setBadges(data || []);
    } catch (error) {
      console.error('Error loading badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeIcon = (type: string) => {
    return badgeIcons[type as keyof typeof badgeIcons] || badgeIcons.default;
  };

  const getBadgeColor = (type: string) => {
    return badgeColors[type as keyof typeof badgeColors] || badgeColors.default;
  };

  const formatBadgeName = (name: string) => {
    // Convert snake_case to readable format
    return name
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded mb-3 w-24" />
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-muted rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (badges.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          {showTitle && <h3 className="font-bold text-foreground mb-3">Conquistas</h3>}
          <div className="text-center py-4">
            <Trophy className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Complete desafios para ganhar suas primeiras conquistas!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        {showTitle && (
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-foreground">Conquistas</h3>
            <Badge variant="outline" className="text-xs">
              {badges.length}
            </Badge>
          </div>
        )}
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {badges.map((badge) => {
            const IconComponent = getBadgeIcon(badge.badge_type);
            const colorClass = getBadgeColor(badge.badge_type);
            
            return (
              <div
                key={badge.id}
                className="group relative bg-muted/50 rounded-lg p-3 hover:bg-muted transition-colors cursor-pointer"
                title={badge.badge_description}
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <div className={cn("p-2 rounded-full", colorClass)}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground leading-tight">
                      {formatBadgeName(badge.badge_name)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(badge.earned_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                  {badge.badge_description}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
