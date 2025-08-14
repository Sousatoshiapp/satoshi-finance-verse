import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Zap, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Button } from '@/components/shared/ui/button';
import { Badge } from '@/components/shared/ui/badge';
import { BattleRoyaleQuestion } from '@/hooks/useBattleRoyaleReal';

interface QuestionPhaseProps {
  question: BattleRoyaleQuestion;
  timeRemaining: number;
  onAnswer: (answer: string, responseTime: number) => void;
  round: number;
}

export function QuestionPhase({ question, timeRemaining, onAnswer, round }: QuestionPhaseProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [startTime] = useState(Date.now());
  const [answered, setAnswered] = useState(false);

  const handleAnswer = (answer: string) => {
    if (answered) return;
    
    setAnswered(true);
    setSelectedAnswer(answer);
    const responseTime = Date.now() - startTime;
    onAnswer(answer, responseTime);
  };

  const timePercentage = (timeRemaining / 30) * 100;
  const isTimeRunningOut = timeRemaining <= 10;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Question Header */}
      <div className="text-center space-y-4">
        <Badge variant="secondary" className="text-lg px-4 py-2">
          Rodada {round}
        </Badge>
        
        {/* Timer */}
        <motion.div
          animate={isTimeRunningOut ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.5, repeat: isTimeRunningOut ? Infinity : 0 }}
          className="relative"
        >
          <div className={`text-4xl font-bold ${isTimeRunningOut ? 'text-destructive' : 'text-primary'}`}>
            {timeRemaining}s
          </div>
          <div className="w-32 h-2 bg-muted/50 rounded-full mx-auto mt-2 overflow-hidden">
            <motion.div
              className={`h-full ${isTimeRunningOut ? 'bg-destructive' : 'bg-primary'}`}
              animate={{ width: `${timePercentage}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </motion.div>
      </div>

      {/* Question Card */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-center text-xl leading-relaxed">
            {question.question}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Answer Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {question.options.map((option, index) => {
              const letters = ['A', 'B', 'C', 'D'];
              const isSelected = selectedAnswer === option;
              
              return (
                <motion.div
                  key={index}
                  whileHover={!answered ? { scale: 1.02 } : {}}
                  whileTap={!answered ? { scale: 0.98 } : {}}
                >
                  <Button
                    variant={isSelected ? "default" : "outline"}
                    className={`w-full p-6 h-auto text-left justify-start ${
                      answered ? 'cursor-not-allowed' : 'cursor-pointer'
                    }`}
                    onClick={() => handleAnswer(option)}
                    disabled={answered}
                  >
                    <div className="flex items-start gap-4 w-full">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                        ${isSelected ? 'bg-primary-foreground text-primary' : 'bg-muted text-muted-foreground'}
                      `}>
                        {letters[index]}
                      </div>
                      <div className="flex-1 text-sm leading-relaxed">
                        {option}
                      </div>
                    </div>
                  </Button>
                </motion.div>
              );
            })}
          </div>

          {/* Power-ups Section (Future Feature) */}
          <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-dashed">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="w-4 h-4" />
                Power-ups disponíveis
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" disabled className="opacity-50">
                  <Shield className="w-4 h-4 mr-1" />
                  Escudo
                </Button>
                <Button variant="ghost" size="sm" disabled className="opacity-50">
                  <Clock className="w-4 h-4 mr-1" />
                  +5s
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Power-ups serão disponibilizados em breve!
            </p>
          </div>

          {/* Answer Status */}
          {answered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-center p-3 bg-success/10 border border-success/20 rounded-lg"
            >
              <p className="text-sm text-success font-medium">
                ✓ Resposta enviada! Aguardando outros jogadores...
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Question Info */}
      <div className="text-center text-sm text-muted-foreground">
        <Badge variant="outline" className="mr-2">
          {question.category}
        </Badge>
        <Badge variant="outline">
          {question.difficulty}
        </Badge>
      </div>

      {/* Pulse Effect for Urgency */}
      {isTimeRunningOut && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-10"
          animate={{ 
            backgroundColor: ['rgba(239, 68, 68, 0)', 'rgba(239, 68, 68, 0.1)', 'rgba(239, 68, 68, 0)']
          }}
          transition={{ 
            duration: 1,
            repeat: Infinity
          }}
        />
      )}
    </motion.div>
  );
}