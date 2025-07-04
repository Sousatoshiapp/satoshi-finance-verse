import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FloatingNavbar } from "@/components/floating-navbar";
import { Building, Users, Zap, TrendingUp, GraduationCap, Bitcoin, Banknote, Home, Globe, Cpu } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Cyberpunk Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10"></div>
        <div className="relative container mx-auto px-4 py-16 text-center">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            SATOSHI CITY
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Bem-vindo à cidade cyberpunk do futuro financeiro. 
            Escolha seu distrito, forme alianças e domine o conhecimento.
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
      </div>

      {/* Districts Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {districts.map((district) => {
            const IconComponent = districtIcons[district.theme as keyof typeof districtIcons] || Building;
            const userInfo = getUserDistrictInfo(district.id);
            
            return (
              <Card 
                key={district.id} 
                className="group relative overflow-hidden border-2 bg-slate-800/50 backdrop-blur-sm hover:scale-105 transition-all duration-300 cursor-pointer"
                style={{
                  borderColor: district.color_primary,
                  boxShadow: `0 0 20px ${district.color_primary}20`
                }}
                onClick={() => navigate(`/satoshi-city/district/${district.id}`)}
              >
                <div 
                  className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity"
                  style={{
                    background: `linear-gradient(135deg, ${district.color_primary}20, ${district.color_secondary}20)`
                  }}
                ></div>
                
                <CardHeader className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <IconComponent 
                      className="h-8 w-8" 
                      style={{ color: district.color_primary }}
                    />
                    {userInfo && (
                      <Badge 
                        className="text-xs"
                        style={{ 
                          backgroundColor: district.color_primary + '20',
                          color: district.color_primary,
                          border: `1px solid ${district.color_primary}`
                        }}
                      >
                        Nível {userInfo.level}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all">
                    {district.name}
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    {district.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="relative">
                  {userInfo ? (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">XP Progress</span>
                        <span style={{ color: district.color_primary }}>
                          {userInfo.xp} XP
                        </span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-300"
                          style={{ 
                            backgroundColor: district.color_primary,
                            width: `${Math.min(100, (userInfo.xp % 1000) / 10)}%`
                          }}
                        ></div>
                      </div>
                      <Button 
                        className="w-full mt-4 text-black font-bold"
                        style={{ 
                          backgroundColor: district.color_primary,
                        }}
                      >
                        Entrar no Distrito
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJoinDistrict(district.id);
                      }}
                      className="w-full text-black font-bold"
                      style={{ 
                        backgroundColor: district.color_primary,
                      }}
                    >
                      Juntar-se ao Distrito
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <FloatingNavbar />
    </div>
  );
}