import { useState, useEffect } from "react";
import { Button } from "@/components/shared/ui/button";
import { Card } from "@/components/shared/ui/card";
import { Input } from "@/components/shared/ui/input";
import { Switch } from "@/components/shared/ui/switch";
import { Badge } from "@/components/shared/ui/badge";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/hooks/use-i18n";
import { useTheme } from "@/providers/ThemeProvider";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/use-profile";
import { useKYCStatus } from "@/hooks/use-kyc-status";
import { useBiometricAuth } from "@/hooks/use-biometric-auth";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { KYCVerification } from "@/components/features/kyc/KYCVerification";
import { PasswordChangeDialog } from "@/components/settings/password-change-dialog";
import { EmailChangeDialog } from "@/components/settings/email-change-dialog";
import { maskEmailForDisplay } from "@/lib/email-mask";
import { Edit, Shield, Fingerprint, Smartphone } from "lucide-react";

export default function Settings() {
  const { t } = useI18n();
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState({
    notifications: true,
    dailyReminder: true,
    soundEffects: true,
    darkMode: theme === 'dark',
    language: 'pt-BR',
    animationsEnabled: true,
    celebrationsEnabled: true,
    hapticsEnabled: true,
    particleQuality: 'medium' as 'low' | 'medium' | 'high',
    biometricAuth: false
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
  const { 
    isAvailable: biometricAvailable, 
    isEnabled: biometricEnabled, 
    enableBiometricAuth, 
    disableBiometricAuth,
    getBiometricLabel
  } = useBiometricAuth();
  const { 
    isSupported: pushSupported, 
    permission: pushPermission, 
    isSubscribed: pushSubscribed, 
    requestPermission: requestPushPermission,
    subscribe: subscribePush,
    unsubscribe: unsubscribePush,
    getPlatformGuidance
  } = usePushNotifications();

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
        setSettings({
          ...parsedSettings,
          darkMode: theme === 'dark',
          biometricAuth: biometricEnabled
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sincronizar configurações com tema global
  useEffect(() => {
    setSettings(prev => ({ ...prev, darkMode: theme === 'dark' }));
  }, [theme]);

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      
      // Salvar configurações no localStorage
      localStorage.setItem('satoshi_settings', JSON.stringify(settings));
      
      // Aplicar configurações de som
      if (settings.soundEffects) {
        localStorage.setItem('enableSounds', 'true');
      } else {
        localStorage.setItem('enableSounds', 'false');
      }
      
      // Aplicar configurações de vibração
      if (settings.hapticsEnabled) {
        localStorage.setItem('enableHaptics', 'true');
      } else {
        localStorage.setItem('enableHaptics', 'false');
      }
      
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
            title: "Aviso",
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
        title: "Configurações salvas!",
        description: "Suas informações foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: t('errors.error'),
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
      title: "Dados exportados!",
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
                  value={maskEmailForDisplay(userInfo.email)}
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

        {/* Segurança */}
        <Card className="p-6">
          <h3 className="font-bold text-foreground mb-6">Segurança</h3>
          <div className="space-y-4">
            {biometricAvailable && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Fingerprint className="w-5 h-5 text-primary" />
                  <div>
                    <h4 className="font-medium text-foreground">{getBiometricLabel()}</h4>
                    <p className="text-sm text-muted-foreground">
                      Usar {getBiometricLabel().toLowerCase()} para entrar no app
                    </p>
                  </div>
                </div>
                <Switch
                  checked={biometricEnabled}
                  onCheckedChange={async (checked) => {
                    if (checked) {
                      const success = await enableBiometricAuth(userInfo.email);
                      if (success) {
                        setSettings({...settings, biometricAuth: true});
                        toast({
                          title: "Autenticação biométrica ativada!",
                          description: `${getBiometricLabel()} configurado com sucesso.`,
                        });
                      } else {
                        toast({
                          title: "Erro",
                          description: "Não foi possível ativar a autenticação biométrica.",
                          variant: "destructive"
                        });
                      }
                    } else {
                      disableBiometricAuth();
                      setSettings({...settings, biometricAuth: false});
                      toast({
                        title: "Autenticação biométrica desativada",
                        description: "Você precisará usar email e senha para entrar.",
                      });
                    }
                  }}
                />
              </div>
            )}
          </div>
        </Card>

        {/* Notificações */}
        <Card className="p-6">
          <h3 className="font-bold text-foreground mb-6">{t('settings.notifications')}</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-primary" />
                <div>
                  <h4 className="font-medium text-foreground">{t('settings.pushNotifications')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {!pushSupported ? "Não suportado neste dispositivo" :
                     pushPermission === 'denied' ? (
                       <span>
                         Acesse as configurações para reativar{" "}
                         <Button 
                           variant="link" 
                           size="sm" 
                           className="h-auto p-0 text-xs text-primary underline"
                           onClick={() => {
                             toast({
                               title: "Como reativar notificações",
                               description: getPlatformGuidance(),
                             });
                           }}
                         >
                           (Como fazer?)
                         </Button>
                       </span>
                     ) :
                     pushSubscribed ? "Ativo - Recebendo notificações" : 
                     pushPermission === 'granted' ? "Disponível para ativar" :
                     "Clique para permitir notificações"
                    }
                  </p>
                </div>
              </div>
              <Switch
                checked={pushSupported && pushSubscribed}
                disabled={!pushSupported || pushPermission === 'denied'}
                onCheckedChange={async (checked) => {
                  if (checked) {
                    const success = await subscribePush();
                    if (success) {
                      setSettings({...settings, notifications: true});
                    }
                  } else {
                    const success = await unsubscribePush();
                    if (success) {
                      setSettings({...settings, notifications: false});
                    }
                  }
                }}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">{t('settings.dailyReminder')}</h4>
                <p className="text-sm text-muted-foreground">
                  {settings.dailyReminder ? "Lembrete diário às 19h" : "Sem lembrete diário"}
                </p>
              </div>
              <Switch
                checked={settings.dailyReminder}
                onCheckedChange={async (checked) => {
                  setSettings({...settings, dailyReminder: checked});
                  if (checked) {
                    // Simular agendamento de notificação local
                    if ('Notification' in window && Notification.permission === 'granted') {
                      toast({
                        title: "Lembrete diário ativado!",
                        description: "Você receberá um lembrete todos os dias às 19h.",
                      });
                    }
                  } else {
                    toast({
                      title: "Lembrete diário desativado",
                      description: "Você não receberá mais lembretes diários.",
                    });
                  }
                }}
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
                <p className="text-sm text-muted-foreground">
                  {settings.soundEffects ? "Sons de feedback ativos" : "Sons desabilitados"}
                </p>
              </div>
              <Switch
                checked={settings.soundEffects}
                onCheckedChange={(checked) => {
                  setSettings({...settings, soundEffects: checked});
                  if (checked) {
                    localStorage.setItem('enableSounds', 'true');
                    toast({
                      title: "Sons ativados!",
                      description: "Você ouvirá efeitos sonoros durante o uso do app.",
                    });
                  } else {
                    localStorage.setItem('enableSounds', 'false');
                    toast({
                      title: "Sons desativados",
                      description: "Os efeitos sonoros foram desabilitados.",
                    });
                  }
                }}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">{t('settings.darkMode')}</h4>
                <p className="text-sm text-muted-foreground">{t('settings.darkInterface')}</p>
              </div>
              <Switch
                checked={settings.darkMode}
                onCheckedChange={(checked) => {
                  setSettings({...settings, darkMode: checked});
                  setTheme(checked ? 'dark' : 'light');
                }}
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
                <p className="text-sm text-muted-foreground">
                  {settings.hapticsEnabled ? "Vibração ativa" : "Vibração desabilitada"}
                </p>
              </div>
              <Switch
                checked={settings.hapticsEnabled}
                onCheckedChange={(checked) => {
                  setSettings({...settings, hapticsEnabled: checked});
                  if (checked) {
                    localStorage.setItem('enableHaptics', 'true');
                    if (navigator.vibrate) {
                      navigator.vibrate(100);
                    }
                    toast({
                      title: "Vibração ativada!",
                      description: "Você sentirá feedback tátil durante o uso do app.",
                    });
                  } else {
                    localStorage.setItem('enableHaptics', 'false');
                    toast({
                      title: "Vibração desativada",
                      description: "O feedback tátil foi desabilitado.",
                    });
                  }
                }}
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
            {loading ? t('settings.buttons.saving') : "Salvar"}
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
              {t('settings.buttons.logout')}
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
