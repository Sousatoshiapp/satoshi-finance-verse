import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FloatingNavbar } from "@/components/floating-navbar";
import { ArrowLeft, Users, Trophy, BookOpen, Zap, Crown, Medal, Award, Star } from "lucide-react";
import xpLogo from "@/assets/districts/xp-investimentos-logo.jpg";
import animaLogo from "@/assets/districts/anima-educacao-logo.jpg";
import criptoLogo from "@/assets/districts/cripto-valley-logo.jpg";
import bankingLogo from "@/assets/districts/banking-sector-logo.jpg";
import realEstateLogo from "@/assets/districts/real-estate-logo.jpg";
import tradeLogo from "@/assets/districts/international-trade-logo.jpg";
import fintechLogo from "@/assets/districts/tech-finance-logo.jpg";
import xpDistrict3D from "@/assets/districts/xp-district-3d.jpg";
import animaDistrict3D from "@/assets/districts/anima-district-3d.jpg";
import criptoDistrict3D from "@/assets/districts/cripto-district-3d.jpg";
import bankingDistrict3D from "@/assets/districts/banking-district-3d.jpg";
import realEstateDistrict3D from "@/assets/districts/real-estate-district-3d.jpg";
import tradeDistrict3D from "@/assets/districts/trade-district-3d.jpg";
import fintechDistrict3D from "@/assets/districts/fintech-district-3d.jpg";

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

interface Resident {
  id: string;
  nickname: string;
  level: number;
  xp: number;
  profile_image_url?: string;
}

const districtLogos = {
  renda_variavel: xpLogo,
  educacao_financeira: animaLogo,
  criptomoedas: criptoLogo,
  sistema_bancario: bankingLogo,
  fundos_imobiliarios: realEstateLogo,
  mercado_internacional: tradeLogo,
  fintech: fintechLogo,
};

const district3DImages = {
  renda_variavel: xpDistrict3D,
  educacao_financeira: animaDistrict3D,
  criptomoedas: criptoDistrict3D,
  sistema_bancario: bankingDistrict3D,
  fundos_imobiliarios: realEstateDistrict3D,
  mercado_internacional: tradeDistrict3D,
  fintech: fintechDistrict3D,
};

export default function DistrictDetail() {
  const { districtId } = useParams();
  const navigate = useNavigate();
  const [district, setDistrict] = useState<District | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [userDistrict, setUserDistrict] = useState<UserDistrict | null>(null);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [ranking, setRanking] = useState<Resident[]>([]);
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

      // Load residents and ranking - simplificado por ora
      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('id, nickname, profile_image_url')
        .limit(10);

      if (allProfiles) {
        const mockResidents = allProfiles.map((profile, index) => ({
          id: profile.id,
          nickname: profile.nickname,
          level: Math.floor(Math.random() * 10) + 1,
          xp: Math.floor(Math.random() * 5000) + 100,
          profile_image_url: profile.profile_image_url
        }));
        
        setResidents(mockResidents);
        setRanking(mockResidents.sort((a, b) => b.xp - a.xp).slice(0, 10));
      }

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
  const districtLogo = districtLogos[district.theme as keyof typeof districtLogos];
  const district3DImage = district3DImages[district.theme as keyof typeof district3DImages];

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown className="h-5 w-5 text-yellow-400" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Award className="h-5 w-5 text-amber-600" />;
      default: return <Star className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="relative overflow-hidden h-96">
        {/* 3D District Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url(${district3DImage})`,
            filter: 'brightness(0.3) contrast(1.2)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
        </div>
        
        <div 
          className="absolute inset-0 opacity-30"
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

          <div className="flex items-center justify-center mb-6">
            {districtLogo && (
              <img 
                src={districtLogo} 
                alt={district.name}
                className="w-20 h-20 rounded-full object-cover mr-6 border-4"
                style={{ borderColor: district.color_primary }}
              />
            )}
            <div className="text-center">
              <h1 
                className="text-5xl font-bold mb-4"
                style={{ color: district.color_primary }}
              >
                {district.name}
              </h1>
              <p className="text-xl text-gray-300 mb-4 max-w-2xl">
                {district.description}
              </p>
            </div>
          </div>
          
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

      {/* Content Tabs */}
      <div className="container mx-auto px-4 py-8 pb-32">
        <Tabs defaultValue="quizzes" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-slate-800/50">
            <TabsTrigger value="quizzes" className="data-[state=active]:bg-slate-700">
              <BookOpen className="mr-2 h-4 w-4" />
              Quizzes
            </TabsTrigger>
            <TabsTrigger value="residents" className="data-[state=active]:bg-slate-700">
              <Users className="mr-2 h-4 w-4" />
              Moradores
            </TabsTrigger>
            <TabsTrigger value="ranking" className="data-[state=active]:bg-slate-700">
              <Trophy className="mr-2 h-4 w-4" />
              Ranking
            </TabsTrigger>
            <TabsTrigger value="teams" className="data-[state=active]:bg-slate-700">
              <Zap className="mr-2 h-4 w-4" />
              Times
            </TabsTrigger>
          </TabsList>

          {/* Quizzes Tab */}
          <TabsContent value="quizzes">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 backdrop-blur-sm border-2" style={{ borderColor: district.color_primary }}>
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <BookOpen className="mr-2 h-5 w-5" style={{ color: district.color_primary }} />
                    Quiz Básico
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Fundamentos essenciais de {district.theme.replace('_', ' ')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Badge variant="outline" style={{ borderColor: district.color_primary, color: district.color_primary }}>
                        +50 XP
                      </Badge>
                      <p className="text-sm text-gray-400">10 perguntas • 5 min</p>
                    </div>
                    <Button 
                      onClick={handleStartQuiz}
                      style={{ backgroundColor: district.color_primary }}
                      className="text-black font-bold"
                    >
                      Começar
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 backdrop-blur-sm border-2" style={{ borderColor: district.color_primary }}>
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Trophy className="mr-2 h-5 w-5" style={{ color: district.color_primary }} />
                    Quiz Avançado
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Para especialistas em {district.theme.replace('_', ' ')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Badge variant="outline" style={{ borderColor: district.color_primary, color: district.color_primary }}>
                        +100 XP
                      </Badge>
                      <p className="text-sm text-gray-400">20 perguntas • 10 min</p>
                    </div>
                    <Button 
                      variant="outline"
                      disabled={!userDistrict || userDistrict.level < 3}
                      style={{ borderColor: district.color_primary }}
                      className="text-gray-400"
                    >
                      {!userDistrict || userDistrict.level < 3 ? 'Nível 3 Necessário' : 'Começar'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Residents Tab */}
          <TabsContent value="residents">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {residents.map((resident) => (
                <Card key={resident.id} className="bg-slate-800/50 backdrop-blur-sm border border-slate-600">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={resident.profile_image_url} />
                        <AvatarFallback className="bg-slate-700 text-white">
                          {resident.nickname.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{resident.nickname}</h3>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Nível {resident.level}</span>
                          <span style={{ color: district.color_primary }}>
                            {resident.xp} XP
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {residents.length === 0 && (
                <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-600 col-span-full">
                  <CardContent className="p-8 text-center">
                    <Users className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">Nenhum morador no distrito ainda</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Ranking Tab */}
          <TabsContent value="ranking">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-2" style={{ borderColor: district.color_primary }}>
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Trophy className="mr-2 h-5 w-5" style={{ color: district.color_primary }} />
                  Top 10 do Distrito
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Os melhores especialistas em {district.theme.replace('_', ' ')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {ranking.map((user, index) => (
                    <div 
                      key={user.id}
                      className={`flex items-center space-x-4 p-3 rounded-lg ${
                        index < 3 ? 'bg-gradient-to-r from-slate-700/50 to-slate-600/50' : 'bg-slate-700/30'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {getRankIcon(index + 1)}
                        <span className="text-lg font-bold text-white">#{index + 1}</span>
                      </div>
                      
                      <Avatar>
                        <AvatarImage src={user.profile_image_url} />
                        <AvatarFallback className="bg-slate-600 text-white">
                          {user.nickname.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{user.nickname}</h3>
                        <p className="text-sm text-gray-400">Nível {user.level}</p>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-bold" style={{ color: district.color_primary }}>
                          {user.xp.toLocaleString()} XP
                        </p>
                        <p className="text-xs text-gray-400">
                          {Math.floor(user.xp / 100)} conquistas
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {ranking.length === 0 && (
                    <div className="text-center py-8">
                      <Trophy className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">Ranking será atualizado em breve</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Teams Tab */}
          <TabsContent value="teams">
            <div className="grid lg:grid-cols-2 gap-6">
              {teams.length > 0 ? (
                teams.map((team) => (
                  <Card key={team.id} className="bg-slate-800/50 backdrop-blur-sm border-2" style={{ borderColor: district.color_primary }}>
                    <CardHeader>
                      <CardTitle className="text-white">{team.name}</CardTitle>
                      <CardDescription className="text-gray-300">
                        {team.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-400">
                            Máximo: {team.max_members} membros
                          </p>
                          <p className="text-sm text-gray-400">
                            Nível mínimo: {team.level_required}
                          </p>
                        </div>
                        <Button 
                          onClick={() => handleJoinTeam(team.id)}
                          style={{ backgroundColor: district.color_primary }}
                          className="text-black font-bold"
                        >
                          Juntar-se
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-600 col-span-full">
                  <CardContent className="p-8 text-center">
                    <Users className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Times em Breve</h3>
                    <p className="text-gray-400">
                      Os times do distrito estarão disponíveis em breve. 
                      Continue fazendo quizzes para aumentar seu nível!
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <FloatingNavbar />
    </div>
  );
}