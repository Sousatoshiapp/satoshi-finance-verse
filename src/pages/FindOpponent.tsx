import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shared/ui/tabs";
import { Input } from "@/components/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shared/ui/select";
import { Label } from "@/components/shared/ui/label";
import { ArrowLeft, Users, Zap, Target, Search, Heart, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/hooks/use-i18n";
import { FloatingNavbar } from "@/components/shared/floating-navbar";
import { useEnhancedDuelMatchmaking } from "@/hooks/use-enhanced-duel-matchmaking";
import { MatchmakingWheel } from "@/components/duels/matchmaking-wheel";
import { ActiveArena } from "@/components/duels/ActiveArena";
import { InviteQueueManager } from "@/components/duels/InviteQueueManager";
import { MatchmakingPreferencesModal } from "@/components/duels/MatchmakingPreferencesModal";
import { AvatarDisplayUniversal } from "@/components/shared/avatar-display-universal";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/use-debounced-callback";
import { useGlobalDuelInvites } from "@/contexts/GlobalDuelInviteContext";

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
  const { t } = useI18n();
  const { inviteQueue, selectInviteFromQueue, dismissAllInvites } = useGlobalDuelInvites();
  const [selectedTopic, setSelectedTopic] = useState("financas");
  const [activeTab, setActiveTab] = useState("quick");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  
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
          id, nickname, level, xp, streak, is_bot, current_avatar_id,
          profile_image_url
        `)
        .ilike('nickname', `%${query}%`)
        .neq('id', currentUserProfile?.id || '')
        .limit(10);

      if (error) throw error;

      // Get avatars for profiles that have current_avatar_id
      const profilesWithAvatars = await Promise.all(
        (profiles || []).map(async (profile) => {
          if (profile.current_avatar_id) {
            const { data: avatarData } = await supabase
              .from('avatars')
              .select('name, image_url')
              .eq('id', profile.current_avatar_id)
              .single();
            return { ...profile, avatars: avatarData };
          }
          return { ...profile, avatars: null };
        })
      );
      setSearchResults(profilesWithAvatars as UserProfile[]);
    } catch (error) {
      console.error('Error searching users:', error);
      toast({
        title: `❌ ${t('common.error')}`,
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
            id, nickname, level, xp, streak, is_bot, current_avatar_id,
            profile_image_url
          )
        `)
        .eq('follower_id', profile.id);

      if (error) throw error;
      
      // Get avatars for friends
      const friendsWithAvatars = await Promise.all(
        (follows || []).map(async (follow: any) => {
          if (follow.profiles?.current_avatar_id) {
            const { data: avatarData } = await supabase
              .from('avatars')
              .select('name, image_url')
              .eq('id', follow.profiles.current_avatar_id)
              .single();
            return { ...follow.profiles, avatars: avatarData };
          }
          return { ...follow.profiles, avatars: null };
        })
      );
      
      setFriends(friendsWithAvatars.filter(Boolean) as UserProfile[]);
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

      // Send database notification
      try {
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
      } catch (error) {
        console.error('Error sending database notification:', error);
      }

      // Se for um bot, disparar a edge function para resposta automática
      if (opponent.is_bot) {
        setTimeout(async () => {
          try {
            await supabase.functions.invoke('bot-duel-responder');
          } catch (error) {
            console.error('Error calling bot responder:', error);
          }
        }, 2000); // Delay de 2 segundos para parecer mais realista
      }

      toast({
        title: "🎯 Convite enviado!",
        description: `Convite de duelo enviado para ${opponent.nickname}. Aguarde a resposta.`,
      });

    } catch (error) {
      console.error('Error challenging user:', error);
      toast({
        title: `❌ ${t('common.error')} ao enviar convite`,
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
        title: `❌ ${t('common.error')} ao criar duelo`,
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
        title: `❌ ${t('common.error')} ao iniciar busca`,
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
      <CardContent className="p-2 sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <AvatarDisplayUniversal
              avatarName={user.avatars?.name}
              avatarUrl={user.avatars?.image_url}
              nickname={user.nickname}
              size="sm"
            />
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-foreground flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
                <span className="truncate">{user.nickname}</span>
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground truncate">
                {t('common.level')} {user.level} • {user.xp} XP • {user.streak} sequência
              </div>
            </div>
          </div>
          <Button
            onClick={onChallenge}
            size="sm"
            className="bg-primary hover:bg-primary/90 shrink-0 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
          >
            {t('findOpponent.invitePlayer')}
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

      <div className="max-w-lg mx-auto px-3 sm:px-4 py-4 sm:py-6 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="text-muted-foreground hover:text-foreground p-1 sm:p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg sm:text-xl font-bold text-foreground">
            {t('findOpponent.title')}
          </h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreferencesModal(true)}
            className="p-1 sm:p-2"
          >
            <Users className="h-4 w-4" />
          </Button>
        </div>

        {/* Topic Selection */}
        <Card className="mb-4 sm:mb-6 bg-card border-border">
          <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-foreground flex items-center gap-2 text-base sm:text-lg">
              <Target className="h-4 w-4 sm:h-5 sm:w-5" />
              {t('findOpponent.topicSelection')}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <Label className="text-xs sm:text-sm font-medium">{t('findOpponent.selectTopic')}</Label>
            <Select value={selectedTopic} onValueChange={setSelectedTopic}>
              <SelectTrigger className="mt-2 h-10 sm:h-11">
                <SelectValue placeholder={t('findOpponent.selectTopic')} />
              </SelectTrigger>
              <SelectContent>
                {topics.map((topic) => (
                  <SelectItem key={topic.id} value={topic.id}>
                    <div>
                      <div className="font-medium text-sm sm:text-base">{topic.name}</div>
                      <div className="text-xs text-muted-foreground">{topic.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-9 sm:h-10">
            <TabsTrigger value="quick" className="text-xs sm:text-sm px-1 sm:px-3">{t('findOpponent.quickMatch')}</TabsTrigger>
            <TabsTrigger value="search" className="text-xs sm:text-sm px-1 sm:px-3">{t('findOpponent.searchPlayers')}</TabsTrigger>
            <TabsTrigger value="friends" className="text-xs sm:text-sm px-1 sm:px-3">{t('findOpponent.friendsList')}</TabsTrigger>
          </TabsList>

          {/* Quick Match Tab */}
          <TabsContent value="quick" className="space-y-3 sm:space-y-4">
            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <CardContent className="p-3 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">{t('findOpponent.quickStart')}</h3>
                
                <div className="space-y-3 sm:space-y-4">
                  <Button
                    onClick={handleStartSearch}
                    disabled={isMatchmaking || showWheel}
                    size="lg"
                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-bold h-11 sm:h-12 text-sm sm:text-base"
                  >
                    <Users className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    {t('findOpponent.searching')}
                  </Button>
                  
                  {/* Active Arena */}
                  <ActiveArena />
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-9 sm:h-10 text-xs sm:text-sm"
                    onClick={() => setShowPreferencesModal(true)}
                  >
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    {t('findOpponent.preferences')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Search Users Tab */}
          <TabsContent value="search" className="space-y-3 sm:space-y-4">
            <Card>
              <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                <div className="flex items-center gap-2 mb-2 sm:mb-4">
                  <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                  <h3 className="text-base sm:text-lg font-semibold">{t('findOpponent.searchPlayers')}</h3>
                </div>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <Input
                  placeholder={t('findOpponent.searchUsers')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mb-3 sm:mb-4 h-10 sm:h-11 text-sm sm:text-base"
                />
                
                {isSearchingUsers && (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-2">{t('common.loading')}</p>
                  </div>
                )}

                <div className="space-y-2 sm:space-y-3">
                  {searchResults.map((user) => (
                    <UserCard
                      key={user.id}
                      user={user}
                      onChallenge={() => handleChallengeUser(user)}
                    />
                  ))}
                  
                  {searchQuery.length >= 2 && !isSearchingUsers && searchResults.length === 0 && (
                    <div className="text-center py-6 sm:py-8">
                      <Search className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                      <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">{t('findOpponent.noResults')}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">{t('findOpponent.searchForPlayers')}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Friends Tab */}
          <TabsContent value="friends" className="space-y-3 sm:space-y-4">
            <Card>
              <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                <div className="flex items-center gap-2 mb-2 sm:mb-4">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                  <h3 className="text-base sm:text-lg font-semibold">{t('findOpponent.yourFriends')}</h3>
                </div>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                <div className="space-y-2 sm:space-y-3">
                  {friends.map((friend) => (
                    <UserCard
                      key={friend.id}
                      user={friend}
                      onChallenge={() => handleChallengeUser(friend)}
                    />
                  ))}
                  
                  {friends.length === 0 && (
                    <div className="text-center py-6 sm:py-8">
                      <Users className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                      <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">{t('findOpponent.noFriends')}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">{t('findOpponent.addFriends')}</p>
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

        {/* Queue Manager */}
        <InviteQueueManager
          queuedInvites={inviteQueue.map(invite => ({
            id: invite.id,
            challenger: {
              nickname: invite.challenger?.nickname || 'Desconhecido',
              level: invite.challenger?.level || 1,
              avatars: invite.challenger?.avatars
            },
            quiz_topic: invite.quiz_topic,
            created_at: invite.created_at,
            timeLeft: Math.max(0, 30 - Math.floor((Date.now() - new Date(invite.created_at).getTime()) / 1000))
          }))}
          onDismissAll={dismissAllInvites}
          onSelectInvite={selectInviteFromQueue}
        />

        {/* Preferences Modal */}
        <MatchmakingPreferencesModal
          isOpen={showPreferencesModal}
          onClose={() => setShowPreferencesModal(false)}
        />
      </div>

      <FloatingNavbar />
    </div>
  );
}