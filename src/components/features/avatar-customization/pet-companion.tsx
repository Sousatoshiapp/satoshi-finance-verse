import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Button } from '@/components/shared/ui/button';
import { Badge } from '@/components/shared/ui/badge';
import { Progress } from '@/components/shared/ui/progress';
import { Heart, Star, Zap, Gift } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/use-profile';
import { toast } from '@/hooks/use-toast';

interface Pet {
  id: string;
  name: string;
  species: string;
  evolution_stage: number;
  evolution_name: string;
  image_url: string;
  unlock_streak_required: number;
  special_abilities: any;
  rarity: string;
}

interface UserPet {
  id: string;
  pet_id: string;
  current_evolution: number;
  is_active: boolean;
  nickname: string | null;
  acquired_at: string;
  pet: Pet;
}

export function PetCompanion() {
  const { profile } = useProfile();
  const [userPets, setUserPets] = useState<UserPet[]>([]);
  const [availablePets, setAvailablePets] = useState<Pet[]>([]);
  const [activePet, setActivePet] = useState<UserPet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPets();
  }, [profile]);

  const loadPets = async () => {
    try {
      if (!profile) return;

      // Buscar pets do usuário
      const { data: userPetsData } = await supabase
        .from('user_pets')
        .select(`
          *,
          pet:avatar_pets(*)
        `)
        .eq('user_id', profile.id);

      // Buscar todos os pets disponíveis
      const { data: allPets } = await supabase
        .from('avatar_pets')
        .select('*')
        .eq('is_active', true)
        .order('unlock_streak_required');

      setUserPets(userPetsData || []);
      setAvailablePets(allPets || []);
      
      // Encontrar pet ativo
      const active = userPetsData?.find(p => p.is_active);
      setActivePet(active || null);

    } catch (error) {
      console.error('Error loading pets:', error);
    } finally {
      setLoading(false);
    }
  };

  const unlockPet = async (pet: Pet) => {
    if (!profile) return;

    if (profile.streak < pet.unlock_streak_required) {
      toast({
        title: "Streak insuficiente",
        description: `Você precisa de ${pet.unlock_streak_required} dias de streak para desbloquear este pet!`,
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('user_pets')
        .insert({
          user_id: profile.id,
          pet_id: pet.id,
          current_evolution: 1,
          is_active: userPets.length === 0 // Se é o primeiro pet, ativar automaticamente
        });

      if (error) throw error;

      toast({
        title: "Pet desbloqueado! 🎉",
        description: `${pet.name} agora é seu companheiro!`
      });

      loadPets();
    } catch (error) {
      console.error('Error unlocking pet:', error);
      toast({
        title: "Erro ao desbloquear",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    }
  };

  const activatePet = async (userPet: UserPet) => {
    if (!profile) return;

    try {
      // Desativar todos os pets
      await supabase
        .from('user_pets')
        .update({ is_active: false })
        .eq('user_id', profile.id);

      // Ativar o pet selecionado
      const { error } = await supabase
        .from('user_pets')
        .update({ is_active: true })
        .eq('id', userPet.id);

      if (error) throw error;

      toast({
        title: "Pet ativado!",
        description: `${userPet.pet.name} agora é seu companheiro ativo!`
      });

      loadPets();
    } catch (error) {
      console.error('Error activating pet:', error);
      toast({
        title: "Erro ao ativar",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    }
  };

  const checkEvolution = (userPet: UserPet) => {
    if (!profile) return false;
    
    const currentStreak = profile.streak;
    const nextEvolutionRequirement = userPet.pet.unlock_streak_required + (userPet.current_evolution * 14);
    
    return currentStreak >= nextEvolutionRequirement && userPet.current_evolution < 3;
  };

  const evolvePet = async (userPet: UserPet) => {
    if (!profile || !checkEvolution(userPet)) return;

    try {
      const { error } = await supabase
        .from('user_pets')
        .update({ 
          current_evolution: userPet.current_evolution + 1,
          evolution_date: new Date().toISOString()
        })
        .eq('id', userPet.id);

      if (error) throw error;

      toast({
        title: "Pet evoluiu! ✨",
        description: `${userPet.pet.name} evoluiu para o próximo estágio!`
      });

      loadPets();
    } catch (error) {
      console.error('Error evolving pet:', error);
      toast({
        title: "Erro na evolução",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
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

  const getEvolutionProgress = (userPet: UserPet) => {
    if (!profile) return 0;
    
    const currentStreak = profile.streak;
    const currentRequirement = userPet.pet.unlock_streak_required + ((userPet.current_evolution - 1) * 14);
    const nextRequirement = userPet.pet.unlock_streak_required + (userPet.current_evolution * 14);
    
    if (userPet.current_evolution >= 3) return 100;
    
    const progress = ((currentStreak - currentRequirement) / (nextRequirement - currentRequirement)) * 100;
    return Math.max(0, Math.min(100, progress));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Carregando pets...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pet Ativo */}
      {activePet && (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Seu Companheiro Ativo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center text-2xl">
                🐱
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">{activePet.pet.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Evolução {activePet.current_evolution}/3 • {activePet.pet.evolution_name}
                </p>
                <Badge
                  variant="secondary"
                  className={`text-xs mt-1 ${getRarityColor(activePet.pet.rarity)} text-white`}
                >
                  {activePet.pet.rarity}
                </Badge>
                
                {activePet.current_evolution < 3 && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span>Progresso da evolução</span>
                      <span>{Math.round(getEvolutionProgress(activePet))}%</span>
                    </div>
                    <Progress value={getEvolutionProgress(activePet)} className="h-2" />
                    {checkEvolution(activePet) && (
                      <Button
                        size="sm"
                        onClick={() => evolvePet(activePet)}
                        className="mt-2"
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        Evoluir Pet
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Meus Pets */}
      {userPets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Meus Pets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userPets.map(userPet => (
                <Card
                  key={userPet.id}
                  className={`cursor-pointer transition-all hover:scale-105 ${
                    userPet.is_active ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => !userPet.is_active && activatePet(userPet)}
                >
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center text-2xl mx-auto mb-2">
                        🐱
                      </div>
                      <h4 className="font-medium">{userPet.pet.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        Evolução {userPet.current_evolution}/3
                      </p>
                      {userPet.is_active && (
                        <Badge variant="default" className="mt-1">
                          Ativo
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pets Disponíveis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Pets Disponíveis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availablePets
              .filter(pet => !userPets.some(up => up.pet_id === pet.id))
              .map(pet => (
                <Card
                  key={pet.id}
                  className="cursor-pointer transition-all hover:scale-105"
                  onClick={() => unlockPet(pet)}
                >
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center text-2xl mx-auto mb-2">
                        🐱
                      </div>
                      <h4 className="font-medium">{pet.name}</h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        {pet.evolution_name}
                      </p>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${getRarityColor(pet.rarity)} text-white`}
                      >
                        {pet.rarity}
                      </Badge>
                      <div className="mt-2 text-xs">
                        <span className={`${
                          profile && profile.streak >= pet.unlock_streak_required
                            ? 'text-green-600'
                            : 'text-muted-foreground'
                        }`}>
                          Requer {pet.unlock_streak_required} dias de streak
                        </span>
                      </div>
                      {profile && profile.streak >= pet.unlock_streak_required && (
                        <Button size="sm" className="mt-2">
                          Desbloquear
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}