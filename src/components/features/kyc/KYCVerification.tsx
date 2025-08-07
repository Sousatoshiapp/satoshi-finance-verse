import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { useProfile } from '@/hooks/use-profile';
import { useKYCStatus } from '@/hooks/use-kyc-status';
import { useI18n } from '@/hooks/use-i18n';
import { Loader2, Shield } from 'lucide-react';
import { Client } from 'persona';

interface KYCVerificationProps {
  onComplete: () => void;
  onCancel?: () => void;
}

export function KYCVerification({ onComplete, onCancel }: KYCVerificationProps) {
  const { t } = useI18n();
  const { profile } = useProfile();
  const { updateKYCStatus } = useKYCStatus();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const templateId = import.meta.env.VITE_PERSONA_TEMPLATE_ID;
    const environmentId = import.meta.env.VITE_PERSONA_ENVIRONMENT_ID;
    
    if (!templateId || templateId === 'TEMPLATE_ID_NEEDED') {
      setError('Persona template ID not configured. Please set VITE_PERSONA_TEMPLATE_ID environment variable.');
      return;
    }
    
    if (!environmentId) {
      setError('Persona environment ID not configured. Please set VITE_PERSONA_ENVIRONMENT_ID environment variable.');
      return;
    }
  }, []);

  const initializePersona = () => {
    const templateId = import.meta.env.VITE_PERSONA_TEMPLATE_ID;
    const environmentId = import.meta.env.VITE_PERSONA_ENVIRONMENT_ID;

    if (!templateId || templateId === 'TEMPLATE_ID_NEEDED') {
      setError('Persona template ID not configured. Please set VITE_PERSONA_TEMPLATE_ID environment variable.');
      return;
    }

    if (!environmentId) {
      setError('Persona environment ID not configured. Please set VITE_PERSONA_ENVIRONMENT_ID environment variable.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const client = new Client({
        templateId,
        environmentId,
        referenceId: profile?.id,
        onComplete: async ({ inquiryId }: { inquiryId: string }) => {
          try {
            await updateKYCStatus(inquiryId);
            onComplete();
          } catch (error) {
            console.error('Error updating KYC status:', error);
            setError('Failed to update KYC status. Please try again.');
          } finally {
            setIsLoading(false);
          }
        },
        onCancel: () => {
          setIsLoading(false);
          if (onCancel) {
            onCancel();
          }
        },
        onError: (error: any) => {
          console.error('Persona error:', error);
          setError('Verification failed. Please try again or contact support if the issue persists.');
          setIsLoading(false);
        }
      });
      
      client.open();
    } catch (error) {
      console.error('Error initializing Persona:', error);
      setError('Failed to initialize verification. Please check your internet connection and try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-xl">{t('kyc.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            {t('kyc.subtitle')}
          </p>
          
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
              <p className="font-medium">Verification Error</p>
              <p>{error}</p>
              {error.includes('environment variable') && (
                <p className="mt-2 text-xs">Contact your administrator to configure the Persona integration.</p>
              )}
            </div>
          )}
          
          <div className="flex gap-2">
            {onCancel && (
              <Button 
                variant="outline" 
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1"
              >
                {t('common.cancel')}
              </Button>
            )}
            <Button 
              onClick={initializePersona}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('kyc.pending')}
                </>
              ) : (
                t('kyc.verifyIdentity')
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
