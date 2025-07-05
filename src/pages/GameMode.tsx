import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Settings, Zap, Users, Trophy, Gamepad2 } from "lucide-react";

export default function GameMode() {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [hologramRotation, setHologramRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setHologramRotation(prev => prev + 1);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const handleModeSelect = (mode: 'solo' | 'duelo' | 'torneio') => {
    setSelectedMode(mode);
    setTimeout(() => {
      switch (mode) {
        case 'solo':
          navigate('/solo-quiz');
          break;
        case 'duelo':
          navigate('/duel-quiz');
          break;
        case 'torneio':
          navigate('/tournament-quiz');
          break;
      }
    }, 300);
  };

  return (
    <div className="min-h-screen relative overflow-hidden pb-20 bg-gradient-to-br from-slate-900 via-purple-900 to-blue-900">
      {/* Cyberpunk Grid Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          animation: 'pulse 4s ease-in-out infinite'
        }} />
      </div>

      {/* Animated Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationName: 'bounce',
              animationDuration: `${3 + Math.random() * 4}s`,
              animationIterationCount: 'infinite',
              animationTimingFunction: 'ease-in-out',
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="max-w-md mx-auto px-4 py-6 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="text-cyan-400 hover:bg-cyan-400/10 hover:text-cyan-300 border border-cyan-400/30 hover:border-cyan-400/60 transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
            ARENA DIGITAL
          </h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/settings')}
            className="text-cyan-400 hover:bg-cyan-400/10 hover:text-cyan-300 border border-cyan-400/30 hover:border-cyan-400/60 transition-all duration-300"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Holographic Gaming Icons */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-6 mb-8">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center relative"
              style={{
                background: 'linear-gradient(45deg, rgba(0, 255, 255, 0.3), rgba(255, 0, 255, 0.3))',
                boxShadow: '0 0 30px rgba(0, 255, 255, 0.5), inset 0 0 20px rgba(255, 0, 255, 0.3)',
                transform: `rotateY(${hologramRotation}deg) rotateX(${Math.sin(hologramRotation * 0.02) * 10}deg)`,
                transformStyle: 'preserve-3d'
              }}
            >
              <Gamepad2 className="text-2xl text-cyan-300" style={{
                filter: 'drop-shadow(0 0 10px rgba(0, 255, 255, 0.8))'
              }} />
            </div>
            
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center relative"
              style={{
                background: 'linear-gradient(45deg, rgba(255, 0, 255, 0.4), rgba(0, 255, 255, 0.4))',
                boxShadow: '0 0 40px rgba(255, 0, 255, 0.6), inset 0 0 25px rgba(0, 255, 255, 0.4)',
                transform: `rotateY(${-hologramRotation}deg) rotateX(${Math.cos(hologramRotation * 0.02) * 15}deg)`,
                transformStyle: 'preserve-3d'
              }}
            >
              <Zap className="text-3xl text-pink-300" style={{
                filter: 'drop-shadow(0 0 15px rgba(255, 0, 255, 0.8))'
              }} />
            </div>
            
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center relative"
              style={{
                background: 'linear-gradient(45deg, rgba(0, 255, 255, 0.25), rgba(255, 255, 0, 0.25))',
                boxShadow: '0 0 25px rgba(0, 255, 255, 0.4), inset 0 0 15px rgba(255, 255, 0, 0.3)',
                transform: `rotateY(${hologramRotation * 0.8}deg) rotateX(${Math.sin(hologramRotation * 0.015) * 8}deg)`,
                transformStyle: 'preserve-3d'
              }}
            >
              <Trophy className="text-lg text-yellow-300" style={{
                filter: 'drop-shadow(0 0 8px rgba(255, 255, 0, 0.8))'
              }} />
            </div>
          </div>
        </div>

        {/* 3D Mode Selection Card */}
        <Card className="relative border-none shadow-none mb-8" style={{
          transform: 'perspective(1000px) rotateX(5deg)',
          transformStyle: 'preserve-3d'
        }}>
          <div className="absolute inset-0 rounded-lg" style={{
            background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(255, 0, 255, 0.1), rgba(255, 255, 0, 0.05))',
            boxShadow: '0 8px 32px rgba(0, 255, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0, 255, 255, 0.2)'
          }} />
          
          <CardContent className="p-8 relative z-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4" style={{
                background: 'linear-gradient(45deg, #00ffff, #ff00ff, #ffff00)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 10px rgba(0, 255, 255, 0.5))'
              }}>
                SELECIONE SEU MODO
              </h2>
              <p className="text-cyan-300 text-sm opacity-80">
                Escolha sua batalha no metaverso financeiro
              </p>
            </div>

            <div className="space-y-6">
              {/* Modo Solo */}
              <Button
                onClick={() => handleModeSelect('solo')}
                variant="outline"
                className={`w-full font-bold py-6 text-lg rounded-xl border-2 transition-all duration-500 relative overflow-hidden group ${
                  selectedMode === 'solo' 
                    ? 'border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-400/50' 
                    : 'border-cyan-400/30 text-cyan-400 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-400/30'
                }`}
                style={{
                  background: selectedMode === 'solo' 
                    ? 'linear-gradient(45deg, rgba(0, 255, 255, 0.1), rgba(0, 255, 255, 0.05))'
                    : 'rgba(0, 0, 0, 0.3)',
                  transform: 'perspective(500px) rotateX(2deg)',
                  transformStyle: 'preserve-3d'
                }}
              >
                <div className="flex items-center justify-center gap-3">
                  <Gamepad2 className="h-5 w-5" />
                  MODO SOLO
                </div>
                {selectedMode === 'solo' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent animate-pulse" />
                )}
              </Button>

              {/* Modo Duelo */}
              <Button
                onClick={() => handleModeSelect('duelo')}
                variant="outline"
                className={`w-full font-bold py-6 text-lg rounded-xl border-2 transition-all duration-500 relative overflow-hidden group ${
                  selectedMode === 'duelo' 
                    ? 'border-purple-400 text-purple-300 shadow-lg shadow-purple-400/50' 
                    : 'border-purple-400/30 text-purple-400 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-400/30'
                }`}
                style={{
                  background: selectedMode === 'duelo' 
                    ? 'linear-gradient(45deg, rgba(255, 0, 255, 0.1), rgba(255, 0, 255, 0.05))'
                    : 'rgba(0, 0, 0, 0.3)',
                  transform: 'perspective(500px) rotateX(2deg)',
                  transformStyle: 'preserve-3d'
                }}
              >
                <div className="flex items-center justify-center gap-3">
                  <Users className="h-5 w-5" />
                  MODO DUELO
                </div>
                {selectedMode === 'duelo' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/20 to-transparent animate-pulse" />
                )}
              </Button>

              {/* Torneio */}
              <Button
                onClick={() => handleModeSelect('torneio')}
                variant="outline"
                className={`w-full font-bold py-6 text-lg rounded-xl border-2 transition-all duration-500 relative overflow-hidden group ${
                  selectedMode === 'torneio' 
                    ? 'border-yellow-400 text-yellow-300 shadow-lg shadow-yellow-400/50' 
                    : 'border-yellow-400/30 text-yellow-400 hover:border-yellow-400 hover:shadow-lg hover:shadow-yellow-400/30'
                }`}
                style={{
                  background: selectedMode === 'torneio' 
                    ? 'linear-gradient(45deg, rgba(255, 255, 0, 0.1), rgba(255, 255, 0, 0.05))'
                    : 'rgba(0, 0, 0, 0.3)',
                  transform: 'perspective(500px) rotateX(2deg)',
                  transformStyle: 'preserve-3d'
                }}
              >
                <div className="flex items-center justify-center gap-3">
                  <Trophy className="h-5 w-5" />
                  TORNEIO
                </div>
                {selectedMode === 'torneio' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent animate-pulse" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}