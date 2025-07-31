import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EmailChangeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmail: string;
}

export function EmailChangeDialog({ isOpen, onClose, currentEmail }: EmailChangeDialogProps) {
  const [newEmail, setNewEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleEmailChangeRequest = () => {
    if (newEmail !== confirmEmail) {
      toast({
        title: "Erro",
        description: "Os emails não coincidem",
        variant: "destructive"
      });
      return;
    }

    if (!newEmail.includes('@')) {
      toast({
        title: "Erro",
        description: "Digite um email válido",
        variant: "destructive"
      });
      return;
    }

    if (newEmail === currentEmail) {
      toast({
        title: "Erro",
        description: "O novo email deve ser diferente do atual",
        variant: "destructive"
      });
      return;
    }

    setShowConfirmation(true);
  };

  const handleEmailChange = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Solicitação de alteração enviada! Verifique o email ${newEmail} para confirmar a alteração.`
      });

      // Reset form
      setNewEmail("");
      setConfirmEmail("");
      setShowConfirmation(false);
      onClose();

    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível alterar o email",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setShowConfirmation(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {showConfirmation ? "Confirmar Alteração" : "Alterar Email"}
          </DialogTitle>
        </DialogHeader>
        
        {!showConfirmation ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-email">Email Atual</Label>
              <Input
                id="current-email"
                type="email"
                value={currentEmail}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-email">Novo Email</Label>
              <Input
                id="new-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Digite o novo email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-email">Confirmar Novo Email</Label>
              <Input
                id="confirm-email"
                type="email"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                placeholder="Confirme o novo email"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button 
                onClick={handleEmailChangeRequest} 
                disabled={!newEmail || !confirmEmail}
                className="flex-1"
              >
                Continuar
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Tem certeza que deseja alterar seu email de:
              </p>
              <p className="font-medium">{currentEmail}</p>
              <p className="text-sm text-muted-foreground">para:</p>
              <p className="font-medium">{newEmail}</p>
              <p className="text-xs text-muted-foreground mt-4">
                Um email de confirmação será enviado para o novo endereço.
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Voltar
              </Button>
              <Button 
                onClick={handleEmailChange} 
                disabled={loading}
                className="flex-1"
              >
                {loading ? "Enviando..." : "Confirmar Alteração"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}