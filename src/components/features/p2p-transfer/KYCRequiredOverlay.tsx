import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Shield } from "lucide-react";
import { useI18n } from "@/hooks/use-i18n";

interface KYCRequiredOverlayProps {
  onStartKYC: () => void;
}

export function KYCRequiredOverlay({ onStartKYC }: KYCRequiredOverlayProps) {
  const { t } = useI18n();
  
  return (
    <div className="max-w-md mx-auto">
      <Card className="p-8 text-center">
        <CardHeader>
          <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
            <Shield className="h-16 w-16 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl font-bold mb-2">{t('kyc.required')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">{t('kyc.subtitle')}</p>
          <Button onClick={onStartKYC} className="w-full">
            {t('kyc.verifyIdentity')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
