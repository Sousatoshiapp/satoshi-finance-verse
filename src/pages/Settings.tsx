import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

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

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const userData = localStorage.getItem('satoshi_user');
    if (userData) {
      const user = JSON.parse(userData);
      setUserInfo({
        nickname: user.nickname || '',
        email: user.email || '',
        financialGoal: user.financialGoal || ''
      });
    }
    
    const savedSettings = localStorage.getItem('satoshi_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSaveSettings = () => {
    localStorage.setItem('satoshi_settings', JSON.stringify(settings));
    
    // Atualizar também as informações do usuário
    const userData = localStorage.getItem('satoshi_user');
    if (userData) {
      const user = JSON.parse(userData);
      const updatedUser = { ...user, ...userInfo };
      localStorage.setItem('satoshi_user', JSON.stringify(updatedUser));
    }
    
    toast({
      title: "Configurações salvas! ✅",
      description: "Suas preferências foram atualizadas.",
    });
  };

  const handleResetProgress = () => {
    if (confirm('Tem certeza que deseja resetar todo o seu progresso? Esta ação não pode ser desfeita.')) {
      localStorage.removeItem('satoshi_user');
      localStorage.removeItem('satoshi_settings');
      navigate('/welcome');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('satoshi_user');
    navigate('/welcome');
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
            
            <Button variant="outline" className="w-full">
              📤 Exportar Progresso
            </Button>
            
            <Button variant="outline" className="w-full">
              📥 Importar Progresso
            </Button>
            
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
            <Button variant="outline" className="w-full">
              🔐 Alterar Senha
            </Button>
            
            <Button variant="outline" className="w-full">
              📧 Alterar Email
            </Button>
            
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
            <Button variant="outline" size="sm">Termos de Uso</Button>
            <Button variant="outline" size="sm">Privacidade</Button>
            <Button variant="outline" size="sm">Suporte</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}