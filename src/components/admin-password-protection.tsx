import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Lock, LogOut } from "lucide-react";

interface AdminPasswordProtectionProps {
  children: React.ReactNode;
}

const ADMIN_PASSWORD = "131326";
const STORAGE_KEY = "admin_access_granted";

export function AdminPasswordProtection({ children }: AdminPasswordProtectionProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
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
    
    if (password === ADMIN_PASSWORD) {
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
            </form>
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