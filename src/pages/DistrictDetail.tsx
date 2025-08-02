import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { Progress } from "@/components/shared/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/shared/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shared/ui/select";
import { PowerBar } from "@/components/shared/ui/power-bar";
import { DistrictPowerBars } from "@/components/district/DistrictPowerBars";
import { FloatingNavbar } from "@/components/shared/floating-navbar";
import { ArrowLeft, Users, Trophy, BookOpen, Zap, Crown, Medal, Star, Swords, Target, Flame, ShoppingBag, Timer, ExternalLink, Building, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/hooks/use-i18n";
import { DistrictCrisisCard } from "@/components/crisis/DistrictCrisisCard";
import { CrisisAlert } from "@/components/crisis/CrisisAlert";
import { CrisisEmergencyModal } from "@/components/crisis/CrisisEmergencyModal";
import { useCrisisState } from "@/hooks/use-crisis-state";
import { useCrisisData } from "@/hooks/use-crisis-data";
import { CrisisIcon } from "@/components/crisis/CrisisIcon";
import xpLogo from "@/assets/xp-logo.png";
import animaLogo from "@/assets/districts/anima-educacao-logo.jpg";
import criptoLogo from "@/assets/districts/cripto-valley-logo.jpg";
import bankingLogo from "@/assets/districts/banking-sector-logo.jpg";
import realEstateLogo from "@/assets/districts/real-estate-logo.jpg";
import tradeLogo from "@/assets/districts/international-trade-logo.jpg";
import fintechLogo from "@/assets/districts/tech-finance-logo.jpg";
// XP District Images
import xpMorning from "@/assets/districts/xp-morning.jpg";
import xpSunset from "@/assets/districts/xp-sunset.jpg";
import xpNight from "@/assets/districts/xp-night.jpg";

// Anima District Images
import animaMorning from "@/assets/districts/anima-morning.jpg";
import animaSunset from "@/assets/districts/anima-sunset.jpg";
import animaNight from "@/assets/districts/anima-night.jpg";

// Crypto District Images
import cryptoMorning from "@/assets/districts/crypto-morning.jpg";
import cryptoSunset from "@/assets/districts/crypto-sunset.jpg";
import cryptoNight from "@/assets/districts/crypto-night.jpg";

// Banking District Images
import bankingMorning from "@/assets/districts/banking-morning.jpg";
import bankingSunset from "@/assets/districts/banking-sunset.jpg";
import bankingNight from "@/assets/districts/banking-night.jpg";

// Real Estate District Images
import realEstateMorning from "@/assets/districts/realestate-morning.jpg";
import realEstateSunset from "@/assets/districts/realestate-sunset.jpg";
import realEstateNight from "@/assets/districts/realestate-night.jpg";

// International Trade District Images
import internationalMorning from "@/assets/districts/international-morning.jpg";
import internationalSunset from "@/assets/districts/international-sunset.jpg";
import internationalNight from "@/assets/districts/international-night.jpg";

// Fintech District Images
import fintechMorning from "@/assets/districts/fintech-morning.jpg";
import fintechSunset from "@/assets/districts/fintech-sunset.jpg";
import fintechNight from "@/assets/districts/fintech-night.jpg";

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
  monetary_power?: number;
  tech_power?: number;
  military_power?: number;
  energy_power?: number;
  commercial_power?: number;
  social_power?: number;
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

// Function to get district image based on theme and time of day
const getDistrictImage = (districtTheme: string) => {
  const currentTime = new Date();
  const hour = currentTime.getHours();
  
  let timeOfDay;
  if (hour >= 6 && hour < 18) {
    timeOfDay = 'morning';
  } else if (hour >= 18 && hour < 21) {
    timeOfDay = 'sunset';
  } else {
    timeOfDay = 'night';
  }

  const imageMap = {
    renda_variavel: {
      morning: xpMorning,
      sunset: xpSunset,
      night: xpNight,
    },
    educacao_financeira: {
      morning: animaMorning,
      sunset: animaSunset,
      night: animaNight,
    },
    criptomoedas: {
      morning: cryptoMorning,
      sunset: cryptoSunset,
      night: cryptoNight,
    },
    sistema_bancario: {
      morning: bankingMorning,
      sunset: bankingSunset,
      night: bankingNight,
    },
    fundos_imobiliarios: {
      morning: realEstateMorning,
      sunset: realEstateSunset,
      night: realEstateNight,
    },
    mercado_internacional: {
      morning: internationalMorning,
      sunset: internationalSunset,
      night: internationalNight,
    },
    fintech: {
      morning: fintechMorning,
      sunset: fintechSunset,
      night: fintechNight,
    },
  };

  return imageMap[districtTheme as keyof typeof imageMap]?.[timeOfDay] || xpMorning;
};

export default function DistrictDetail() {
  const { districtId } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
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
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [userBtz, setUserBtz] = useState(0);
  const [userXp, setUserXp] = useState(0);
  
  const { toast } = useToast();
  const { data: crisis } = useCrisisData();
  const { shouldShowBanner, shouldShowIcon, dismissBanner, markAsContributed, openBanner, crisis: crisisData } = useCrisisState();
  
  console.log('🚨 DistrictDetail crisis state:', { 
    crisis: !!crisis, 
    shouldShowIcon, 
    shouldShowBanner, 
    crisisData: !!crisisData,
    loading: !crisis && !crisisData 
  });

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
          
          // Get user profile data including BTZ and XP
          const { data: userProfileData } = await supabase
            .from('profiles')
            .select('points, xp')
            .eq('id', profile.id)
            .single();
          
          if (userProfileData) {
            setUserBtz(userProfileData.points || 0);
            setUserXp(userProfileData.xp || 0);
          }
          
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
  const district3DImage = getDistrictImage(district.theme);
  const battleWinRate = district.battles_won + district.battles_lost > 0 
    ? Math.round((district.battles_won / (district.battles_won + district.battles_lost)) * 100)
    : 0;
  
  const maxPowerInNetwork = Math.max(...allDistrictsPower.map(d => d.power), 1);
  const districtRanking = allDistrictsPower.findIndex(d => d.id === districtId) + 1;

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: `url(${district3DImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Full screen overlay */}
      <div className={`absolute inset-0 ${crisis ? 'bg-gradient-to-br from-red-900/80 via-slate-900/80 to-red-900/60' : 'bg-gradient-to-br from-slate-900/85 via-purple-900/75 to-slate-900/85'}`}></div>
      {/* Crisis Emergency Overlay */}
      {crisis && (
        <div className="fixed inset-0 bg-red-900/10 pointer-events-none z-10">
          {/* Top emergency bar */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-pulse"></div>
          
          {/* Crisis alert badge with clickable action */}
          <div className="absolute top-4 left-4 z-20">
            <div 
              className="flex items-center space-x-2 bg-red-900/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-red-500/50 animate-pulse cursor-pointer hover:bg-red-800/80 transition-colors pointer-events-auto"
              onClick={() => setShowEmergencyModal(true)}
            >
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <span className="text-red-200 text-sm font-medium">ESTADO DE EMERGÊNCIA ATIVO</span>
              <span className="text-red-300 text-xs">Clique para ajudar</span>
            </div>
          </div>
          
          {/* Floating alert particles */}
          <div className="absolute inset-0">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-red-400 rounded-full animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Hero Header */}
      <div className="relative overflow-hidden h-64 sm:h-80 z-20">
        {/* Overlay for better text readability */}
        <div className={`absolute inset-0 ${crisis ? 'bg-gradient-to-t from-red-900/60 via-slate-900/40 to-red-900/20' : 'bg-gradient-to-t from-slate-900/60 via-slate-900/30 to-transparent'}`}></div>
        
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: crisis 
              ? `linear-gradient(135deg, #ef444420, ${district.color_primary}20)` 
              : `linear-gradient(135deg, ${district.color_primary}20, ${district.color_secondary}20)`
          }}
        ></div>
        
        <div className="relative container mx-auto px-4 py-6 h-full flex flex-col">
          {/* Header with Back Button and Crisis Icon */}
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/satoshi-city')}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar à Cidade
            </Button>
            
            {shouldShowIcon && (
              <div className="relative">
                <CrisisIcon onClick={() => {
                  console.log('🚨 District CrisisIcon clicked, opening emergency modal');
                  setShowEmergencyModal(true);
                }} />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
              </div>
            )}
          </div>

          {/* District Info */}
          <div className="flex-1 flex items-center">
            <div className="flex items-center space-x-6">
              <div 
                className={`w-20 h-20 rounded-xl flex items-center justify-center border-4 ${crisis ? 'animate-pulse' : ''}`}
                style={{ 
                  borderColor: crisis ? '#ef4444' : district.color_primary,
                  backgroundColor: crisis ? '#ef444440' : `${district.color_primary}40`,
                  boxShadow: crisis ? `0 0 20px #ef444460` : undefined
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

      {/* District Power Bars */}
      <div className="container mx-auto px-4 py-6 relative z-20">
        <DistrictPowerBars 
          district={district}
          className="mb-8"
        />

        {/* District Stats */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Zap className="w-5 h-5" style={{ color: district.color_primary }} />
                Estatísticas do Distrito
              </span>
              <Badge variant="outline">
                #{districtRanking} no Ranking
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
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

        {/* Crisis Alert Banner */}
        {shouldShowBanner && (
          <div className="mb-6">
            <CrisisAlert 
              crisis={crisisData}
              shouldShowBanner={shouldShowBanner}
              onDismiss={dismissBanner} 
              onContributed={markAsContributed} 
            />
          </div>
        )}

        {/* Crisis Alert for District - Only show when crisis is active */}
        {crisis && <DistrictCrisisCard districtId={districtId || ""} />}

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
      
      {/* Crisis Emergency Modal */}
      {crisis && (
        <CrisisEmergencyModal
          isOpen={showEmergencyModal}
          onClose={() => setShowEmergencyModal(false)}
          crisis={crisis}
          userBtz={userBtz}
          userXp={userXp}
          onContributionSuccess={() => {
            // Reload user data after contribution
            loadDistrictData();
          }}
        />
      )}
    </div>
  );
}
