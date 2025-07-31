import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, RefreshCw } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface EmailVerificationNoticeProps {
  email: string;
  onResend?: () => void;
}

export function EmailVerificationNotice({ email, onResend }: EmailVerificationNoticeProps) {
  const [isResending, setIsResending] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) throw error;

      toast({
        title: t('auth.emailResentSuccess'),
        description: t('auth.emailResentSuccessDescription')
      });
      
      onResend?.();
    } catch (error: any) {
      console.error('Error resending email:', error);
      toast({
        title: t('auth.resendError'),
        description: error.message || t('auth.resendErrorDescription'),
        variant: "destructive"
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-xl">{t('auth.verifyEmail')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <p className="text-muted-foreground">
          {t('auth.verificationSent')}
        </p>
        <p className="font-semibold text-primary">{email}</p>
        <p className="text-sm text-muted-foreground">
          {t('auth.clickLinkToActivate')}
        </p>
        
        <div className="pt-4 space-y-3">
          <Button 
            variant="outline" 
            onClick={handleResendEmail}
            disabled={isResending}
            className="w-full"
          >
            {isResending ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                {t('auth.resending')}
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                {t('auth.resendEmail')}
              </>
            )}
          </Button>
          
          <p className="text-xs text-muted-foreground">
            {t('auth.checkSpamFolder')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
