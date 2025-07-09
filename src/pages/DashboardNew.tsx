import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PersonalizedDashboard } from "@/components/dashboard/PersonalizedDashboard";
import { SmartOnboarding } from "@/components/onboarding/SmartOnboarding";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, User, Home, Settings } from "lucide-react";
import { toast } from "sonner";

export default function DashboardNew() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [currentTab, setCurrentTab] = useState("dashboard");
  const navigate = useNavigate();

  useEffect(() => {
    checkOnboardingStatus();
    loadNotificationCount();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const { data: onboardingProfile } = await supabase
        .from('user_onboarding_profiles')
        .select('id')
        .eq('user_id', profile.id)
        .single();

      // Show onboarding if no profile exists
      if (!onboardingProfile) {
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  };

  const loadNotificationCount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id)
        .eq('is_read', false);

      setUnreadNotifications(count || 0);
    } catch (error) {
      console.error('Error loading notification count:', error);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    toast.success("🎉 Configuração concluída! Bem-vindo ao BeetzQuiz!");
  };

  if (showOnboarding) {
    return <SmartOnboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header with Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Acompanhe seu progresso e continue aprendendo
            </p>
          </div>
          
          {/* Quick Navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant={currentTab === "notifications" ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentTab("notifications")}
              className="relative"
            >
              <Bell className="h-4 w-4" />
              {unreadNotifications > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {unreadNotifications}
                </Badge>
              )}
            </Button>
            
            <Button
              variant={currentTab === "dashboard" ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentTab("dashboard")}
            >
              <Home className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/profile')}
            >
              <User className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/settings')}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="notifications" className="relative">
              Notificações
              {unreadNotifications > 0 && (
                <Badge 
                  variant="destructive" 
                  className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {unreadNotifications}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <PersonalizedDashboard />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <NotificationCenter />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}