import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { Badge } from "@/components/shared/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/hooks/use-i18n";
import { supabase } from "@/integrations/supabase/client";
import { AdminAuthProtection } from "@/components/admin-auth-protection";
import { AdminSidebar } from "@/components/features/admin/admin-sidebar";
import { 
  Users, Search, MoreHorizontal, Crown, Shield, 
  Trash2, Edit, Eye, DollarSign, Trophy, Calendar
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shared/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shared/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shared/ui/dialog";

interface User {
  id: string;
  nickname: string;
  level: number;
  xp: number;
  points: number;
  subscription_tier: 'free' | 'pro' | 'elite';
  subscription_expires_at: string | null;
  created_at: string;
  updated_at: string;
  is_bot: boolean;
  streak: number;
}

export default function AdminUsers() {
  const { t } = useI18n();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User>>({});
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_bot', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      console.error('Error loading users:', error);
      toast({
        title: t('errors.error') + " ao carregar usuários",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', selectedUser.id);

      if (error) throw error;

      toast({
        title: "Usuário deletado",
        description: `${selectedUser.nickname} foi removido do sistema.`,
      });

      setDeleteDialogOpen(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: t('errors.error') + " ao deletar usuário",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser || !editingUser) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(editingUser)
        .eq('id', selectedUser.id);

      if (error) throw error;

      toast({
        title: "Usuário atualizado",
        description: `${selectedUser.nickname} foi atualizado com sucesso.`,
      });

      setEditDialogOpen(false);
      setSelectedUser(null);
      setEditingUser({});
      loadUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        title: t('errors.error') + " ao atualizar usuário",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setEditingUser({
      nickname: user.nickname,
      level: user.level,
      xp: user.xp,
      points: user.points,
      subscription_tier: user.subscription_tier,
    });
    setEditDialogOpen(true);
  };

  const filteredUsers = users.filter(user =>
    user.nickname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSubscriptionBadge = (tier: string) => {
    switch (tier) {
      case 'elite':
        return <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">Elite</Badge>;
      case 'pro':
        return <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500">Pro</Badge>;
      default:
        return <Badge variant="outline">Free</Badge>;
    }
  };

  return (
    <AdminAuthProtection>
      <div className="flex min-h-screen w-full bg-background">
        <AdminSidebar />
        
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">
                  Gestão de Usuários
                </h1>
                <p className="text-muted-foreground">
                  Gerenciar todos os usuários do sistema
                </p>
              </div>
              <Button onClick={loadUsers} disabled={loading}>
                {loading ? t('common.loading') + "..." : "Atualizar"}
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Usuários</p>
                      <p className="text-2xl font-bold">{users.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-warning" />
                    <div>
                      <p className="text-sm text-muted-foreground">Premium</p>
                      <p className="text-2xl font-bold">
                        {users.filter(u => u.subscription_tier !== 'free').length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-success" />
                    <div>
                      <p className="text-sm text-muted-foreground">Ativos (7 dias)</p>
                      <p className="text-2xl font-bold">
                        {users.filter(u => 
                          new Date(u.updated_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                        ).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-level" />
                    <div>
                      <p className="text-sm text-muted-foreground">Nível Médio</p>
                      <p className="text-2xl font-bold">
                        {users.length > 0 ? Math.round(users.reduce((acc, u) => acc + u.level, 0) / users.length) : 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Usuários</CardTitle>
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nickname..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Nível</TableHead>
                      <TableHead>XP</TableHead>
                      <TableHead>Beetz</TableHead>
                      <TableHead>Assinatura</TableHead>
                      <TableHead>Streak</TableHead>
                      <TableHead>Criado em</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.nickname}
                        </TableCell>
                        <TableCell>{user.level}</TableCell>
                        <TableCell>{user.xp?.toLocaleString()}</TableCell>
                        <TableCell>{user.points?.toLocaleString()}</TableCell>
                        <TableCell>{getSubscriptionBadge(user.subscription_tier)}</TableCell>
                        <TableCell>{user.streak}</TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => openEditDialog(user)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Deletar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja deletar o usuário <strong>{selectedUser?.nickname}</strong>? 
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Deletar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Modificar informações do usuário {selectedUser?.nickname}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="nickname" className="text-right">Nickname</label>
              <Input
                id="nickname"
                value={editingUser.nickname || ''}
                onChange={(e) => setEditingUser({...editingUser, nickname: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="level" className="text-right">Nível</label>
              <Input
                id="level"
                type="number"
                value={editingUser.level || 0}
                onChange={(e) => setEditingUser({...editingUser, level: parseInt(e.target.value)})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="xp" className="text-right">XP</label>
              <Input
                id="xp"
                type="number"
                value={editingUser.xp || 0}
                onChange={(e) => setEditingUser({...editingUser, xp: parseInt(e.target.value)})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="points" className="text-right">Beetz</label>
              <Input
                id="points"
                type="number"
                value={editingUser.points || 0}
                onChange={(e) => setEditingUser({...editingUser, points: parseInt(e.target.value)})}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditUser}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminAuthProtection>
  );
}
