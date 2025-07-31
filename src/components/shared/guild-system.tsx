import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  Shield, 
  Crown, 
  Trophy, 
  Plus,
  UserPlus,
  MessageCircle,
  Target,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface Guild {
  id: string;
  name: string;
  description: string;
  logo: string;
  level: number;
  member_count: number;
  max_members: number;
  total_xp: number;
  weekly_xp: number;
  rank: number;
  leader: {
    id: string;
    name: string;
    avatar: string;
  };
  requirements: {
    min_level: number;
    min_xp: number;
  };
  perks: string[];
  is_member?: boolean;
  user_role?: 'leader' | 'officer' | 'member';
}

export function GuildSystem() {
  const navigate = useNavigate();
  const [userGuild, setUserGuild] = useState<Guild | null>(null);
  const [recommendedGuilds, setRecommendedGuilds] = useState<Guild[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGuildData();
  }, []);

  const loadGuildData = async () => {
    try {
      // Mock guild data - in real app would come from database
      const mockGuilds: Guild[] = [
        {
          id: '1',
          name: 'Crypto Titans',
          description: 'Guild elite para traders experientes e hodlers de longo prazo',
          logo: '⚡',
          level: 15,
          member_count: 47,
          max_members: 50,
          total_xp: 2500000,
          weekly_xp: 125000,
          rank: 3,
          leader: {
            id: 'leader1',
            name: 'SatoshiMaster',
            avatar: '/src/assets/avatars/the-satoshi.jpg'
          },
          requirements: {
            min_level: 10,
            min_xp: 5000
          },
          perks: [
            '+15% XP Bonus',
            'Acesso a canais VIP',
            'Challenges exclusivos',
            'Mentoria especializada'
          ],
          is_member: true,
          user_role: 'member'
        },
        {
          id: '2',
          name: 'DeFi Warriors',
          description: 'Especialistas em protocolos DeFi e yield farming',
          logo: '🔥',
          level: 12,
          member_count: 32,
          max_members: 40,
          total_xp: 1800000,
          weekly_xp: 95000,
          rank: 7,
          leader: {
            id: 'leader2',
            name: 'DefiKing',
            avatar: '/src/assets/avatars/defi-samurai.jpg'
          },
          requirements: {
            min_level: 8,
            min_xp: 3000
          },
          perks: [
            '+10% XP Bonus',
            'DeFi Alpha Calls',
            'Pool de recompensas',
            'Workshops semanais'
          ]
        },
        {
          id: '3',
          name: 'Blockchain Newbies',
          description: 'Guild acolhedora para iniciantes no mundo crypto',
          logo: '🌱',
          level: 8,
          member_count: 89,
          max_members: 100,
          total_xp: 950000,
          weekly_xp: 45000,
          rank: 15,
          leader: {
            id: 'leader3',
            name: 'CryptoTeacher',
            avatar: '/src/assets/avatars/crypto-analyst.jpg'
          },
          requirements: {
            min_level: 1,
            min_xp: 0
          },
          perks: [
            '+5% XP Bonus',
            'Tutoriais exclusivos',
            'Suporte 24/7',
            'Eventos para iniciantes'
          ]
        }
      ];

      // Set user guild (first one as example)
      setUserGuild(mockGuilds[0]);
      // Set recommended guilds (others)
      setRecommendedGuilds(mockGuilds.slice(1));
    } catch (error) {
      console.error('Error loading guild data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGuildAction = (guild: Guild, action: 'join' | 'view' | 'manage') => {
    switch (action) {
      case 'join':
        // In real app, would make API call to join guild
        console.log('Joining guild:', guild.name);
        break;
      case 'view':
        navigate(`/guild/${guild.id}`);
        break;
      case 'manage':
        navigate(`/guild/${guild.id}/manage`);
        break;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Sistema de Guildas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="bg-muted/30 rounded-lg p-3 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-emerald-500/20 bg-gradient-to-br from-background to-emerald-500/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-500" />
            Sistema de Guildas
          </CardTitle>
          
          {!userGuild && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/guilds')}
              className="text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10"
            >
              <Plus className="h-4 w-4 mr-1" />
              Criar Guild
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* User's Guild */}
        {userGuild && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Minha Guild</h3>
              <Badge variant="outline" className="text-emerald-500 border-emerald-500/30">
                {userGuild.user_role}
              </Badge>
            </div>
            
            <div 
              className="border-2 border-emerald-500/30 rounded-lg p-4 bg-emerald-500/5 cursor-pointer hover:border-emerald-500/50 transition-all"
              onClick={() => handleGuildAction(userGuild, 'view')}
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{userGuild.logo}</div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-bold text-lg">{userGuild.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      Nível {userGuild.level}
                    </Badge>
                    <Badge variant="outline" className="text-xs text-yellow-500 border-yellow-500/30">
                      #{userGuild.rank} Ranking
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {userGuild.description}
                  </p>
                  
                  {/* Guild Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs mb-3">
                    <div>
                      <div className="text-muted-foreground">Membros</div>
                      <div className="font-medium">{userGuild.member_count}/{userGuild.max_members}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">XP Total</div>
                      <div className="font-medium">{userGuild.total_xp.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">XP Semanal</div>
                      <div className="font-medium text-green-500">+{userGuild.weekly_xp.toLocaleString()}</div>
                    </div>
                  </div>
                  
                  {/* Leader Info */}
                  <div className="flex items-center gap-2 mb-3">
                    <Crown className="h-4 w-4 text-yellow-500" />
                    <span className="text-xs text-muted-foreground">Líder:</span>
                    <span className="text-xs font-medium">{userGuild.leader.name}</span>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <MessageCircle className="h-3 w-3 mr-1" />
                      Chat
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Users className="h-3 w-3 mr-1" />
                      Membros
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Target className="h-3 w-3 mr-1" />
                      Missões
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Recommended Guilds */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">
            {userGuild ? 'Outras Guildas' : 'Guildas Recomendadas'}
          </h3>
          
          <div className="space-y-3">
            {recommendedGuilds.slice(0, 2).map((guild) => (
              <div 
                key={guild.id}
                className="border rounded-lg p-3 hover:border-emerald-500/30 transition-all cursor-pointer"
                onClick={() => handleGuildAction(guild, 'view')}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{guild.logo}</div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{guild.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        Nv.{guild.level}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        #{guild.rank}
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-2">
                      {guild.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span>{guild.member_count}/{guild.max_members} membros</span>
                        <span className="text-green-500">+{guild.weekly_xp.toLocaleString()} XP/sem</span>
                      </div>
                      
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" className="h-6 px-2 text-xs">
                          <UserPlus className="h-3 w-3 mr-1" />
                          Entrar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {recommendedGuilds.length === 0 && !userGuild && (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma guild disponível</p>
            <p className="text-sm">Crie sua própria guild ou aguarde novas opções!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}