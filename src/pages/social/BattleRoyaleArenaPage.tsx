import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Coins } from 'lucide-react';
import { Button } from '@/components/shared/ui/button';
import { BattleRoyaleQuickStart } from '@/components/features/battle-royale/BattleRoyaleQuickStart';
import { FloatingNavbar } from '@/components/shared/floating-navbar';
import { useNavigate } from 'react-router-dom';
import { useRealtimePoints } from "@/hooks/use-realtime-points";

export default function BattleRoyaleArenaPage() {
  const navigate = useNavigate();
  const { points, isLoading } = useRealtimePoints();

  const handleSessionJoined = (sessionId: string, sessionCode: string) => {
    navigate(`/battle-royale/session/${sessionId}`, { 
      state: { sessionCode } 
    });
  };

  return (
    <>
      <div className="min-h-screen casino-futuristic overflow-hidden">
        <div className="relative z-10 p-6 pb-40">
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="casino-button border-purple-500/40 text-white bg-black/20 backdrop-blur-sm hover:bg-purple-500/20"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <div className="casino-btz-display flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-sm rounded-full border border-amber-400/40">
              <Coins className="h-5 w-5 text-amber-400 casino-coin-glow" />
              <span className="font-bold text-white">{isLoading ? "..." : points.toFixed(2)}</span>
              <span className="text-sm text-amber-400">BTZ</span>
            </div>
          </div>

          <BattleRoyaleQuickStart onSessionJoined={handleSessionJoined} />
        </div>
      </div>
      
      <FloatingNavbar />
    </>
  );
}