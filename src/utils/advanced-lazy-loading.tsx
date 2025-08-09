import { lazy } from 'react';

// Lazy loaded components
export const LazyRoutes = {
  // Main pages
  Index: lazy(() => import('@/pages/Index')),
  Dashboard: lazy(() => import('@/pages/Dashboard')),
  GameMode: lazy(() => import('@/pages/GameMode')),
  
  // Quiz pages
  SoloQuiz: lazy(() => import('@/pages/quiz/SoloQuiz')),
  StudyMode: lazy(() => import('@/pages/quiz/StudyMode')),
  ImportExport: lazy(() => import('@/pages/quiz/ImportExport')),
  ConceptConnectionsPage: lazy(() => import('@/pages/ConceptConnectionsPage')),
  
  // Legacy quiz pages
  Quiz: lazy(() => import('@/pages/Quiz')),
  EnhancedQuiz: lazy(() => import('@/pages/EnhancedQuiz')),
  
  // Duel pages
  BtcDuel: lazy(() => import('@/pages/BtcDuel')),
  
  // Other pages
  Profile: lazy(() => import('@/pages/Profile')),
  Social: lazy(() => import('@/pages/Social')),
  Leaderboard: lazy(() => import('@/pages/Leaderboard')),
  Store: lazy(() => import('@/pages/Store'))
};
