import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FloatingNavbar } from "@/components/floating-navbar";
import { ArrowLeft, Users, Trophy, BookOpen, Zap } from "lucide-react";

interface District {
  id: string;
  name: string;
  description: string;
  theme: string;
  color_primary: string;
  color_secondary: string;
  level_required: number;
}

interface Team {
  id: string;
  name: string;
  description: string;
  max_members: number;
  level_required: number;
}

interface UserDistrict {
  level: number;
  xp: number;
}

export default function DistrictDetail() {
  const { districtId } = useParams();
  const navigate = useNavigate();
  const [district, setDistrict] = useState<District | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [userDistrict, setUserDistrict] = useState<UserDistrict | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (districtId) {
      loadDistrictData();
    }
  }, [districtId]);

  const loadDistrictData = async () => {
    try {
      // Load district info
      const { data: districtData, error: districtError } = await supabase
        .from('districts')
        .select('*')
        .eq('id', districtId)
        .single();

      if (districtError) throw districtError;
      setDistrict(districtData);

      // Load teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .eq('district_id', districtId);

      if (teamsError) throw teamsError;
      setTeams(teamsData || []);

      // Load user district progress
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          const { data: userDistrictData } = await supabase
            .from('user_districts')
            .select('level, xp')
            .eq('user_id', profile.id)
            .eq('district_id', districtId)
            .single();

          setUserDistrict(userDistrictData);
        }
      }
    } catch (error) {
      console.error('Error loading district data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = () => {
    navigate(`/satoshi-city/district/${districtId}/quiz`);
  };

  const handleJoinTeam = async (teamId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const { error } = await supabase
        .from('user_teams')
        .insert({
          user_id: profile.id,
          team_id: teamId
        });

      if (error) throw error;
      
      // Reload data
      loadDistrictData();
    } catch (error) {
      console.error('Error joining team:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!district) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Distrito não encontrado</h1>
          <Button onClick={() => navigate('/satoshi-city')}>
            Voltar para Satoshi City
          </Button>
        </div>
      </div>
    );
  }

  const nextLevelXP = userDistrict ? userDistrict.level * 1000 : 1000;
  const currentLevelXP = userDistrict ? userDistrict.xp % 1000 : 0;
  const progressPercent = (currentLevelXP / 1000) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: `linear-gradient(135deg, ${district.color_primary}20, ${district.color_secondary}20)`
          }}
        ></div>
        
        <div className="relative container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/satoshi-city')}
            className="mb-4 text-gray-300 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Satoshi City
          </Button>

          <div className="text-center">
            <h1 
              className="text-5xl font-bold mb-4"
              style={{ color: district.color_primary }}
            >
              {district.name}
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              {district.description}
            </p>
            
            {userDistrict && (
              <div className="max-w-md mx-auto">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Nível {userDistrict.level}</span>
                  <span style={{ color: district.color_primary }}>
                    {currentLevelXP} / 1000 XP
                  </span>
                </div>
                <Progress 
                  value={progressPercent} 
                  className="h-2"
                  style={{
                    background: 'rgb(51, 65, 85)'
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quiz Section */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-2" style={{ borderColor: district.color_primary }}>
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <BookOpen className="mr-2 h-5 w-5" style={{ color: district.color_primary }} />
                  Desafios do Distrito
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Teste seus conhecimentos em {district.theme.replace('_', ' ')} e ganhe XP
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-white">Quiz Básico</h3>
                      <p className="text-sm text-gray-400">Fundamentos essenciais</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" style={{ borderColor: district.color_primary, color: district.color_primary }}>
                        +50 XP
                      </Badge>
                      <Button 
                        onClick={handleStartQuiz}
                        style={{ backgroundColor: district.color_primary }}
                        className="text-black font-bold"
                      >
                        Começar
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-white">Quiz Avançado</h3>
                      <p className="text-sm text-gray-400">Para especialistas</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" style={{ borderColor: district.color_primary, color: district.color_primary }}>
                        +100 XP
                      </Badge>
                      <Button 
                        variant="outline"
                        disabled={!userDistrict || userDistrict.level < 3}
                        style={{ borderColor: district.color_primary }}
                        className="text-gray-400"
                      >
                        Nível 3 Necessário
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Teams Section */}
          <div>
            <Card className="bg-slate-800/50 backdrop-blur-sm border-2" style={{ borderColor: district.color_primary }}>
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Users className="mr-2 h-5 w-5" style={{ color: district.color_primary }} />
                  Times do Distrito
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Junte-se a um time e forme alianças
                </CardDescription>
              </CardHeader>
              <CardContent>
                {teams.length > 0 ? (
                  <div className="space-y-3">
                    {teams.map((team) => (
                      <div key={team.id} className="p-3 bg-slate-700/50 rounded-lg">
                        <h4 className="font-semibold text-white">{team.name}</h4>
                        <p className="text-xs text-gray-400 mb-2">{team.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">
                            Max: {team.max_members} membros
                          </span>
                          <Button 
                            size="sm"
                            onClick={() => handleJoinTeam(team.id)}
                            style={{ backgroundColor: district.color_primary }}
                            className="text-black font-bold text-xs"
                          >
                            Juntar-se
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-4">
                    Nenhum time disponível ainda
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border-2 mt-6" style={{ borderColor: district.color_primary }}>
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Trophy className="mr-2 h-5 w-5" style={{ color: district.color_primary }} />
                  Estatísticas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Rank no Distrito</span>
                    <span className="text-white">#{Math.floor(Math.random() * 100) + 1}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Quizzes Concluídos</span>
                    <span className="text-white">{Math.floor(Math.random() * 50)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Precisão</span>
                    <span className="text-white">{Math.floor(Math.random() * 40) + 60}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <FloatingNavbar />
    </div>
  );
}