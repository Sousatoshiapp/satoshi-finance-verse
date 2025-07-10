import { QuizEngine } from "@/components/quiz/quiz-engine";

// Componente simplificado que usa o QuizEngine unificado
export default function SoloQuiz() {
  return <QuizEngine mode="solo" questionsCount={7} />;
}