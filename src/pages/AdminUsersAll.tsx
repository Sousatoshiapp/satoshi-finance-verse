import { useState, useEffect } from "react";
import { AdminAuthProtection } from "@/components/admin-auth-protection";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Users, Search, UserCheck, UserX, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  nickname: string;
  level: number;
  xp: number;
  points: number;
  subscription_tier: 'free' | 'pro' | 'elite';
  is_bot: boolean;
  streak: number;
  created_at: string;
}

export default function AdminUsersAll() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar usuários",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.nickname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const userStats = {
    total: users.length,
    real: users.filter(u => !u.is_bot).length,
    bots: users.filter(u => u.is_bot).length,
    premium: users.filter(u => u.subscription_tier !== 'free').length
  };

  return (
    <AdminAuthProtection>
      <div className="flex min-h-screen w-full bg-background">
        <AdminSidebar />
        
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Header */}
              <div>
                <h1 className="text-3xl font-bold text-foreground">Todos os Usuários</h1>
                <p className="text-muted-foreground">Gerencie todos os usuários da plataforma</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Users className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="text-2xl font-bold">{userStats.total}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <UserCheck className="h-8 w-8 text-green-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Usuários Reais</p>
                        <p className="text-2xl font-bold">{userStats.real}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <UserX className="h-8 w-8 text-gray-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Bots</p>
                        <p className="text-2xl font-bold">{userStats.bots}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Crown className="h-8 w-8 text-yellow-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Premium</p>
                        <p className="text-2xl font-bold">{userStats.premium}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Search */}
              <Card>
                <CardHeader>
                  <CardTitle>Buscar Usuários</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nickname..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Users List */}
              <Card>
                <CardHeader>
                  <CardTitle>Lista de Usuários ({filteredUsers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">Carregando...</div>
                  ) : (
                    <div className="space-y-4">
                      {filteredUsers.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <div>
                              <h3 className="font-semibold">{user.nickname}</h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>Nível {user.level}</span>
                                <span>•</span>
                                <span>{user.xp} XP</span>
                                <span>•</span>
                                <span>{user.points} Beetz</span>
                                {user.is_bot && <Badge variant="secondary">Bot</Badge>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={user.subscription_tier === 'free' ? 'outline' : 'default'}>
                              {user.subscription_tier}
                            </Badge>
                            <Button variant="outline" size="sm">
                              Ver Detalhes
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AdminAuthProtection>
  );
}