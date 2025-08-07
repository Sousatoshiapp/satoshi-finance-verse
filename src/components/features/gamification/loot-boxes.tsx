import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/shared/ui/dialog";
import { useLootBoxes } from "@/hooks/use-loot-boxes";
import { Gift, Package, Sparkles, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export function LootBoxes() {
  // Loot boxes temporariamente desabilitadas
  console.log('[MAINTENANCE] LootBoxes component disabled');
  
  return (
    <Card className="border-orange-500/30 bg-gradient-to-br from-background to-orange-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-500">
          <Gift className="h-5 w-5" />
          Sistema em Manutenção
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-4 text-muted-foreground">
          <p>Loot boxes estão temporariamente desabilitadas para melhorias.</p>
        </div>
      </CardContent>
    </Card>
  );
}
