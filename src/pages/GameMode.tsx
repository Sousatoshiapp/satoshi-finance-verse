import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Settings } from "lucide-react";

export default function GameMode() {
  const navigate = useNavigate();

  const handleModeSelect = (mode: 'solo' | 'duelo' | 'torneio') => {
    switch (mode) {
      case 'solo':
        navigate('/quiz');
        break;
      case 'duelo':
        navigate('/duels');
        break;
      case 'torneio':
        navigate('/leaderboard');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-green-900 pb-20">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold text-white">Jogue</h1>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Question Mark Icons */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-16 h-16 bg-slate-600 rounded-full flex items-center justify-center">
              <span className="text-3xl text-white">?</span>
            </div>
            <div className="w-20 h-20 bg-slate-500 rounded-full flex items-center justify-center">
              <span className="text-4xl text-white">?</span>
            </div>
            <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center">
              <span className="text-2xl text-white">?</span>
            </div>
          </div>
        </div>

        {/* Mode Selection Card */}
        <Card className="bg-gradient-to-b from-green-400 to-green-500 border-none shadow-2xl mb-8">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-black mb-2">
                Escolha o seu modo de jogo
              </h2>
              <p className="text-black/80 text-sm">
                Selecione como você quer jogar hoje.
              </p>
            </div>

            <div className="space-y-4">
              {/* Modo Solo */}
              <Button
                onClick={() => handleModeSelect('solo')}
                className="w-full bg-black hover:bg-black/80 text-white font-semibold py-4 text-lg rounded-full border-2 border-transparent hover:border-black/20"
              >
                Modo Solo
              </Button>

              {/* Modo Duelo */}
              <Button
                onClick={() => handleModeSelect('duelo')}
                variant="outline"
                className="w-full bg-transparent hover:bg-black/10 text-black font-semibold py-4 text-lg rounded-full border-2 border-black"
              >
                Modo Duelo
              </Button>

              {/* Torneio */}
              <Button
                onClick={() => handleModeSelect('torneio')}
                variant="outline"
                className="w-full bg-transparent hover:bg-black/10 text-black font-semibold py-4 text-lg rounded-full border-2 border-black"
              >
                Torneio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}