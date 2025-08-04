import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/shared/ui/avatar";
import { Badge } from "@/components/shared/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Check } from "lucide-react";

// Import avatar images
import neoTrader from "@/assets/avatars/neo-trader.jpg";
import cryptoAnalyst from "@/assets/avatars/crypto-analyst.jpg";
import financeHacker from "@/assets/avatars/finance-hacker.jpg";
import investmentScholar from "@/assets/avatars/investment-scholar.jpg";
import quantumBroker from "@/assets/avatars/quantum-broker.jpg";
import defiSamurai from "@/assets/avatars/defi-samurai.jpg";
import theSatoshi from "@/assets/avatars/the-satoshi.jpg";
import neuralArchitect from "@/assets/avatars/neural-architect.jpg";
import dataMiner from "@/assets/avatars/data-miner.jpg";
import blockchainGuardian from "@/assets/avatars/blockchain-guardian.jpg";
import quantumPhysician from "@/assets/avatars/quantum-physician.jpg";
import virtualRealtor from "@/assets/avatars/virtual-realtor.jpg";
import codeAssassin from "@/assets/avatars/code-assassin.jpg";
import cryptoShaman from "@/assets/avatars/crypto-shaman.jpg";
import marketProphet from "@/assets/avatars/market-prophet.jpg";
import digitalNomad from "@/assets/avatars/digital-nomad.jpg";
import neonDetective from "@/assets/avatars/neon-detective.jpg";
import hologramDancer from "@/assets/avatars/hologram-dancer.jpg";
import cyberMechanic from "@/assets/avatars/cyber-mechanic.jpg";
import ghostTrader from "@/assets/avatars/ghost-trader.jpg";
import binaryMonk from "@/assets/avatars/binary-monk.jpg";
import pixelArtist from "@/assets/avatars/pixel-artist.jpg";
import quantumThief from "@/assets/avatars/quantum-thief.jpg";
import memoryKeeper from "@/assets/avatars/memory-keeper.jpg";
import stormHacker from "@/assets/avatars/storm-hacker.jpg";
import dreamArchitect from "@/assets/avatars/dream-architect.jpg";
import chromeGladiator from "@/assets/avatars/chrome-gladiator.jpg";
import satoshiLogo from "/lovable-uploads/f344f3a7-aa34-4a5f-a2e0-8ac072c6aac5.png";

const avatarImages = {
  'neo-trader': neoTrader,
  'crypto-analyst': cryptoAnalyst,
  'finance-hacker': financeHacker,
  'investment-scholar': investmentScholar,
  'quantum-broker': quantumBroker,
  'defi-samurai': defiSamurai,
  'the-satoshi': theSatoshi,
  'neural-architect': neuralArchitect,
  'data-miner': dataMiner,
  'blockchain-guardian': blockchainGuardian,
  'quantum-physician': quantumPhysician,
  'virtual-realtor': virtualRealtor,
  'code-assassin': codeAssassin,
  'crypto-shaman': cryptoShaman,
  'market-prophet': marketProphet,
  'digital-nomad': digitalNomad,
  'neon-detective': neonDetective,
  'hologram-dancer': hologramDancer,
  'cyber-mechanic': cyberMechanic,
  'ghost-trader': ghostTrader,
  'binary-monk': binaryMonk,
  'pixel-artist': pixelArtist,
  'quantum-thief': quantumThief,
  'memory-keeper': memoryKeeper,
  'storm-hacker': stormHacker,
  'dream-architect': dreamArchitect,
  'chrome-gladiator': chromeGladiator,
};

interface AvatarData {
  id: string;
  name: string;
  image_url: string;
  rarity: string;
  is_active: boolean;
}

interface AvatarSelectorProps {
  userProfileId: string;
  currentAvatarId?: string;
  onAvatarChanged: (avatarId: string) => void;
}

export function AvatarSelector({ userProfileId, currentAvatarId, onAvatarChanged }: AvatarSelectorProps) {
  const [ownedAvatars, setOwnedAvatars] = useState<AvatarData[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const { toast } = useToast();

  const getAvatarImage = (avatarName?: string) => {
    if (!avatarName) return satoshiLogo;
    const key = avatarName.toLowerCase().replace(' ', '-') as keyof typeof avatarImages;
    return avatarImages[key] || satoshiLogo;
  };

  useEffect(() => {
    loadOwnedAvatars();
  }, [userProfileId]);

  const loadOwnedAvatars = async () => {
    try {
      // Skip database calls for local users
      if (userProfileId === 'local-user') {
        setOwnedAvatars([]);
        setLoading(false);
        return;
      }

      // First get user's owned avatars
      const { data: userAvatarsData, error: userAvatarsError } = await supabase
        .from('user_avatars')
        .select('avatar_id, is_active')
        .eq('user_id', userProfileId);

      if (userAvatarsError) throw userAvatarsError;

      if (!userAvatarsData || userAvatarsData.length === 0) {
        setOwnedAvatars([]);
        setLoading(false);
        return;
      }

      // Then get avatar details
      const avatarIds = userAvatarsData.map(item => item.avatar_id);
      const { data: avatarsData, error: avatarsError } = await supabase
        .from('avatars')
        .select('id, name, image_url, rarity')
        .in('id', avatarIds);

      if (avatarsError) throw avatarsError;

      // Combine the data
      const combinedData = avatarsData?.map(avatar => {
        const userAvatar = userAvatarsData.find(ua => ua.avatar_id === avatar.id);
        return {
          id: avatar.id,
          name: avatar.name,
          image_url: avatar.image_url,
          rarity: avatar.rarity,
          is_active: userAvatar?.is_active || false
        };
      }) || [];

      setOwnedAvatars(combinedData);
    } catch (error) {
      console.error('Error loading owned avatars:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus avatares",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const setActiveAvatar = async (avatarId: string) => {
    setUpdating(avatarId);
    
    try {
      // Deactivate all current avatars
      await supabase
        .from('user_avatars')
        .update({ is_active: false })
        .eq('user_id', userProfileId);

      // Activate the selected avatar
      await supabase
        .from('user_avatars')
        .update({ is_active: true })
        .eq('user_id', userProfileId)
        .eq('avatar_id', avatarId);

      // Update profile avatar_id and clear profile_image_url
      await supabase
        .from('profiles')
        .update({ 
          avatar_id: avatarId, 
          profile_image_url: null 
        })
        .eq('id', userProfileId);

      // Update local state
      setOwnedAvatars(prev => 
        prev.map(avatar => ({
          ...avatar,
          is_active: avatar.id === avatarId
        }))
      );

      onAvatarChanged(avatarId);

      toast({
        title: "Avatar Ativo",
        description: "Seu avatar foi atualizado com sucesso!"
      });

    } catch (error) {
      console.error('Error setting active avatar:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o avatar",
        variant: "destructive"
      });
    } finally {
      setUpdating(null);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-500';
      case 'uncommon': return 'border-green-500';
      case 'rare': return 'border-blue-500';
      case 'epic': return 'border-purple-500';
      case 'legendary': return 'border-gradient-to-r from-yellow-400 to-orange-500';
      default: return 'border-gray-500';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Seus Avatares</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Carregando avatares...</p>
        </CardContent>
      </Card>
    );
  }

  if (ownedAvatars.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Seus Avatares</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Você ainda não possui avatares. Vá ao marketplace para comprar alguns!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seus Avatares</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {ownedAvatars.map((avatar) => (
            <div
              key={avatar.id}
              className={`relative p-4 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${
                avatar.is_active ? 'border-primary bg-primary/5' : 'border-muted hover:border-muted-foreground/50'
              } ${getRarityColor(avatar.rarity)}`}
              onClick={() => setActiveAvatar(avatar.id)}
            >
              {avatar.is_active && (
                <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1">
                  <Check className="h-3 w-3" />
                </div>
              )}
              
              <div className="text-center">
                <Avatar className="w-16 h-16 mx-auto mb-2">
                  <AvatarImage src={getAvatarImage(avatar.name)} alt={avatar.name} />
                  <AvatarFallback>{avatar.name.charAt(0)}</AvatarFallback>
                </Avatar>
                
                <h4 className="text-sm font-medium mb-1">{avatar.name}</h4>
                <Badge variant="outline" className="text-xs">
                  {avatar.rarity}
                </Badge>
                
                {updating === avatar.id && (
                  <p className="text-xs text-muted-foreground mt-2">Ativando...</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
