import { useState, useEffect } from "react";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { Label } from "@/components/shared/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, ScanFace, Fingerprint, ShieldCheck } from "lucide-react";
import { useSecureBiometricAuth } from "@/hooks/use-secure-biometric-auth";
import { useEnhancedSecurity } from "@/hooks/use-enhanced-security";
import { SecurityValidation } from "@/lib/security-validation";

interface EnhancedLoginFormProps {
  onForgotPassword: () => void;
}

export function EnhancedLoginForm({ onForgotPassword }: EnhancedLoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const { toast } = useToast();
  const biometric = useSecureBiometricAuth();
  const { logSecurityAction, logSuspiciousActivity, validateAction, csrfToken } = useEnhancedSecurity();

  // Check for biometric login on component mount
  useEffect(() => {
    if (biometric.isAvailable && biometric.isEnabled && !biometric.loading) {
      handleBiometricLogin();
    }
  }, [biometric.isAvailable, biometric.isEnabled, biometric.loading]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAction('login')) {
      toast({
        title: "Muitas tentativas",
        description: "Aguarde antes de tentar novamente.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Validate and sanitize input
      const emailValidation = SecurityValidation.validateEmail(email);
      if (!emailValidation.isValid) {
        throw new Error(emailValidation.error);
      }

      const sanitizedEmail = SecurityValidation.sanitizeInput(email);
      
      logSecurityAction('login_attempt', { email: sanitizedEmail });

      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password: password,
      });

      if (error) {
        logSuspiciousActivity('login_failed', { 
          email: sanitizedEmail, 
          error: error.message,
          timestamp: Date.now(),
          csrfToken
        });
        throw error;
      }

      logSecurityAction('login_success', { email: sanitizedEmail });

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
      console.error("Login error:", error);
      toast({
        title: "Erro no login",
        description: error.message || "Erro ao fazer login. Tente novamente.",
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
          title: "Login realizado!",
          description: `Autenticado com ${biometric.getBiometricLabel()}`,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('Biometric login error:', error);
      // Silent fail for biometric - don't show error toast
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
          autoComplete="email"
          className="focus:ring-2 focus:ring-primary"
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
            autoComplete="current-password"
            className="pr-10 focus:ring-2 focus:ring-primary"
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

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="link"
          className="px-0 font-normal text-sm"
          onClick={onForgotPassword}
        >
          Esqueceu a senha?
        </Button>
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

      {/* Enhanced Biometric Authentication Button */}
      {biometric.isAvailable && (
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">ou</span>
          </div>
        </div>
      )}

      {biometric.isAvailable && (
        <Button
          type="button"
          variant="outline"
          className="w-full border-primary/20 hover:bg-primary/5"
          onClick={handleBiometricLogin}
          disabled={biometricLoading || biometric.loading}
        >
          {biometricLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
          ) : (
            (() => {
              const IconComponent = getBiometricIcon();
              return <IconComponent className="w-4 h-4 mr-2" />;
            })()
          )}
          {biometricLoading 
            ? "Autenticando..." 
            : `Entrar com ${biometric.getBiometricLabel()}`
          }
        </Button>
      )}
    </form>
  );
}