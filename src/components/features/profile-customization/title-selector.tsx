import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Button } from '@/components/shared/ui/button';
import { Badge } from '@/components/shared/ui/badge';
import { Check, Crown, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/use-profile';
import { toast } from '@/hooks/use-toast';

interface ProfileTitle {
  id: string;
  title: string;
  description: string;
  unlock_requirement: any;
  rarity: string;
  color_scheme: any;
  is_animated: boolean;
  animation_type: string | null;
  is_owned: boolean;
  is_active: boolean;
}

export function TitleSelector() {
  const { profile } = useProfile();
  const [titles, setTitles] = useState<ProfileTitle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTitle, setActiveTitle] = useState<ProfileTitle | null>(null);

  useEffect(() => {
    loadTitles();
  }, [profile]);

  const loadTitles = async () => {
    try {
      if (!profile) return;

      // Buscar todos os títulos
      const { data: allTitles } = await supabase
        .from('profile_titles')
        .select('*')
        .eq('is_active', true);

      // Buscar títulos do usuário
      const { data: userTitles } = await supabase
        .from('user_profile_titles')
        .select('title_id, is_active')
        .eq('user_id', profile.id);

      const ownedTitleIds = userTitles?.map(ut => ut.title_id) || [];
      const activeTitleId = userTitles?.find(ut => ut.is_active)?.title_id;

      const titlesWithOwnership = allTitles?.map(title => ({
        ...title,
        is_owned: ownedTitleIds.includes(title.id) || checkUnlockRequirement(title as any),
        is_active: title.id === activeTitleId
      })) as ProfileTitle[] || [];

      setTitles(titlesWithOwnership);
      
      const active = titlesWithOwnership.find(t => t.is_active);
      setActiveTitle(active || null);

    } catch (error) {
      console.error('Error loading titles:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkUnlockRequirement = (title: ProfileTitle) => {
    if (!profile || !title.unlock_requirement) return false;

    const req = title.unlock_requirement;
    
    switch (req.type) {
      case 'level':
        return profile.level >= req.value;
      case 'streak':
        return profile.streak >= req.value;
      case 'points':
        return profile.points >= req.value;
      case 'quiz_perfect':
        // TODO: implementar lógica para quizzes perfeitos
        return false;
      default:
        return false;
    }
  };

  const unlockTitle = async (title: ProfileTitle) => {
    if (!profile || !checkUnlockRequirement(title)) return;

    try {
      const { error } = await supabase
        .from('user_profile_titles')
        .insert({
          user_id: profile.id,
          title_id: title.id,
          unlock_method: 'achievement'
        });

      if (error) throw error;

      toast({
        title: "Título desbloqueado! 🏆",
        description: `Você conquistou o título "${title.title}"!`
      });

      loadTitles();
    } catch (error) {
      console.error('Error unlocking title:', error);
      toast({
        title: "Erro ao desbloquear",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    }
  };

  const activateTitle = async (title: ProfileTitle) => {
    if (!profile || !title.is_owned) return;

    try {
      // Desativar todos os títulos
      await supabase
        .from('user_profile_titles')
        .update({ is_active: false })
        .eq('user_id', profile.id);

      // Ativar o título selecionado
      const { error } = await supabase
        .from('user_profile_titles')
        .update({ is_active: true })
        .eq('user_id', profile.id)
        .eq('title_id', title.id);

      if (error) throw error;

      // Atualizar perfil
      await supabase
        .from('profiles')
        .update({ active_title_id: title.id })
        .eq('id', profile.id);

      toast({
        title: "Título ativado!",
        description: `"${title.title}" agora é seu título ativo!`
      });

      loadTitles();
    } catch (error) {
      console.error('Error activating title:', error);
      toast({
        title: "Erro ao ativar",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    }
  };

  const deactivateTitle = async () => {
    if (!profile) return;

    try {
      // Desativar todos os títulos
      await supabase
        .from('user_profile_titles')
        .update({ is_active: false })
        .eq('user_id', profile.id);

      // Remover título ativo do perfil
      await supabase
        .from('profiles')
        .update({ active_title_id: null })
        .eq('id', profile.id);

      toast({
        title: "Título removido",
        description: "Nenhum título está ativo no seu perfil."
      });

      loadTitles();
    } catch (error) {
      console.error('Error deactivating title:', error);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'uncommon': return 'bg-green-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getUnlockText = (title: ProfileTitle) => {
    if (!title.unlock_requirement) return '';

    const req = title.unlock_requirement;
    
    switch (req.type) {
      case 'level':
        return `Nível ${req.value}`;
      case 'streak':
        return `${req.value} dias de streak`;
      case 'points':
        return `${req.value} BTZ`;
      case 'quiz_perfect':
        return `${req.value} quizzes perfeitos`;
      default:
        return 'Requisito especial';
    }
  };

  const getTitleStyle = (title: ProfileTitle) => {
    const baseStyle = {
      color: title.color_scheme?.primary || '#ffffff',
      textShadow: `0 0 10px ${title.color_scheme?.secondary || '#000000'}`
    };

    if (title.is_animated && title.animation_type) {
      switch (title.animation_type) {
        case 'glow':
          return {
            ...baseStyle,
            animation: 'titleGlow 2s ease-in-out infinite alternate'
          };
        case 'pulse':
          return {
            ...baseStyle,
            animation: 'titlePulse 1.5s ease-in-out infinite'
          };
        case 'rainbow':
          return {
            ...baseStyle,
            animation: 'titleRainbow 3s linear infinite'
          };
        default:
          return baseStyle;
      }
    }

    return baseStyle;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Carregando títulos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* CSS Animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes titleGlow {
            from { 
              filter: brightness(1) drop-shadow(0 0 5px currentColor);
            }
            to { 
              filter: brightness(1.3) drop-shadow(0 0 15px currentColor);
            }
          }

          @keyframes titlePulse {
            0%, 100% { 
              transform: scale(1);
            }
            50% { 
              transform: scale(1.05);
            }
          }

          @keyframes titleRainbow {
            0% { filter: hue-rotate(0deg); }
            100% { filter: hue-rotate(360deg); }
          }
        `
      }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Títulos de Perfil
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Título Ativo */}
          {activeTitle && (
            <div className="mb-6 p-4 border rounded-lg bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium mb-1">Título Ativo</h3>
                  <p 
                    className="text-lg font-bold"
                    style={getTitleStyle(activeTitle)}
                  >
                    {activeTitle.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activeTitle.description}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={deactivateTitle}
                >
                  Remover
                </Button>
              </div>
            </div>
          )}

          {/* Títulos Desbloqueados */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3">Títulos Desbloqueados</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {titles.filter(t => t.is_owned).map(title => (
                <Card
                  key={title.id}
                  className={`cursor-pointer transition-all hover:scale-105 ${
                    title.is_active ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => !title.is_active && activateTitle(title)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p 
                          className="font-medium"
                          style={getTitleStyle(title)}
                        >
                          {title.title}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {title.description}
                        </p>
                        <Badge
                          variant="secondary"
                          className={`text-xs mt-1 ${getRarityColor(title.rarity)} text-white`}
                        >
                          {title.rarity}
                        </Badge>
                      </div>
                      {title.is_active && (
                        <Check className="h-4 w-4 text-primary ml-2" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Títulos Bloqueados */}
          <div>
            <h3 className="text-sm font-medium mb-3">Títulos Bloqueados</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {titles.filter(t => !t.is_owned).map(title => {
                const canUnlock = checkUnlockRequirement(title);

                return (
                  <Card
                    key={title.id}
                    className={`transition-all ${canUnlock ? 'cursor-pointer hover:scale-105' : 'opacity-60'}`}
                    onClick={() => canUnlock && unlockTitle(title)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-muted-foreground">
                            {title.title}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {title.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant="secondary"
                              className={`text-xs ${getRarityColor(title.rarity)} text-white`}
                            >
                              {title.rarity}
                            </Badge>
                            <span className={`text-xs ${canUnlock ? 'text-green-600' : 'text-muted-foreground'}`}>
                              {getUnlockText(title)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-2">
                          {canUnlock ? (
                            <Button size="sm">
                              Desbloquear
                            </Button>
                          ) : (
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}