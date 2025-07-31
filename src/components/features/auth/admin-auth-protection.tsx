import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Lock, LogOut, User, Shield, Mail } from "lucide-react";

interface AdminAuthProtectionProps {
  children: React.ReactNode;
}

interface AdminSession {
  isValid: boolean;
  role?: string;
  user?: any;
}

export function AdminAuthProtection({ children }: AdminAuthProtectionProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginLoading, setLoginLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkAdminSession();
  }, []);

  const checkAdminSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Check if user is an admin
        const { data: isAdminResult, error } = await supabase
          .rpc('is_admin', { user_uuid: session.user.id });

        if (error) {
          console.error('Error checking admin status:', error);
          setIsAuthenticated(false);
        } else if (isAdminResult) {
          // Get admin role
          const { data: role } = await supabase
            .rpc('get_admin_role', { user_uuid: session.user.id });
          
          setAdminSession({
            isValid: true,
            role: role || 'admin',
            user: session.user
          });
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          toast({
            title: "Acesso negado",
            description: "Você não tem permissão para acessar a área administrativa.",
            variant: "destructive",
          });
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking admin session:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password,
      });

      if (error) throw error;

      if (data.user) {
        // Check if user is an admin
        const { data: isAdminResult, error: adminError } = await supabase
          .rpc('is_admin', { user_uuid: data.user.id });

        if (adminError) throw adminError;

        if (isAdminResult) {
          await checkAdminSession();
          toast({
            title: "Login realizado com sucesso!",
            description: "Bem-vindo à área administrativa.",
          });
        } else {
          await supabase.auth.signOut();
          throw new Error("Usuário não tem permissão administrativa");
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Erro no login",
        description: error.message || "Credenciais inválidas ou sem permissão administrativa.",
        variant: "destructive",
      });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setIsAuthenticated(false);
      setAdminSession(null);
      setLoginForm({ email: "", password: "" });
      
      toast({
        title: "Logout realizado",
        description: "Você saiu da área administrativa com segurança.",
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: "Erro no logout",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md border-primary/20 bg-gradient-to-br from-background to-primary/5">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Área Administrativa
            </CardTitle>
            <p className="text-muted-foreground">
              Faça login com suas credenciais de administrador
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@exemplo.com"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <label htmlFor="password" className="text-sm font-medium">Senha</label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Digite sua senha"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  required
                  autoComplete="current-password"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={loginLoading}
              >
                {loginLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Entrando...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Entrar
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 p-4 border border-muted/20 bg-muted/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">Acesso Seguro</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Esta área requer autenticação através do sistema Supabase Auth. 
                Apenas usuários com permissões administrativas podem acessar.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      {/* Admin header with user info and logout */}
      <div className="container mx-auto p-6 pb-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">
                {adminSession?.user?.email}
              </p>
              <p className="text-xs text-muted-foreground">
                {adminSession?.role === 'super_admin' ? 'Super Administrador' : 
                 adminSession?.role === 'admin' ? 'Administrador' : 'Moderador'}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
      
      {children}
    </div>
  );
}
