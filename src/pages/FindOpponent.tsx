import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FloatingNavbar } from "@/components/floating-navbar";
import { UserCard } from "@/components/social/user-card";
import { ArrowLeft, Search, Users, Shuffle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  id: string;
  nickname: string;
  level: number;
  xp: number;
  profile_image_url?: string;
  avatar?: {
    id: string;
    name: string;
    image_url: string;
  };
}

export default function FindOpponent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadCurrentUser();
    loadRandomUsers();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setCurrentUser(profile);
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const loadRandomUsers = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      const { data } = await supabase
        .from('profiles')
        .select(`
          id,
          nickname,
          level,
          xp,
          profile_image_url,
          avatars (
            id,
            name,
            image_url
          )
        `)
        .neq('id', currentProfile?.id)
        .limit(10);

      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      loadRandomUsers();
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      const { data } = await supabase
        .from('profiles')
        .select(`
          id,
          nickname,
          level,
          xp,
          profile_image_url,
          avatars (
            id,
            name,
            image_url
          )
        `)
        .neq('id', currentProfile?.id)
        .ilike('nickname', `%${searchQuery}%`)
        .limit(10);

      setUsers(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const challengeUser = async (userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: challengerProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!challengerProfile) return;

      const { error } = await supabase
        .from('duel_invites')
        .insert({
          challenger_id: challengerProfile.id,
          challenged_id: userId,
          quiz_topic: 'financas'
        });

      if (error) throw error;

      toast({
        title: "Desafio enviado!",
        description: "O usuário foi desafiado. Aguarde a resposta.",
      });

      navigate('/duels');
    } catch (error) {
      console.error('Error challenging user:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o desafio. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const findAutomaticOpponent = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      // Usar a função do banco para encontrar oponente automático
      const { data: matchResult } = await supabase
        .rpc('find_automatic_opponent', {
          p_user_id: profile.id,
          p_topic: 'financas'
        });

      if (matchResult && matchResult.length > 0) {
        const result = matchResult[0];
        
        if (result.match_found) {
          if (result.opponent_type === 'human') {
            // Criar duelo com usuário real
            toast({
              title: "Oponente encontrado!",
              description: "Iniciando duelo com usuário real...",
            });
          } else if (result.opponent_type === 'bot') {
            // Criar duelo com bot
            toast({
              title: "Bot encontrado!",
              description: "Iniciando duelo com bot...",
            });
          }
          
          // Criar duelo automaticamente
          const { error: duelError } = await supabase
            .from('duel_invites')
            .insert({
              challenger_id: profile.id,
              challenged_id: result.opponent_id,
              quiz_topic: 'financas',
              status: 'accepted' // Auto-aceitar para bots e matching automático
            });

          if (!duelError) {
            navigate('/duels');
          }
        } else {
          toast({
            title: "Aguardando oponente...",
            description: "Você foi adicionado à fila. Aguarde um oponente.",
          });
        }
      }
    } catch (error) {
      console.error('Error finding automatic opponent:', error);
      toast({
        title: "Erro",
        description: "Não foi possível encontrar oponente automático.",
        variant: "destructive"
      });
    }
  };

  const findRandomOpponent = () => {
    if (users.length > 0) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      challengeUser(randomUser.id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-blue-900 pb-20">
      {/* Cyberpunk Grid Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(173, 255, 47, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(173, 255, 47, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          animation: 'pulse 4s ease-in-out infinite'
        }} />
      </div>

      <div className="max-w-md mx-auto px-4 py-6 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/duel-quiz')}
            className="text-[#adff2f] hover:bg-[#adff2f]/10 hover:text-[#adff2f] border border-[#adff2f]/30 hover:border-[#adff2f]/60 transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#adff2f] via-purple-400 to-pink-400 bg-clip-text text-transparent">
            ENCONTRAR OPONENTE
          </h1>
          <div className="w-10"></div>
        </div>

        {/* Search Section */}
        <Card className="relative border-none shadow-none mb-8" style={{
          background: 'linear-gradient(135deg, rgba(173, 255, 47, 0.1), rgba(255, 0, 255, 0.1), rgba(255, 255, 0, 0.05))',
          boxShadow: '0 8px 32px rgba(173, 255, 47, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(173, 255, 47, 0.2)'
        }}>
          <CardContent className="p-6">
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Buscar por nickname..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
                className="bg-black/30 border-[#adff2f]/30 text-white placeholder:text-white/60"
              />
              <Button
                onClick={searchUsers}
                className="bg-[#adff2f] hover:bg-[#adff2f]/80 text-black"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Button
                onClick={findAutomaticOpponent}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold"
              >
                <Shuffle className="h-4 w-4 mr-2" />
                Encontrar Oponente Automático
              </Button>
              
              <Button
                onClick={findRandomOpponent}
                variant="outline"
                className="w-full border-[#adff2f]/30 text-[#adff2f] hover:bg-[#adff2f]/10"
              >
                Desafiar Aleatório da Lista
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-[#adff2f]">Buscando oponentes...</div>
            </div>
          ) : users.length === 0 ? (
            <Card className="bg-black/20 border-[#adff2f]/20">
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-[#adff2f]/50 mx-auto mb-4" />
                <p className="text-white/70">Nenhum usuário encontrado</p>
                <p className="text-sm text-white/50 mt-2">
                  {searchQuery ? 'Tente buscar com outro termo' : 'Carregue usuários aleatórios'}
                </p>
              </CardContent>
            </Card>
          ) : (
            users.map((user) => (
              <Card 
                key={user.id}
                className="bg-black/20 border-[#adff2f]/20 hover:border-[#adff2f]/40 transition-all duration-300"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <UserCard
                      user={user}
                      compact
                      showSocialStats={false}
                    />
                    <Button
                      onClick={() => challengeUser(user.id)}
                      className="bg-[#adff2f] hover:bg-[#adff2f]/80 text-black font-semibold"
                    >
                      Desafiar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <FloatingNavbar />
    </div>
  );
}