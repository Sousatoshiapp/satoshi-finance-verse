import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/shared/ui/dialog";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { Label } from "@/components/shared/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  const handleEmailChangeRequest = () => {
    if (newEmail !== confirmEmail) {
      toast({
        title: t('settings.emailChange.emailMismatch'),
        description: t('settings.emailChange.emailMismatch'),
        variant: "destructive"
      });
      return;
    }

    if (!newEmail.includes('@')) {
      toast({
        title: t('settings.emailChange.invalidEmail'),
        description: t('settings.emailChange.invalidEmail'),
        variant: "destructive"
      });
      return;
    }

    if (newEmail === currentEmail) {
      toast({
        title: t('settings.emailChange.sameEmail'),
        description: t('settings.emailChange.sameEmail'),
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
        title: t('settings.emailChange.success'),
        description: t('settings.emailChange.successDescription', { email: newEmail })
      });

      // Reset form
      setNewEmail("");
      setConfirmEmail("");
      setShowConfirmation(false);
      onClose();

    } catch (error: any) {
      toast({
        title: t('settings.emailChange.error'),
        description: error.message || t('settings.emailChange.errorDescription'),
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
            {showConfirmation ? t('settings.emailChange.confirmTitle') : t('settings.emailChange.title')}
          </DialogTitle>
        </DialogHeader>
        
        {!showConfirmation ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-email">{t('settings.emailChange.currentEmail')}</Label>
              <Input
                id="current-email"
                type="email"
                value={currentEmail}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-email">{t('settings.emailChange.newEmail')}</Label>
              <Input
                id="new-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder={t('settings.emailChange.newEmailPlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-email">{t('settings.emailChange.confirmEmail')}</Label>
              <Input
                id="confirm-email"
                type="email"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                placeholder={t('settings.emailChange.confirmEmailPlaceholder')}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={onClose} className="flex-1">
                {t('settings.emailChange.back')}
              </Button>
              <Button 
                onClick={handleEmailChangeRequest} 
                disabled={!newEmail || !confirmEmail}
                className="flex-1"
              >
                {t('settings.emailChange.continue')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                {t('settings.emailChange.confirmQuestion')}
              </p>
              <p className="font-medium">{currentEmail}</p>
              <p className="text-sm text-muted-foreground">{t('settings.emailChange.to')}</p>
              <p className="font-medium">{newEmail}</p>
              <p className="text-xs text-muted-foreground mt-4">
                {t('settings.emailChange.confirmationNote')}
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                {t('settings.emailChange.back')}
              </Button>
              <Button 
                onClick={handleEmailChange} 
                disabled={loading}
                className="flex-1"
              >
                {loading ? t('settings.emailChange.sending') : t('settings.emailChange.confirmChange')}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
