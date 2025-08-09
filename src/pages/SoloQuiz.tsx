// PÁGINA ANTIGA COMENTADA - JANEIRO 2025
// Esta página foi substituída pelo novo sistema em /quiz/solo
// Redirecionando para o novo sistema

import { useEffect } from "react";
import { Navigate } from "react-router-dom";

export default function LegacySoloQuiz() {
  console.warn('⚠️ Legacy SoloQuiz page accessed - redirecting to new system');
  
  useEffect(() => {
    console.log('Redirecionando /solo-quiz para /quiz/solo');
  }, []);
  
  return <Navigate to="/quiz/solo" replace />;
}