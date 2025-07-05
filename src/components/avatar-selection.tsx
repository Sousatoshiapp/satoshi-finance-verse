import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Zap, Brain, Shield } from "lucide-react";

// Import avatar images
import neoTrader from "@/assets/avatars/neo-trader.jpg";
import cryptoAnalyst from "@/assets/avatars/crypto-analyst.jpg";
import financeHacker from "@/assets/avatars/finance-hacker.jpg";
import investmentScholar from "@/assets/avatars/investment-scholar.jpg";

interface Avatar {
  id: string;
  name: string;
  description: string;
  image_url: string;
  avatar_class: string;
  district_theme: string;
  backstory: string;
  bonus_effects: any;
}

interface AvatarSelectionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAvatarSelected: () => void;
}

const avatarImages = {
  'neo-trader': neoTrader,
  'crypto-analyst': cryptoAnalyst,
  'finance-hacker': financeHacker,
  'investment-scholar': investmentScholar,
};

const classIcons = {
  trader: Zap,
  analyst: Brain,
  hacker: Shield,
  scholar: Sparkles,
};

export function AvatarSelection({ open, onOpenChange, onAvatarSelected }: AvatarSelectionProps) {
  const [starterAvatars, setStarterAvatars] = useState<Avatar[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadStarterAvatars();
    }
  }, [open]);

  const loadStarterAvatars = async () => {
    try {
      const { data, error } = await supabase
        .from('avatars')
        .select('*')
        .eq('is_starter', true)
        .eq('is_available', true)
        .order('name');

      if (error) throw error;
      setStarterAvatars(data || []);
    } catch (error) {
      console.error('Error loading starter avatars:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os avatares",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarSelect = (avatar: Avatar) => {
    setSelectedAvatar(avatar);
    setConfirming(true);
  };

  const confirmAvatarSelection = async () => {
    if (!selectedAvatar) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      // Add avatar to user's collection
      const { error: insertError } = await supabase
        .from('user_avatars')
        .insert({
          user_id: profile.id,
          avatar_id: selectedAvatar.id,
          is_active: true
        });

      if (insertError) throw insertError;

      // Update profile to reference this avatar
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_id: selectedAvatar.id })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      toast({
        title: "🎉 Avatar Selecionado!",
        description: `Bem-vindo(a) à Satoshi City, ${selectedAvatar.name}!`,
      });

      onAvatarSelected();
      onOpenChange(false);
    } catch (error) {
      console.error('Error selecting avatar:', error);
      toast({
        title: "Erro",
        description: "Não foi possível selecionar o avatar",
        variant: "destructive"
      });
    }
  };

  const getAvatarImage = (avatar: Avatar) => {
    const key = avatar.name.toLowerCase().replace(' ', '-') as keyof typeof avatarImages;
    return avatarImages[key] || avatar.image_url;
  };

  const getClassIcon = (avatarClass: string) => {
    const IconComponent = classIcons[avatarClass as keyof typeof classIcons] || Sparkles;
    return IconComponent;
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open && !confirming} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Escolha seu Cidadão Digital
            </DialogTitle>
            <DialogDescription className="text-center">
              Selecione seu avatar inicial para começar sua jornada em Satoshi City
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
            {starterAvatars.map((avatar) => {
              const IconComponent = getClassIcon(avatar.avatar_class);
              
              return (
                <Card 
                  key={avatar.id} 
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-primary"
                  onClick={() => handleAvatarSelect(avatar)}
                >
                  <div className="relative">
                    <div className="aspect-square bg-gradient-to-b from-muted to-card flex items-center justify-center p-2">
                      <img 
                        src={getAvatarImage(avatar)}
                        alt={avatar.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-primary text-primary-foreground">
                        <IconComponent className="h-3 w-3 mr-1" />
                        Inicial
                      </Badge>
                    </div>
                  </div>
                  
                  <CardHeader className="p-3">
                    <CardTitle className="text-sm text-center">{avatar.name}</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="p-3 pt-0">
                    <p className="text-xs text-muted-foreground text-center line-clamp-2 mb-2">
                      {avatar.description}
                    </p>
                    <Badge variant="outline" className="w-full justify-center text-xs">
                      {avatar.district_theme?.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="text-center text-sm text-muted-foreground p-4">
            Avatares gratuitos para começar sua aventura • Desbloqueie mais na loja
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirming} onOpenChange={setConfirming}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmação de Avatar</DialogTitle>
            <DialogDescription>
              Você deseja selecionar este avatar como seu cidadão digital?
            </DialogDescription>
          </DialogHeader>

          {selectedAvatar && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <img 
                  src={getAvatarImage(selectedAvatar)}
                  alt={selectedAvatar.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div>
                  <h3 className="font-bold">{selectedAvatar.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedAvatar.description}</p>
                </div>
              </div>

              <div className="bg-muted p-3 rounded-lg">
                <h4 className="font-semibold mb-2">História:</h4>
                <p className="text-sm">{selectedAvatar.backstory}</p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setConfirming(false)} className="flex-1">
                  Voltar
                </Button>
                <Button onClick={confirmAvatarSelection} className="flex-1">
                  Confirmar Seleção
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}