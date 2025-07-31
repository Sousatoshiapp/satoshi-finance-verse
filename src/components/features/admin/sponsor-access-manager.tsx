import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Plus, Trash2, Settings, Users, Eye } from "lucide-react";

interface District {
  id: string;
  name: string;
  color_primary: string;
  sponsor_company: string | null;
}

interface SponsorAccess {
  id: string;
  user_id: string;
  district: District;
  access_level: string;
  permissions: any;
  granted_at: string;
  is_active: boolean;
}

interface User {
  id: string;
  nickname: string;
  user_id: string;
}

export function SponsorAccessManager() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [sponsorAccesses, setSponsorAccesses] = useState<SponsorAccess[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedAccessLevel, setSelectedAccessLevel] = useState<string>("manager");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load districts
      const { data: districtsData } = await supabase
        .from('districts')
        .select('id, name, color_primary, sponsor_company')
        .order('name');

      // Load users
      const { data: usersData } = await supabase
        .from('profiles')
        .select('id, nickname, user_id')
        .eq('is_bot', false)
        .order('nickname');

      // Load existing sponsor accesses
      const { data: accessData } = await supabase
        .from('sponsor_admin_access')
        .select(`
          id,
          user_id,
          access_level,
          permissions,
          granted_at,
          is_active,
          district:districts(
            id,
            name,
            color_primary,
            sponsor_company
          )
        `)
        .order('granted_at', { ascending: false });

      setDistricts(districtsData || []);
      setUsers(usersData || []);
      setSponsorAccesses(accessData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGrantAccess = async () => {
    if (!selectedUser || !selectedDistrict) {
      toast({
        title: "Dados incompletos",
        description: "Selecione um usuário e um distrito.",
        variant: "destructive",
      });
      return;
    }

    try {
      const permissions = {
        view_analytics: true,
        manage_store: selectedAccessLevel === 'owner' || selectedAccessLevel === 'manager',
        manage_events: selectedAccessLevel === 'owner'
      };

      const { error } = await supabase
        .from('sponsor_admin_access')
        .insert([{
          user_id: selectedUser,
          district_id: selectedDistrict,
          access_level: selectedAccessLevel,
          permissions: permissions,
          is_active: true
        }]);

      if (error) throw error;

      toast({
        title: "Acesso concedido!",
        description: "O usuário agora tem acesso ao distrito selecionado.",
      });

      // Reset form
      setSelectedUser("");
      setSelectedDistrict("");
      setSelectedAccessLevel("manager");

      // Reload data
      loadData();
    } catch (error: any) {
      console.error('Error granting access:', error);
      toast({
        title: "Erro ao conceder acesso",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRevokeAccess = async (accessId: string) => {
    try {
      const { error } = await supabase
        .from('sponsor_admin_access')
        .update({ is_active: false })
        .eq('id', accessId);

      if (error) throw error;

      toast({
        title: "Acesso revogado",
        description: "O acesso foi removido com sucesso.",
      });

      loadData();
    } catch (error: any) {
      console.error('Error revoking access:', error);
      toast({
        title: "Erro ao revogar acesso",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getAccessBadgeColor = (level: string) => {
    switch (level) {
      case 'owner': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black';
      case 'manager': return 'bg-gradient-to-r from-blue-500 to-purple-600 text-white';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
    }
  };

  const getAccessIcon = (level: string) => {
    switch (level) {
      case 'owner': return Settings;
      case 'manager': return Users;
      default: return Eye;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Form para adicionar novo acesso */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Conceder Acesso de Sponsor Admin
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Usuário</label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um usuário" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.nickname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Distrito</label>
              <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um distrito" />
                </SelectTrigger>
                <SelectContent>
                  {districts.map((district) => (
                    <SelectItem key={district.id} value={district.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: district.color_primary }}
                        />
                        {district.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Nível de Acesso</label>
              <Select value={selectedAccessLevel} onValueChange={setSelectedAccessLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Visualizador</SelectItem>
                  <SelectItem value="manager">Gerente</SelectItem>
                  <SelectItem value="owner">Proprietário</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={handleGrantAccess} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Conceder Acesso
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de acessos existentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Acessos Ativos ({sponsorAccesses.filter(a => a.is_active).length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sponsorAccesses.filter(access => access.is_active).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Nenhum acesso de sponsor admin configurado ainda.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sponsorAccesses
                .filter(access => access.is_active)
                .map((access) => {
                  const user = users.find(u => u.id === access.user_id);
                  const Icon = getAccessIcon(access.access_level);
                  
                  return (
                    <div key={access.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: access.district.color_primary }}
                        />
                        <div>
                          <div className="font-medium">{user?.nickname || 'Usuário removido'}</div>
                          <div className="text-sm text-muted-foreground">
                            {access.district.name}
                            {access.district.sponsor_company && (
                              <span className="ml-2">• {access.district.sponsor_company}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge className={getAccessBadgeColor(access.access_level)}>
                          <Icon className="w-3 h-3 mr-1" />
                          {access.access_level}
                        </Badge>
                        
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRevokeAccess(access.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}