import { lazy } from 'react';

// Lazy loaded components
export const LazyRoutes = {
  // Main pages
  Index: lazy(() => import('@/pages/Index')),
  Dashboard: lazy(() => import('@/pages/Dashboard')),
  
  // Quiz pages
  SoloQuiz: lazy(() => import('@/pages/quiz/SoloQuiz')),
  StudyMode: lazy(() => import('@/pages/quiz/StudyMode')),
  ImportExport: lazy(() => import('@/pages/quiz/ImportExport')),
  
  // Legacy quiz pages
  Quiz: lazy(() => import('@/pages/Quiz')),
  EnhancedQuiz: lazy(() => import('@/pages/EnhancedQuiz')),
  
  // New quiz pages
  StudyMode: lazy(() => import('@/pages/quiz/StudyMode')),
  ImportExport: lazy(() => import('@/pages/quiz/ImportExport')),
  
  // Other pages
  Profile: lazy(() => import('@/pages/Profile')),
  Social: lazy(() => import('@/pages/Social')),
  Leaderboard: lazy(() => import('@/pages/Leaderboard')),
  Store: lazy(() => import('@/pages/Store')),
  Admin: lazy(() => import('@/pages/Admin')),
  
  // Auth pages
  Login: lazy(() => import('@/pages/Login')),
  Register: lazy(() => import('@/pages/Register'))
};
