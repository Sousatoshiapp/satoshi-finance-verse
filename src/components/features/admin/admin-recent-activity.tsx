import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Activity, User, Trophy, MessageSquare, DollarSign } from "lucide-react";

interface ActivityItem {
  id: string;
  activity_type: string;
  created_at: string;
  activity_data: any;
  user_nickname?: string;
}

export function AdminRecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentActivity();
  }, []);

  const loadRecentActivity = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_feed')
        .select(`
          id,
          activity_type,
          created_at,
          activity_data,
          user_id,
          profiles!inner(nickname)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const formattedActivities = data?.map(item => ({
        ...item,
        user_nickname: (item as any).profiles?.nickname || 'Usuário'
      })) || [];

      setActivities(formattedActivities);
    } catch (error) {
      console.error('Error loading recent activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'xp_earned':
        return Trophy;
      case 'quiz_completed':
        return Trophy;
      case 'social_post':
        return MessageSquare;
      case 'subscription':
        return DollarSign;
      default:
        return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'xp_earned':
        return 'text-experience';
      case 'quiz_completed':
        return 'text-success';
      case 'social_post':
        return 'text-accent';
      case 'subscription':
        return 'text-beetz';
      default:
        return 'text-muted-foreground';
    }
  };

  const getActivityDescription = (activity: ActivityItem) => {
    const { activity_type, activity_data, user_nickname } = activity;
    
    switch (activity_type) {
      case 'xp_earned':
        return `${user_nickname} ganhou ${activity_data?.xp_amount || 0} XP`;
      case 'quiz_completed':
        return `${user_nickname} completou um quiz`;
      case 'social_post':
        return `${user_nickname} fez uma nova postagem`;
      case 'subscription':
        return `${user_nickname} assinou plano premium`;
      default:
        return `${user_nickname} realizou uma atividade`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Atividade Recente
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 bg-muted rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-auto">
            {activities.map((activity) => {
              const Icon = getActivityIcon(activity.activity_type);
              return (
                <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/5 transition-colors">
                  <div className={`p-2 rounded-lg bg-accent/10 ${getActivityColor(activity.activity_type)}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {getActivityDescription(activity)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.created_at), { 
                        addSuffix: true,
                        locale: ptBR 
                      })}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {activity.activity_type}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
