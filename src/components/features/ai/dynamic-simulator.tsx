import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Button } from '@/components/shared/ui/button';
import { Badge } from '@/components/shared/ui/badge';
import { Progress } from '@/components/shared/ui/progress';
import { PlayCircle, PauseCircle, RotateCcw, TrendingUp, AlertTriangle } from 'lucide-react';
import { useContentEngine } from '@/hooks/use-content-engine';
import { motion, AnimatePresence } from 'framer-motion';

interface SimulationState {
  portfolio: { [key: string]: number };
  cash: number;
  totalValue: number;
  day: number;
  marketEvents: string[];
  decisions: Array<{ action: string; impact: number; timestamp: number }>;
}

interface DynamicSimulatorProps {
  scenario: string;
  complexity: 'basic' | 'intermediate' | 'advanced';
  onComplete?: (results: any) => void;
}

export const DynamicSimulator: React.FC<DynamicSimulatorProps> = ({
  scenario,
  complexity,
  onComplete
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [simulationState, setSimulationState] = useState<SimulationState>({
    portfolio: { BTCN: 0.5, AAPL: 0.3, CASH: 0.2 },
    cash: 10000,
    totalValue: 10000,
    day: 1,
    marketEvents: [],
    decisions: []
  });
  const [currentEvent, setCurrentEvent] = useState<string | null>(null);
  const [performance, setPerformance] = useState(0);
  const { createSimulation, generatingContent } = useContentEngine();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning) {
      interval = setInterval(() => {
        setSimulationState(prev => {
          const newState = { ...prev };
          newState.day += 1;
          
          // Generate market events based on complexity
          if (Math.random() < 0.3) {
            const events = [
              'Mercado em alta - Alta volatilidade detectada',
              'Notícias econômicas impactam setor tecnológico',
              'Anúncio do banco central sobre taxas de juros',
              'Criptomoedas apresentam movimento atípico'
            ];
            const event = events[Math.floor(Math.random() * events.length)];
            newState.marketEvents.push(event);
            setCurrentEvent(event);
          }
          
          // Simulate price changes
          const priceChange = (Math.random() - 0.5) * 0.1; // ±5% daily change
          newState.totalValue *= (1 + priceChange);
          
          return newState;
        });
      }, 2000); // 2 seconds per day
    }
    
    return () => clearInterval(interval);
  }, [isRunning]);

  const handleDecision = (action: string, impact: number) => {
    setSimulationState(prev => ({
      ...prev,
      decisions: [...prev.decisions, { action, impact, timestamp: prev.day }],
      totalValue: prev.totalValue * (1 + impact)
    }));
    
    setCurrentEvent(null);
  };

  const calculatePerformance = () => {
    return ((simulationState.totalValue - 10000) / 10000) * 100;
  };

  const resetSimulation = () => {
    setIsRunning(false);
    setSimulationState({
      portfolio: { BTCN: 0.5, AAPL: 0.3, CASH: 0.2 },
      cash: 10000,
      totalValue: 10000,
      day: 1,
      marketEvents: [],
      decisions: []
    });
    setCurrentEvent(null);
    setPerformance(0);
  };

  const completeSimulation = () => {
    const finalPerformance = calculatePerformance();
    const results = {
      scenario,
      complexity,
      finalValue: simulationState.totalValue,
      performance: finalPerformance,
      daysSimulated: simulationState.day,
      decisionsCount: simulationState.decisions.length,
      grade: finalPerformance > 15 ? 'A' : finalPerformance > 5 ? 'B' : finalPerformance > -5 ? 'C' : 'D'
    };
    
    onComplete?.(results);
    setIsRunning(false);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Simulação: {scenario}
            </CardTitle>
            <Badge variant={complexity === 'advanced' ? 'destructive' : 'secondary'}>
              {complexity}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Portfolio Overview */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Portfolio</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Valor Total:</span>
                    <span className="font-bold">
                      R$ {simulationState.totalValue.toLocaleString('pt-BR', { 
                        minimumFractionDigits: 2 
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Performance:</span>
                    <span className={`font-bold ${calculatePerformance() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {calculatePerformance().toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dia:</span>
                    <span>{simulationState.day}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Market Events */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Eventos do Mercado</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {simulationState.marketEvents.slice(-3).map((event, index) => (
                    <div key={index} className="text-sm p-2 bg-secondary rounded">
                      {event}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Controls */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Controles</h4>
                <div className="space-y-2">
                  <Button
                    onClick={() => setIsRunning(!isRunning)}
                    variant={isRunning ? "destructive" : "default"}
                    className="w-full"
                  >
                    {isRunning ? (
                      <>
                        <PauseCircle className="w-4 h-4 mr-2" />
                        Pausar
                      </>
                    ) : (
                      <>
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Iniciar
                      </>
                    )}
                  </Button>
                  <Button onClick={resetSimulation} variant="outline" className="w-full">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Resetar
                  </Button>
                  <Button onClick={completeSimulation} variant="secondary" className="w-full">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Finalizar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Current Event Decision */}
          <AnimatePresence>
            {currentEvent && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-4"
              >
                <Card className="border-orange-200 bg-orange-50">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-orange-600 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-orange-800">
                          Decisão Requerida
                        </h4>
                        <p className="text-sm text-orange-700 mb-3">
                          {currentEvent}
                        </p>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleDecision('Comprar mais', 0.05)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Comprar Mais
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => handleDecision('Manter posição', 0)}
                            variant="outline"
                          >
                            Manter
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => handleDecision('Vender parcial', -0.02)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Vender
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Performance Chart */}
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Evolução do Portfolio</h4>
            <Progress 
              value={Math.max(0, calculatePerformance() + 50)} 
              className="h-3"
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-1">
              <span>-50%</span>
              <span>0%</span>
              <span>+50%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
