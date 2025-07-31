import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FloatingNavbar } from "@/components/floating-navbar";
import { ArrowLeft, Crown, Users, Zap, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/hooks/use-i18n";

interface Resident {
  id: string;
  nickname: string;
  level: number;
  xp: number;
  profile_image_url?: string;
  streak: number;
  points: number;
  is_residence?: boolean;
}

interface District {
  id: string;
  name: string;
  theme: string;
  color_primary: string;
  color_secondary: string;
}

export default function DistrictResidentsPage() {
  const { districtId } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [district, setDistrict] = useState<District | null>(null);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPower, setTotalPower] = useState(0);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    if (districtId) {
      loadResidentsData();
    }
  }, [districtId]);

  const loadResidentsData = async () => {
    try {
      // Load district info
      const { data: districtData, error: districtError } = await supabase
        .from('districts')
        .select('*')
        .eq('id', districtId)
        .single();

      if (districtError) throw districtError;
      setDistrict(districtData);

      // Load current user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();
        setCurrentUserProfile(profile);
      }

      // Load all residents - using profiles directly
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, nickname, level, xp, profile_image_url, streak, points')
        .order('xp', { ascending: false });

      if (profilesData) {
        const residentsData = profilesData.map(profile => ({
          id: profile.id,
          nickname: profile.nickname || 'Usuário',
          level: profile.level || 1,
          xp: profile.xp || 0,
          profile_image_url: profile.profile_image_url,
          streak: profile.streak || 0,
          points: profile.points || 0,
          is_residence: false // simplified approach
        }));

        setResidents(residentsData);
        
        // Calculate total district power (sum of all XP)
        const totalXP = residentsData.reduce((sum, resident) => sum + resident.xp, 0);
        setTotalPower(totalXP);
      }

    } catch (error) {
      console.error('Erro ao carregar moradores:', error);
      toast({
        title: t('errors.error'),
        description: t('errors.couldNotLoadResidents'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !district) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Carregando moradores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pb-24">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate(`/satoshi-city/district/${districtId}`)}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Distrito
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">{district.name}</h1>
              <p className="text-gray-300">Moradores do Distrito</p>
            </div>
          </div>
          
          <Badge 
            variant="outline" 
            className="border-white/30 text-white px-4 py-2"
          >
            <Users className="w-4 h-4 mr-2" />
            {residents.length} Moradores
          </Badge>
        </div>

        {/* District Power Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" style={{ color: district.color_primary }} />
              Poder Total do Distrito
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div 
                  className="text-3xl font-bold mb-2"
                  style={{ color: district.color_primary }}
                >
                  {totalPower.toLocaleString()}
                </div>
                <div className="text-muted-foreground">XP Total</div>
              </div>
              <div className="text-center">
                <div 
                  className="text-3xl font-bold mb-2"
                  style={{ color: district.color_primary }}
                >
                  {residents.length}
                </div>
                <div className="text-muted-foreground">Moradores Ativos</div>
              </div>
              <div className="text-center">
                <div 
                  className="text-3xl font-bold mb-2"
                  style={{ color: district.color_primary }}
                >
                  {Math.round(totalPower / Math.max(residents.length, 1))}
                </div>
                <div className="text-muted-foreground">XP Médio</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Residents List */}
        <div className="grid gap-4">
          {residents.map((resident, index) => (
            <Card 
              key={resident.id}
              className={`${
                resident.id === currentUserProfile?.id 
                  ? 'border-2' 
                  : 'border'
              }`}
              style={resident.id === currentUserProfile?.id ? {
                borderColor: district.color_primary
              } : {}}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Ranking Position */}
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>

                    {/* Avatar */}
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={resident.profile_image_url} />
                      <AvatarFallback>
                        {resident.nickname.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {/* User Info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{resident.nickname}</h3>
                        {resident.is_residence && (
                          <Crown className="w-4 h-4 text-yellow-500" />
                        )}
                        {resident.id === currentUserProfile?.id && (
                          <Badge variant="outline" className="text-xs">
                            Você
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Level {resident.level}</span>
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          {resident.xp.toLocaleString()} XP
                        </span>
                        <span className="flex items-center gap-1">
                          <Trophy className="w-3 h-3" />
                          {resident.points.toLocaleString()} BTZ
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="text-right">
                    <Badge 
                      variant="outline"
                      className="mb-2"
                    >
                      🔥 {resident.streak} dias
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      {((resident.xp / totalPower) * 100).toFixed(1)}% do poder
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {residents.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Nenhum morador encontrado</h3>
              <p className="text-muted-foreground">
                Este distrito ainda não possui moradores registrados.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <FloatingNavbar />
    </div>
  );
}
