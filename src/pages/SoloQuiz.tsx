import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { QuizEngine } from "@/components/quiz/quiz-engine";
import { ThemedQuizEngine } from "@/components/features/quiz/themed-quiz-engine";

export default function SoloQuiz() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const theme = searchParams.get('theme');

  useEffect(() => {
    // Se não há tema selecionado, redirecionar para seleção
    if (!theme) {
      navigate('/game-mode');
    }
  }, [theme, navigate]);

  // Se há tema selecionado, usar o quiz temático
  if (theme) {
    return (
      <ThemedQuizEngine
        theme={theme}
        questionsCount={10}
        onComplete={(results) => {
          console.log('Quiz temático completado:', results);
        }}
      />
    );
  }

  // Fallback para o quiz original (caso não tenha tema)
  return <QuizEngine mode="solo" questionsCount={7} />;
}