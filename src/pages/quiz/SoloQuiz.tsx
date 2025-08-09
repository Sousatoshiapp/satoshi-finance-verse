import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { NewQuizEngine } from '@/components/quiz/new-quiz-engine';

export default function SoloQuiz() {
  const [searchParams] = useSearchParams();
  
  const category = searchParams.get('category') || undefined;
  const difficulty = searchParams.get('difficulty') as 'facil' | 'medio' | 'dificil' | 'muito_dificil' || undefined;
  const questionsCount = parseInt(searchParams.get('count') || '10');
  const mode = searchParams.get('mode') as 'practice' | 'study' | 'adaptive' || 'adaptive';

  const handleQuizComplete = (results: any) => {
    console.log('Quiz completed:', results);
    // Aqui você pode salvar os resultados ou navegar para uma página de resultados
  };

  return (
    <NewQuizEngine
      topic={category}
      difficulty={difficulty}
      questionsCount={questionsCount}
      mode={mode}
      onComplete={handleQuizComplete}
    />
  );
}