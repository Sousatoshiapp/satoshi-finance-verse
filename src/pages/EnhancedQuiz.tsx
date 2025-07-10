import { QuizEngine } from "@/components/quiz/quiz-engine";

// Enhanced Quiz - agora usa o QuizEngine unificado
export default function EnhancedQuiz() {
  return <QuizEngine mode="solo" questionsCount={7} />;
}