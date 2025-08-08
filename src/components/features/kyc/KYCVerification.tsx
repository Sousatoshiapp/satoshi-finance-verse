import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { useI18n } from '@/hooks/use-i18n';
import { Shield, Clock } from 'lucide-react';

interface KYCVerificationProps {
  onComplete: () => void;
  onCancel?: () => void;
}

export function KYCVerification({ onComplete, onCancel }: KYCVerificationProps) {
  const { t } = useI18n();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
            <Clock className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-xl">Verificação de Identidade</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            Esta funcionalidade será lançada em breve! Estamos trabalhando para oferecer a melhor experiência de verificação.
          </p>
          
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md text-sm">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="h-4 w-4" />
              <span className="font-medium">Em Desenvolvimento</span>
            </div>
            <p>Sistema de verificação KYC será implementado na próxima versão do aplicativo.</p>
          </div>
          
          <div className="flex gap-2">
            {onCancel && (
              <Button 
                variant="outline" 
                onClick={onCancel}
                className="flex-1"
              >
                Fechar
              </Button>
            )}
            <Button 
              onClick={onComplete}
              className="flex-1"
            >
              Entendi
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}