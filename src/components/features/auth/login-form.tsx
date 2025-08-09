
import { useState, useEffect } from "react";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { Label } from "@/components/shared/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, ScanFace, Fingerprint, ShieldCheck } from "lucide-react";
import { useBiometricAuth } from "@/hooks/use-biometric-auth";

interface LoginFormProps {
  onForgotPassword: () => void;
}

export function LoginForm({ onForgotPassword }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const { toast } = useToast();
  const biometric = useBiometricAuth();

  // Check for biometric login on component mount
  useEffect(() => {
    if (biometric.isAvailable && biometric.isEnabled && !biometric.loading) {
      handleBiometricLogin();
    }
  }, [biometric.isAvailable, biometric.isEnabled, biometric.loading]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Ask if user wants to enable biometric auth
      if (biometric.isAvailable && !biometric.isEnabled) {
        setTimeout(() => {
          if (confirm(`Habilitar ${biometric.getBiometricLabel()} para login rápido?`)) {
            biometric.enableBiometricAuth(email);
          }
        }, 1000);
      }

      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta!",
      });

    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message || "Credenciais inválidas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    setBiometricLoading(true);
    
    try {
      const result = await biometric.authenticateWithBiometric();
      
      if (result.success) {
        toast({
          title: "Login realizado com sucesso!",
          description: `Autenticado com ${biometric.getBiometricLabel()}`,
        });
      } else if (result.error && !result.error.includes('Cancelado')) {
        toast({
          title: "Erro na autenticação biométrica",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Biometric login error:', error);
    } finally {
      setBiometricLoading(false);
    }
  };

  const getBiometricIcon = () => {
    const iconName = biometric.getBiometricIcon();
    switch (iconName) {
      case 'scan-face':
        return ScanFace;
      case 'fingerprint':
        return Fingerprint;
      default:
        return ShieldCheck;
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Digite seu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Digite sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            disabled={loading}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            Entrando...
          </>
        ) : (
          "Entrar"
        )}
      </Button>

      {/* Biometric Authentication Button */}
      {biometric.isAvailable && (
        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center gap-2"
          onClick={handleBiometricLogin}
          disabled={biometricLoading || biometric.loading}
        >
          {biometricLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            (() => {
              const IconComponent = getBiometricIcon();
              return <IconComponent className="h-4 w-4" />;
            })()
          )}
          {biometricLoading 
            ? "Autenticando..." 
            : `Entrar com ${biometric.getBiometricLabel()}`
          }
        </Button>
      )}

      <div className="text-center">
        <Button
          type="button"
          variant="link"
          onClick={onForgotPassword}
          disabled={loading}
          className="text-sm"
        >
          Esqueceu sua senha?
        </Button>
      </div>
    </form>
  );
}
