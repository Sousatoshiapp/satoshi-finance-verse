import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";
import { BeetzIcon } from "@/components/shared/ui/beetz-icon";
import { Gift, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { LightningIcon, RocketIcon, TrophyIcon, GiftIcon } from "@/components/icons/game-icons";
import { IconSystem } from "@/components/icons/icon-system";

interface AnimatedLootBoxProps {
  isAvailable: boolean;
}

interface Prize {
  type: 'xp' | 'beetz' | 'avatar' | 'boost' | 'badge';
  value: number;
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export function AnimatedLootBox({ isAvailable }: AnimatedLootBoxProps) {
  // Loot boxes temporariamente desabilitadas
  console.log('[MAINTENANCE] AnimatedLootBox disabled - isAvailable:', isAvailable);
  return null;
}
