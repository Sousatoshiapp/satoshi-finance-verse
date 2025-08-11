import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/hooks/use-i18n";
import { supabase } from "@/integrations/supabase/client";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";

export default function AdminPasswordReset() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useI18n();
  
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      toast({
        title: "Token inválido",
        description: "Link de reset inválido ou expirado.",
        variant: "destructive",
      });
      navigate("/admin");
    }
  }, [searchParams, navigate, toast]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || newPassword.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "As senhas digitadas não são iguais.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-password-reset', {
        body: {
          action: 'reset_password',
          token: token,
          newPassword: newPassword
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error('Erro ao conectar com o servidor');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Erro ao redefinir senha');
      }

      setSuccess(true);
      toast({
        title: "Senha alterada!",
        description: "Sua nova senha foi definida com sucesso.",
      });
      
      // Redirecionar após 3 segundos
      setTimeout(() => {
        navigate("/admin");
      }, 3000);

    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: t('errors.passwordResetError'),
        description: error.message || t('errors.invalidToken'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md border-success/20 bg-gradient-to-br from-background to-success/5">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-success">
              <CheckCircle className="h-6 w-6" />
              Senha Alterada!
            </CardTitle>
            <p className="text-muted-foreground">
              Sua nova senha foi definida com sucesso
            </p>
          </CardHeader>
          <CardContent className="text-center">
            <div className="p-4 bg-success/10 rounded-lg border border-success/20 mb-4">
              <p className="text-sm text-success font-medium">
                Redirecionando para o painel administrativo...
              </p>
            </div>
            <Button onClick={() => navigate("/admin")} className="w-full">
              Ir para Admin
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md border-primary/20 bg-gradient-to-br from-background to-primary/5">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Lock className="h-6 w-6 text-primary" />
            Redefinir Senha Admin
          </CardTitle>
          <p className="text-muted-foreground">
            Digite sua nova senha para o painel administrativo
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nova Senha</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite a nova senha"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-10"
                  autoFocus
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Confirmar Nova Senha</label>
              <Input
                type="password"
                placeholder="Confirme a nova senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {newPassword && (
              <div className="text-xs text-muted-foreground space-y-1">
                <div className={`flex items-center gap-2 ${newPassword.length >= 6 ? 'text-success' : 'text-warning'}`}>
                  <div className={`w-2 h-2 rounded-full ${newPassword.length >= 6 ? 'bg-success' : 'bg-warning'}`} />
                  Pelo menos 6 caracteres
                </div>
                {confirmPassword && (
                  <div className={`flex items-center gap-2 ${newPassword === confirmPassword ? 'text-success' : 'text-destructive'}`}>
                    <div className={`w-2 h-2 rounded-full ${newPassword === confirmPassword ? 'bg-success' : 'bg-destructive'}`} />
                    Senhas coincidem
                  </div>
                )}
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Redefinindo...
                </>
              ) : (
                "Redefinir Senha"
              )}
            </Button>
            
            <Button 
              type="button"
              variant="ghost" 
              className="w-full"
              onClick={() => navigate("/admin")}
              disabled={loading}
            >
              Voltar ao Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
