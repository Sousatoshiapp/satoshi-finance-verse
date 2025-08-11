import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/shared/ui/dialog';
import { Button } from '@/components/shared/ui/button';
import { Input } from '@/components/shared/ui/input';
import { Label } from '@/components/shared/ui/label';
import { useToast } from '@/hooks/use-toast';
import { SecurityValidation } from '@/lib/security-validation';
import { SecurityAudit } from '@/lib/security-audit';
import { supabase } from '@/integrations/supabase/client';
import { Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";

interface PasswordChangeDialogProps {
  open?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
}

export function PasswordChangeDialog({ open, isOpen, onOpenChange, onClose }: PasswordChangeDialogProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{ isValid: boolean; errors: string[] }>({ isValid: false, errors: [] });
  const { toast } = useToast();

  const handlePasswordChange = (value: string) => {
    setNewPassword(value);
    const strength = SecurityValidation.validatePasswordStrength(value);
    setPasswordStrength(strength);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Enhanced password validation
    const passwordValidation = SecurityValidation.validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      toast({
        title: "Nova senha não atende aos requisitos",
        description: passwordValidation.errors.join(", "),
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "A nova senha e confirmação devem ser iguais.",
        variant: "destructive",
      });
      return;
    }

    if (currentPassword === newPassword) {
      toast({
        title: "Nova senha deve ser diferente",
        description: "A nova senha deve ser diferente da senha atual.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: (await supabase.auth.getUser()).data.user?.email || '',
        password: currentPassword,
      });

      if (signInError) {
        SecurityAudit.logEvent({
          event_type: 'password_change_failed_verification',
          event_data: { reason: 'Invalid current password' },
          severity: 'medium'
        });
        
        toast({
          title: "Senha atual incorreta",
          description: "A senha atual não confere.",
          variant: "destructive",
        });
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        SecurityAudit.logEvent({
          event_type: 'password_change_failed',
          event_data: { error: updateError.message },
          severity: 'high'
        });
        throw updateError;
      }

      // Log successful password change
      SecurityAudit.logEvent({
        event_type: 'password_changed',
        event_data: { timestamp: Date.now() },
        severity: 'low'
      });

      toast({
        title: "Senha alterada com sucesso!",
        description: "Sua senha foi atualizada.",
      });

      // Reset form and close dialog
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      if (onOpenChange) onOpenChange(false);
      if (onClose) onClose();

    } catch (error: any) {
      toast({
        title: "Erro ao alterar senha",
        description: error.message || "Não foi possível alterar a senha",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open || isOpen} onOpenChange={onOpenChange || onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Alterar Senha</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="current">Senha Atual</Label>
            <div className="relative">
              <Input 
                id="current" 
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword} 
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                disabled={loading}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                disabled={loading}
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <div>
            <Label htmlFor="new">Nova Senha</Label>
            <div className="relative">
              <Input 
                id="new" 
                type={showNewPassword ? "text" : "password"}
                placeholder="Mínimo 8 caracteres"
                value={newPassword} 
                onChange={(e) => handlePasswordChange(e.target.value)}
                required
                disabled={loading}
                className="pr-10"
                minLength={8}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowNewPassword(!showNewPassword)}
                disabled={loading}
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            
            {/* Password Strength Indicator */}
            {newPassword && (
              <div className="space-y-2 text-sm mt-2">
                <div className="flex items-center gap-2">
                  {passwordStrength.isValid ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className={passwordStrength.isValid ? "text-green-600" : "text-red-600"}>
                    {passwordStrength.isValid ? "Senha forte" : "Senha fraca"}
                  </span>
                </div>
                {!passwordStrength.isValid && passwordStrength.errors.length > 0 && (
                  <ul className="space-y-1 text-red-600">
                    {passwordStrength.errors.map((error, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <XCircle className="h-3 w-3" />
                        {error}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
          
          <div>
            <Label htmlFor="confirm">Confirmar Nova Senha</Label>
            <div className="relative">
              <Input 
                id="confirm" 
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                className="pr-10"
                minLength={8}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || !passwordStrength.isValid}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Alterando...
              </>
            ) : (
              "Alterar Senha"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}