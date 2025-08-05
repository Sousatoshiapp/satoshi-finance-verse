import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/shared/ui/avatar";
import { Progress } from "@/components/shared/ui/progress";
import { Input } from "@/components/shared/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/shared/ui/dialog";
import { Textarea } from "@/components/shared/ui/textarea";
import { FloatingNavbar } from "@/components/shared/floating-navbar";
import { Users, Crown, Trophy, Shield, Search, Plus, ArrowLeft, MessageCircle, Target, Star, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AvatarDisplayUniversal } from "@/components/shared/avatar-display-universal";

interface Guild {
  id: string;
  name: string;
  description: string;
  emblem: string;
  leader_id: string;
  member_count: number;
  max_members: number;
  level: number;
  xp: number;
  requirements: {
    min_level: number;
    min_xp: number;
  };
  perks: string[];
  weekly_goal: number;
  weekly_progress: number;
  is_recruiting: boolean;
  leader_info?: {
    nickname: string;
    avatars?: {
      name: string;
      image_url: string;
    };
  };
  user_membership?: {
    role: 'leader' | 'officer' | 'member';
    is_active: boolean;
  };
  user_request?: {
    status: 'pending' | 'approved' | 'rejected';
  };
}

export default function Guilds() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [newGuild, setNewGuild] = useState({
    name: "",
    description: "",
    emblem: "🛡️",
    requirements: { min_level: 1, min_xp: 0 }
  });

  useEffect(() => {
    loadUserProfile();
    loadGuilds();
  }, []);

  const loadUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const loadGuilds = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      // Load guilds with leader info and user membership status
      const { data: guildsData, error } = await supabase
        .from('guilds')
        .select(`
          *,
          profiles!guilds_leader_id_fkey(
            nickname,
            user_avatars!inner (
              avatars(name, image_url)
            )
          ),
          guild_members!guild_members_guild_id_fkey(
            role,
            is_active,
            user_id
          ),
          guild_requests!guild_requests_guild_id_fkey(
            status,
            user_id
          )
        `)
        .eq('status', 'active')
        .order('member_count', { ascending: false });

      if (error) throw error;

      const transformedGuilds = guildsData?.map(guild => ({
        ...guild,
        requirements: typeof guild.requirements === 'object' && guild.requirements !== null 
          ? guild.requirements as { min_level: number; min_xp: number }
          : { min_level: 1, min_xp: 0 },
        perks: Array.isArray(guild.perks) ? guild.perks.map(p => String(p)) : [],
        leader_info: guild.profiles,
        user_membership: guild.guild_members?.find((m: any) => m.user_id === profile.id) ? {
          role: guild.guild_members.find((m: any) => m.user_id === profile.id)?.role as 'leader' | 'officer' | 'member',
          is_active: guild.guild_members.find((m: any) => m.user_id === profile.id)?.is_active
        } : undefined,
        user_request: guild.guild_requests?.find((r: any) => r.user_id === profile.id && r.status === 'pending') ? {
          status: guild.guild_requests.find((r: any) => r.user_id === profile.id && r.status === 'pending')?.status as 'pending' | 'approved' | 'rejected'
        } : undefined
      })) || [];

      setGuilds(transformedGuilds);
    } catch (error) {
      console.error('Error loading guilds:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as guildas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGuild = async () => {
    if (!userProfile) return;

    if (!newGuild.name.trim() || !newGuild.description.trim()) {
      toast({
        title: "Erro",
        description: "Nome e descrição são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setCreateLoading(true);
    try {
      const { data, error } = await supabase
        .from('guilds')
        .insert({
          name: newGuild.name.trim(),
          description: newGuild.description.trim(),
          emblem: newGuild.emblem,
          leader_id: userProfile.id,
          requirements: newGuild.requirements
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as leader
      await supabase
        .from('guild_members')
        .insert({
          guild_id: data.id,
          user_id: userProfile.id,
          role: 'leader'
        });

      toast({
        title: "Guilda criada!",
        description: "Sua guilda foi criada com sucesso",
      });

      setShowCreateDialog(false);
      setNewGuild({
        name: "",
        description: "",
        emblem: "🛡️",
        requirements: { min_level: 1, min_xp: 0 }
      });
      loadGuilds();
    } catch (error: any) {
      console.error('Error creating guild:', error);
      toast({
        title: "Erro",
        description: error.message === 'duplicate key value violates unique constraint "guilds_name_key"' 
          ? "Já existe uma guilda com este nome"
          : "Não foi possível criar a guilda",
        variant: "destructive"
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleJoinRequest = async (guildId: string) => {
    if (!userProfile) return;

    try {
      const { error } = await supabase.rpc('request_guild_membership', {
        p_guild_id: guildId,
        p_user_id: userProfile.id,
        p_message: 'Gostaria de me juntar à guilda!'
      });

      if (error) throw error;

      toast({
        title: "Solicitação enviada!",
        description: "Sua solicitação foi enviada para os líderes da guilda",
      });

      loadGuilds();
    } catch (error: any) {
      console.error('Error joining guild:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível enviar a solicitação",
        variant: "destructive"
      });
    }
  };

  const filteredGuilds = guilds.filter(guild =>
    guild.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guild.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const userGuild = guilds.find(g => g.user_membership?.is_active);
  const availableGuilds = guilds.filter(g => !g.user_membership?.is_active);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="p-4">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-muted/30 rounded-lg p-6 h-32"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header - Mobile Optimized */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/dashboard')}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl font-bold">Sistema de Guildas</h1>
                <p className="text-sm sm:text-base text-muted-foreground">Una-se a outros traders e conquiste objetivos juntos</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowCreateDialog(true)} 
              className="bg-gradient-to-r from-primary to-secondary w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Guilda
            </Button>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar guildas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Your Guild */}
          {userGuild && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                Sua Guilda
              </h2>
              <Card className="border-primary/30 bg-gradient-to-r from-background to-primary/5">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl sm:text-3xl">
                        {userGuild.emblem}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="flex flex-wrap items-center gap-2">
                          {userGuild.name}
                          <Badge variant="outline" className="bg-yellow-500/10 border-yellow-500/30">
                            <Crown className="h-3 w-3 mr-1" />
                            Nível {userGuild.level}
                          </Badge>
                        </CardTitle>
                        <p className="text-muted-foreground text-sm">{userGuild.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button variant="outline" size="sm" className="flex-1 sm:flex-initial">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Chat
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 sm:flex-initial">
                        Gerenciar
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Membros</div>
                      <div className="text-lg font-bold">{userGuild.member_count}/{userGuild.max_members}</div>
                      <Progress value={(userGuild.member_count / userGuild.max_members) * 100} className="h-2 mt-1" />
                    </div>
                    <div>
                      <div className="text-muted-foreground">XP da Guilda</div>
                      <div className="text-lg font-bold">{userGuild.xp.toLocaleString()}</div>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <div className="text-muted-foreground">Meta Semanal</div>
                      <div className="text-lg font-bold">{userGuild.weekly_progress}/{userGuild.weekly_goal}</div>
                      <Progress value={(userGuild.weekly_progress / userGuild.weekly_goal) * 100} className="h-2 mt-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Available Guilds */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              {userGuild ? 'Outras Guildas' : 'Guildas Disponíveis'}
            </h2>
            <div className="space-y-4">
              {availableGuilds.filter(g => 
                g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                g.description.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((guild) => {
                const canJoin = !guild.user_request && 
                              userProfile?.level >= guild.requirements.min_level &&
                              userProfile?.xp >= guild.requirements.min_xp &&
                              guild.member_count < guild.max_members &&
                              guild.is_recruiting;
                
                return (
                  <Card key={guild.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-muted to-card flex items-center justify-center text-xl sm:text-2xl">
                            {guild.emblem}
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="flex flex-wrap items-center gap-2 text-sm sm:text-base">
                              {guild.name}
                              <Badge variant="outline" className="text-xs">
                                Nível {guild.level}
                              </Badge>
                              {guild.member_count >= guild.max_members && (
                                <Badge variant="secondary" className="text-xs">Lotada</Badge>
                              )}
                            </CardTitle>
                            <p className="text-muted-foreground text-xs sm:text-sm truncate">{guild.description}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                          {guild.user_request ? (
                            <Badge variant="outline" className="text-yellow-500 border-yellow-500/30">
                              Pendente
                            </Badge>
                          ) : canJoin ? (
                            <Button 
                              size="sm" 
                              onClick={() => handleJoinRequest(guild.id)}
                              className="flex-1 sm:flex-initial"
                            >
                              <UserPlus className="h-4 w-4 mr-1" />
                              Solicitar Entrada
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm" disabled className="flex-1 sm:flex-initial">
                              {!guild.is_recruiting ? 'Não recrutando' :
                               guild.member_count >= guild.max_members ? 'Lotada' :
                               userProfile?.level < guild.requirements.min_level ? `Nível ${guild.requirements.min_level} req.` :
                               'Requisitos não atendidos'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap items-center justify-between text-xs gap-2">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {guild.member_count}/{guild.max_members}
                          </div>
                          <div className="flex items-center gap-1">
                            <Trophy className="h-3 w-3" />
                            {guild.xp.toLocaleString()} XP
                          </div>
                          <div className="flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            Nível {guild.requirements.min_level}+
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <AvatarDisplayUniversal
                            avatarName={guild.leader_info?.avatars?.name}
                            avatarUrl={guild.leader_info?.avatars?.image_url}
                            nickname={guild.leader_info?.nickname || 'Líder'}
                            size="sm"
                            className="w-5 h-5"
                          />
                          <span className="text-muted-foreground">
                            {guild.leader_info?.nickname || 'Líder'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {filteredGuilds.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Nenhuma guilda encontrada</p>
              <p className="text-sm">Tente ajustar sua busca ou crie uma nova guilda!</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Guild Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Nova Guilda</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nome da Guilda *</label>
              <Input
                value={newGuild.name}
                onChange={(e) => setNewGuild({...newGuild, name: e.target.value})}
                placeholder="Nome da sua guilda"
                maxLength={50}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Descrição *</label>
              <Textarea
                value={newGuild.description}
                onChange={(e) => setNewGuild({...newGuild, description: e.target.value})}
                placeholder="Descreva sua guilda..."
                maxLength={200}
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Emblema</label>
              <div className="flex gap-2 mt-2">
                {['🛡️', '⚔️', '🏰', '👑', '🎯', '🔥', '⚡', '🌟'].map(emoji => (
                  <Button
                    key={emoji}
                    variant={newGuild.emblem === emoji ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNewGuild({...newGuild, emblem: emoji})}
                    className="text-lg p-2"
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Nível Mínimo</label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={newGuild.requirements.min_level}
                  onChange={(e) => setNewGuild({
                    ...newGuild, 
                    requirements: {...newGuild.requirements, min_level: parseInt(e.target.value) || 1}
                  })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">XP Mínimo</label>
                <Input
                  type="number"
                  min="0"
                  value={newGuild.requirements.min_xp}
                  onChange={(e) => setNewGuild({
                    ...newGuild, 
                    requirements: {...newGuild.requirements, min_xp: parseInt(e.target.value) || 0}
                  })}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowCreateDialog(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateGuild}
                disabled={createLoading}
                className="flex-1"
              >
                {createLoading ? 'Criando...' : 'Criar Guilda'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <FloatingNavbar />
    </div>
  );
}
