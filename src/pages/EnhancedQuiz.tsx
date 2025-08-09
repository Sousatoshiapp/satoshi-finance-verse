import { Navigate } from "react-router-dom";

// Enhanced Quiz - redirecionado para o novo sistema
export default function EnhancedQuiz() {
  console.warn('⚠️ Legacy EnhancedQuiz page accessed - redirecting to new system');
  return <Navigate to="/quiz/solo" replace />;
}