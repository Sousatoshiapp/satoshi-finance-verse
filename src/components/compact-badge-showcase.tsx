import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { StreakIcon, TrophyIcon, CrownIcon, StarIcon } from "@/components/icons/game-icons";

interface UserBadge {
  id: string;
  badge_name: string;
  badge_type: string;
  badge_description: string;
  earned_at: string;
}

interface CompactBadgeShowcaseProps {
  className?: string;
}

export function CompactBadgeShowcase({ className }: CompactBadgeShowcaseProps) {
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadUserBadges();
  }, []);

  const loadUserBadges = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();
        
        if (profile) {
          const { data, error } = await supabase
            .from('user_badges')
            .select('*')
            .eq('user_id', profile.id)
            .order('earned_at', { ascending: false })
            .limit(3);
          
          if (error) throw error;
          setBadges(data || []);
        }
      }
    } catch (error) {
      console.error('Error loading badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeIcon = (type: string) => {
    switch (type) {
      case 'streak': return <StreakIcon size="xs" animated variant="glow" />;
      case 'level': return <CrownIcon size="xs" animated variant="glow" />;
      case 'quiz': return <TrophyIcon size="xs" animated variant="glow" />;
      case 'social': return <StarIcon size="xs" animated variant="glow" />;
      default: return <TrophyIcon size="xs" variant="default" />;
    }
  };

  if (loading) {
    return (
      <Card className={cn("bg-card/50", className)}>
        <CardContent className="p-3">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded mb-2 w-20" />
            <div className="flex gap-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-6 h-6 bg-muted rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={cn("bg-card/50 hover:bg-card transition-colors cursor-pointer", className)}
      onClick={() => navigate('/profile')}
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <div>
              <p className="text-sm font-medium text-foreground">Conquistas</p>
              <p className="text-xs text-muted-foreground">
                {badges.length === 0 ? "Nenhuma ainda" : `${badges.length} desbloqueadas`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {badges.length === 0 ? (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Plus className="h-3 w-3" />
                <span className="text-xs">Ganhe suas primeiras!</span>
              </div>
            ) : (
              <>
                {badges.slice(0, 3).map((badge) => (
                  <div
                    key={badge.id}
                    className="flex items-center justify-center w-6 h-6"
                    title={badge.badge_description}
                  >
                    {getBadgeIcon(badge.badge_type)}
                  </div>
                ))}
                {badges.length > 3 && (
                  <Badge variant="outline" className="text-xs ml-1">
                    +{badges.length - 3}
                  </Badge>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}