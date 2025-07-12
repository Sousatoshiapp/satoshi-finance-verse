import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PowerBar } from "@/components/ui/power-bar";
import { FloatingNavbar } from "@/components/floating-navbar";
import { ArrowLeft, Users, Trophy, BookOpen, Zap, Crown, Medal, Star, Swords, Target, Flame, ShoppingBag, Timer, ExternalLink, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import xpLogo from "@/assets/xp-logo.png";
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

interface UserDistrict {
  level: number;
  xp: number;
  is_residence: boolean;
}

interface Resident {
  id: string;
  nickname: string;
  level: number;
  xp: number;
  profile_image_url?: string;
}

interface DistrictDuel {
  id: string;
  initiator_district: { name: string };
  challenged_district: { name: string };
  status: string;
  participants_count_initiator: number;
  participants_count_challenged: number;
  average_score_initiator: number;
  average_score_challenged: number;
  winner_district_id: string | null;
  end_time: string;
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
  const [userDistrict, setUserDistrict] = useState<UserDistrict | null>(null);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const [allDistricts, setAllDistricts] = useState<District[]>([]);
  const [activeDuels, setActiveDuels] = useState<DistrictDuel[]>([]);
  const [targetDistrictId, setTargetDistrictId] = useState('');
  const [isInitiatingDuel, setIsInitiatingDuel] = useState(false);
  const [storeItems, setStoreItems] = useState<any[]>([]);
  const [districtPower, setDistrictPower] = useState(0);
  const [allDistrictsPower, setAllDistrictsPower] = useState<any[]>([]);
  
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

      // Load actual residents of this district
      const { data: userDistrictsData } = await supabase
        .from('user_districts')
        .select('user_id')
        .eq('district_id', districtId)
        .eq('is_residence', true);

      let residentsData = [];
      let totalDistrictXP = 0;

      if (userDistrictsData && userDistrictsData.length > 0) {
        // Get profiles for district residents
        const userIds = userDistrictsData.map(ud => ud.user_id);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, nickname, profile_image_url, level, xp')
          .in('id', userIds)
          .order('xp', { ascending: false });

        if (profilesData) {
          residentsData = profilesData.map(profile => ({
            id: profile.id,
            nickname: profile.nickname || 'Usuário',
            level: profile.level || 1,
            xp: profile.xp || 0,
            profile_image_url: profile.profile_image_url
          }));
          
          totalDistrictXP = residentsData.reduce((sum, resident) => sum + resident.xp, 0);
        }
      } else {
        // Fallback: use top profiles if no district residents found
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, nickname, profile_image_url, level, xp')
          .order('xp', { ascending: false })
          .limit(20);

        if (profilesData) {
          residentsData = profilesData.map(profile => ({
            id: profile.id,
            nickname: profile.nickname || 'Usuário',
            level: profile.level || 1,
            xp: profile.xp || 0,
            profile_image_url: profile.profile_image_url
          }));
          
          totalDistrictXP = residentsData.reduce((sum, resident) => sum + resident.xp, 0);
        }
      }
      
      setResidents(residentsData);
      setDistrictPower(totalDistrictXP);

      // Calculate ranking among all districts
      const { data: allDistrictsData } = await supabase
        .from('districts')
        .select('id, name');

      if (allDistrictsData) {
        const districtPowerMap = await Promise.all(
          allDistrictsData.map(async (dist) => {
            // Get users for this district
            const { data: districtUsers } = await supabase
              .from('user_districts')
              .select('user_id')
              .eq('district_id', dist.id)
              .eq('is_residence', true);

            if (districtUsers && districtUsers.length > 0) {
              const userIds = districtUsers.map(du => du.user_id);
              const { data: districtProfiles } = await supabase
                .from('profiles')
                .select('xp')
                .in('id', userIds);

              const districtXP = districtProfiles?.reduce((sum, profile) => 
                sum + (profile.xp || 0), 0) || 0;

              return { id: dist.id, power: districtXP, name: dist.name };
            }

            return { id: dist.id, power: 0, name: dist.name };
          })
        );

        // Sort by power descending
        const sortedDistricts = districtPowerMap.sort((a, b) => b.power - a.power);
        setAllDistrictsPower(sortedDistricts);
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
          
          const { data: userDistrictData } = await supabase
            .from('user_districts')
            .select('*')
            .eq('user_id', profile.id)
            .eq('district_id', districtId)
            .single();

          if (userDistrictData) {
            setUserDistrict({
              level: userDistrictData.level || 1,
              xp: userDistrictData.xp || 0,
              is_residence: userDistrictData.is_residence || false
            });
          }
        }
      }

      // Load all districts for duels
      const { data: districtsData } = await supabase
        .from('districts')
        .select('*')
        .neq('id', districtId)
        .eq('is_active', true);
      
      setAllDistricts(districtsData || []);

      // Load active duels
      const { data: duelsData } = await supabase
        .from('district_duels')
        .select(`
          *,
          initiator_district:districts!district_duels_initiator_district_id_fkey(name),
          challenged_district:districts!district_duels_challenged_district_id_fkey(name)
        `)
        .or(`initiator_district_id.eq.${districtId},challenged_district_id.eq.${districtId}`)
        .in('status', ['pending', 'active'])
        .order('created_at', { ascending: false })
        .limit(5);

      setActiveDuels(duelsData || []);

      // Load store items
      const { data: itemsData } = await supabase
        .from('district_store_items')
        .select('*')
        .eq('district_id', districtId)
        .eq('is_available', true)
        .limit(6);

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

  const handleDistrictQuiz = () => {
    navigate(`/quiz/district/${districtId}`);
  };

  const handleInitiateDuel = async () => {
    if (!targetDistrictId || !currentProfile) {
      toast({
        title: "Erro",
        description: "Selecione um distrito para desafiar",
        variant: "destructive"
      });
      return;
    }

    setIsInitiatingDuel(true);
    try {
      const { data, error } = await supabase.rpc('start_district_duel', {
        p_initiator_district_id: districtId,
        p_challenged_district_id: targetDistrictId
      });

      if (error) throw error;

      toast({
        title: "Duelo Iniciado!",
        description: "O distrito foi desafiado! O duelo começou e durará 24 horas.",
        duration: 5000
      });

      setTargetDistrictId('');
      loadDistrictData(); // Reload duels
    } catch (error) {
      console.error('Erro ao iniciar duelo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar o duelo",
        variant: "destructive"
      });
    } finally {
      setIsInitiatingDuel(false);
    }
  };

  const handleJoinDuel = (duelId: string) => {
    navigate(`/district-duel/${duelId}`);
  };

  const handleViewResidents = () => {
    navigate(`/district/${districtId}/residents`);
  };

  const handleViewStore = () => {
    // Implementar navegação para loja do distrito
    toast({
      title: "Em breve!",
      description: "A loja do distrito estará disponível em breve"
    });
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

  const districtLogo = districtLogos[district.theme as keyof typeof districtLogos];
  const district3DImage = district3DImages[district.theme as keyof typeof district3DImages];
  const battleWinRate = district.battles_won + district.battles_lost > 0 
    ? Math.round((district.battles_won / (district.battles_won + district.battles_lost)) * 100)
    : 0;
  
  const maxPowerInNetwork = Math.max(...allDistrictsPower.map(d => d.power), 1);
  const districtRanking = allDistrictsPower.findIndex(d => d.id === districtId) + 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Header */}
      <div className="relative overflow-hidden h-64 sm:h-80">
        {/* Background Image */}
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
        
        <div className="relative container mx-auto px-4 py-6 h-full flex flex-col">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate('/satoshi-city')}
            className="self-start mb-4 text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar à Cidade
          </Button>

          {/* District Info */}
          <div className="flex-1 flex items-center">
            <div className="flex items-center space-x-6">
              <div 
                className="w-20 h-20 rounded-xl flex items-center justify-center border-4"
                style={{ 
                  borderColor: district.color_primary,
                  backgroundColor: `${district.color_primary}40`
                }}
              >
                {districtLogo ? (
                  <img 
                    src={districtLogo} 
                    alt={district.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <Building className="w-12 h-12" style={{ color: district.color_primary }} />
                )}
              </div>
              
              <div className="text-white">
                <h1 className="text-3xl font-bold mb-2">{district.name}</h1>
                <p className="text-gray-300 mb-3 max-w-2xl">{district.description}</p>
                
                <div className="flex items-center space-x-4">
                  <Badge 
                    variant="outline" 
                    className="border-white/30 text-white"
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    XP Total: {districtPower.toLocaleString()}
                  </Badge>
                  
                  <Badge 
                    variant="outline" 
                    className="border-white/30 text-white"
                  >
                    <Trophy className="w-3 h-3 mr-1" />
                    {battleWinRate}% Vitórias
                  </Badge>

                  {userDistrict?.is_residence && (
                    <Badge 
                      variant="outline" 
                      className="border-yellow-400 text-yellow-400"
                    >
                      <Crown className="w-3 h-3 mr-1" />
                      Minha Casa
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* District Power Bar */}
      <div className="container mx-auto px-4 py-6">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Zap className="w-5 h-5" style={{ color: district.color_primary }} />
                Poder do Distrito
              </span>
              <Badge variant="outline">
                #{districtRanking} no Ranking
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PowerBar
              currentPower={districtPower}
              maxPower={20000000}
              label={`${districtPower.toLocaleString()} XP`}
              color={district.color_primary}
              showPercentage={false}
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-center text-sm">
              <div>
                <div className="font-semibold">{residents.length}</div>
                <div className="text-muted-foreground">Moradores</div>
              </div>
              <div>
                <div className="font-semibold">{Math.round(districtPower / Math.max(residents.length, 1))}</div>
                <div className="text-muted-foreground">XP Médio</div>
              </div>
              <div>
                <div className="font-semibold">{district.battles_won}</div>
                <div className="text-muted-foreground">Vitórias</div>
              </div>
              <div>
                <div className="font-semibold">{battleWinRate}%</div>
                <div className="text-muted-foreground">Taxa Vitória</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Actions */}
        <div className="grid grid-cols-4 gap-2 mb-8">
          {/* Quiz do Distrito */}
          <Card 
            className="cursor-pointer hover:scale-105 transition-transform border-2 aspect-square"
            style={{ borderColor: district.color_primary }}
            onClick={handleDistrictQuiz}
          >
            <CardContent className="p-2 text-center h-full flex flex-col justify-center">
              <div 
                className="w-6 h-6 rounded-full mx-auto mb-1 flex items-center justify-center"
                style={{ backgroundColor: district.color_primary }}
              >
                <BookOpen className="w-3 h-3 text-white" />
              </div>
              <h3 className="font-semibold text-xs mb-1">Quiz do Distrito</h3>
              <p className="text-xs text-muted-foreground">
                Perguntas temáticas
              </p>
            </CardContent>
          </Card>

          {/* Desafiar Distrito */}
          <Card className="border-2 border-orange-500 aspect-square">
            <CardContent className="p-2 text-center h-full flex flex-col justify-center">
              <div className="w-6 h-6 rounded-full mx-auto mb-1 bg-orange-500 flex items-center justify-center">
                <Swords className="w-3 h-3 text-white" />
              </div>
              <h3 className="font-semibold text-xs mb-1">Desafiar Distrito</h3>
              <p className="text-xs text-muted-foreground mb-1">
                Duelo 20 perguntas
              </p>
              <div className="space-y-1">
                <Select value={targetDistrictId} onValueChange={setTargetDistrictId}>
                  <SelectTrigger className="h-5 text-xs">
                    <SelectValue placeholder="Adversário" />
                  </SelectTrigger>
                  <SelectContent>
                    {allDistricts.map(d => (
                      <SelectItem key={d.id} value={d.id} className="text-xs">{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleInitiateDuel}
                  disabled={!targetDistrictId || isInitiatingDuel}
                  size="sm"
                  className="w-full h-5 text-xs bg-orange-500 hover:bg-orange-600"
                >
                  {isInitiatingDuel ? "..." : "Desafiar"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Ver Moradores */}
          <Card 
            className="cursor-pointer hover:scale-105 transition-transform border-2 border-blue-500 aspect-square"
            onClick={handleViewResidents}
          >
            <CardContent className="p-2 text-center h-full flex flex-col justify-center">
              <div className="w-6 h-6 rounded-full mx-auto mb-1 bg-blue-500 flex items-center justify-center">
                <Users className="w-3 h-3 text-white" />
              </div>
              <h3 className="font-semibold text-xs mb-1">Ver Moradores</h3>
              <p className="text-xs text-muted-foreground mb-1">
                {residents.length} residentes
              </p>
              <div className="flex justify-center -space-x-1">
                {residents.slice(0, 3).map((resident, i) => (
                  <Avatar key={resident.id} className="w-3 h-3 border border-background">
                    <AvatarImage src={resident.profile_image_url} />
                    <AvatarFallback className="text-xs">
                      {resident.nickname.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Loja do Sponsor */}
          <Card 
            className="cursor-pointer hover:scale-105 transition-transform border-2 border-green-500 aspect-square"
            onClick={handleViewStore}
          >
            <CardContent className="p-2 text-center h-full flex flex-col justify-center">
              <div className="w-6 h-6 rounded-full mx-auto mb-1 bg-green-500 flex items-center justify-center">
                <ShoppingBag className="w-3 h-3 text-white" />
              </div>
              <h3 className="font-semibold text-xs mb-1">Loja {district.sponsor_company?.split(' ')[0]}</h3>
              <p className="text-xs text-muted-foreground">
                {storeItems.length} itens exclusivos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Active Duels */}
        {activeDuels.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                Duelos Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeDuels.map(duel => (
                  <div 
                    key={duel.id}
                    className="flex items-center justify-between p-4 bg-muted rounded-lg"
                  >
                    <div>
                      <h3 className="font-semibold">
                        {duel.initiator_district.name} vs {duel.challenged_district.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {duel.participants_count_initiator + duel.participants_count_challenged} participantes
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-sm font-bold">
                          {duel.average_score_initiator.toFixed(1)} vs {duel.average_score_challenged.toFixed(1)}
                        </div>
                        <div className="text-xs text-muted-foreground">Média</div>
                      </div>
                      <Button 
                        onClick={() => handleJoinDuel(duel.id)}
                        className="bg-orange-500 hover:bg-orange-600"
                      >
                        <Target className="w-4 h-4 mr-2" />
                        Participar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ranking dos Moradores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Ranking do Distrito
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {residents.slice(0, 10).map((resident, index) => (
                <div 
                  key={resident.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                      {index + 1}
                    </div>
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={resident.profile_image_url} />
                      <AvatarFallback>{resident.nickname.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{resident.nickname}</p>
                      <p className="text-sm text-muted-foreground">Nível {resident.level}</p>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {resident.xp} XP
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <FloatingNavbar />
    </div>
  );
}