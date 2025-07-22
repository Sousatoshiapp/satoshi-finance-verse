import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/use-profile";

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

  const [dialogStates, setDialogStates] = useState({
    changePassword: false,
    changeEmail: false,
    exportData: false,
    importData: false,
    terms: false,
    privacy: false,
    support: false
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    password: ''
  });

  const [importText, setImportText] = useState('');
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

  const handleImportData = () => {
    try {
      if (!importText.trim()) {
        toast({
          title: "Erro na importação ❌",
          description: "Por favor, cole os dados do backup.",
          variant: "destructive"
        });
        return;
      }

      const importedData = JSON.parse(importText);
      
      if (importedData.user) {
        localStorage.setItem('satoshi_user', JSON.stringify(importedData.user));
      }
      if (importedData.settings) {
        localStorage.setItem('satoshi_settings', JSON.stringify(importedData.settings));
        setSettings(importedData.settings);
      }
      
      setImportText('');
      setDialogStates({ ...dialogStates, importData: false });
      
      toast({
        title: "Dados importados! 📥",
        description: "Seu progresso foi restaurado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro na importação ❌",
        description: "Formato de dados inválido.",
        variant: "destructive"
      });
    }
  };

  const handleChangePassword = async () => {
    console.log('🔐 Tentando alterar senha...');
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Erro ❌",
        description: "As senhas não coincidem.",
        variant: "destructive"
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Erro ❌",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('📝 Enviando requisição para atualizar senha...');
      const { data, error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });

      console.log('📄 Resposta do Supabase:', { data, error });

      if (error) {
        console.error('❌ Erro específico ao alterar senha:', error);
        throw error;
      }

      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setDialogStates({ ...dialogStates, changePassword: false });
      
      toast({
        title: "Senha alterada! 🔐",
        description: "Sua senha foi atualizada com sucesso.",
      });
    } catch (error: any) {
      console.error('💥 Erro completo ao alterar senha:', error);
      toast({
        title: "Erro ❌",
        description: error.message || "Não foi possível alterar a senha.",
        variant: "destructive"
      });
    }
  };

  const handleChangeEmail = async () => {
    console.log('📧 Tentando alterar email...');
    
    if (!emailForm.newEmail || !emailForm.password) {
      toast({
        title: "Erro ❌",
        description: "Preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('📝 Enviando requisição para atualizar email...');
      const { data, error } = await supabase.auth.updateUser({
        email: emailForm.newEmail
      });

      console.log('📄 Resposta do Supabase:', { data, error });

      if (error) {
        console.error('❌ Erro específico ao alterar email:', error);
        throw error;
      }

      setEmailForm({ newEmail: '', password: '' });
      setDialogStates({ ...dialogStates, changeEmail: false });
      
      toast({
        title: "Email alterado! 📧",
        description: "Verifique seu novo email para confirmar a alteração.",
      });
    } catch (error: any) {
      console.error('💥 Erro completo ao alterar email:', error);
      toast({
        title: "Erro ❌",
        description: error.message || "Não foi possível alterar o email.",
        variant: "destructive"
      });
    }
  };

  const openDialog = (dialogName: string) => {
    setDialogStates({ ...dialogStates, [dialogName]: true });
  };

  const closeDialog = (dialogName: string) => {
    setDialogStates({ ...dialogStates, [dialogName]: false });
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
              <Input
                type="email"
                value={userInfo.email}
                onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
                placeholder="seu@email.com"
              />
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

        {/* Dados */}
        <Card className="p-6">
          <h3 className="font-bold text-foreground mb-6">Dados</h3>
          <div className="space-y-4">
            <Button onClick={handleSaveSettings} className="w-full">
              💾 Salvar Configurações
            </Button>
            
            <Button variant="outline" onClick={handleExportData} className="w-full">
              📤 Exportar Progresso
            </Button>
            
            <Dialog open={dialogStates.importData} onOpenChange={() => closeDialog('importData')}>
              <DialogTrigger asChild>
                <Button variant="outline" onClick={() => openDialog('importData')} className="w-full">
                  📥 Importar Progresso
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Importar Progresso</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Cole os dados do backup aqui:
                  </p>
                  <textarea
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder="Cole o conteúdo do arquivo de backup aqui..."
                    className="w-full h-32 p-3 border rounded-md resize-none"
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => closeDialog('importData')}>
                    Cancelar
                  </Button>
                  <Button onClick={handleImportData}>
                    Importar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Button 
              variant="destructive" 
              onClick={handleResetProgress}
              className="w-full"
            >
              🔄 Resetar Progresso
            </Button>
          </div>
        </Card>

        {/* Conta */}
        <Card className="p-6">
          <h3 className="font-bold text-foreground mb-6">Conta</h3>
          <div className="space-y-4">
            <Dialog open={dialogStates.changePassword} onOpenChange={() => closeDialog('changePassword')}>
              <DialogTrigger asChild>
                <Button variant="outline" onClick={() => openDialog('changePassword')} className="w-full">
                  🔐 Alterar Senha
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Alterar Senha</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nova Senha</label>
                    <Input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      placeholder="Digite sua nova senha"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Confirmar Senha</label>
                    <Input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                      placeholder="Confirme sua nova senha"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => closeDialog('changePassword')}>
                    Cancelar
                  </Button>
                  <Button onClick={handleChangePassword}>
                    Alterar Senha
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Dialog open={dialogStates.changeEmail} onOpenChange={() => closeDialog('changeEmail')}>
              <DialogTrigger asChild>
                <Button variant="outline" onClick={() => openDialog('changeEmail')} className="w-full">
                  📧 Alterar Email
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Alterar Email</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Novo Email</label>
                    <Input
                      type="email"
                      value={emailForm.newEmail}
                      onChange={(e) => setEmailForm({...emailForm, newEmail: e.target.value})}
                      placeholder="Digite seu novo email"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => closeDialog('changeEmail')}>
                    Cancelar
                  </Button>
                  <Button onClick={handleChangeEmail}>
                    Alterar Email
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
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
            O Duolingo das finanças
          </p>
          <div className="flex gap-2 justify-center">
            <Dialog open={dialogStates.terms} onOpenChange={() => closeDialog('terms')}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => openDialog('terms')}>
                  Termos de Uso
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Termos de Uso</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 text-sm">
                  <h4 className="font-semibold">1. Aceitação dos Termos</h4>
                  <p>Ao usar o Satoshi Finance Game, você concorda com estes termos de uso.</p>
                  
                  <h4 className="font-semibold">2. Uso do Aplicativo</h4>
                  <p>O aplicativo é destinado para fins educacionais sobre finanças pessoais e investimentos.</p>
                  
                  <h4 className="font-semibold">3. Gamificação</h4>
                  <p>Os pontos, níveis e conquistas são virtuais e não possuem valor monetário real.</p>
                  
                  <h4 className="font-semibold">4. Responsabilidades</h4>
                  <p>O conteúdo educacional não constitui aconselhamento financeiro profissional.</p>
                  
                  <h4 className="font-semibold">5. Modificações</h4>
                  <p>Reservamos o direito de modificar estes termos a qualquer momento.</p>
                </div>
                <DialogFooter>
                  <Button onClick={() => closeDialog('terms')}>
                    Fechar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Dialog open={dialogStates.privacy} onOpenChange={() => closeDialog('privacy')}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => openDialog('privacy')}>
                  Privacidade
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Política de Privacidade</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 text-sm">
                  <h4 className="font-semibold">1. Coleta de Dados</h4>
                  <p>Coletamos apenas dados necessários para o funcionamento do aplicativo e sua experiência educacional.</p>
                  
                  <h4 className="font-semibold">2. Uso dos Dados</h4>
                  <p>Seus dados são usados para personalizar seu aprendizado e salvar seu progresso.</p>
                  
                  <h4 className="font-semibold">3. Compartilhamento</h4>
                  <p>Não compartilhamos seus dados pessoais com terceiros sem seu consentimento.</p>
                  
                  <h4 className="font-semibold">4. Segurança</h4>
                  <p>Implementamos medidas de segurança para proteger seus dados.</p>
                  
                  <h4 className="font-semibold">5. Cookies</h4>
                  <p>Usamos localStorage para salvar suas preferências e progresso localmente.</p>
                  
                  <h4 className="font-semibold">6. Seus Direitos</h4>
                  <p>Você pode exportar, importar ou resetar seus dados a qualquer momento.</p>
                </div>
                <DialogFooter>
                  <Button onClick={() => closeDialog('privacy')}>
                    Fechar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Dialog open={dialogStates.support} onOpenChange={() => closeDialog('support')}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => openDialog('support')}>
                  Suporte
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Suporte</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="text-center space-y-3">
                    <h4 className="font-semibold">Precisa de Ajuda?</h4>
                    <p className="text-sm text-muted-foreground">
                      Entre em contato conosco através dos canais abaixo:
                    </p>
                    
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full" onClick={() => window.open('mailto:suporte@satoshi.app')}>
                        📧 Email: suporte@satoshi.app
                      </Button>
                      
                      <Button variant="outline" className="w-full" onClick={() => window.open('https://telegram.me/satoshisupport')}>
                        💬 Telegram
                      </Button>
                      
                      <Button variant="outline" className="w-full" onClick={() => window.open('https://wa.me/5511999999999')}>
                        📱 WhatsApp
                      </Button>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-4">
                      Respondemos em até 24 horas
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => closeDialog('support')}>
                    Fechar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </Card>
      </div>
    </div>
  );
}