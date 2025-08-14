import React from 'react';
import { CriticalHitEffectsContainer } from '@/components/shared/animations/critical-hit-effects';
import { FOMODashboard } from '@/components/fomo/fomo-dashboard';
import { motion } from 'framer-motion';
import { Card } from '@/components/shared/ui/card';
import { Button } from '@/components/shared/ui/button';
import { Zap, Target, Gift, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DopamineHitsShowcase() {
  const [showEffects, setShowEffects] = React.useState(false);

  const triggerCriticalHit = () => {
    setShowEffects(true);
    
    // Trigger critical hit event
    window.dispatchEvent(new CustomEvent('showCriticalHit', {
      detail: {
        type: 'critical-legendary',
        position: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
        multiplier: 5
      }
    }));

    // Reset after animation
    setTimeout(() => setShowEffects(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      {/* Critical Hit Effects Container */}
      <CriticalHitEffectsContainer />
      
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent mb-4">
            🎪 FASE 3: DOPAMINE HITS
          </h1>
          <p className="text-xl text-muted-foreground">
            Sistema de micro-recompensas viciantes e FOMO features
          </p>
        </motion.div>

        {/* Demo Section */}
        <Card className="p-8 border-2 border-gradient-to-r from-purple-500 to-pink-500">
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold">🎮 Demo dos Efeitos</h2>
            <p className="text-muted-foreground">
              Clique no botão para testar o sistema de critical hits!
            </p>
            
            <Button
              onClick={triggerCriticalHit}
              size="lg"
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold px-8 py-4 text-xl"
            >
              💥 TRIGGER CRITICAL HIT! 💥
            </Button>
            
            {showEffects && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-6xl"
              >
                🎊🎉🎊
              </motion.div>
            )}
          </div>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 h-full border-2 border-blue-500/20 hover:border-blue-500/50 transition-colors">
              <div className="text-center space-y-4">
                <Zap className="w-12 h-12 text-blue-500 mx-auto" />
                <h3 className="text-xl font-bold">Critical Hits</h3>
                <p className="text-sm text-muted-foreground">
                  Sistema de critical hits aleatórios com multiplicadores até 5x
                </p>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 h-full border-2 border-orange-500/20 hover:border-orange-500/50 transition-colors">
              <div className="text-center space-y-4">
                <Target className="w-12 h-12 text-orange-500 mx-auto" />
                <h3 className="text-xl font-bold">CS:GO Audio</h3>
                <p className="text-sm text-muted-foreground">
                  Sons satisfatórios estilo headshot para respostas perfeitas
                </p>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 h-full border-2 border-purple-500/20 hover:border-purple-500/50 transition-colors">
              <div className="text-center space-y-4">
                <Gift className="w-12 h-12 text-purple-500 mx-auto" />
                <h3 className="text-xl font-bold">FOMO Shop</h3>
                <p className="text-sm text-muted-foreground">
                  Loja com itens exclusivos por tempo limitado
                </p>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 h-full border-2 border-pink-500/20 hover:border-pink-500/50 transition-colors">
              <div className="text-center space-y-4">
                <Sparkles className="w-12 h-12 text-pink-500 mx-auto" />
                <h3 className="text-xl font-bold">Secret Achievements</h3>
                <p className="text-sm text-muted-foreground">
                  Conquistas secretas descobríveis com dicas misteriosas
                </p>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* FOMO Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <FOMODashboard />
        </motion.div>

        {/* Integration Info */}
        <Card className="p-8 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-2 border-green-500/20">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-green-600">✅ FASE 3 Implementada!</h2>
            <p className="text-muted-foreground">
              O sistema foi integrado ao quiz existente. Agora quando você responder perguntas, 
              você terá chance de conseguir critical hits, ouvirá sons satisfatórios e poderá 
              descobrir conquistas secretas!
            </p>
            
            <div className="flex justify-center gap-4 mt-6">
              <Button asChild variant="outline">
                <Link to="/quiz">
                  🎯 Testar no Quiz
                </Link>
              </Button>
              <Button asChild>
                <Link to="/dashboard">
                  🏠 Voltar ao Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}