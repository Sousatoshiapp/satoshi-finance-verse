import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, UserPlus, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { DistrictBackground } from './DistrictBackground';
import { DistrictCircleActions } from './DistrictCircleActions';
import { DistrictStatsCard } from './DistrictStatsCard';
import { useDistrictStats } from '@/hooks/use-district-stats';
import { FloatingNavbar } from '@/components/floating-navbar';
import { useCrisisState } from '@/hooks/use-crisis-state';
import { CrisisEmergencyModal } from '@/components/crisis/CrisisEmergencyModal';
// District logos
import xpLogo from "@/assets/xp-logo.png";
import animaLogo from "@/assets/districts/anima-educacao-logo.jpg";
import criptoLogo from "@/assets/districts/cripto-valley-logo.jpg";
import bankingLogo from "@/assets/districts/banking-sector-logo.jpg";
import realEstateLogo from "@/assets/districts/real-estate-logo.jpg";
import tradeLogo from "@/assets/districts/international-trade-logo.jpg";
import fintechLogo from "@/assets/districts/tech-finance-logo.jpg";

// District backgrounds - dynamic time-based backgrounds (using Unsplash placeholders)
const morningBg = "https://images.unsplash.com/photo-1500673922987-e212871fec22"; // yellow lights between trees - morning
const sunsetBg = "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05"; // foggy mountain summit - sunset  
const nightBg = "https://images.unsplash.com/photo-1470813740244-df37b8c1edcb"; // blue starry night

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

// Mapeamento de logos por tema do distrito
const districtLogos = {
  renda_variavel: xpLogo,
  educacao_financeira: animaLogo,
  criptomoedas: criptoLogo,
  sistema_bancario: bankingLogo,
  fundos_imobiliarios: realEstateLogo,
  mercado_internacional: tradeLogo,
  fintech: fintechLogo,
};

export const ImmersiveDistrictPage: React.FC = () => {
  const { districtId } = useParams();
  const navigate = useNavigate();
  const [district, setDistrict] = useState<District | null>(null);
  const [userDistrict, setUserDistrict] = useState<UserDistrict | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [crisisModalOpen, setCrisisModalOpen] = useState(false);
  const { stats, loading: statsLoading } = useDistrictStats(districtId);
  const { crisis, shouldShowBanner, shouldShowIcon, openBanner } = useCrisisState();

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

      // Carregar dados do usuário no distrito e perfil
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userDistrictData } = await supabase
          .from('user_districts')
          .select('*')
          .eq('user_id', user.id)
          .eq('district_id', districtId)
          .single();

        setUserDistrict(userDistrictData);

        // Carregar perfil do usuário
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        setUserProfile(profileData);
      }

      // Member count will come from stats hook
    } catch (error) {
      console.error('Erro ao carregar dados do distrito:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para determinar o fundo baseado na hora
  const getCurrentBackground = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 18) {
      return morningBg;
    } else if (hour >= 18 && hour < 21) {
      return sunsetBg;
    } else {
      return nightBg;
    }
  };

  const handleCrisisClick = () => {
    setCrisisModalOpen(true);
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
      
      // Reload data
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

  return (
    <>
      <FloatingNavbar />
      <div className="min-h-screen w-full overflow-auto bg-gray-900 relative">
        {/* Background dinâmico baseado na hora */}
        <div 
          className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${getCurrentBackground()})` }}
        />
        
        {/* Overlay de emergência se houver crise ativa */}
        {crisis && (
          <div className="fixed inset-0 z-5 bg-red-900/20 animate-pulse pointer-events-none" />
        )}

        {/* Container principal */}
        <div className="relative z-10 min-h-screen pb-32 flex flex-col">
          {/* Header com botão voltar, logo do distrito e alerta de crise */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="p-6 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <Button
                onClick={handleBack}
                variant="ghost"
                size="lg"
                className="bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 border border-white/20"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Voltar à Cidade
              </Button>
              
              {/* Logo circular do distrito */}
              {district && (
                <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20">
                  <img 
                    src={districtLogos[district.theme as keyof typeof districtLogos]} 
                    alt={district.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Ícone de alerta de crise */}
            {shouldShowIcon && (
              <Button
                onClick={handleCrisisClick}
                variant="ghost"
                size="sm"
                className="bg-red-600/80 hover:bg-red-600 text-white border border-red-500 animate-pulse"
              >
                <AlertTriangle className="w-5 h-5" />
              </Button>
            )}
          </motion.div>

          {/* Badge de estado de emergência */}
          {crisis && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="px-6 mb-4"
            >
              <div 
                onClick={handleCrisisClick}
                className="mx-auto max-w-fit bg-red-600/90 backdrop-blur-sm border border-red-500 rounded-full px-4 py-2 cursor-pointer hover:bg-red-600 transition-colors animate-pulse"
              >
                <p className="text-white font-bold text-sm text-center">
                  🚨 ESTADO DE EMERGÊNCIA ATIVO - CLIQUE PARA AJUDAR
                </p>
              </div>
            </motion.div>
          )}

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="px-6 mb-8"
          >
            <div className="grid grid-cols-3 gap-1 md:gap-4 max-w-sm md:max-w-lg mx-auto">
              <DistrictStatsCard
                title="BTZ Total"
                value={stats.totalBTZ}
                suffix="BTZ"
                icon="B"
                loading={statsLoading}
                className="min-w-[100px] md:min-w-[160px] text-xs md:text-sm"
              />
              <DistrictStatsCard
                title="XP Total"
                value={stats.totalXP}
                suffix="XP"
                icon="X"
                loading={statsLoading}
                className="min-w-[100px] md:min-w-[160px] text-xs md:text-sm"
              />
              <DistrictStatsCard
                title="Poder"
                value={stats.rank}
                suffix=""
                icon="⚡"
                showRank={true}
                loading={statsLoading}
                className="min-w-[100px] md:min-w-[160px] text-xs md:text-sm"
              />
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="px-6 mb-8"
          >
            <div className="flex gap-2 justify-center items-center max-w-xs mx-auto">
              {!userDistrict ? (
                <Button
                  onClick={handleJoinDistrict}
                  className="bg-[#adff2f] hover:bg-[#adff2f]/90 text-black font-semibold px-3 py-2 text-xs flex-1"
                >
                  <UserPlus className="w-3 h-3 mr-1" />
                  Virar Membro
                </Button>
              ) : (
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg px-3 py-2 flex-1 text-center">
                  <p className="text-green-300 font-medium text-xs">
                    ✓ Membro
                  </p>
                </div>
              )}

              <Button
                onClick={handleViewMembers}
                variant="outline"
                className="border-[#adff2f] text-[#adff2f] hover:bg-[#adff2f]/10 font-semibold px-3 py-2 text-xs flex-1"
              >
                <Users className="w-3 h-3 mr-1" />
                Ver Time
              </Button>
            </div>
          </motion.div>

          {/* Círculos de ação - Centro */}
          <div className="flex-1 flex items-center justify-center px-6">
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

      {/* Modal de emergência de crise */}
      {crisis && userProfile && (
        <CrisisEmergencyModal
          isOpen={crisisModalOpen}
          onClose={() => setCrisisModalOpen(false)}
          crisis={{
            id: crisis.id,
            title: crisis.title,
            description: crisis.description,
            end_time: crisis.end_time,
            total_btz_goal: crisis.total_btz_goal,
            total_xp_goal: crisis.total_xp_goal,
            current_btz_contributions: crisis.current_btz_contributions,
            current_xp_contributions: crisis.current_xp_contributions
          }}
          userBtz={userProfile.points || 0}
          userXp={userProfile.xp || 0}
          onContributionSuccess={() => {
            loadDistrictData(); // Recarregar dados após contribuição
            setCrisisModalOpen(false);
          }}
        />
      )}
    </>
  );
};