import { useState, useEffect } from "react";
import { Button } from "@/components/shared/ui/button";
import { Card } from "@/components/shared/ui/card";
import { Input } from "@/components/shared/ui/input";
import { Switch } from "@/components/shared/ui/switch";
import { Badge } from "@/components/shared/ui/badge";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/hooks/use-i18n";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/use-profile";
import { useKYCStatus } from "@/hooks/use-kyc-status";
import { KYCVerification } from "@/components/features/kyc/KYCVerification";
import { PasswordChangeDialog } from "@/components/settings/password-change-dialog";
import { EmailChangeDialog } from "@/components/settings/email-change-dialog";
import { Edit, Shield } from "lucide-react";

export default function Settings() {
  const { t } = useI18n();
  const [settings, setSettings] = useState({
    notifications: true,
    dailyReminder: true,
    soundEffects: true,
    darkMode: true,
    language: 'pt-BR',
    animationsEnabled: true,
    celebrationsEnabled: true,
    hapticsEnabled: true,
    particleQuality: 'medium' as 'low' | 'medium' | 'high'
  });
  
  const [userInfo, setUserInfo] = useState({
    nickname: '',
    email: '',
    financialGoal: ''
  });

  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [changeEmailOpen, setChangeEmailOpen] = useState(false);
  const [showKYCVerification, setShowKYCVerification] = useState(false);

  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useProfile();
  const { checkKYCRequired } = useKYCStatus();

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
        title: t('errors.error') + " ❌",
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
    <div className="min-h-screen bg-background pb-24" 
         style={{ paddingTop: '50px' }}>
      {/* Header - Enhanced mobile spacing */}
      <div className="px-6 py-4 pt-18">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
              ← {t('profile.header.profile')}
            </Button>
            <h1 className="text-xl font-bold text-foreground">{t('settings.header.settings')}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-4 space-y-6">
        {/* Informações Pessoais */}
        <Card className="p-6">
          <h3 className="font-bold text-foreground mb-6">{t('settings.personalInfo')}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t('settings.nickname')}</label>
              <Input
                value={userInfo.nickname}
                onChange={(e) => setUserInfo({...userInfo, nickname: e.target.value})}
                placeholder="Seu apelido"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t('settings.email')}</label>
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
              <label className="block text-sm font-medium mb-2">{t('settings.password')}</label>
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
              <label className="block text-sm font-medium mb-2">{t('settings.financialGoal')}</label>
              <Input
                value={userInfo.financialGoal}
                onChange={(e) => setUserInfo({...userInfo, financialGoal: e.target.value})}
                placeholder="Seu objetivo principal"
              />
            </div>
          </div>
        </Card>

        {/* KYC Verification */}
        <Card className="p-6">
          <h3 className="font-bold text-foreground mb-6">{t('kyc.title')}</h3>
          <div className="space-y-4">
            <p className="text-muted-foreground">{t('kyc.subtitle')}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span className="text-sm">
                  {profile?.kyc_status === 'approved' ? t('kyc.approved') : 
                   profile?.kyc_status === 'pending' ? t('kyc.pending') : 
                   t('kyc.required')}
                </span>
              </div>
              <Badge variant={
                profile?.kyc_status === 'approved' ? 'default' : 
                profile?.kyc_status === 'pending' ? 'secondary' : 
                'destructive'
              }>
                {profile?.kyc_status === 'approved' ? t('kyc.approved') : 
                 profile?.kyc_status === 'pending' ? t('kyc.pending') : 
                 t('kyc.required')}
              </Badge>
            </div>
            <Button 
              onClick={() => toast({
                title: "Verificação em breve!",
                description: "Esta funcionalidade será lançada em uma próxima versão."
              })}
              disabled={profile?.kyc_status === 'approved'}
              className="w-full"
              variant={profile?.kyc_status === 'approved' ? 'outline' : 'default'}
            >
              {profile?.kyc_status === 'approved' ? t('kyc.approved') : t('kyc.verifyIdentity')}
            </Button>
          </div>
        </Card>

        {/* Notificações */}
        <Card className="p-6">
          <h3 className="font-bold text-foreground mb-6">{t('settings.notifications')}</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">{t('settings.pushNotifications')}</h4>
                <p className="text-sm text-muted-foreground">{t('settings.receiveNotifications')}</p>
              </div>
              <Switch
                checked={settings.notifications}
                onCheckedChange={(checked) => setSettings({...settings, notifications: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">{t('settings.dailyReminder')}</h4>
                <p className="text-sm text-muted-foreground">{t('settings.studyReminder')}</p>
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
          <h3 className="font-bold text-foreground mb-6">{t('settings.experience')}</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">{t('settings.soundEffects')}</h4>
                <p className="text-sm text-muted-foreground">{t('settings.interactionSounds')}</p>
              </div>
              <Switch
                checked={settings.soundEffects}
                onCheckedChange={(checked) => setSettings({...settings, soundEffects: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">{t('settings.darkMode')}</h4>
                <p className="text-sm text-muted-foreground">{t('settings.darkInterface')}</p>
              </div>
              <Switch
                checked={settings.darkMode}
                onCheckedChange={(checked) => setSettings({...settings, darkMode: checked})}
              />
            </div>
          </div>
        </Card>

        {/* Feedback Visual */}
        <Card className="p-6">
          <h3 className="font-bold text-foreground mb-6">{t('feedback.settings.title')}</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">{t('feedback.settings.animations')}</h4>
                <p className="text-sm text-muted-foreground">Animações de recompensas e conquistas</p>
              </div>
              <Switch
                checked={settings.animationsEnabled}
                onCheckedChange={(checked) => setSettings({...settings, animationsEnabled: checked})}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">{t('feedback.settings.celebrations')}</h4>
                <p className="text-sm text-muted-foreground">Celebrações visuais para marcos importantes</p>
              </div>
              <Switch
                checked={settings.celebrationsEnabled}
                onCheckedChange={(checked) => setSettings({...settings, celebrationsEnabled: checked})}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">{t('feedback.settings.haptics')}</h4>
                <p className="text-sm text-muted-foreground">Vibração para feedback tátil</p>
              </div>
              <Switch
                checked={settings.hapticsEnabled}
                onCheckedChange={(checked) => setSettings({...settings, hapticsEnabled: checked})}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">{t('feedback.settings.particleQuality')}</h4>
                <p className="text-sm text-muted-foreground">Qualidade dos efeitos visuais</p>
              </div>
              <select 
                value={settings.particleQuality} 
                onChange={(e) => setSettings({...settings, particleQuality: e.target.value as 'low' | 'medium' | 'high'})}
                className="px-3 py-2 border rounded-md bg-background text-foreground"
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Salvar */}
        <Card className="p-6">
          <Button onClick={handleSaveSettings} className="w-full" disabled={loading}>
            {loading ? t('settings.buttons.saving') : "💾 " + t('settings.buttons.saveSettings')}
          </Button>
        </Card>

        {/* Conta */}
        <Card className="p-6">
          <h3 className="font-bold text-foreground mb-6">{t('settings.account')}</h3>
          <div className="space-y-4">
            <Button 
              variant="destructive"
              onClick={handleLogout}
              className="w-full"
            >
              🚪 {t('settings.buttons.logout')}
            </Button>
          </div>
        </Card>

        {/* Sobre */}
        <Card className="p-6 text-center">
          <h3 className="font-bold text-foreground mb-4">{t('settings.aboutSatoshi')}</h3>
          <p className="text-muted-foreground mb-4">
            {t('settings.app.version')}<br />
            {t('settings.app.description')}
          </p>
          <div className="text-sm text-muted-foreground">
            <p>Email: suporte@sousatoshi.com</p>
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

        {/* KYC Verification Dialog */}
        {/* KYC Feature temporarily disabled - coming soon */}
      </div>
    </div>
  );
}
