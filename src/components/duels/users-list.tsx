import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sword } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface UsersListProps {
  onBack: () => void;
}

export function UsersList({ onBack }: UsersListProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
    loadCurrentProfile();
    loadDistricts();
  }, []);

  const loadCurrentProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setCurrentProfile(profile);
    } catch (error) {
      console.error('Error loading current profile:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .neq('user_id', user.id)
        .order('xp', { ascending: false });

      setUsers(profiles || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de usuários",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadDistricts = async () => {
    try {
      const { data: districts } = await supabase
        .from('districts')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      setDistricts(districts || []);
    } catch (error) {
      console.error('Error loading districts:', error);
    }
  };

  const sendDuelInvite = async (challengedId: string) => {
    try {
      if (!currentProfile) return;
      
      if (!selectedDistrict) {
        toast({
          title: "Distrito obrigatório",
          description: "Selecione um distrito para o duelo",
          variant: "destructive"
        });
        return;
      }

      const district = districts.find(d => d.id === selectedDistrict);
      
      const { error } = await supabase
        .from('duel_invites')
        .insert({
          challenger_id: currentProfile.id,
          challenged_id: challengedId,
          quiz_topic: district?.name || 'Finanças Gerais'
        });

      if (error) throw error;

      toast({
        title: "Convite Enviado!",
        description: `Duelo sobre ${district?.name} enviado!`,
      });

      onBack();
    } catch (error) {
      console.error('Error sending duel invite:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o convite",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando usuários...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Escolher Oponente
            </h1>
            <p className="text-muted-foreground">
              Selecione um usuário para desafiar
            </p>
          </div>
        </div>

        {/* District Selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Escolha o Distrito do Duelo</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione um distrito..." />
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
            {selectedDistrict && (
              <div className="mt-2 text-sm text-muted-foreground">
                {districts.find(d => d.id === selectedDistrict)?.description}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Users List */}
        <div className="grid gap-4">
          {users.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">
                  Nenhum usuário disponível para duelo no momento
                </p>
              </CardContent>
            </Card>
          ) : (
            users.map((user) => (
              <Card key={user.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {user.nickname.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {user.nickname}
                        </h3>
                        <div className="flex items-center gap-4 mt-1">
                          <Badge variant="outline">
                            Nível {user.level}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {user.xp} XP
                          </span>
                          <span className="text-sm text-muted-foreground">
                            🔥 {user.streak} dias
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => sendDuelInvite(user.id)}
                      className="gap-2"
                    >
                      <Sword className="h-4 w-4" />
                      Desafiar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}