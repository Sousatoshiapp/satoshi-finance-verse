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
      <Card className="cursor-pointer hover:shadow-lg transition-all">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AvatarDisplayUniversal
                avatarData={normalizeAvatarData(user)}
                nickname={user.nickname}
                size="md"
              />
              <div>
                <div className="font-semibold">{user.nickname}</div>
                <div className="text-sm text-muted-foreground">
                  Nível {user.level} • {user.points} BTZ
                </div>
                {user.is_bot && (
                  <Badge variant="secondary" className="text-xs">Bot</Badge>
                )}
              </div>
            </div>
            <Button
              size="sm"
              onClick={onChallenge}
              disabled={isSearching}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Swords className="h-4 w-4 mr-1" />
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
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="container mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Selecionar Oponente</h1>
            <p className="text-muted-foreground">
              {state.topic} • Aposta: {state.betAmount} BTZ
            </p>
          </div>
        </div>

        {/* Search Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Buscar Jogadores
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Digite o nickname do jogador..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                searchUsers(e.target.value);
              }}
              className="w-full"
            />
            
            {loadingSearch && (
              <div className="text-center py-4 text-muted-foreground">
                Buscando...
              </div>
            )}
            
            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Amigos e Seguindo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingFriends ? (
              <div className="text-center py-4 text-muted-foreground">
                Carregando amigos...
              </div>
            ) : friends.length > 0 ? (
              <div className="space-y-2">
                {friends.map(user => (
                  <UserCard
                    key={user.id}
                    user={user}
                    onChallenge={() => handleDuelInvite(user.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Você ainda não segue ninguém</p>
                <p className="text-sm">Siga outros jogadores para duelar com eles!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Random Match Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shuffle className="h-5 w-5" />
              Busca Aleatória
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleRandomMatch}
              disabled={isSearching}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-3"
            >
              {isSearching ? 'Buscando...' : 'Encontrar Oponente Aleatório'}
            </Button>
            
            <div className="text-sm text-muted-foreground text-center">
              O sistema irá buscar um oponente disponível ou um bot com nível similar
            </div>

            {/* Recent Online Users */}
            {!loadingRandom && randomUsers.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Jogadores Ativos</h4>
                <div className="space-y-2">
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