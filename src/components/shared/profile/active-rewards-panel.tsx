import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Badge } from '@/components/shared/ui/badge';
import { Button } from '@/components/shared/ui/button';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Gift, Clock, Shield, Zap, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/hooks/use-i18n';

interface ActiveReward {
  id: string;
  name: string;
  description: string;
  category: string;
  expires_at: string;
}

interface ActiveRewardsPanelProps {
  userId: string;
  showHistory?: boolean;
}

export function ActiveRewardsPanel({ userId, showHistory = false }: ActiveRewardsPanelProps) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [activePowerups, setActivePowerups] = useState<ActiveReward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivePowerups();
  }, [userId]);

  const loadActivePowerups = async () => {
    try {
      setLoading(true);
      const mockPowerups: ActiveReward[] = [
        {
          id: '1',
          name: 'Proteção de Streak',
          description: 'Protege seu streak por 24h',
          category: 'streak_protection',
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          name: 'Boost XP 2x',
          description: 'Dobra o XP ganho por 1 hora',
          category: 'xp_boost',
          expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString()
        }
      ];
      setActivePowerups(mockPowerups);
    } catch (error) {
      console.error('Error loading active powerups:', error);
      setActivePowerups([]);
    } finally {
      setLoading(false);
    }
  };

  const getRewardIcon = (category: string) => {
    switch (category) {
      case 'streak_protection': return <Shield className="w-4 h-4" />;
      case 'xp_boost': return <Zap className="w-4 h-4" />;
      case 'btz_multiplier': return <Gift className="w-4 h-4" />;
      default: return <Gift className="w-4 h-4" />;
    }
  };

  const getRewardColor = (category: string) => {
    switch (category) {
      case 'streak_protection': return 'text-blue-500';
      case 'xp_boost': return 'text-green-500';
      case 'btz_multiplier': return 'text-purple-500';
      default: return 'text-gray-500';
    }
  };

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return t('profile.rewards.inactive');
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            {t('profile.gamification.activeRewards')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-24 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            {t('profile.gamification.activeRewards')}
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/powerups')}
            className="text-primary hover:text-primary/80"
          >
            Ver Todos <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {activePowerups.length === 0 ? (
          <div className="text-center py-6">
            <Gift className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground mb-2">
              Nenhuma recompensa ativa
            </p>
            <Button variant="outline" size="sm" onClick={() => navigate('/powerups')}>
              Explorar Power-ups
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {activePowerups.slice(0, 3).map((powerup) => (
              <div key={powerup.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className={`${getRewardColor(powerup.category)}`}>
                  {getRewardIcon(powerup.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">
                    {powerup.name}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {powerup.description}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="mb-1">
                    {t('profile.rewards.active')}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {formatTimeRemaining(powerup.expires_at)}
                  </div>
                </div>
              </div>
            ))}
            
            {activePowerups.length > 3 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full"
                onClick={() => navigate('/powerups')}
              >
                Ver mais {activePowerups.length - 3} recompensas
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
