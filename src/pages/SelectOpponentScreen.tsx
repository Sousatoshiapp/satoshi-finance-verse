import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { Badge } from "@/components/shared/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/shared/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/use-profile";
import { useCasinoDuels } from "@/hooks/use-casino-duels";
import { Search, Users, Shuffle, ArrowLeft, Swords, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AvatarDisplayUniversal } from "@/components/shared/avatar-display-universal";
import { normalizeAvatarData } from "@/lib/avatar-utils";
import { RandomMatchSearchModal } from "@/components/features/duels/RandomMatchSearchModal";

interface LocationState {
  topic: string;
  betAmount: number;
}

interface UserData {
  id: string;
  nickname: string;
  level: number;
  points: number;
  profile_image_url?: string;
  current_avatar_id?: string;
  avatars?: any;
  is_bot: boolean;
  is_online?: boolean;
  last_login_date?: string;
  xp?: number;
  streak?: number;
  user_presence?: Array<{
    last_seen: string;
    is_online: boolean;
  }> | {
    last_seen: string;
    is_online: boolean;
  };
}

export default function SelectOpponentScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { findOpponent, isSearching } = useCasinoDuels();
  const { toast } = useToast();
  
  const state = location.state as LocationState;
  const [searchQuery, setSearchQuery] = useState("");
  const [friends, setFriends] = useState<UserData[]>([]);
  const [searchResults, setSearchResults] = useState<UserData[]>([]);
  const [randomUsers, setRandomUsers] = useState<UserData[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingRandom, setLoadingRandom] = useState(true);
  const [searchingOpponent, setSearchingOpponent] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  useEffect(() => {
    if (!state?.topic || !state?.betAmount) {
      navigate('/find-opponent');
      return;
    }
    
    // Only load random users if profile is available
    if (profile?.id) {
      loadRandomUsers();
    }
  }, [profile?.id, state]);

  // Separate useEffect for loading friends only after profile is loaded
  useEffect(() => {
    console.log('🔍 Profile loading state:', { 
      profileExists: !!profile, 
      profileId: profile?.id,
      profileLoading: !profile 
    });
    
    if (profile?.id) {
      console.log('✅ Profile loaded, now loading friends');
      loadFriends();
    } else {
      console.log('⏳ Waiting for profile to load before loading friends');
    }
  }, [profile?.id, state?.betAmount]);

  const loadFriends = async () => {
    if (!profile?.id) {
      console.log('⚠️ Profile ID não encontrado, não é possível carregar amigos');
      setLoadingFriends(false);
      setFriends([]);
      return;
    }
    
    setLoadingFriends(true);
    try {
      console.log('🔍 Loading friends for profile:', profile.id);
      console.log('💰 Required BTZ for bet:', state?.betAmount || 5);
      
      // First try to get friends through user_follows relationship
      const { data: followsData, error: followsError } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', profile.id);

      let friendIds: string[] = [];
      if (!followsError && followsData?.length) {
        friendIds = followsData.map(f => f.following_id);
      }

      console.log('👥 Total friends found in follows:', friendIds.length);

      if (friendIds.length === 0) {
        console.log('❌ No friends found in user_follows table');
        setFriends([]);
        return;
      }

      // First, get ALL friends without BTZ filter to see the complete picture
      const { data: allFriendsData, error: allFriendsError } = await supabase
        .from('profiles')
        .select(`
          id, nickname, level, points, profile_image_url, 
          current_avatar_id, is_bot,
          avatars!current_avatar_id (id, name, image_url)
        `)
        .in('id', friendIds)
        .order('level', { ascending: false });

      console.log('👥 All friends data (before BTZ filter):', allFriendsData?.length || 0);
      
      if (allFriendsData) {
        allFriendsData.forEach(friend => {
          console.log(`👤 Friend: ${friend.nickname} - ${friend.points} BTZ (${friend.points >= (state?.betAmount || 5) ? '✅ Sufficient' : '❌ Insufficient'})`);
        });
      }

      // Now apply BTZ filter
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, nickname, level, points, profile_image_url, 
          current_avatar_id, is_bot,
          avatars!current_avatar_id (id, name, image_url)
        `)
        .in('id', friendIds)
        .gte('points', state?.betAmount || 5)
        .order('level', { ascending: false })
        .limit(20);

      if (error) {
        console.error('❌ Friends query error:', error);
        
        // Fallback: load some recent users instead
        const { data: fallbackData } = await supabase
          .from('profiles')
          .select(`
            id, nickname, level, points, profile_image_url, 
            current_avatar_id, is_bot,
            avatars!current_avatar_id (id, name, image_url)
          `)
          .neq('id', profile.id)
          .gte('points', state?.betAmount || 5)
          .limit(10);
        
        console.log('🔄 Using fallback users:', fallbackData?.length || 0);
        setFriends(fallbackData || []);
        return;
      }
      
      console.log('✅ Friends with sufficient BTZ:', data?.length || 0);
      const totalFriends = allFriendsData?.length || 0;
      const friendsWithBTZ = data?.length || 0;
      const filteredOut = totalFriends - friendsWithBTZ;
      
      console.log(`📊 Friend filter summary: ${totalFriends} total → ${friendsWithBTZ} with enough BTZ (${filteredOut} filtered out)`);
      
      setFriends(data || []);
      
    } catch (error) {
      console.error('❌ Error loading friends:', error);
      setFriends([]); // Fallback to empty list
    } finally {
      setLoadingFriends(false);
    }
  };

  const loadRandomUsers = async () => {
    if (!profile?.id) {
      console.log('⚠️ Profile ID não encontrado, não é possível carregar usuários aleatórios');
      setLoadingRandom(false);
      setRandomUsers([]);
      return;
    }

    setLoadingRandom(true);
    try {
      console.log('🎲 Loading random users, excluding profile:', profile.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, nickname, level, xp, streak, points,
          current_avatar_id, is_bot, last_login_date,
          avatars!current_avatar_id (id, name, image_url),
          user_presence!left (last_seen, is_online)
        `)
        .neq('id', profile.id)
        .gte('points', state?.betAmount || 5)
        .order('last_login_date', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      // Filtrar usuários realmente online (last_seen < 2 minutos)
      const now = new Date();
      const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);
      
      const filteredUsers = data?.filter(user => {
        if (user.user_presence) {
          const presence = Array.isArray(user.user_presence) ? user.user_presence[0] : user.user_presence;
          if (presence) {
            const lastSeen = new Date(presence.last_seen);
            return presence.is_online && lastSeen > twoMinutesAgo;
          }
        }
        // Se não tem presence, incluir se fez login nas últimas 24h
        if (user.last_login_date) {
          const lastLogin = new Date(user.last_login_date);
          const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          return lastLogin > twentyFourHoursAgo;
        }
        return false;
      }) || [];
      
      // Separar usuários online dos offline
      const onlineUsers = filteredUsers.filter(user => {
        if (user.user_presence) {
          const presence = Array.isArray(user.user_presence) ? user.user_presence[0] : user.user_presence;
          if (presence) {
            const lastSeen = new Date(presence.last_seen);
            return presence.is_online && lastSeen > twoMinutesAgo;
          }
        }
        return false;
      });
      
      const offlineUsers = filteredUsers.filter(user => !onlineUsers.includes(user));
      
      // Priorizar usuários online, depois offline
      const sortedUsers = [...onlineUsers, ...offlineUsers].slice(0, 10);
      
      console.log(`✅ Found ${onlineUsers.length} online users, ${offlineUsers.length} offline users (total: ${sortedUsers.length})`);
      setRandomUsers(sortedUsers);
    } catch (error) {
      console.error('❌ Error loading random users:', error);
      setRandomUsers([]);
    } finally {
      setLoadingRandom(false);
    }
  };

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoadingSearch(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, nickname, level, points, profile_image_url, 
          current_avatar_id, is_bot,
          avatars!current_avatar_id (id, name, image_url)
        `)
        .ilike('nickname', `%${query}%`)
        .neq('id', profile?.id)
        .gte('points', state?.betAmount || 5)
        .limit(15);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleDuelInvite = async (opponentId: string) => {
    if (!profile?.id || !state) return;

    try {
      await findOpponent(state.topic, state.betAmount, opponentId);
    } catch (error) {
      console.error('Error creating duel:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o duelo. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleRandomMatch = async () => {
    if (!state || searchingOpponent) return;
    
    // Open search modal immediately
    setShowSearchModal(true);
    setSearchingOpponent(true);
    console.log('🎲 Starting random match search...');
    console.log('Topic:', state.topic, 'Bet Amount:', state.betAmount);
  };

  const handleOpponentFound = async (opponent: any) => {
    if (!state) return;
    
    try {
      console.log('🎯 Opponent found, creating duel with specific opponent:', opponent.id);
      console.log('🎯 Topic:', state.topic, 'Bet Amount:', state.betAmount);
      
      // Close modal first to prevent navigation issues
      setShowSearchModal(false);
      setSearchingOpponent(false);
      
      // Use the specific opponent ID found by the modal
      await findOpponent(state.topic, state.betAmount, opponent.id);
      console.log('✅ Duel creation completed and navigation should happen automatically');
      
    } catch (error) {
      console.error('❌ Error finding random opponent:', error);
      
      let errorMessage = "Não foi possível encontrar um oponente no momento.";
      
      if (error instanceof Error) {
        if (error.message.includes('perguntas')) {
          errorMessage = "Erro ao carregar perguntas do duelo. Tente outro tópico.";
        } else if (error.message.includes('oponente')) {
          errorMessage = "Nenhum oponente disponível agora. Tente mais tarde.";
        }
      }
      
      toast({
        title: "Ops! 😅",
        description: errorMessage + " Que tal tentar de novo?",
        variant: "destructive"
      });
    } finally {
      // Only close modal if not already closed above
      if (showSearchModal) {
        setShowSearchModal(false);
        setSearchingOpponent(false);
      }
    }
  };

  const handleCloseSearchModal = () => {
    setShowSearchModal(false);
    setSearchingOpponent(false);
  };

  const UserCard = ({ user, onChallenge }: { user: UserData, onChallenge: () => void }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="casino-card bg-black/40 backdrop-blur-sm border-purple-500/30 cursor-pointer hover:shadow-lg transition-all">
        <CardContent className="p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AvatarDisplayUniversal
                avatarData={normalizeAvatarData(user)}
                nickname={user.nickname}
                size="sm"
              />
              <div>
                <div className="font-semibold text-green-400 text-sm">{user.nickname}</div>
                <div className="text-xs text-blue-400">
                  Nível {user.level} • {user.points} BTZ
                </div>
                {user.is_bot && (
                  <Badge variant="secondary" className="text-xs bg-purple-500/20 text-purple-300">Bot</Badge>
                )}
              </div>
            </div>
            <Button
              size="sm"
              onClick={onChallenge}
              disabled={isSearching}
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-2 py-1 h-auto"
            >
              <Swords className="h-3 w-3 mr-1" />
              Desafiar
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const UserListWithDropdown = ({ 
    users, 
    onChallenge, 
    emptyMessage, 
    dropdownLabel 
  }: { 
    users: UserData[], 
    onChallenge: (userId: string) => void, 
    emptyMessage: React.ReactNode,
    dropdownLabel: string 
  }) => {
    const visibleUsers = users.slice(0, 3);
    const hiddenUsers = users.slice(3);

    if (users.length === 0) {
      return emptyMessage;
    }

    return (
      <div className="space-y-1">
        {visibleUsers.map(user => (
          <UserCard
            key={user.id}
            user={user}
            onChallenge={() => onChallenge(user.id)}
          />
        ))}
        
        {hiddenUsers.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full bg-black/20 border-purple-500/30 text-green-400 hover:bg-black/40"
              >
                {dropdownLabel} (+{hiddenUsers.length})
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 bg-black/90 backdrop-blur-sm border-purple-500/30 max-h-60 overflow-y-auto">
              {hiddenUsers.map(user => (
                <DropdownMenuItem key={user.id} className="p-0 focus:bg-purple-500/20">
                  <div className="w-full p-2">
                    <UserCard
                      user={user}
                      onChallenge={() => onChallenge(user.id)}
                    />
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    );
  };

  if (!state) {
    return null;
  }

  return (
    <div className="min-h-screen casino-futuristic">
      <div className="relative z-10 p-6 pb-40">
        {/* Header */}
        <div className="flex items-center justify-start mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>

        {/* Topic and bet info */}
        <div className="text-center mb-6">
          <p className="text-green-400 text-sm">
            {state.topic} • Aposta: {state.betAmount} BTZ
          </p>
        </div>

        {/* Search Section */}
        <Card className="casino-card bg-black/40 backdrop-blur-sm border-purple-500/30 mb-4">
          <CardHeader className="p-3">
            <CardTitle className="flex items-center gap-2 text-white text-lg">
              <Search className="h-4 w-4" />
              Buscar Jogadores
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-3 pt-0">
            <Input
              placeholder="Digite o nickname do jogador..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                searchUsers(e.target.value);
              }}
              className="w-full bg-black/60 border-blue-400/30 text-white"
            />
            
            {loadingSearch && (
              <div className="text-center py-2 text-green-400 text-sm">
                Buscando...
              </div>
            )}
            
            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <UserListWithDropdown
                    users={searchResults}
                    onChallenge={handleDuelInvite}
                    emptyMessage={null}
                    dropdownLabel="Ver mais jogadores"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Friends Section */}
        <Card className="casino-card bg-black/40 backdrop-blur-sm border-purple-500/30 mb-4">
          <CardHeader className="p-3">
            <CardTitle className="flex items-center gap-2 text-white text-lg">
              <Users className="h-4 w-4" />
              Amigos e Seguindo
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            {!profile ? (
              <div className="text-center py-2 text-blue-400 text-sm">
                Aguardando perfil carregar...
              </div>
            ) : loadingFriends ? (
              <div className="text-center py-2 text-[#adff2f] text-sm">
                Carregando amigos...
              </div>
            ) : (
              <UserListWithDropdown
                users={friends}
                onChallenge={handleDuelInvite}
                emptyMessage={
                  <div className="text-center py-4 text-green-400">
                    <Users className="h-6 w-6 mx-auto mb-1 opacity-50" />
                    <p className="text-sm">Nenhum amigo disponível para duelos</p>
                    <p className="text-xs opacity-70">
                      Seus amigos precisam ter pelo menos {state?.betAmount || 5} BTZ para participar desta aposta.
                    </p>
                    <p className="text-xs opacity-50 mt-1">
                      Verifique os logs do console para detalhes sobre o filtro aplicado.
                    </p>
                  </div>
                }
                dropdownLabel="Ver mais amigos"
              />
            )}
          </CardContent>
        </Card>

        {/* Random Match Section */}
        <Card className="casino-card bg-black/40 backdrop-blur-sm border-purple-500/30">
          <CardHeader className="p-3">
            <CardTitle className="flex items-center gap-2 text-white text-lg">
              <Shuffle className="h-4 w-4" />
              Busca Aleatória
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-3 pt-0">
            <Button
              onClick={handleRandomMatch}
              disabled={isSearching || searchingOpponent}
              className="w-full font-bold py-2 text-black border-2 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: '#adff2f',
                borderColor: '#adff2f',
                color: 'black'
              }}
            >
              {(isSearching || searchingOpponent) ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                  Procurando Oponente...
                </div>
              ) : (
                'Encontrar Oponente Aleatório'
              )}
            </Button>

            {/* Recent Online Users */}
            {!loadingRandom && randomUsers.length > 0 && (
              <div>
                <h4 className="font-semibold mb-1 text-green-400 text-sm">Jogadores Ativos</h4>
                <UserListWithDropdown
                  users={randomUsers}
                  onChallenge={handleDuelInvite}
                  emptyMessage={null}
                  dropdownLabel="Ver mais jogadores"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Random Match Search Modal */}
      <RandomMatchSearchModal
        isOpen={showSearchModal}
        onClose={handleCloseSearchModal}
        candidates={[
          ...randomUsers.map(user => ({
            id: user.id,
            nickname: user.nickname,
            avatar_url: user.profile_image_url,
            level: user.level,
            is_bot: user.is_bot
          })),
          // Add some bot candidates
          {
            id: 'bot1',
            nickname: 'AlphaBot',
            avatar_url: undefined,
            level: Math.floor(Math.random() * 50) + 1,
            is_bot: true
          },
          {
            id: 'bot2', 
            nickname: 'BetaBot',
            avatar_url: undefined,
            level: Math.floor(Math.random() * 50) + 1,
            is_bot: true
          },
          {
            id: 'bot3',
            nickname: 'GammaBot', 
            avatar_url: undefined,
            level: Math.floor(Math.random() * 50) + 1,
            is_bot: true
          }
        ]}
        onFoundOpponent={handleOpponentFound}
        searchDuration={30}
      />
    </div>
  );
}