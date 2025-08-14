import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';

interface ResultsPhaseProps {
  result: {
    is_correct: boolean;
    points_earned: number;
    correct_answer: string;
  };
  myScore: number;
  onContinue: () => void;
}

export function ResultsPhase({ result, myScore }: ResultsPhaseProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="text-center space-y-6"
    >
      <div className={`text-6xl ${result.is_correct ? 'text-success' : 'text-destructive'}`}>
        {result.is_correct ? <CheckCircle className="w-24 h-24 mx-auto" /> : <XCircle className="w-24 h-24 mx-auto" />}
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-2">
          {result.is_correct ? '✅ Correto!' : '❌ Incorreto!'}
        </h2>
        <p className="text-muted-foreground">
          Resposta correta: {result.correct_answer}
        </p>
      </div>

      <div className="bg-muted/30 p-4 rounded-lg">
        <p className="text-lg">Pontos ganhos: <span className="font-bold text-primary">+{result.points_earned}</span></p>
        <p className="text-sm text-muted-foreground">Score total: {myScore}</p>
      </div>
    </motion.div>
  );
}