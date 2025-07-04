import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FloatingNavbar } from "@/components/floating-navbar";
import { Building, Users, Zap, TrendingUp, GraduationCap, Bitcoin, Banknote, Home, Globe, Cpu } from "lucide-react";
import satoshiCityMap from "@/assets/satoshi-city-map.jpg";
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
}

interface UserDistrict {
  district_id: string;
  level: number;
  xp: number;
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
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDistricts();
    loadUserDistricts();
  }, []);

  const loadDistricts = async () => {
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
  };

  const loadUserDistricts = async () => {
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
  };

  const getUserDistrictInfo = (districtId: string) => {
    return userDistricts.find(ud => ud.district_id === districtId);
  };

  const handleJoinDistrict = async (districtId: string) => {
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

      const { error } = await supabase
        .from('user_districts')
        .insert({
          user_id: profile.id,
          district_id: districtId
        });

      if (error) throw error;
      
      loadUserDistricts();
    } catch (error) {
      console.error('Error joining district:', error);
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Cyberpunk City Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${satoshiCityMap})`,
          filter: 'brightness(0.4) contrast(1.2)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-slate-900/60"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 container mx-auto px-4 py-8 text-center">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          SATOSHI CITY
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Bem-vindo à cidade cyberpunk do futuro financeiro. 
          Clique nos distritos para explorar conhecimento.
        </p>
        <div className="flex justify-center space-x-4">
          <Badge variant="outline" className="border-cyan-400 text-cyan-400">
            7 Distritos Ativos
          </Badge>
          <Badge variant="outline" className="border-purple-400 text-purple-400">
            Sistema Neural Ativo
          </Badge>
        </div>
      </div>

      {/* Interactive City Map */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="relative w-full max-w-6xl mx-auto" style={{ paddingBottom: '56.25%' }}>
          {districts.map((district) => {
            const position = districtPositions[district.theme as keyof typeof districtPositions];
            const userInfo = getUserDistrictInfo(district.id);
            const IconComponent = districtIcons[district.theme as keyof typeof districtIcons] || Building;
            const districtLogo = districtLogos[district.theme as keyof typeof districtLogos];
            
            if (!position) return null;
            
            return (
              <div
                key={district.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                style={{ 
                  left: `${position.x}%`, 
                  top: `${position.y}%` 
                }}
                onClick={() => navigate(`/satoshi-city/district/${district.id}`)}
              >
                {/* District Glow Effect */}
                <div 
                  className="absolute inset-0 rounded-full opacity-60 group-hover:opacity-100 transition-all duration-300 animate-pulse"
                  style={{
                    boxShadow: `0 0 30px ${district.color_primary}`,
                    width: '80px',
                    height: '80px',
                    transform: 'translate(-50%, -50%)'
                  }}
                ></div>
                
                {/* District Point */}
                <div 
                  className="relative w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all duration-300 hover:scale-110 backdrop-blur-sm"
                  style={{
                    borderColor: district.color_primary,
                    backgroundColor: `${district.color_primary}20`,
                    boxShadow: `0 0 20px ${district.color_primary}40`
                  }}
                >
                  {districtLogo ? (
                    <img 
                      src={districtLogo} 
                      alt={district.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <IconComponent 
                      className="w-8 h-8" 
                      style={{ color: district.color_primary }}
                    />
                  )}
                </div>

                {/* District Info Tooltip */}
                <div className="absolute left-1/2 transform -translate-x-1/2 top-20 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                  <Card 
                    className="w-64 border-2 bg-slate-800/90 backdrop-blur-sm"
                    style={{ borderColor: district.color_primary }}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-white">{district.name}</CardTitle>
                      <CardDescription className="text-xs text-gray-300">
                        {district.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {userInfo ? (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Nível {userInfo.level}</span>
                            <span style={{ color: district.color_primary }}>
                              {userInfo.xp} XP
                            </span>
                          </div>
                          <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all"
                              style={{ 
                                backgroundColor: district.color_primary,
                                width: `${Math.min(100, (userInfo.xp % 1000) / 10)}%`
                              }}
                            ></div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400">Clique para explorar</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* User Level Badge */}
                {userInfo && (
                  <div 
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-black"
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

      {/* City Stats */}
      <div className="relative z-10 container mx-auto px-4 py-8 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="bg-slate-800/50 backdrop-blur-sm border border-cyan-400/30">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-cyan-400 mb-2">
                {userDistricts.length}
              </div>
              <p className="text-gray-300">Distritos Explorados</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 backdrop-blur-sm border border-purple-400/30">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {userDistricts.reduce((sum, ud) => sum + ud.xp, 0)}
              </div>
              <p className="text-gray-300">XP Total da Cidade</p>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 backdrop-blur-sm border border-pink-400/30">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-pink-400 mb-2">
                {Math.floor(userDistricts.reduce((sum, ud) => sum + ud.xp, 0) / 1000) + userDistricts.length}
              </div>
              <p className="text-gray-300">Nível Médio</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <FloatingNavbar />
    </div>
  );
}