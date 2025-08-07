import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Button } from '@/components/shared/ui/button';
import { Input } from '@/components/shared/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, ArrowLeft } from 'lucide-react';

interface AdminPasswordResetRequestProps {
  onBack?: () => void;
}

export function AdminPasswordResetRequest({ onBack }: AdminPasswordResetRequestProps) {
  const [email, setEmail] = useState('fasdurian@gmail.com');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('unified-email', {
        body: {
          type: 'admin_password_reset',
          email: email
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error('Erro ao conectar com o servidor');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Erro ao solicitar reset');
      }

      setEmailSent(true);
      toast({
        title: "Email Enviado!",
        description: "Verifique sua caixa de entrada para o link de redefinição.",
      });

    } catch (error: any) {
      console.error('Password reset request error:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao solicitar redefinição de senha",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <Card className="w-full max-w-md border-primary/20 bg-gradient-to-br from-background to-primary/5">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-primary">
            <Mail className="h-6 w-6" />
            Email Enviado!
          </CardTitle>
          <p className="text-muted-foreground">
            Verifique sua caixa de entrada
          </p>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-sm text-primary font-medium mb-2">
              Email enviado para: {email}
            </p>
            <p className="text-xs text-muted-foreground">
              Se não receber o email em alguns minutos, verifique a pasta de spam.
              O link expira em 24 horas.
            </p>
          </div>
          
          <Button 
            onClick={() => {
              setEmailSent(false);
              setEmail('fasdurian@gmail.com');
            }}
            variant="outline"
            className="w-full"
          >
            Enviar Outro Email
          </Button>
          
          {onBack && (
            <Button onClick={onBack} variant="ghost" className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Login
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-primary/20 bg-gradient-to-br from-background to-primary/5">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Mail className="h-6 w-6 text-primary" />
          Reset de Senha - Admin
        </CardTitle>
        <p className="text-muted-foreground">
          Solicitar link de redefinição de senha
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRequestReset} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email do Administrador</label>
            <Input
              type="email"
              placeholder="Digite o email do admin"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              readOnly
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Apenas o email autorizado pode solicitar reset administrativo
            </p>
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={loading || !email}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Enviando...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Enviar Link de Reset
              </>
            )}
          </Button>
          
          {onBack && (
            <Button 
              type="button"
              variant="ghost" 
              className="w-full"
              onClick={onBack}
              disabled={loading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Login
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}