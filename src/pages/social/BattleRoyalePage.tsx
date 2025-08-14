import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Coins } from 'lucide-react';
import { Button } from '@/components/shared/ui/button';
import { BattleRoyaleModeSelector } from '@/components/features/battle-royale/BattleRoyaleModeSelector';
import { FloatingNavbar } from '@/components/shared/floating-navbar';
import { useNavigate } from 'react-router-dom';
import { useRealtimePoints } from "@/hooks/use-realtime-points";
import { useIsMobile } from '@/hooks/use-mobile';

export default function BattleRoyalePage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { points, isLoading } = useRealtimePoints();

  return (
    <>
      <div className="min-h-screen casino-futuristic overflow-hidden">
        <div className="relative z-10 p-6 pb-40">
          {/* Header with casino styling */}
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

          <div className="max-w-md mx-auto space-y-8">
            {/* Title */}
            <div className="text-center">
              <h2 className="text-sm font-bold mb-2 text-white">Battle Royale</h2>
              <p className="text-xs text-gray-300">Até 100 jogadores simultâneos</p>
            </div>

            {/* Mode Selector */}
            <BattleRoyaleModeSelector />

            {/* Action Button */}
            <div className="text-center">
              <Button
                onClick={() => navigate('/battle-royale/arena')}
                className="w-full py-2 px-6 font-bold text-sm rounded-lg transition-all duration-300 border-2 hover:brightness-110"
                style={{ 
                  backgroundColor: 'transparent',
                  color: '#adff2f',
                  borderColor: '#adff2f',
                  boxShadow: '0 0 10px rgba(173, 255, 47, 0.5)',
                  minHeight: '28px'
                }}
              >
                ENTRAR NA ARENA
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <FloatingNavbar />
    </>
  );
}