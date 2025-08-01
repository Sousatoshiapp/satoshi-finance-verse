import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/shared/ui/avatar";
import { Progress } from "@/components/shared/ui/progress";
import { 
  Crown, 
  Star, 
  Calendar, 
  Clock, 
  Trophy, 
  Target,
  BookOpen,
  MessageSquare,
  Video,
  Award,
  Zap,
  User,
  CheckCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface Mentor {
  id: string;
  name: string;
  title: string;
  avatar_url: string;
  specialties: string[];
  rating: number;
  sessions_completed: number;
  years_experience: number;
  success_rate: number;
  available_slots: number;
  tier: 'gold' | 'platinum' | 'diamond';
  bio: string;
}

interface MentorshipSession {
  id: string;
  mentor: {
    name: string;
    avatar_url: string;
    title: string;
  };
  type: 'consultation' | 'review' | 'strategy' | 'emergency';
  title: string;
  description: string;
  scheduled_at: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  rating?: number;
  notes?: string;
}

interface MentorshipStats {
  total_sessions: number;
  hours_mentored: number;
  avg_rating: number;
  improvement_score: number;
  current_tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  tier_progress: number;
  next_tier_requirement: number;
}

export function VIPMentorshipProgram() {
  const navigate = useNavigate();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [sessions, setSessions] = useState<MentorshipSession[]>([]);
  const [stats, setStats] = useState<MentorshipStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasVIPAccess, setHasVIPAccess] = useState(true);

  useEffect(() => {
    loadMentorshipData();
  }, []);

  const loadMentorshipData = async () => {
    try {
      // Mock mentors data
      const mockMentors: Mentor[] = [
        {
          id: '1',
          name: 'Dr. Alexandra Chen',
          title: 'Quantitative Trading Expert',
          avatar_url: '/placeholder-avatar.jpg',
          specialties: ['Algorithmic Trading', 'Risk Management', 'Portfolio Optimization'],
          rating: 4.9,
          sessions_completed: 847,
          years_experience: 15,
          success_rate: 94,
          available_slots: 3,
          tier: 'diamond',
          bio: 'Ex-Goldman Sachs quantitative analyst with 15+ years in institutional trading'
        },
        {
          id: '2',
          name: 'Marcus Rodriguez',
          title: 'Crypto Trading Specialist',
          avatar_url: '/placeholder-avatar.jpg',
          specialties: ['DeFi Strategies', 'NFT Trading', 'Blockchain Analysis'],
          rating: 4.8,
          sessions_completed: 623,
          years_experience: 8,
          success_rate: 91,
          available_slots: 5,
          tier: 'platinum',
          bio: 'Early Bitcoin adopter and DeFi protocol advisor'
        },
        {
          id: '3',
          name: 'Sarah Thompson',
          title: 'Trading Psychology Coach',
          avatar_url: '/placeholder-avatar.jpg',
          specialties: ['Psychology', 'Discipline', 'Emotional Control'],
          rating: 4.7,
          sessions_completed: 456,
          years_experience: 12,
          success_rate: 89,
          available_slots: 2,
          tier: 'gold',
          bio: 'Certified trading psychologist helping traders overcome mental barriers'
        }
      ];

      const mockSessions: MentorshipSession[] = [
        {
          id: '1',
          mentor: {
            name: 'Dr. Alexandra Chen',
            avatar_url: '/placeholder-avatar.jpg',
            title: 'Quantitative Trading Expert'
          },
          type: 'strategy',
          title: 'Portfolio Risk Assessment',
          description: 'Análise detalhada da estratégia de diversificação atual',
          scheduled_at: new Date(Date.now() + 86400000).toISOString(),
          duration: 60,
          status: 'scheduled'
        },
        {
          id: '2',
          mentor: {
            name: 'Marcus Rodriguez',
            avatar_url: '/placeholder-avatar.jpg',
            title: 'Crypto Trading Specialist'
          },
          type: 'review',
          title: 'DeFi Strategy Review',
          description: 'Revisão das posições em protocolos DeFi e otimizações',
          scheduled_at: new Date(Date.now() - 172800000).toISOString(),
          duration: 45,
          status: 'completed',
          rating: 5,
          notes: 'Excelente sessão, recebi insights valiosos sobre yield farming'
        }
      ];

      const mockStats: MentorshipStats = {
        total_sessions: 12,
        hours_mentored: 18.5,
        avg_rating: 4.8,
        improvement_score: 87,
        current_tier: 'gold',
        tier_progress: 65,
        next_tier_requirement: 20
      };

      setMentors(mockMentors);
      setSessions(mockSessions);
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading mentorship data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'diamond': return 'text-cyan-500 border-cyan-500/30 bg-cyan-500/10';
      case 'platinum': return 'text-gray-400 border-gray-400/30 bg-gray-400/10';
      case 'gold': return 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10';
      case 'silver': return 'text-gray-300 border-gray-300/30 bg-gray-300/10';
      case 'bronze': return 'text-orange-600 border-orange-600/30 bg-orange-600/10';
      default: return 'text-muted-foreground';
    }
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'consultation': return <MessageSquare className="h-4 w-4" />;
      case 'review': return <BookOpen className="h-4 w-4" />;
      case 'strategy': return <Target className="h-4 w-4" />;
      case 'emergency': return <Zap className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getSessionStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'text-blue-500';
      case 'completed': return 'text-green-500';
      case 'cancelled': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Amanhã';
    if (diffDays === -1) return 'Ontem';
    if (diffDays > 0) return `Em ${diffDays} dias`;
    return `${Math.abs(diffDays)} dias atrás`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Programa VIP de Mentoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
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

  if (!hasVIPAccess) {
    return (
      <Card className="border-yellow-500/20 bg-gradient-to-br from-background to-yellow-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Programa VIP de Mentoria
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Crown className="h-16 w-16 mx-auto mb-4 text-yellow-500 opacity-50" />
          <h3 className="font-semibold mb-2">Acesso VIP Necessário</h3>
          <p className="text-muted-foreground mb-4">
            Upgrade para Pro ou Elite para acessar mentoria 1:1 com experts
          </p>
          <Button 
            className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
            onClick={() => navigate('/subscription-plans')}
          >
            <Crown className="h-4 w-4 mr-2" />
            Fazer Upgrade
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-violet-500/20 bg-gradient-to-br from-background to-violet-500/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-violet-500" />
            Programa VIP de Mentoria
            {stats && (
              <Badge variant="outline" className={cn("ml-2", getTierColor(stats.current_tier))}>
                {stats.current_tier.toUpperCase()}
              </Badge>
            )}
          </CardTitle>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/mentorship')}
            className="text-violet-500 border-violet-500/30 hover:bg-violet-500/10"
          >
            Ver Programa
          </Button>
        </div>
        
        {/* Mentorship Stats */}
        {stats && (
          <div className="bg-violet-500/10 border border-violet-500/30 rounded-lg p-3">
            <div className="grid grid-cols-4 gap-4 text-center text-xs">
              <div>
                <div className="text-lg font-bold text-violet-500">{stats.total_sessions}</div>
                <div className="text-muted-foreground">Sessões</div>
              </div>
              <div>
                <div className="text-lg font-bold text-violet-500">{stats.hours_mentored}h</div>
                <div className="text-muted-foreground">Mentoria</div>
              </div>
              <div>
                <div className="text-lg font-bold text-violet-500">{stats.avg_rating}</div>
                <div className="text-muted-foreground">Avaliação</div>
              </div>
              <div>
                <div className="text-lg font-bold text-violet-500">{stats.improvement_score}%</div>
                <div className="text-muted-foreground">Melhoria</div>
              </div>
            </div>
            
            {/* Tier Progress */}
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span>Progresso para Platinum</span>
                <span>{stats.tier_progress}%</span>
              </div>
              <Progress value={stats.tier_progress} className="h-2" />
              <div className="text-xs text-muted-foreground mt-1">
                Faltam {stats.next_tier_requirement - stats.total_sessions} sessões
              </div>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Featured Mentors */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Star className="h-4 w-4 text-violet-500" />
            Mentores em Destaque
          </h3>
          
          <div className="space-y-2">
            {mentors.slice(0, 2).map((mentor) => (
              <div 
                key={mentor.id}
                className="border rounded-lg p-3 hover:border-violet-500/30 transition-all cursor-pointer"
                onClick={() => navigate(`/mentor/${mentor.id}`)}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={mentor.avatar_url} />
                    <AvatarFallback>{mentor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{mentor.name}</h4>
                      <Badge variant="outline" className={cn("text-xs", getTierColor(mentor.tier))}>
                        {mentor.tier}
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-2">{mentor.title}</p>
                    
                    <div className="flex items-center gap-4 text-xs mb-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        {mentor.rating}
                      </div>
                      <div>{mentor.sessions_completed} sessões</div>
                      <div className="text-green-500">{mentor.success_rate}% sucesso</div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {mentor.specialties.slice(0, 2).map((specialty) => (
                          <Badge key={specialty} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {mentor.available_slots} slots disponíveis
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Upcoming Sessions */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Calendar className="h-4 w-4 text-violet-500" />
            Próximas Sessões
          </h3>
          
          <div className="space-y-2">
            {sessions.filter(s => s.status === 'scheduled').slice(0, 1).map((session) => (
              <div 
                key={session.id}
                className="bg-violet-500/10 border border-violet-500/30 rounded-lg p-3"
              >
                <div className="flex items-start gap-3">
                  <div className="text-violet-500">
                    {getSessionTypeIcon(session.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-sm">{session.title}</h4>
                      <Badge variant="outline" className="text-xs text-blue-500 border-blue-500/30">
                        {formatDate(session.scheduled_at)}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      Com {session.mentor.name}
                    </p>
                    
                    <p className="text-xs text-muted-foreground mb-2">
                      {session.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {session.duration} min
                      </div>
                      <Button variant="outline" size="sm">
                        <Video className="h-3 w-3 mr-1" />
                        Entrar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Recent Completed Session */}
        {sessions.some(s => s.status === 'completed') && (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-violet-500" />
              Última Sessão
            </h3>
            
            {sessions.filter(s => s.status === 'completed').slice(0, 1).map((session) => (
              <div 
                key={session.id}
                className="border rounded-lg p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{session.title}</h4>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={cn("h-3 w-3", 
                          i < (session.rating || 0) ? "text-yellow-500 fill-current" : "text-muted-foreground"
                        )} 
                      />
                    ))}
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground mb-2">
                  {formatDate(session.scheduled_at)} • {session.duration} min
                </p>
                
                {session.notes && (
                  <p className="text-sm italic text-muted-foreground">
                    "{session.notes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => navigate('/book-session')}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Agendar
          </Button>
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => navigate('/mentorship-history')}
          >
            <Trophy className="h-4 w-4 mr-2" />
            Histórico
          </Button>
        </div>
        
        {mentors.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Crown className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Carregando mentores VIP...</p>
            <p className="text-sm">Acesso exclusivo para assinantes!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
