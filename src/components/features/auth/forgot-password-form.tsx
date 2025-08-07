
import { useState } from "react";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { Label } from "@/components/shared/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Mail } from "lucide-react";

interface ForgotPasswordFormProps {
  onBack: () => void;
}

export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('unified-email', {
        body: {
          type: 'password_reset',
          email: email,
          redirectTo: `${window.location.origin}/reset-password`
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error('Erro ao conectar com o servidor');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Erro ao enviar email de recuperação');
      }

      setEmailSent(true);
      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada para o link de redefinição de senha.",
      });

    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao enviar email de recuperação",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Mail className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">Email Enviado!</h3>
          <p className="text-muted-foreground mb-4">
            Enviamos um link de redefinição de senha para <strong>{email}</strong>
          </p>
          <p className="text-sm text-muted-foreground">
            Verifique sua caixa de entrada e siga as instruções no email para redefinir sua senha.
          </p>
        </div>
        <div className="space-y-2">
          <Button 
            onClick={() => {
              setEmailSent(false);
              setEmail("");
            }}
            variant="outline"
            className="w-full"
          >
            Enviar Novamente
          </Button>
          <Button onClick={onBack} variant="ghost" className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2 text-center">
        <h3 className="text-xl font-semibold">Esqueceu sua senha?</h3>
        <p className="text-muted-foreground text-sm">
          Digite seu email e enviaremos um link para redefinir sua senha
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reset-email">Email</Label>
        <Input
          id="reset-email"
          type="email"
          placeholder="Digite seu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          autoFocus
        />
      </div>

      <div className="space-y-2">
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
              <Mail className="w-4 h-4 mr-2" />
              Enviar Link de Recuperação
            </>
          )}
        </Button>

        <Button 
          type="button"
          variant="ghost" 
          className="w-full"
          onClick={onBack}
          disabled={loading}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Login
        </Button>
      </div>
    </form>
  );
}
