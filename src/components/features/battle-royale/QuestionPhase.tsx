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
      <div className="text-center space-y-2">
        <Badge variant="secondary" className="text-xs px-2 py-1">
          Rodada {round}
        </Badge>
        
        {/* Timer */}
        <motion.div
          animate={isTimeRunningOut ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.5, repeat: isTimeRunningOut ? Infinity : 0 }}
          className="relative"
        >
          <div className={`text-xl font-bold ${isTimeRunningOut ? 'text-destructive' : 'text-primary'}`}>
            {timeRemaining}s
          </div>
          <div className="w-24 h-1 bg-muted/50 rounded-full mx-auto mt-1 overflow-hidden">
            <motion.div
              className={`h-full ${isTimeRunningOut ? 'bg-destructive' : 'bg-primary'}`}
              animate={{ width: `${timePercentage}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </motion.div>
      </div>

      {/* Question Card */}
      <Card className="casino-card border-purple-500/30">
        <CardHeader className="p-3">
          <CardTitle className="text-center text-sm leading-relaxed">
            {question.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          {/* Answer Options */}
          <div className="grid grid-cols-1 gap-2">
            {question.options.map((option, index) => {
              const letters = ['A', 'B', 'C', 'D'];
              const isSelected = selectedAnswer === option;
              
              return (
                <motion.div
                  key={index}
                  whileHover={!answered ? { scale: 1.01 } : {}}
                  whileTap={!answered ? { scale: 0.99 } : {}}
                >
                  <Button
                    variant={isSelected ? "default" : "outline"}
                    className={`casino-button w-full p-3 h-auto text-left justify-start ${
                      answered ? 'cursor-not-allowed' : 'cursor-pointer'
                    }`}
                    onClick={() => handleAnswer(option)}
                    disabled={answered}
                  >
                    <div className="flex items-start gap-2 w-full">
                      <div className={`
                        w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold
                        ${isSelected ? 'bg-primary-foreground text-primary' : 'bg-muted text-muted-foreground'}
                      `}>
                        {letters[index]}
                      </div>
                      <div className="flex-1 text-xs leading-relaxed">
                        {option}
                      </div>
                    </div>
                  </Button>
                </motion.div>
              );
            })}
          </div>

          {/* Answer Status */}
          {answered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-center p-2 casino-card border-green-500/30"
            >
              <p className="text-xs text-success font-medium">
                ✓ Enviado! Aguardando...
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Question Info */}
      <div className="text-center text-xs text-muted-foreground">
        <Badge variant="outline" className="text-[10px] mr-1 px-1 py-0">
          {question.category}
        </Badge>
        <Badge variant="outline" className="text-[10px] px-1 py-0">
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