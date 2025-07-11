import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FloatingNavbar } from "@/components/floating-navbar";
import { SatoshiCity3D } from "@/components/satoshi-city-3d";
import { PowerBar } from "@/components/ui/power-bar";
import { Building, Users, Zap, TrendingUp, GraduationCap, Bitcoin, Banknote, Home, Globe, Cpu, Swords, Shield, Star, Trophy, Crown, Timer, Target, Users2, Flame, Box } from "lucide-react";
import satoshiCityMap from "@/assets/satoshi-city-map.jpg";
import satoshiCityDay from "@/assets/satoshi-city-day-illuminated.jpg";
import satoshiCitySunset from "@/assets/satoshi-city-sunset-illuminated.jpg";
import satoshiCityNight from "@/assets/satoshi-city-night-illuminated.jpg";
import xpLogo from "@/assets/districts/xp-investimentos-logo.jpg";
import animaLogo from "@/assets/districts/anima-educacao-logo.jpg";
import criptoLogo from "@/assets/districts/cripto-valley-logo.jpg";
import bankingLogo from "@/assets/districts/banking-sector-logo.jpg";
import realEstateLogo from "@/assets/districts/real-estate-logo.jpg";
import tradeLogo from "@/assets/districts/international-trade-logo.jpg";
import fintechLogo from "@/assets/districts/tech-finance-logo.jpg";

interface District {
  id: string;
  name: string;
  description: string;
  theme: string;
  color_primary: string;
  color_secondary: string;
  level_required: number;
  is_active: boolean;
  power_level: number;
  battles_won: number;
  battles_lost: number;
  sponsor_company: string;
  sponsor_logo_url: string;
  referral_link: string;
  special_power: string;
}

interface UserDistrict {
  district_id: string;
  level: number;
  xp: number;
  is_residence: boolean;
  residence_started_at: string | null;
  daily_streak: number;
  last_activity_date: string;
}

const districtIcons = {
  renda_variavel: TrendingUp,
  educacao_financeira: GraduationCap,
  criptomoedas: Bitcoin,
  sistema_bancario: Banknote,
  fundos_imobiliarios: Home,
  mercado_internacional: Globe,
  fintech: Cpu,
};

const districtLogos = {
  renda_variavel: xpLogo,
  educacao_financeira: animaLogo,
  criptomoedas: criptoLogo,
  sistema_bancario: bankingLogo,
  fundos_imobiliarios: realEstateLogo,
  mercado_internacional: tradeLogo,
  fintech: fintechLogo,
};

// Posições dos distritos no mapa (coordenadas em %)
const districtPositions = {
  renda_variavel: { x: 25, y: 35 },
  educacao_financeira: { x: 75, y: 25 },
  criptomoedas: { x: 15, y: 70 },
  sistema_bancario: { x: 50, y: 40 },
  fundos_imobiliarios: { x: 85, y: 60 },
  mercado_internacional: { x: 35, y: 15 },
  fintech: { x: 65, y: 75 },
};

export default function SatoshiCity() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [userDistricts, setUserDistricts] = useState<UserDistrict[]>([]);
  const [districtXPData, setDistrictXPData] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [currentCityImage, setCurrentCityImage] = useState(satoshiCityNight);
  const [is3DMode, setIs3DMode] = useState(false);
  const navigate = useNavigate();

  // Memoize the city image function
  const getCityImageByTime = useCallback(() => {
    const hour = new Date().getHours();
    
    if (hour >= 6 && hour < 18) {
      return satoshiCityDay; // Day: 6AM to 6PM
    } else if (hour >= 18 && hour < 20) {
      return satoshiCitySunset; // Sunset: 6PM to 8PM
    } else {
      return satoshiCityNight; // Night: 8PM to 6AM
    }
  }, []);

  useEffect(() => {
    // Set initial image based on current time
    setCurrentCityImage(getCityImageByTime());
    
    // Update image every minute
    const interval = setInterval(() => {
      setCurrentCityImage(getCityImageByTime());
    }, 60000);

    loadDistricts();
    loadUserDistricts();

    return () => clearInterval(interval);
  }, [getCityImageByTime]);

  const loadDistrictXPData = useCallback(async () => {
    try {
      const xpData: Record<string, number> = {};
      
      for (const district of districts) {
        // Get all user IDs who are residents of this district
        const { data: residents, error: residentsError } = await supabase
          .from('user_districts')
          .select('user_id')
          .eq('district_id', district.id)
          .eq('is_residence', true);

        if (residentsError) {
          console.error(`Error loading residents for district ${district.id}:`, residentsError);
          xpData[district.id] = 0;
          continue;
        }

        if (!residents || residents.length === 0) {
          xpData[district.id] = 0;
          continue;
        }

        // Get XP for all residents
        const userIds = residents.map(r => r.user_id);
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('xp')
          .in('id', userIds);

        if (profilesError) {
          console.error(`Error loading profiles for district ${district.id}:`, profilesError);
          xpData[district.id] = 0;
          continue;
        }

        // Sum up all XP from residents
        const totalXP = profiles?.reduce((sum, profile) => {
          return sum + (profile.xp || 0);
        }, 0) || 0;

        xpData[district.id] = totalXP;
      }
      
      setDistrictXPData(xpData);
    } catch (error) {
      console.error('Error loading district XP data:', error);
    }
  }, [districts]);

  // Load district XP data after districts are loaded
  useEffect(() => {
    if (districts.length > 0) {
      loadDistrictXPData();
    }
  }, [districts, loadDistrictXPData]);

  const loadDistricts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('districts')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setDistricts(data || []);
    } catch (error) {
      console.error('Error loading districts:', error);
    }
  }, []);

  const loadUserDistricts = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const { data, error } = await supabase
        .from('user_districts')
        .select('*')
        .eq('user_id', profile.id);

      if (error) throw error;
      setUserDistricts(data || []);
    } catch (error) {
      console.error('Error loading user districts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserDistrictInfo = useCallback((districtId: string) => {
    return userDistricts.find(ud => ud.district_id === districtId);
  }, [userDistricts]);

  const getCurrentResidence = useCallback(() => {
    return userDistricts.find(ud => ud.is_residence);
  }, [userDistricts]);

  const handleChangeResidence = useCallback(async (districtId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/welcome');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      // Verificar se já mora neste distrito
      const currentResidence = getCurrentResidence();
      if (currentResidence?.district_id === districtId) {
        return; // Já mora aqui
      }

      // Remover residência atual se existir
      if (currentResidence) {
        await supabase
          .from('user_districts')
          .update({ 
            is_residence: false, 
            residence_started_at: null 
          })
          .eq('user_id', profile.id)
          .eq('is_residence', true);
      }

      // Verificar se já explorou este distrito
      const existingDistrict = userDistricts.find(ud => ud.district_id === districtId);
      
      if (existingDistrict) {
        // Atualizar distrito existente para residência
        await supabase
          .from('user_districts')
          .update({ 
            is_residence: true, 
            residence_started_at: new Date().toISOString(),
            daily_streak: 0,
            last_activity_date: new Date().toISOString().split('T')[0]
          })
          .eq('user_id', profile.id)
          .eq('district_id', districtId);
      } else {
        // Criar nova entrada para o distrito
        await supabase
          .from('user_districts')
          .insert({
            user_id: profile.id,
            district_id: districtId,
            is_residence: true,
            residence_started_at: new Date().toISOString(),
            daily_streak: 0,
            last_activity_date: new Date().toISOString().split('T')[0]
          });
      }
      
      loadUserDistricts();
      loadDistrictXPData(); // Reload XP data after residence change
    } catch (error) {
      console.error('Error changing residence:', error);
    }
  }, [navigate, getCurrentResidence, userDistricts, loadUserDistricts, loadDistrictXPData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando Satoshi City...</p>
        </div>
      </div>
    );
  }

  // Renderizar modo 3D
  if (is3DMode) {
    return <SatoshiCity3D onBack={() => setIs3DMode(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Dynamic Cyberpunk City Background */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 z-0"
        style={{ 
          backgroundImage: `url(${currentCityImage})`,
          filter: 'brightness(0.6) contrast(1.3)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-slate-900/50"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 container mx-auto px-4 pt-0 text-center">
        <div className="flex justify-center mb-4">
          <img 
            src="/lovable-uploads/da61d87e-9d37-454b-bdeb-b54db4abfa9e.png" 
            alt="Satoshi City Logo" 
            className="h-72 w-auto"
          />
        </div>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Bem-vindo à cidade do futuro financeiro. 
          Clique nos distritos para explorar conhecimento.
        </p>
        <div className="flex justify-center space-x-4 mb-6">
          <Badge variant="outline" className="border-cyan-400 text-cyan-400">
            7 Distritos Ativos
          </Badge>
          <Badge variant="outline" className="border-purple-400 text-purple-400">
            Sistema Neural Ativo
          </Badge>
        </div>
        
        {/* Botão para modo 3D - Temporariamente desabilitado */}
        <div className="flex justify-center">
          <Button
            disabled
            className="bg-gray-500 text-gray-300 font-medium px-6 py-3 rounded-full shadow-lg cursor-not-allowed opacity-60"
          >
            <Box className="w-5 h-5 mr-2" />
            3D em Desenvolvimento
          </Button>
        </div>
      </div>

      {/* Interactive City Map - Mobile Optimized */}
      <div className="relative z-10 container mx-auto px-4 py-8 pb-24">
        <div className="relative w-full max-w-6xl mx-auto min-h-[400px] sm:min-h-[600px]" style={{ paddingBottom: '56.25%' }}>
          {districts.map((district) => {
            const position = districtPositions[district.theme as keyof typeof districtPositions];
            const userInfo = getUserDistrictInfo(district.id);
            const IconComponent = districtIcons[district.theme as keyof typeof districtIcons] || Building;
            const districtLogo = district.sponsor_logo_url || districtLogos[district.theme as keyof typeof districtLogos];
            const districtTotalXP = districtXPData[district.id] || 0;
            const maxXP = 20000000; // 20 million XP max
            const powerLevel = Math.min(100, Math.round((districtTotalXP / maxXP) * 100));
            const battleWinRate = district.battles_won + district.battles_lost > 0 
              ? Math.round((district.battles_won / (district.battles_won + district.battles_lost)) * 100)
              : 100;
            
            if (!position) return null;
            
            return (
                <div
                  key={district.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-20"
                  style={{ 
                    left: `${position.x}%`, 
                    top: `${position.y}%` 
                  }}
                  onClick={() => navigate(`/satoshi-city/district/${district.id}`)}
                >
                {/* Dynamic Power Aura - Mobile Optimized */}
                <div 
                  className={`absolute inset-0 rounded-full transition-all duration-500 ${
                    powerLevel > 80 ? 'animate-pulse opacity-80' : powerLevel > 50 ? 'opacity-60' : 'opacity-40'
                  }`}
                  style={{
                    boxShadow: `0 0 ${20 + (powerLevel * 0.3)}px ${district.color_primary}${Math.round(powerLevel * 2.55).toString(16).padStart(2, '0')}`,
                    width: `${40 + (powerLevel * 0.3)}px`,
                    height: `${40 + (powerLevel * 0.3)}px`,
                    transform: 'translate(-50%, -50%)'
                  }}
                ></div>
                
                {/* District Core - Mobile Optimized */}
                <div 
                  className={`relative w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 sm:border-4 flex items-center justify-center transition-all duration-300 hover:scale-110 backdrop-blur-sm ${
                    userInfo?.is_residence ? 'ring-2 sm:ring-4 ring-yellow-400 ring-opacity-60 animate-pulse' : ''
                  } ${powerLevel < 30 ? 'opacity-75 grayscale' : ''}`}
                  style={{
                    borderColor: district.color_primary,
                    backgroundColor: `${district.color_primary}${Math.round(powerLevel * 0.8).toString(16).padStart(2, '0')}`,
                    boxShadow: `0 0 15px ${district.color_primary}60`
                  }}
                >
                  {districtLogo ? (
                    <img 
                      src={districtLogo} 
                      alt={district.name}
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
                    />
                  ) : (
                    <IconComponent 
                      className="w-6 h-6 sm:w-8 sm:h-8" 
                      style={{ color: district.color_primary }}
                    />
                  )}
                  
                  {/* Residence Crown */}
                  {userInfo?.is_residence && (
                    <div className="absolute -top-1 -right-1 text-yellow-400">
                      <Crown className="w-4 h-4" />
                    </div>
                  )}

                  {/* Battle Status */}
                  {district.battles_won > 0 && (
                    <div className="absolute -top-2 -left-2 bg-green-500 rounded-full w-5 h-5 flex items-center justify-center">
                      <Trophy className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>

                {/* Power Level Bar */}
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 w-20">
                  <PowerBar
                    currentPower={districtTotalXP}
                    maxPower={maxXP}
                    label="XP Total"
                    color={district.color_primary}
                    showPercentage={false}
                    className="scale-75"
                  />
                </div>

                {/* Compact District Hover Card - Mobile Hidden */}
                <div className="absolute left-1/2 transform -translate-x-1/2 top-16 sm:top-20 opacity-0 group-hover:opacity-100 transition-all duration-300 z-50 pointer-events-none group-hover:pointer-events-auto hidden sm:block">
                  <Card 
                    className="w-48 sm:w-64 border-2 bg-slate-800/95 backdrop-blur-sm shadow-2xl"
                    style={{ borderColor: district.color_primary }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <div 
                          className="w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: district.color_primary }}
                        >
                          <IconComponent className="w-4 h-4 text-white" />
                        </div>
                        <CardTitle className="text-sm text-white">{district.name}</CardTitle>
                        {userInfo?.is_residence && (
                          <Badge variant="outline" className="text-xs border-yellow-400 text-yellow-400 ml-auto">
                            <Crown className="w-3 h-3 mr-1" />
                            Casa
                          </Badge>
                        )}
                      </div>
                      
                      <CardDescription className="text-xs text-gray-300">
                        {district.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      {/* Simple Action Button */}
                      <div 
                        className="pointer-events-auto"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {userInfo?.is_residence ? (
                          <div className="text-xs text-center text-yellow-400 font-medium p-2 bg-yellow-400/10 rounded">
                            ✨ Esta é sua residência atual
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            className="w-full text-xs font-medium"
                            style={{ 
                              backgroundColor: district.color_primary,
                              color: 'white'
                            }}
                            onClick={() => handleChangeResidence(district.id)}
                          >
                            <Home className="w-3 h-3 mr-1" />
                            Morar Aqui
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* User Level Badge */}
                {userInfo && (
                  <div 
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-black shadow-lg"
                    style={{ backgroundColor: district.color_primary }}
                  >
                    {userInfo.level}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <FloatingNavbar />
    </div>
  );
}
