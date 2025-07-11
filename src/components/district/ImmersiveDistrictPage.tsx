import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, UserPlus, Crown, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DistrictBackground } from './DistrictBackground';
import { DistrictCircleActions } from './DistrictCircleActions';
import { useSponsorTheme } from '@/contexts/SponsorThemeProvider';
import { FloatingNavbar } from '@/components/floating-navbar';

interface District {
  id: string;
  name: string;
  description: string;
  theme: string;
  color_primary: string;
  color_secondary: string;
  level_required: number;
  power_level: number;
  sponsor_company: string;
  referral_link: string;
  special_power: string;
}

interface UserDistrict {
  level: number;
  xp: number;
  is_residence: boolean;
}

export const ImmersiveDistrictPage: React.FC = () => {
  const { districtId } = useParams();
  const navigate = useNavigate();
  const [district, setDistrict] = useState<District | null>(null);
  const [userDistrict, setUserDistrict] = useState<UserDistrict | null>(null);
  const [loading, setLoading] = useState(true);
  const [memberCount, setMemberCount] = useState(0);
  const { getTheme } = useSponsorTheme();

  useEffect(() => {
    loadDistrictData();
  }, [districtId]);

  const loadDistrictData = async () => {
    if (!districtId) return;

    try {
      // Carregar dados do distrito
      const { data: districtData, error: districtError } = await supabase
        .from('districts')
        .select('*')
        .eq('id', districtId)
        .single();

      if (districtError) throw districtError;
      setDistrict(districtData);

      // Carregar dados do usuário no distrito
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userDistrictData } = await supabase
          .from('user_districts')
          .select('*')
          .eq('user_id', user.id)
          .eq('district_id', districtId)
          .single();

        setUserDistrict(userDistrictData);
      }

      // Carregar contagem de membros
      const { count } = await supabase
        .from('user_districts')
        .select('*', { count: 'exact' })
        .eq('district_id', districtId);

      setMemberCount(count || 0);
    } catch (error) {
      console.error('Erro ao carregar dados do distrito:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinDistrict = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !district) return;

    try {
      const { error } = await supabase
        .from('user_districts')
        .upsert({
          user_id: user.id,
          district_id: district.id,
          level: 1,
          xp: 0,
          is_residence: false,
        });

      if (error) throw error;
      
      // Recarregar dados
      loadDistrictData();
    } catch (error) {
      console.error('Erro ao se juntar ao distrito:', error);
    }
  };

  const handleViewMembers = () => {
    navigate(`/district/${districtId}/residents`);
  };

  const handleBack = () => {
    navigate('/satoshi-city');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-gray-800 border-t-[#adff2f] rounded-full"
        />
      </div>
    );
  }

  if (!district) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Distrito não encontrado</h2>
          <Button onClick={handleBack} variant="outline">
            Voltar à Cidade
          </Button>
        </div>
      </div>
    );
  }

  const theme = getTheme(district.theme);

  return (
    <>
      <FloatingNavbar />
      <div className="min-h-screen w-full overflow-auto bg-gray-900">
        {/* Background dinâmico */}
        <DistrictBackground districtTheme={district.theme} className="fixed inset-0 z-0" />

        {/* Container com scroll - Estrutura flex vertical */}
        <div className="relative z-10 min-h-screen pb-32 flex flex-col">{/* pb-32 para espaço do navbar */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute top-0 left-0 right-0 z-30 p-6"
        >
          <div className="flex items-center justify-between">
            <Button
              onClick={handleBack}
              variant="ghost"
              size="lg"
              className="bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 border border-white/20"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar à Cidade
            </Button>

            <div className="flex items-center gap-4">
              <Badge 
                className="bg-black/40 backdrop-blur-sm text-white border border-white/20 px-4 py-2"
              >
                <MapPin className="w-4 h-4 mr-2" />
                {district.name}
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Layout principal - Grid responsivo */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 pt-24">
          
          {/* Informações do distrito - Card compacto */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-black/20 backdrop-blur-lg rounded-xl p-4 border border-white/20 max-w-sm">
              <div className="flex items-center gap-3 mb-3">
                <img 
                  src={theme.logoUrl} 
                  alt={theme.name}
                  className="w-12 h-12 rounded-lg object-cover border-2 border-white/20"
                />
                <div>
                  <h1 className="text-lg font-bold text-white mb-1">{theme.name}</h1>
                  <p className="text-white/70 text-xs leading-tight">{district.description}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                <Badge variant="secondary" className="bg-white/10 text-white border-white/20 text-xs px-2 py-1">
                  <Crown className="w-3 h-3 mr-1" />
                  Nível {district.level_required}+
                </Badge>
                <Badge variant="secondary" className="bg-white/10 text-white border-white/20 text-xs px-2 py-1">
                  <Users className="w-3 h-3 mr-1" />
                  {memberCount} membros
                </Badge>
              </div>

              <div className="space-y-2">
                {!userDistrict ? (
                  <Button
                    onClick={handleJoinDistrict}
                    className="w-full text-sm py-2"
                    style={{ 
                      backgroundColor: theme.primaryColor,
                      borderColor: theme.accentColor 
                    }}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Virar Membro
                  </Button>
                ) : (
                  <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
                    <p className="text-green-300 text-sm font-medium">
                      ✓ Você é membro deste distrito
                    </p>
                    <p className="text-green-200/70 text-xs">
                      Nível {userDistrict.level} • {userDistrict.xp} XP
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleViewMembers}
                  variant="outline"
                  className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 text-sm py-2"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Ver Time
                </Button>

                {district.referral_link && (
                  <Button
                    onClick={() => window.open(district.referral_link, '_blank')}
                    variant="outline"
                    className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 text-sm py-2"
                  >
                    Acessar Portal
                  </Button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Círculos de ação - Centro */}
          <div className="lg:col-span-2 flex items-center justify-center">
            <DistrictCircleActions 
              districtTheme={district.theme}
              districtId={district.id}
              userLevel={userDistrict?.level}
            />
          </div>
        </div>

        {/* Rodapé com informações especiais */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-auto p-6"
        >
          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/20 max-w-md mx-auto text-center">
            <h3 className="text-white font-semibold mb-2">Poder Especial</h3>
            <p className="text-white/70 text-sm">{district.special_power}</p>
          </div>
        </motion.div>
        </div>
      </div>
    </>
  );
};