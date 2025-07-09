import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FloatingNavbar } from "@/components/floating-navbar";
import { ArrowLeft, Users, Trophy, BookOpen, Zap, Crown, Medal, Award, Star, Home, Shield, Swords, Target, Flame, ExternalLink, Plus, UserPlus, Settings, Clock, AlertTriangle, CheckCircle, ShoppingBag, Lock, Sparkles, Search, Filter, SortAsc, SortDesc } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DistrictQuests } from "@/components/district-quests";
import { SponsorActivationBanner } from "@/components/sponsor-activation-banner";
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
  power_level: number;
  battles_won: number;
  battles_lost: number;
  sponsor_company: string;
  sponsor_logo_url: string;
  referral_link: string;
  special_power: string;
}

interface Team {
  id: string;
  name: string;
  description: string;
  max_members: number;
  members_count: number;
  team_power: number;
  team_color: string;
  captain_id: string;
  achievements: any;
  team_motto: string;
  sponsor_themed: boolean;
}

interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profiles: {
    nickname: string;
    level: number;
    profile_image_url?: string;
  };
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
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [allDistricts, setAllDistricts] = useState<District[]>([]);
  const [activeBattles, setActiveBattles] = useState<any[]>([]);
  const [targetDistrictId, setTargetDistrictId] = useState('');
  const [isInitiatingBattle, setIsInitiatingBattle] = useState(false);
  const [storeItems, setStoreItems] = useState<any[]>([]);
  const [userPurchases, setUserPurchases] = useState<any[]>([]);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [userTeamMembership, setUserTeamMembership] = useState<string | null>(null);
  
  // Simplified filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [activityFilter, setActivityFilter] = useState('all');
  
  const { toast } = useToast();

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
        .from('district_teams')
        .select('*')
        .eq('district_id', districtId)
        .order('created_at', { ascending: false });

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
          setCurrentProfile(profile);
          
          // Load user team membership
          const { data: teamMembership } = await supabase
            .from('team_members')
            .select('team_id, district_teams(name)')
            .eq('user_id', profile.id)
            .eq('is_active', true)
            .single();
          
          if (teamMembership) {
            setUserTeamMembership(teamMembership.district_teams?.name || null);
          }

          // Simular dados do distrito do usuário
          setUserDistrict({
            level: Math.floor(Math.random() * 5) + 1,
            xp: Math.floor(Math.random() * 1000) + 100
          });
        }
      }

      // Load all districts for battles
      const { data: districtsData } = await supabase
        .from('districts')
        .select('*')
        .neq('id', districtId);
      
      setAllDistricts(districtsData || []);

      // Load active battles
      const { data: battlesData } = await supabase
        .from('district_battles')
        .select(`
          *,
          attacking_district:districts!district_battles_attacking_district_id_fkey(name),
          defending_district:districts!district_battles_defending_district_id_fkey(name)
        `)
        .or(`attacking_district_id.eq.${districtId},defending_district_id.eq.${districtId}`)
        .in('status', ['pending', 'active'])
        .order('created_at', { ascending: false });

      setActiveBattles(battlesData || []);

      // Load store items
      const { data: itemsData } = await supabase
        .from('district_store_items')
        .select('*')
        .eq('district_id', districtId)
        .eq('is_available', true);

      setStoreItems(itemsData || []);

    } catch (error) {
      console.error('Erro ao carregar dados do distrito:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do distrito",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = () => {
    navigate(`/quiz/${district?.theme}`);
  };

  const handleJoinTeam = async (teamId: string) => {
    if (!currentProfile) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para entrar em um time",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          user_id: currentProfile.id,
          role: 'member'
        });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Você entrou no time com sucesso!"
      });

      loadDistrictData(); // Reload data
    } catch (error) {
      console.error('Erro ao entrar no time:', error);
      toast({
        title: "Erro",
        description: "Não foi possível entrar no time",
        variant: "destructive"
      });
    }
  };

  const handleViewTeamMembers = async (team: Team) => {
    setSelectedTeam(team);
    setIsLoadingMembers(true);
    
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          *,
          profiles (nickname, level, profile_image_url)
        `)
        .eq('team_id', team.id)
        .eq('is_active', true);

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      console.error('Erro ao carregar membros do time:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os membros do time",
        variant: "destructive"
      });
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!currentProfile || !newTeamName.trim()) {
      toast({
        title: "Erro",
        description: "Nome do time é obrigatório",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingTeam(true);
    try {
      const { data: teamData, error: teamError } = await supabase
        .from('district_teams')
        .insert({
          name: newTeamName.trim(),
          description: newTeamDescription.trim(),
          district_id: districtId,
          captain_id: currentProfile.id,
          max_members: 10,
          members_count: 1
        })
        .select()
        .single();

      if (teamError) throw teamError;

      // Add creator as team member
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: teamData.id,
          user_id: currentProfile.id,
          role: 'captain'
        });

      if (memberError) throw memberError;

      toast({
        title: "Sucesso!",
        description: "Time criado com sucesso!"
      });

      setNewTeamName('');
      setNewTeamDescription('');
      loadDistrictData(); // Reload teams
    } catch (error) {
      console.error('Erro ao criar time:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o time",
        variant: "destructive"
      });
    } finally {
      setIsCreatingTeam(false);
    }
  };

  const handleInitiateBattle = async () => {
    if (!targetDistrictId || !currentProfile) {
      toast({
        title: "Erro",
        description: "Selecione um distrito para desafiar",
        variant: "destructive"
      });
      return;
    }

    setIsInitiatingBattle(true);
    try {
      const { error } = await supabase
        .from('district_battles')
        .insert({
          attacking_district_id: districtId,
          defending_district_id: targetDistrictId,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Batalha Iniciada!",
        description: "O distrito rival foi desafiado!"
      });

      setTargetDistrictId('');
      loadDistrictData(); // Reload battles
    } catch (error) {
      console.error('Erro ao iniciar batalha:', error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar a batalha",
        variant: "destructive"
      });
    } finally {
      setIsInitiatingBattle(false);
    }
  };

  const handlePurchaseItem = async (item: any) => {
    if (!currentProfile) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para comprar items",
        variant: "destructive"
      });
      return;
    }

    // Simplified purchase logic without database insert for now
    toast({
      title: "Compra Realizada!",
      description: `Você comprou ${item.name}!`
    });
  };

  const canPurchaseItem = (item: any) => {
    return item.is_available;
  };

  if (loading || !district) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Carregando distrito...</p>
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
      {/* Optimized Mobile Header */}
      <div className="relative overflow-hidden h-48 sm:h-64 lg:h-80">
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
        
        <div className="relative container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/satoshi-city')}
            className="mb-4 text-gray-300 hover:text-white text-sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Voltar para Satoshi City</span>
            <span className="sm:hidden">Voltar</span>
          </Button>

          <div className="flex flex-col items-center text-center">
            {districtLogo && (
              <img 
                src={districtLogo} 
                alt={district.name}
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover mb-3 border-2"
                style={{ borderColor: district.color_primary }}
              />
            )}
            <h1 
              className="text-xl sm:text-2xl lg:text-4xl font-bold mb-2"
              style={{ color: district.color_primary }}
            >
              {district.name}
            </h1>
            <p className="text-sm lg:text-base text-gray-300 mb-4 max-w-md">
              {district.description}
            </p>
            
            {/* Simplified District Power Display */}
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-4 h-4" style={{ color: district.color_primary }} />
              <span className="text-sm text-gray-300">Poder:</span>
              <span 
                className="font-bold text-sm"
                style={{ color: district.color_primary }}
              >
                {district.power_level || 100}/100
              </span>
            </div>
            
            {userDistrict && (
              <div className="w-full max-w-sm">
                <div className="flex justify-between mb-1 text-xs">
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

      {/* Sponsor Activation Banner - Positioned for maximum visibility */}
      <SponsorActivationBanner district={district} />

      {/* Simplified Mobile Filters */}
      <div className="container mx-auto px-4 py-4">
        <Card className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 mb-6">
          <CardContent className="p-3">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Combined Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar no distrito..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 h-10"
                />
              </div>
              
              {/* Quick Filter Chips */}
              <div className="flex gap-2 overflow-x-auto">
                <Button
                  variant={activityFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActivityFilter('all')}
                  className="whitespace-nowrap h-10 px-4 text-xs"
                  style={activityFilter === 'all' ? { backgroundColor: district.color_primary, color: 'black' } : {}}
                >
                  Todos
                </Button>
                <Button
                  variant={activityFilter === 'quests' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActivityFilter('quests')}
                  className="whitespace-nowrap h-10 px-4 text-xs"
                  style={activityFilter === 'quests' ? { backgroundColor: district.color_primary, color: 'black' } : {}}
                >
                  Quests
                </Button>
                <Button
                  variant={activityFilter === 'teams' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActivityFilter('teams')}
                  className="whitespace-nowrap h-10 px-4 text-xs"
                  style={activityFilter === 'teams' ? { backgroundColor: district.color_primary, color: 'black' } : {}}
                >
                  Times
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Optimized Mobile Content Tabs - Reduced to 3 essential tabs */}
        <Tabs defaultValue="activities" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-slate-800/50 gap-1 p-1">
            <TabsTrigger 
              value="activities" 
              className="data-[state=active]:bg-slate-700 text-xs sm:text-sm flex items-center justify-center py-3"
              style={{ 
                fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                minHeight: '44px'
              }}
            >
              <Zap className="h-4 w-4 mr-1 sm:mr-2" />
              <span>Atividades</span>
            </TabsTrigger>
            <TabsTrigger 
              value="teams" 
              className="data-[state=active]:bg-slate-700 text-xs sm:text-sm flex items-center justify-center py-3"
              style={{ 
                fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                minHeight: '44px'
              }}
            >
              <Home className="h-4 w-4 mr-1 sm:mr-2" />
              <span>Times</span>
            </TabsTrigger>
            <TabsTrigger 
              value="ranking" 
              className="data-[state=active]:bg-slate-700 text-xs sm:text-sm flex items-center justify-center py-3"
              style={{ 
                fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                minHeight: '44px'
              }}
            >
              <Trophy className="h-4 w-4 mr-1 sm:mr-2" />
              <span>Ranking</span>
            </TabsTrigger>
          </TabsList>

          {/* Activities Tab - Integrated with quests, quizzes and battles */}
          <TabsContent value="activities" className="space-y-6">
            {/* District Quests */}
            <DistrictQuests 
              districtId={district.id}
              districtTheme={district.theme}
              districtColor={district.color_primary}
            />
            
            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Quick Quiz */}
              <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-600">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-white text-base">
                    <BookOpen className="mr-2 h-4 w-4" style={{ color: district.color_primary }} />
                    Quiz Rápido
                  </CardTitle>
                  <CardDescription className="text-gray-300 text-sm">
                    Fundamentos de {district.theme.replace('_', ' ')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Badge variant="outline" style={{ borderColor: district.color_primary, color: district.color_primary }} className="text-xs">
                        +50 XP
                      </Badge>
                      <p className="text-xs text-gray-400">10 perguntas • 5 min</p>
                    </div>
                    <Button 
                      onClick={handleStartQuiz}
                      style={{ backgroundColor: district.color_primary }}
                      className="text-black font-bold text-sm"
                      size="sm"
                    >
                      Começar
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Battles Summary */}
              <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-600">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center text-base">
                    <Swords className="mr-2 h-4 w-4" style={{ color: district.color_primary }} />
                    Batalhas
                  </CardTitle>
                  <CardDescription className="text-gray-300 text-sm">
                    Ativas: {activeBattles.length} | Vitórias: {district.battles_won}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-400">
                      Taxa de vitória: {Math.round((district.battles_won / (district.battles_won + district.battles_lost || 1)) * 100)}%
                    </div>
                    <Button 
                      variant="outline"
                      size="sm"
                      className="text-sm"
                      style={{ borderColor: district.color_primary, color: district.color_primary }}
                    >
                      Ver Todas
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Teams Tab */}
          <TabsContent value="teams" className="space-y-6">
            {/* Create Team */}
            {!userTeamMembership && (
              <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center text-base">
                    <Plus className="mr-2 h-4 w-4" style={{ color: district.color_primary }} />
                    Criar Novo Time
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Nome do time"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  <Textarea
                    placeholder="Descrição do time (opcional)"
                    value={newTeamDescription}
                    onChange={(e) => setNewTeamDescription(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  <Button 
                    onClick={handleCreateTeam}
                    disabled={!newTeamName.trim() || isCreatingTeam}
                    style={{ backgroundColor: district.color_primary }}
                    className="w-full text-black font-bold"
                  >
                    {isCreatingTeam ? "Criando..." : "Criar Time"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Teams List */}
            <div className="grid grid-cols-1 gap-4">
              {teams.map((team) => (
                <Card key={team.id} className="bg-slate-800/50 backdrop-blur-sm border border-slate-600">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white text-base">{team.name}</h3>
                        {team.description && (
                          <p className="text-sm text-gray-400 mt-1">{team.description}</p>
                        )}
                        {team.team_motto && (
                          <p className="text-xs text-gray-500 italic mt-1">"{team.team_motto}"</p>
                        )}
                      </div>
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: team.team_color || district.color_primary }}
                      ></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span className="flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          {team.members_count}/{team.max_members}
                        </span>
                        <span className="flex items-center">
                          <Zap className="w-3 h-3 mr-1" />
                          {team.team_power || 0}
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewTeamMembers(team)}
                          className="text-xs"
                        >
                          Ver Membros
                        </Button>
                        {!userTeamMembership && team.members_count < team.max_members && (
                          <Button
                            size="sm"
                            onClick={() => handleJoinTeam(team.id)}
                            style={{ backgroundColor: district.color_primary }}
                            className="text-black font-bold text-xs"
                          >
                            Entrar
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {teams.length === 0 && (
                <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-600">
                  <CardContent className="p-8 text-center">
                    <Home className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">Nenhum time criado ainda. Seja o primeiro!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Ranking Tab */}
          <TabsContent value="ranking">
            <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-600">
              <CardHeader>
                <CardTitle className="flex items-center text-white text-base">
                  <Trophy className="mr-2 h-4 w-4" style={{ color: district.color_primary }} />
                  Top 10 do Distrito
                </CardTitle>
                <CardDescription className="text-gray-300 text-sm">
                  Os melhores especialistas em {district.theme.replace('_', ' ')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {ranking.map((user, index) => (
                    <div 
                      key={user.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg ${
                        index < 3 ? 'bg-gradient-to-r from-slate-700/50 to-slate-600/50' : 'bg-slate-700/30'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        {getRankIcon(index + 1)}
                        <span className="text-sm font-bold text-white">#{index + 1}</span>
                      </div>
                      
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.profile_image_url} />
                        <AvatarFallback className="bg-slate-600 text-white text-xs">
                          {user.nickname.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-white text-sm">{user.nickname}</h3>
                        <p className="text-xs text-gray-400">Nível {user.level}</p>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-bold text-sm" style={{ color: district.color_primary }}>
                          {user.xp.toLocaleString()} XP
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
        </Tabs>
      </div>

      {/* Team Members Dialog */}
      <Dialog open={selectedTeam !== null} onOpenChange={() => setSelectedTeam(null)}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" style={{ color: district.color_primary }} />
              Membros - {selectedTeam?.name}
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              {selectedTeam?.members_count} membros ativos
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {isLoadingMembers ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
              </div>
            ) : (
              teamMembers.map((member) => (
                <div key={member.id} className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg">
                  <Avatar>
                    <AvatarImage src={member.profiles?.profile_image_url} />
                    <AvatarFallback className="bg-slate-600 text-white">
                      {member.profiles?.nickname?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">{member.profiles?.nickname}</h4>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-gray-400">Nível {member.profiles?.level}</span>
                      {member.role === 'captain' && (
                        <Badge variant="outline" style={{ borderColor: district.color_primary, color: district.color_primary }}>
                          <Crown className="w-3 h-3 mr-1" />
                          Capitão
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <FloatingNavbar />
    </div>
  );
}