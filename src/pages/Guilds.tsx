import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { FloatingNavbar } from "@/components/floating-navbar";
import { Users, Crown, Trophy, Shield, Search, Plus, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Guild {
  id: string;
  name: string;
  description: string;
  members: number;
  maxMembers: number;
  level: number;
  xp: number;
  leader: string;
  emblem: string;
  requirements: string;
  isJoined: boolean;
}

export default function Guilds() {
  const navigate = useNavigate();
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGuilds();
  }, []);

  const loadGuilds = async () => {
    // Mock data
    const mockGuilds: Guild[] = [
      {
        id: '1',
        name: 'Crypto Masters',
        description: 'Elite traders unidos pela paixão em criptomoedas',
        members: 48,
        maxMembers: 50,
        level: 15,
        xp: 15420,
        leader: 'CryptoKing',
        emblem: '⚡',
        requirements: 'Nível 10+',
        isJoined: true
      },
      {
        id: '2',
        name: 'DeFi Warriors',
        description: 'Explorando o futuro das finanças descentralizadas',
        members: 32,
        maxMembers: 40,
        level: 12,
        xp: 9830,
        leader: 'DeFiMaster',
        emblem: '🛡️',
        requirements: 'Nível 8+',
        isJoined: false
      },
      {
        id: '3',
        name: 'Blockchain Pioneers',
        description: 'Pioneiros da tecnologia blockchain',
        members: 25,
        maxMembers: 30,
        level: 18,
        xp: 21500,
        leader: 'BlockchainPro',
        emblem: '🔗',
        requirements: 'Nível 15+',
        isJoined: false
      }
    ];

    setTimeout(() => {
      setGuilds(mockGuilds);
      setLoading(false);
    }, 1000);
  };

  const filteredGuilds = guilds.filter(guild =>
    guild.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guild.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dashboard')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Sistema de Guildas</h1>
              <p className="text-muted-foreground">Una-se a outros traders e conquiste objetivos juntos</p>
            </div>
            <Button onClick={() => {}} className="bg-gradient-to-r from-primary to-secondary">
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
          {guilds.some(g => g.isJoined) && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                Sua Guilda
              </h2>
              {guilds.filter(g => g.isJoined).map((guild) => (
                <Card key={guild.id} className="border-primary/30 bg-gradient-to-r from-background to-primary/5">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-3xl">
                          {guild.emblem}
                        </div>
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {guild.name}
                            <Badge variant="outline" className="bg-yellow-500/10 border-yellow-500/30">
                              <Crown className="h-3 w-3 mr-1" />
                              Nível {guild.level}
                            </Badge>
                          </CardTitle>
                          <p className="text-muted-foreground">{guild.description}</p>
                        </div>
                      </div>
                      <Button variant="outline">
                        Gerenciar
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Membros</div>
                        <div className="text-xl font-bold">{guild.members}/{guild.maxMembers}</div>
                        <Progress value={(guild.members / guild.maxMembers) * 100} className="h-2 mt-1" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">XP da Guilda</div>
                        <div className="text-xl font-bold">{guild.xp.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Líder</div>
                        <div className="text-xl font-bold">{guild.leader}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Available Guilds */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Guildas Disponíveis
            </h2>
            <div className="space-y-4">
              {filteredGuilds.filter(g => !g.isJoined).map((guild) => (
                <Card key={guild.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-muted to-card flex items-center justify-center text-2xl">
                          {guild.emblem}
                        </div>
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {guild.name}
                            <Badge variant="outline">
                              Nível {guild.level}
                            </Badge>
                          </CardTitle>
                          <p className="text-muted-foreground text-sm">{guild.description}</p>
                        </div>
                      </div>
                      <Button>
                        Solicitar Entrada
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {guild.members}/{guild.maxMembers}
                        </div>
                        <div className="flex items-center gap-1">
                          <Trophy className="h-4 w-4" />
                          {guild.xp.toLocaleString()} XP
                        </div>
                        <div className="flex items-center gap-1">
                          <Shield className="h-4 w-4" />
                          {guild.requirements}
                        </div>
                      </div>
                      <div className="text-muted-foreground">
                        Líder: {guild.leader}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
      <FloatingNavbar />
    </div>
  );
}