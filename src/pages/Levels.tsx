import { useState, useEffect } from "react";
import { Button } from "@/components/shared/ui/button";
import { FloatingNavbar } from "@/components/shared/floating-navbar";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { levelTiers as staticLevelTiers, getLevelInfo as getStaticLevelInfo } from "@/data/levels";
import { useI18n } from "@/hooks/use-i18n";
import { ArrowLeft, Settings, Filter } from "lucide-react";
import { useProgressionSystem } from "@/hooks/use-progression-system";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProfile } from "@/hooks/use-profile";
import { LevelHeroSection } from "@/components/features/levels/level-hero-section";
import { LevelCategoryView } from "@/components/features/levels/level-category-view";
import { LevelStatsPanel } from "@/components/features/levels/level-stats-panel";

export default function Levels() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { levelTiers: dbLevelTiers, getNextLevelXP } = useProgressionSystem();
  const { profile, loading } = useProfile();
  const isMobile = useIsMobile();

  // Derived data
  const user = profile ? {
    level: profile.level,
    xp: profile.xp,
    streak: profile.streak || 0,
    avatar_url: profile.profile_image_url,
    nickname: profile.nickname
  } : null;

  const currentLevelInfo = user ? getStaticLevelInfo(user.level) : { name: "", description: "" };
  const nextLevelXP = user ? (getNextLevelXP ? getNextLevelXP(user.level) : user.level * 100) : 0;

  if (loading) {
    return (
      <div className={`min-h-screen bg-background flex items-center justify-center ${isMobile ? 'pb-24' : 'pb-20'}`} 
           style={isMobile ? { paddingTop: 'env(safe-area-inset-top, 20px)' } : {}}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`min-h-screen bg-background flex items-center justify-center ${isMobile ? 'pb-24' : 'pb-20'}`}>
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Não foi possível carregar seus dados</p>
          <Button onClick={() => navigate('/dashboard')}>
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background overflow-x-hidden ${isMobile ? 'pb-28' : 'pb-20'}`} 
         style={isMobile ? { paddingTop: 'max(env(safe-area-inset-top, 0px), 20px)' } : {}}>
      
      {/* Header */}
      <div className={`${isMobile ? 'px-3 py-3 pt-6' : 'px-6 py-6'}`}>
        <div className={`mx-auto ${isMobile ? 'max-w-full' : 'max-w-7xl'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size={isMobile ? "sm" : "sm"} onClick={() => navigate('/dashboard')}>
                <ArrowLeft className={`${isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'} mr-1`} />
                {isMobile ? 'Voltar' : 'Dashboard'}
              </Button>
              <h1 className={`font-bold text-foreground ${isMobile ? 'text-lg' : 'text-2xl'}`}>
                {isMobile ? 'Níveis' : 'Níveis & Progressão'}
              </h1>
            </div>
            
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="sm">
                <Filter className={`${isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
                {!isMobile && <span className="ml-1">Filtrar</span>}
              </Button>
              <Button variant="outline" size="sm">
                <Settings className={`${isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
                {!isMobile && <span className="ml-1">Config</span>}
              </Button>
            </div>
          </div>

          {/* Hero Section */}
          <LevelHeroSection 
            user={user}
            currentLevelInfo={currentLevelInfo}
            nextLevelXP={nextLevelXP}
            className={isMobile ? "mb-6" : "mb-8"}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className={`mx-auto ${isMobile ? 'max-w-full px-3' : 'max-w-7xl px-6'}`}>
        {isMobile ? (
          // Mobile Layout: Single Column
          <div className="space-y-4">
            <LevelCategoryView 
              levels={staticLevelTiers}
              userLevel={user.level}
              userXP={user.xp}
              getNextLevelXP={getNextLevelXP}
            />
          </div>
        ) : (
          // Desktop Layout: Three Columns
          <div className="grid grid-cols-12 gap-6">
            {/* Left: Quick Stats */}
            <div className="col-span-3">
              <LevelStatsPanel 
                user={user}
                totalLevels={100}
                averageXPPerLevel={150}
                estimatedTimeToNext="2-3 dias"
              />
            </div>
            
            {/* Center: Main Level Grid */}
            <div className="col-span-6">
              <LevelCategoryView 
                levels={staticLevelTiers}
                userLevel={user.level}
                userXP={user.xp}
                getNextLevelXP={getNextLevelXP}
              />
            </div>
            
            {/* Right: Additional Info */}
            <div className="col-span-3">
              <div className="space-y-4">
                {/* Quick Tips */}
                <div className="bg-card rounded-lg p-4 border">
                  <h3 className="font-semibold mb-3">💡 Dicas Rápidas</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• Complete quizzes diários para ganhar XP</p>
                    <p>• Mantenha seu streak para bônus</p>
                    <p>• Participe de desafios especiais</p>
                    <p>• Convide amigos para ganhar recompensas</p>
                  </div>
                </div>

                {/* Next Rewards */}
                <div className="bg-card rounded-lg p-4 border">
                  <h3 className="font-semibold mb-3">🎁 Próximas Recompensas</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Nível {user.level + 1}</span>
                      <span className="text-primary">+50 BTZ</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Nível {user.level + 5}</span>
                      <span className="text-secondary">Badge Especial</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Nível {user.level + 10}</span>
                      <span className="text-accent">Funcionalidade Nova</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <FloatingNavbar />
    </div>
  );
}
