import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { AdminPasswordProtection } from "@/components/admin-password-protection";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { LanguageSelector } from "@/components/admin/language-selector";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, Save, RefreshCw, Database, Shield, 
  Bell, Gamepad2, DollarSign, Users 
} from "lucide-react";

export default function AdminSettings() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    // Sistema Geral
    maintenance_mode: false,
    max_users_online: 10000,
    backup_frequency: 24,
    
    // Quiz & Gamificação
    daily_xp_limit: 1000,
    quiz_time_limit: 30,
    max_daily_duels: 10,
    loot_box_drop_rate: 0.15,
    
    // Economia
    beetz_conversion_rate: 100,
    subscription_price_basic: 9.99,
    subscription_price_premium: 19.99,
    referral_bonus: 500,
    
    // Segurança
    max_login_attempts: 5,
    session_timeout: 3600,
    password_min_length: 8,
    
    // Notificações
    email_notifications: true,
    push_notifications: true,
    weekly_reports: true,
    
    // Social
    max_message_length: 500,
    chat_spam_limit: 5,
    auto_moderation: true,
    
    // Avançado
    api_rate_limit: 1000,
    debug_mode: false,
    analytics_tracking: true
  });
  
  const { toast } = useToast();

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Configurações Salvas",
        description: "Todas as configurações foram atualizadas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao Salvar",
        description: "Falha ao atualizar configurações.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const settingSections = [
    {
      title: "Sistema Geral",
      icon: Settings,
      color: "text-blue-500",
      settings: [
        { key: 'maintenance_mode', label: 'Modo Manutenção', type: 'boolean' },
        { key: 'max_users_online', label: 'Máximo de Usuários Online', type: 'number' },
        { key: 'backup_frequency', label: 'Frequência de Backup (horas)', type: 'number' },
      ]
    },
    {
      title: "Quiz & Gamificação",
      icon: Gamepad2,
      color: "text-purple-500",
      settings: [
        { key: 'daily_xp_limit', label: 'Limite Diário de XP', type: 'number' },
        { key: 'quiz_time_limit', label: 'Tempo Limite Quiz (segundos)', type: 'number' },
        { key: 'max_daily_duels', label: 'Máximo de Duelos Diários', type: 'number' },
        { key: 'loot_box_drop_rate', label: 'Taxa de Drop Loot Box', type: 'number', step: 0.01, min: 0, max: 1 },
      ]
    },
    {
      title: "Sistema Econômico",
      icon: DollarSign,
      color: "text-green-500",
      settings: [
        { key: 'beetz_conversion_rate', label: 'Taxa de Conversão Beetz', type: 'number' },
        { key: 'subscription_price_basic', label: 'Preço Assinatura Básica ($)', type: 'number', step: 0.01 },
        { key: 'subscription_price_premium', label: 'Preço Assinatura Premium ($)', type: 'number', step: 0.01 },
        { key: 'referral_bonus', label: 'Bônus por Indicação (Beetz)', type: 'number' },
      ]
    },
    {
      title: "Segurança & Acesso",
      icon: Shield,
      color: "text-red-500",
      settings: [
        { key: 'max_login_attempts', label: 'Máximo Tentativas de Login', type: 'number' },
        { key: 'session_timeout', label: 'Timeout de Sessão (segundos)', type: 'number' },
        { key: 'password_min_length', label: 'Tamanho Mínimo da Senha', type: 'number' },
      ]
    },
    {
      title: "Notificações",
      icon: Bell,
      color: "text-yellow-500",
      settings: [
        { key: 'email_notifications', label: 'Notificações por Email', type: 'boolean' },
        { key: 'push_notifications', label: 'Notificações Push', type: 'boolean' },
        { key: 'weekly_reports', label: 'Relatórios Semanais', type: 'boolean' },
      ]
    },
    {
      title: "Sistema Social",
      icon: Users,
      color: "text-cyan-500",
      settings: [
        { key: 'max_message_length', label: 'Tamanho Máximo da Mensagem', type: 'number' },
        { key: 'chat_spam_limit', label: 'Limite de Spam no Chat', type: 'number' },
        { key: 'auto_moderation', label: 'Moderação Automática', type: 'boolean' },
      ]
    },
    {
      title: "Configurações Avançadas",
      icon: Database,
      color: "text-gray-500",
      settings: [
        { key: 'api_rate_limit', label: 'Limite de Taxa da API', type: 'number' },
        { key: 'debug_mode', label: 'Modo Debug', type: 'boolean' },
        { key: 'analytics_tracking', label: 'Rastreamento Analytics', type: 'boolean' },
      ]
    }
  ];

  const renderSettingInput = (setting: any) => {
    const value = settings[setting.key as keyof typeof settings];
    
    if (setting.type === 'boolean') {
      return (
        <Switch
          checked={value as boolean}
          onCheckedChange={(checked) => 
            setSettings(prev => ({ ...prev, [setting.key]: checked }))
          }
        />
      );
    }
    
    return (
      <Input
        type={setting.type}
        value={value as string | number}
        step={setting.step}
        min={setting.min}
        max={setting.max}
        onChange={(e) => 
          setSettings(prev => ({ 
            ...prev, 
            [setting.key]: setting.type === 'number' ? parseFloat(e.target.value) : e.target.value 
          }))
        }
      />
    );
  };

  return (
    <AdminPasswordProtection>
      <div className="flex min-h-screen w-full bg-background">
        <AdminSidebar />
        
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Configurações do Sistema</h1>
                  <p className="text-muted-foreground">Gerencie todas as configurações da plataforma</p>
                </div>
                
                <Button onClick={handleSaveSettings} disabled={loading}>
                  {loading ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {loading ? 'Salvando...' : 'Salvar Tudo'}
                </Button>
              </div>

              {/* Language Selector */}
              <LanguageSelector />

              {/* Settings Sections */}
              <div className="space-y-6">
                {settingSections.map((section) => {
                  const IconComponent = section.icon;
                  return (
                    <Card key={section.title}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <IconComponent className={`h-5 w-5 ${section.color}`} />
                          {section.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                          {section.settings.map((setting) => (
                            <div key={setting.key} className="space-y-2">
                              <Label htmlFor={setting.key} className="text-sm font-medium">
                                {setting.label}
                              </Label>
                              {renderSettingInput(setting)}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* System Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-green-500" />
                    Status do Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="p-4 bg-green-500/10 rounded-lg">
                      <div className="text-sm font-medium text-green-600">Sistema Online</div>
                      <div className="text-2xl font-bold text-green-500">99.9%</div>
                      <div className="text-xs text-muted-foreground">Uptime</div>
                    </div>
                    
                    <div className="p-4 bg-blue-500/10 rounded-lg">
                      <div className="text-sm font-medium text-blue-600">Usuários Ativos</div>
                      <div className="text-2xl font-bold text-blue-500">1,247</div>
                      <div className="text-xs text-muted-foreground">Agora</div>
                    </div>
                    
                    <div className="p-4 bg-purple-500/10 rounded-lg">
                      <div className="text-sm font-medium text-purple-600">Uso de Storage</div>
                      <div className="text-2xl font-bold text-purple-500">67%</div>
                      <div className="text-xs text-muted-foreground">Capacidade</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AdminPasswordProtection>
  );
}