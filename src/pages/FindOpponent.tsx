import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Users, Zap, Target, Search, Heart, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FloatingNavbar } from "@/components/floating-navbar";
import { useEnhancedDuelMatchmaking } from "@/hooks/use-enhanced-duel-matchmaking";
import { MatchmakingWheel } from "@/components/duels/matchmaking-wheel";
import { AvatarDisplayUniversal } from "@/components/avatar-display-universal";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/use-debounced-callback";

const topics = [
  { id: "financas", name: "Finanças Gerais", description: "Conceitos básicos de educação financeira" },
  { id: "investimentos", name: "Investimentos", description: "Ações, fundos, renda fixa" },
  { id: "criptomoedas", name: "Criptomoedas", description: "Bitcoin, Ethereum e blockchain" },
  { id: "economia", name: "Economia", description: "Macroeconomia e mercados" },
];

interface UserProfile {
  id: string;
  nickname: string;
  level: number;
  xp: number;
  streak: number;
  is_bot: boolean;
  avatars?: {
    name: string;
    image_url: string;
  };
}

export default function FindOpponent() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedTopic, setSelectedTopic] = useState("financas");
  const [activeTab, setActiveTab] = useState("quick");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  
  const { isSearching: isMatchmaking, startMatchmaking, cancelMatchmaking, createDuel, setIsSearching } = useEnhancedDuelMatchmaking();
  const [showWheel, setShowWheel] = useState(false);

  // Debounced search
  const debouncedSearch = useDebounce((query: string) => {
    searchUsers(query);
  }, 300);

  useEffect(() => {
    loadCurrentUser();
    loadFriends();
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      debouncedSearch(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (showWheel && !isMatchmaking) {
      setShowWheel(false);
    }
  }, [isMatchmaking, showWheel]);

  const loadCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setCurrentUserProfile(profile);
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const searchUsers = async (query: string) => {
    try {
      setIsSearchingUsers(true);
      
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          id, nickname, level, xp, streak, is_bot,
          avatars (name, image_url)
        `)
        .ilike('nickname', `%${query}%`)
        .neq('id', currentUserProfile?.id || '')
        .limit(10);

      if (error) throw error;
      setSearchResults(profiles || []);
    } catch (error) {
      console.error('Error searching users:', error);
      toast({
        title: "❌ Erro na busca",
        description: "Não foi possível buscar usuários",
        variant: "destructive"
      });
    } finally {
      setIsSearchingUsers(false);
    }
  };

  const loadFriends = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const { data: follows, error } = await supabase
        .from('user_follows')
        .select(`
          following_id,
          profiles!following_id (
            id, nickname, level, xp, streak, is_bot,
            avatars (name, image_url)
          )
        `)
        .eq('follower_id', profile.id);

      if (error) throw error;
      
      const friendsList = follows?.map(f => f.profiles).filter(Boolean) || [];
      setFriends(friendsList);
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  const handleChallengeUser = async (opponent: UserProfile) => {
    try {
      // Create duel invite
      const { data: invite, error: inviteError } = await supabase
        .from('duel_invites')
        .insert({
          challenger_id: currentUserProfile.id,
          challenged_id: opponent.id,
          quiz_topic: selectedTopic,
          status: 'pending'
        })
        .select()
        .single();

      if (inviteError) throw inviteError;

      // Send notification
      await supabase.functions.invoke('send-social-notification', {
        body: {
          type: 'duel_invite',
          targetUserId: opponent.id,
          data: {
            challengerName: currentUserProfile.nickname,
            topic: topics.find(t => t.id === selectedTopic)?.name || selectedTopic,
            inviteId: invite.id
          }
        }
      });

      toast({
        title: "🎯 Convite enviado!",
        description: `Convite de duelo enviado para ${opponent.nickname}. Aguarde a resposta.`,
      });

      // Não redirecionar automaticamente - aguardar resposta do oponente

    } catch (error) {
      console.error('Error challenging user:', error);
      toast({
        title: "❌ Erro ao enviar convite",
        description: "Tente novamente",
        variant: "destructive"
      });
    }
  };

  const handleMatchFound = async (opponent: any) => {
    try {
      setShowWheel(false);
      setIsSearching(false);
      
      const duel = await createDuel(opponent.id, selectedTopic);
      
      toast({
        title: "🎉 Duelo criado!",
        description: `Iniciando duelo contra ${opponent.nickname}...`,
      });
      
      setTimeout(() => {
        navigate('/duels');
      }, 1000);
    } catch (error) {
      console.error('Error handling match:', error);
      toast({
        title: "❌ Erro ao criar duelo",
        description: "Tente novamente",
        variant: "destructive"
      });
      setShowWheel(false);
      setIsSearching(false);
    }
  };

  const handleStartSearch = async () => {
    try {
      setShowWheel(true);
      await startMatchmaking(selectedTopic);
    } catch (error) {
      console.error('Error starting search:', error);
      toast({
        title: "❌ Erro ao iniciar busca",
        description: "Tente novamente",
        variant: "destructive"
      });
      setShowWheel(false);
    }
  };

  const handleCancelSearch = async () => {
    await cancelMatchmaking();
    setShowWheel(false);
    toast({
      title: "🚫 Busca cancelada",
      description: "Você pode tentar novamente quando quiser",
    });
  };

  const UserCard = ({ user, onChallenge }: { user: UserProfile; onChallenge: () => void }) => (
    <Card className="hover:shadow-md transition-shadow border-border">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AvatarDisplayUniversal
              avatarName={user.avatars?.name}
              avatarUrl={user.avatars?.image_url}
              nickname={user.nickname}
              size="sm"
            />
            <div>
              <div className="font-semibold text-foreground flex items-center gap-2">
                {user.nickname}
                {user.is_bot && <Badge variant="secondary" className="text-xs">Bot</Badge>}
              </div>
              <div className="text-sm text-muted-foreground">
                Nível {user.level} • {user.xp} XP • {user.streak} sequência
              </div>
            </div>
          </div>
          <Button
            onClick={onChallenge}
            size="sm"
            className="bg-primary hover:bg-primary/90"
          >
            Desafiar
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(var(--primary-rgb), 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(var(--primary-rgb), 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }} />
      </div>

      <div className="max-w-md mx-auto px-4 py-6 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/duels')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">
            Encontrar Oponente
          </h1>
          <div className="w-10"></div>
        </div>

        {/* Topic Selection */}
        <Card className="mb-6 bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground flex items-center gap-2">
              <Target className="h-5 w-5" />
              Escolha o Tópico
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topics.map((topic) => (
              <div
                key={topic.id}
                onClick={() => setSelectedTopic(topic.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                  selectedTopic === topic.id
                    ? 'border-primary bg-primary/10 text-primary shadow-lg'
                    : 'border-border hover:border-primary/50 text-muted-foreground hover:text-foreground hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm">{topic.name}</div>
                    <div className="text-xs text-muted-foreground">{topic.description}</div>
                  </div>
                  {selectedTopic === topic.id && (
                    <div className="text-primary">✓</div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="quick" className="text-xs">
              🎯 Busca Rápida
            </TabsTrigger>
            <TabsTrigger value="search" className="text-xs">
              🔍 Buscar
            </TabsTrigger>
            <TabsTrigger value="friends" className="text-xs">
              👥 Amigos
            </TabsTrigger>
          </TabsList>

          {/* Quick Match Tab */}
          <TabsContent value="quick" className="space-y-4">
            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20 shadow-xl">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Zap className="h-8 w-8 text-primary animate-pulse" />
                    <h2 className="text-2xl font-bold text-primary">Arena de Duelos</h2>
                    <Zap className="h-8 w-8 text-primary animate-pulse" />
                  </div>
                  
                  <p className="text-muted-foreground">
                    10 perguntas • 30 segundos cada • Duelo simultâneo
                  </p>
                  
                  <Button
                    onClick={handleStartSearch}
                    disabled={isMatchmaking || showWheel}
                    size="lg"
                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-bold py-6 text-lg shadow-lg transform transition-transform hover:scale-105"
                  >
                    <Users className="mr-2 h-5 w-5" />
                    🎯 Encontrar Oponente
                  </Button>
                  
                  <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Online
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      Buscando
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Search Users Tab */}
          <TabsContent value="search" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Buscar Usuário
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Digite o nickname do usuário..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mb-4"
                />
                
                {isSearchingUsers && (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground mt-2">Buscando...</p>
                  </div>
                )}

                <div className="space-y-3">
                  {searchResults.map((user) => (
                    <UserCard
                      key={user.id}
                      user={user}
                      onChallenge={() => handleChallengeUser(user)}
                    />
                  ))}
                  
                  {searchQuery.length >= 2 && !isSearchingUsers && searchResults.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Nenhum usuário encontrado</p>
                      <p className="text-sm">Tente outro termo de busca</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Friends Tab */}
          <TabsContent value="friends" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Seus Amigos ({friends.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {friends.map((friend) => (
                    <UserCard
                      key={friend.id}
                      user={friend}
                      onChallenge={() => handleChallengeUser(friend)}
                    />
                  ))}
                  
                  {friends.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <UserPlus className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Você ainda não segue ninguém</p>
                      <p className="text-sm">Vá para a aba Social para encontrar pessoas para seguir</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => navigate('/social')}
                      >
                        Ir para Social
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Matchmaking Wheel */}
        <MatchmakingWheel
          isSearching={showWheel}
          onMatchFound={handleMatchFound}
          onCancel={handleCancelSearch}
          topic={selectedTopic}
        />
      </div>

      <FloatingNavbar />
    </div>
  );
}