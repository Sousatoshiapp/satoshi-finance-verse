import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FloatingNavbar } from "@/components/floating-navbar";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { levelTiers, getLevelInfo } from "@/data/levels";
import { Trophy, Star, Lock, CheckCircle } from "lucide-react";

interface UserProfile {
  level: number;
  xp: number;
}

export default function Levels() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      // Check localStorage first for user data
      const userData = localStorage.getItem('satoshi_user');
      if (!userData) {
        navigate('/welcome');
        return;
      }

      const { data: { user: authUser } } = await supabase.auth.getUser();

      // Load user profile from Supabase or fallback to localStorage
      let profile = null;
      if (authUser) {
        const { data: supabaseProfile } = await supabase
          .from('profiles')
          .select('level, xp')
          .eq('user_id', authUser.id)
          .single();
        profile = supabaseProfile;
      }

      // If no Supabase profile, use localStorage data
      if (!profile) {
        const localUser = JSON.parse(userData);
        profile = {
          level: localUser.level || 1,
          xp: localUser.xp || 0,
        };
      }

      if (profile) {
        setUser(profile);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelStatus = (level: number) => {
    if (!user) return 'locked';
    if (level < user.level) return 'completed';
    if (level === user.level) return 'current';
    return 'locked';
  };

  const getLevelIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'current': return <Star className="h-5 w-5 text-primary" />;
      default: return <Lock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getLevelBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'current': return 'secondary';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
                ← Dashboard
              </Button>
              <h1 className="text-xl font-bold text-foreground">Níveis & Progressão</h1>
            </div>
            {user && (
              <Badge variant="secondary" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                {getLevelInfo(user.level).name}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4">
        {/* Current Level Card */}
        {user && (
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-lg font-bold">
                  {user.level}
                </div>
                <div>
                  <h2 className="text-xl">{getLevelInfo(user.level).name}</h2>
                  <p className="text-sm text-muted-foreground">Seu nível atual</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {getLevelInfo(user.level).description}
              </p>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">XP Atual: {user.xp}</span>
                <span className="text-sm text-muted-foreground">
                  Próximo nível: {user.level * 100} XP
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Levels Grid */}
        <div className="grid gap-4">
          <h2 className="text-2xl font-bold text-foreground mb-4">Todos os Níveis</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {levelTiers.map((tier) => {
              const status = getLevelStatus(tier.level);
              const isLocked = status === 'locked';
              
              return (
                <Card 
                  key={tier.level} 
                  className={`transition-all ${
                    status === 'current' 
                      ? 'border-primary bg-primary/5' 
                      : status === 'completed'
                      ? 'border-green-500/20 bg-green-500/5'
                      : isLocked 
                      ? 'opacity-60' 
                      : ''
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                          status === 'current' 
                            ? 'bg-primary text-white' 
                            : status === 'completed'
                            ? 'bg-green-500 text-white'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {tier.level}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{tier.name}</CardTitle>
                          <p className="text-xs text-muted-foreground">Nível {tier.level}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {getLevelIcon(status)}
                        <Badge variant={getLevelBadgeVariant(status) as any}>
                          {status === 'completed' ? 'Concluído' : 
                           status === 'current' ? 'Atual' : 'Bloqueado'}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <CardDescription className={isLocked ? 'text-muted-foreground/60' : ''}>
                      {tier.description}
                    </CardDescription>
                    
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className={`font-medium ${isLocked ? 'text-muted-foreground/60' : ''}`}>
                        XP Necessário: {tier.level * 100}
                      </span>
                      
                      {status === 'current' && user && (
                        <span className="text-primary font-medium">
                          {Math.round((user.xp / (tier.level * 100)) * 100)}% completo
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
      
      <FloatingNavbar />
    </div>
  );
}