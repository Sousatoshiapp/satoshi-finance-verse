import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { QuizEngine } from "@/components/quiz/quiz-engine";
import { ThemedQuizEngine } from "@/components/features/quiz/themed-quiz-engine";
import { GenerateQuestionsButton } from "@/components/quiz/generate-questions-button";

export default function SoloQuiz() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const theme = searchParams.get('theme');

  useEffect(() => {
    // Se não há tema selecionado E não é geração, redirecionar para seleção
    if (!theme && searchParams.get('generate') !== 'true') {
      navigate('/game-mode');
    }
  }, [theme, navigate, searchParams]);

  // Mostrar gerador de perguntas se for desenvolvimento
  if (searchParams.get('generate') === 'true') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <GenerateQuestionsButton />
      </div>
    );
  }

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