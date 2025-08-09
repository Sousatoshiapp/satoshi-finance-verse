import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { NewQuizEngine } from '@/components/quiz/new-quiz-engine';

export default function SoloQuiz() {
  const [searchParams] = useSearchParams();
  
  const topic = searchParams.get('topic') || undefined;
  const difficulty = searchParams.get('difficulty') as 'basic' | 'intermediate' | 'advanced' || undefined;
  const questionsCount = parseInt(searchParams.get('count') || '10');
  const mode = searchParams.get('mode') as 'practice' | 'study' | 'adaptive' || 'practice';

  const handleQuizComplete = (results: any) => {
    console.log('Quiz completed:', results);
    // Aqui você pode salvar os resultados ou navegar para uma página de resultados
  };

  return (
    <NewQuizEngine
      topic={topic}
      difficulty={difficulty}
      questionsCount={questionsCount}
      mode={mode}
      onComplete={handleQuizComplete}
    />
  );
}