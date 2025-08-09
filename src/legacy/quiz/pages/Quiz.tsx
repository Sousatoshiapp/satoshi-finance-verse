// LEGACY CODE - ISOLADO EM JANEIRO 2025
// Esta página foi substituída pelo novo sistema de quiz
// Redireciona para o novo sistema

import { Navigate } from "react-router-dom";

export default function LegacyQuiz() {
  console.warn('⚠️ Legacy Quiz page accessed - redirecting to new system');
  return <Navigate to="/quiz-v2" replace />;
}