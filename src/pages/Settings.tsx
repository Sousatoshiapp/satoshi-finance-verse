import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/use-profile";
import { PasswordChangeDialog } from "@/components/settings/password-change-dialog";
import { EmailChangeDialog } from "@/components/settings/email-change-dialog";
import { Edit } from "lucide-react";

export default function Settings() {
  const [settings, setSettings] = useState({
    notifications: true,
    dailyReminder: true,
    soundEffects: true,
    darkMode: true,
    language: 'pt-BR'
  });
  
  const [userInfo, setUserInfo] = useState({
    nickname: '',
    email: '',
    financialGoal: ''
  });

  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [changeEmailOpen, setChangeEmailOpen] = useState(false);

  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useProfile();

  useEffect(() => {
    loadUserData();
  }, [profile]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Buscar dados do usuário autenticado
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && profile) {
        setUserInfo({
          nickname: profile.nickname || '',
          email: user.email || '',
          financialGoal: (profile as any).financial_goal || ''
        });
      }
      
      // Carregar configurações salvas
      const savedSettings = localStorage.getItem('satoshi_settings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
        
        // Aplicar modo escuro
        if (parsedSettings.darkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  // Aplicar mudanças em tempo real
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      
      // Salvar configurações no localStorage
      localStorage.setItem('satoshi_settings', JSON.stringify(settings));
      
      // Atualizar perfil no Supabase se há mudanças no nickname ou objetivo
      if (profile) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            nickname: userInfo.nickname,
            financial_goal: userInfo.financialGoal 
          })
          .eq('id', profile.id);
          
        if (profileError) throw profileError;
      }
      
      // Atualizar email no auth se foi alterado
      const { data: { user } } = await supabase.auth.getUser();
      if (user && userInfo.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: userInfo.email
        });
        
        if (emailError) {
          toast({
            title: "Aviso ⚠️",
            description: "Email não foi alterado. Use a opção 'Alterar Email' na seção Conta.",
            variant: "destructive"
          });
        }
      }
      
      // Atualizar localStorage para compatibilidade
      const userData = localStorage.getItem('satoshi_user');
      if (userData) {
        const user = JSON.parse(userData);
        const updatedUser = { ...user, ...userInfo };
        localStorage.setItem('satoshi_user', JSON.stringify(updatedUser));
      }
      
      toast({
        title: "Configurações salvas! ✅",
        description: "Suas informações foram atualizadas no banco de dados.",
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro ❌",
        description: "Não foi possível salvar algumas informações.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetProgress = () => {
    if (confirm('Tem certeza que deseja resetar todo o seu progresso? Esta ação não pode ser desfeita.')) {
      localStorage.removeItem('satoshi_user');
      localStorage.removeItem('satoshi_settings');
      navigate('/welcome');
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('satoshi_user');
      navigate('/welcome');
    } catch (error) {
      console.error('Error logging out:', error);
      navigate('/welcome');
    }
  };

  const handleExportData = () => {
    const userData = localStorage.getItem('satoshi_user');
    const settingsData = localStorage.getItem('satoshi_settings');
    
    const exportData = {
      user: userData ? JSON.parse(userData) : null,
      settings: settingsData ? JSON.parse(settingsData) : null,
      timestamp: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `satoshi-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    
    toast({
      title: "Dados exportados! 📤",
      description: "Seu backup foi baixado com sucesso.",
    });
  };


  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
              ← Perfil
            </Button>
            <h1 className="text-xl font-bold text-foreground">Configurações</h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Informações Pessoais */}
        <Card className="p-6">
          <h3 className="font-bold text-foreground mb-6">Informações Pessoais</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Apelido</label>
              <Input
                value={userInfo.nickname}
                onChange={(e) => setUserInfo({...userInfo, nickname: e.target.value})}
                placeholder="Seu apelido"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  value={userInfo.email}
                  readOnly
                  placeholder="seu@email.com"
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setChangeEmailOpen(true)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Senha</label>
              <div className="flex gap-2">
                <Input
                  type="password"
                  value="••••••••"
                  readOnly
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setChangePasswordOpen(true)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Objetivo Financeiro</label>
              <Input
                value={userInfo.financialGoal}
                onChange={(e) => setUserInfo({...userInfo, financialGoal: e.target.value})}
                placeholder="Seu objetivo principal"
              />
            </div>
          </div>
        </Card>

        {/* Notificações */}
        <Card className="p-6">
          <h3 className="font-bold text-foreground mb-6">Notificações</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">Notificações Push</h4>
                <p className="text-sm text-muted-foreground">Receber notificações do app</p>
              </div>
              <Switch
                checked={settings.notifications}
                onCheckedChange={(checked) => setSettings({...settings, notifications: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">Lembrete Diário</h4>
                <p className="text-sm text-muted-foreground">Lembrete para estudar todos os dias</p>
              </div>
              <Switch
                checked={settings.dailyReminder}
                onCheckedChange={(checked) => setSettings({...settings, dailyReminder: checked})}
              />
            </div>
          </div>
        </Card>

        {/* Experiência */}
        <Card className="p-6">
          <h3 className="font-bold text-foreground mb-6">Experiência</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">Efeitos Sonoros</h4>
                <p className="text-sm text-muted-foreground">Sons de interação e conquistas</p>
              </div>
              <Switch
                checked={settings.soundEffects}
                onCheckedChange={(checked) => setSettings({...settings, soundEffects: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">Modo Escuro</h4>
                <p className="text-sm text-muted-foreground">Interface com tema escuro</p>
              </div>
              <Switch
                checked={settings.darkMode}
                onCheckedChange={(checked) => setSettings({...settings, darkMode: checked})}
              />
            </div>
          </div>
        </Card>

        {/* Salvar */}
        <Card className="p-6">
          <Button onClick={handleSaveSettings} className="w-full" disabled={loading}>
            {loading ? "Salvando..." : "💾 Salvar Configurações"}
          </Button>
        </Card>

        {/* Conta */}
        <Card className="p-6">
          <h3 className="font-bold text-foreground mb-6">Conta</h3>
          <div className="space-y-4">
            <Button 
              variant="destructive"
              onClick={handleLogout}
              className="w-full"
            >
              🚪 Sair da Conta
            </Button>
          </div>
        </Card>

        {/* Sobre */}
        <Card className="p-6 text-center">
          <h3 className="font-bold text-foreground mb-4">Sobre o Satoshi</h3>
          <p className="text-muted-foreground mb-4">
            Versão 1.0.0<br />
            O game das finanças
          </p>
          <div className="text-sm text-muted-foreground">
            <p>Email: suporte@satoshi.app</p>
            <p>Telegram: @satoshisupport</p>
          </div>
        </Card>

        {/* Password Change Dialog */}
        <PasswordChangeDialog
          isOpen={changePasswordOpen}
          onClose={() => setChangePasswordOpen(false)}
        />

        {/* Email Change Dialog */}
        <EmailChangeDialog
          isOpen={changeEmailOpen}
          onClose={() => setChangeEmailOpen(false)}
          currentEmail={userInfo.email}
        />
      </div>
    </div>
  );
}
