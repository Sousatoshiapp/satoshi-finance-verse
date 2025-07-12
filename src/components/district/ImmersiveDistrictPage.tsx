import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { DistrictBackground } from './DistrictBackground';
import { DistrictCircleActions } from './DistrictCircleActions';
import { DistrictStatsCard } from './DistrictStatsCard';
import { useDistrictStats } from '@/hooks/use-district-stats';
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
  const { stats, loading: statsLoading } = useDistrictStats(districtId);

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

      // Member count will come from stats hook
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
      <div className="min-h-screen w-full overflow-auto bg-gray-900">
        {/* Background dinâmico */}
        <DistrictBackground districtTheme={district.theme} className="fixed inset-0 z-0" />

        {/* Container principal */}
        <div className="relative z-10 min-h-screen pb-32 flex flex-col">
          {/* Header com botão voltar */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="p-6"
          >
            <Button
              onClick={handleBack}
              variant="ghost"
              size="lg"
              className="bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 border border-white/20"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar à Cidade
            </Button>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="px-6 mb-8"
          >
            <div className="flex flex-wrap gap-4 justify-center">
              <DistrictStatsCard
                title="BTZ Total"
                value={stats.totalBTZ}
                suffix="BTZ"
                icon="B"
                loading={statsLoading}
              />
              <DistrictStatsCard
                title="XP Total"
                value={stats.totalXP}
                suffix="XP"
                icon="X"
                loading={statsLoading}
              />
              <DistrictStatsCard
                title="Poder do Distrito"
                value={stats.totalBTZ}
                suffix="BTZ"
                icon="⚡"
                rank={stats.rank}
                loading={statsLoading}
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
            <div className="flex flex-wrap gap-4 justify-center">
              {!userDistrict ? (
                <Button
                  onClick={handleJoinDistrict}
                  className="bg-[#adff2f] hover:bg-[#adff2f]/90 text-black font-semibold px-6 py-3"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Virar Membro
                </Button>
              ) : (
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg px-6 py-3">
                  <p className="text-green-300 font-medium">
                    ✓ Você é membro deste distrito
                  </p>
                </div>
              )}

              <Button
                onClick={handleViewMembers}
                variant="outline"
                className="border-[#adff2f] text-[#adff2f] hover:bg-[#adff2f]/10 font-semibold px-6 py-3"
              >
                <Users className="w-4 h-4 mr-2" />
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
    </>
  );
};