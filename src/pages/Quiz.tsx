import { Navigate } from "react-router-dom";

// Quiz genérico - redirecionado para o novo sistema
export default function Quiz() {
  console.warn('⚠️ Legacy Quiz page accessed - redirecting to new system');
  return <Navigate to="/quiz/solo" replace />;
}