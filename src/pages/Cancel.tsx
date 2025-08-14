import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Cancel() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle>Pagamento Cancelado</CardTitle>
          <CardDescription>
            Sua transação foi cancelada com sucesso.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Nenhuma cobrança foi realizada. Você pode tentar novamente quando quiser.
          </p>
          <div className="flex flex-col gap-2">
            <Button onClick={() => navigate("/subscription-plans")} className="w-full">
              Tentar Novamente
            </Button>
            <Button variant="outline" onClick={() => navigate("/dashboard")} className="w-full">
              Voltar ao Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}