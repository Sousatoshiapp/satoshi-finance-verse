import { QuizEngine } from "@/components/quiz/quiz-engine";

// Quiz genérico - redirecionado para o QuizEngine
export default function Quiz() {
  return <QuizEngine mode="solo" questionsCount={7} />;
}