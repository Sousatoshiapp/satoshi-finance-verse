import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { Badge } from "@/components/shared/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/use-profile";
import { useCasinoDuels } from "@/hooks/use-casino-duels";
import { Search, Users, Shuffle, ArrowLeft, Swords } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AvatarDisplayUniversal } from "@/components/shared/avatar-display-universal";
import { normalizeAvatarData } from "@/lib/avatar-utils";

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

  useEffect(() => {
    if (!state?.topic || !state?.betAmount) {
      navigate('/find-opponent');
      return;
    }
    loadFriends();
    loadRandomUsers();
  }, []);

  const loadFriends = async () => {
    if (!profile?.id) return;
    
    setLoadingFriends(true);
    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select(`
          following:profiles!following_id (
            id, nickname, level, points, profile_image_url, 
            current_avatar_id, is_bot,
            avatars!current_avatar_id (id, name, image_url)
          )
        `)
        .eq('follower_id', profile.id)
        .limit(20);

      if (error) throw error;
      setFriends(data?.map(item => item.following).filter(Boolean) || []);
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoadingFriends(false);
    }
  };

  const loadRandomUsers = async () => {
    setLoadingRandom(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, nickname, level, points, profile_image_url, 
          current_avatar_id, is_bot,
          avatars!current_avatar_id (id, name, image_url)
        `)
        .neq('id', profile?.id)
        .gte('points', state?.betAmount || 5)
        .order('last_login_date', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRandomUsers(data || []);
    } catch (error) {
      console.error('Error loading random users:', error);
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
    if (!state) return;
    
    try {
      await findOpponent(state.topic, state.betAmount);
    } catch (error) {
      console.error('Error finding random opponent:', error);
      toast({
        title: "Erro",
        description: "Não foi possível encontrar um oponente. Tente novamente.",
        variant: "destructive"
      });
    }
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

  if (!state) {
    return null;
  }

  return (
    <div className="min-h-screen casino-futuristic">
      <div className="relative z-10 p-6 pb-40">
        {/* Header with BTZ display */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="relative z-60 p-2 font-bold text-sm rounded-lg transition-all duration-300 border-2 hover:brightness-110"
            style={{ 
              backgroundColor: 'transparent',
              borderColor: '#3d82f7',
              color: '#3d82f7',
              borderImage: 'linear-gradient(45deg, #3d82f7, #7c3aed) 1'
            }}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          
          <div className="casino-card p-2 px-4 border border-blue-400/50 bg-black/40 backdrop-blur-sm rounded-lg">
            <span className="text-blue-400 font-bold">{profile?.points?.toFixed(2) || '0.00'} BTZ</span>
          </div>
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
            <CardTitle className="flex items-center gap-2 text-green-400 text-lg">
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
                  className="space-y-1"
                >
                  {searchResults.map(user => (
                    <UserCard
                      key={user.id}
                      user={user}
                      onChallenge={() => handleDuelInvite(user.id)}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Friends Section */}
        <Card className="casino-card bg-black/40 backdrop-blur-sm border-purple-500/30 mb-4">
          <CardHeader className="p-3">
            <CardTitle className="flex items-center gap-2 text-green-400 text-lg">
              <Users className="h-4 w-4" />
              Amigos e Seguindo
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            {loadingFriends ? (
              <div className="text-center py-2 text-green-400 text-sm">
                Carregando amigos...
              </div>
            ) : friends.length > 0 ? (
              <div className="space-y-1">
                {friends.map(user => (
                  <UserCard
                    key={user.id}
                    user={user}
                    onChallenge={() => handleDuelInvite(user.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-green-400">
                <Users className="h-6 w-6 mx-auto mb-1 opacity-50" />
                <p className="text-sm">Você ainda não segue ninguém</p>
                <p className="text-xs opacity-70">Siga outros jogadores para duelar com eles!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Random Match Section */}
        <Card className="casino-card bg-black/40 backdrop-blur-sm border-purple-500/30">
          <CardHeader className="p-3">
            <CardTitle className="flex items-center gap-2 text-green-400 text-lg">
              <Shuffle className="h-4 w-4" />
              Busca Aleatória
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-3 pt-0">
            <Button
              onClick={handleRandomMatch}
              disabled={isSearching}
              className="w-full font-bold py-2 text-black border-2 hover:brightness-110"
              style={{
                backgroundColor: '#adff2f',
                borderColor: '#adff2f',
                color: 'black'
              }}
            >
              {isSearching ? 'Buscando...' : 'Encontrar Oponente Aleatório'}
            </Button>

            {/* Recent Online Users */}
            {!loadingRandom && randomUsers.length > 0 && (
              <div>
                <h4 className="font-semibold mb-1 text-green-400 text-sm">Jogadores Ativos</h4>
                <div className="space-y-1">
                  {randomUsers.slice(0, 5).map(user => (
                    <UserCard
                      key={user.id}
                      user={user}
                      onChallenge={() => handleDuelInvite(user.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}