import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Lock, LogOut, Mail, Shield, Settings } from "lucide-react";

interface AdminPasswordProtectionProps {
  children: React.ReactNode;
}

const STORAGE_KEY = "admin_access_granted";
const PASSWORD_KEY = "admin_password";

// Recuperar senha atual do localStorage ou usar padrão
const getCurrentPassword = (): string => {
  return localStorage.getItem(PASSWORD_KEY) || "131326";
};

export function AdminPasswordProtection({ children }: AdminPasswordProtectionProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [showPasswordManager, setShowPasswordManager] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Verificar se já tem acesso salvo
    const savedAccess = localStorage.getItem(STORAGE_KEY);
    if (savedAccess === "true") {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === getCurrentPassword()) {
      setIsAuthenticated(true);
      localStorage.setItem(STORAGE_KEY, "true");
      toast({
        title: "Acesso liberado!",
        description: "Bem-vindo à área administrativa.",
      });
    } else {
      toast({
        title: "Senha incorreta",
        description: "Tente novamente.",
        variant: "destructive",
      });
      setPassword("");
    }
  };

  const handlePasswordReset = async () => {
    setResetLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-password-reset', {
        body: { 
          email: 'fasdurian@gmail.com',
          action: 'request_reset'
        }
      });

      if (error) throw error;

      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada em fasdurian@gmail.com",
      });
      
      setShowPasswordManager(false);
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: "Erro ao enviar email",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setResetLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(STORAGE_KEY);
    setPassword("");
    toast({
      title: "Saiu da área administrativa",
      description: "Senha removida com sucesso.",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
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
              <Lock className="h-6 w-6 text-primary" />
              Área Administrativa
            </CardTitle>
            <p className="text-muted-foreground">
              Digite a senha para acessar o painel de administração
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="Digite a senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-center"
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full">
                Entrar
              </Button>
              
              <div className="pt-4 border-t border-border">
                <Button 
                  type="button"
                  variant="ghost" 
                  size="sm"
                  className="w-full text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPasswordManager(true)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Esqueceu a senha?
                </Button>
              </div>
            </form>
            
            {showPasswordManager && (
              <div className="mt-6 p-4 border border-warning/20 bg-warning/5 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-5 w-5 text-warning" />
                  <h3 className="font-semibold text-warning">Reset de Senha</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Um link de reset será enviado para <strong>fasdurian@gmail.com</strong>
                </p>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setShowPasswordManager(false)}
                    disabled={resetLoading}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    size="sm"
                    onClick={handlePasswordReset}
                    disabled={resetLoading}
                    className="bg-warning hover:bg-warning/90"
                  >
                    {resetLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Enviar Reset
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      {/* Botão de logout no topo da página */}
      <div className="container mx-auto p-6 pb-0">
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sair da Área Admin
          </Button>
        </div>
      </div>
      
      {children}
    </div>
  );
}