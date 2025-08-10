import { lazy } from 'react';

// Lazy loaded components
export const LazyRoutes = {
  // Public pages
  Welcome: lazy(() => import('@/pages/Welcome')),
  Auth: lazy(() => import('@/pages/Auth')),
  
  // Main pages
  Index: lazy(() => import('@/pages/Index')),
  Dashboard: lazy(() => import('@/pages/Dashboard')),
  GameMode: lazy(() => import('@/pages/GameMode')),
  SatoshiCity: lazy(() => import('@/pages/SatoshiCity')),
  
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
  Duels: lazy(() => import('@/pages/Duels')),
  FindOpponent: lazy(() => import('@/pages/FindOpponent')),
  SelectOpponentScreen: lazy(() => import('@/pages/SelectOpponentScreen')),
  CasinoDuelScreen: lazy(() => import('@/pages/CasinoDuelScreen')),
  DuelWaitingScreen: lazy(() => import('@/components/duels/duel-waiting-screen')),
  EnhancedSimultaneousDuel: lazy(() => import('@/components/duels/enhanced-simultaneous-duel')),
  
  // Tournament pages
  Tournaments: lazy(() => import('@/pages/Tournaments')),
  TournamentDetail: lazy(() => import('@/pages/TournamentDetail')),
  TournamentQuizSpecific: lazy(() => import('@/pages/TournamentQuizSpecific')),
  
  // Social & Chat pages
  Social: lazy(() => import('@/pages/Social')),
  Messages: lazy(() => import('@/pages/Messages')),
  DirectChat: lazy(() => import('@/pages/DirectChat')),
  DirectChatWrapper: lazy(() => import('@/pages/DirectChatWrapper')),
  
  // Transfer pages
  P2PTransfer: lazy(() => import('@/pages/P2PTransfer')),
  ProximityTransferBluetooth: lazy(() => import('@/pages/ProximityTransferBluetooth')),
  
  // Detail pages
  AvatarDetail: lazy(() => import('@/pages/AvatarDetail')),
  BoostDetail: lazy(() => import('@/pages/BoostDetail')),
  SkinDetail: lazy(() => import('@/pages/SkinDetail')),
  AccessoryDetail: lazy(() => import('@/pages/AccessoryDetail')),
  
  // Gamification pages
  Achievements: lazy(() => import('@/pages/Achievements')),
  Inventory: lazy(() => import('@/pages/Inventory')),
  AvatarCollection: lazy(() => import('@/pages/AvatarCollection')),
  Levels: lazy(() => import('@/pages/Levels')),
  Powerups: lazy(() => import('@/pages/Powerups')),
  BeetzInfo: lazy(() => import('@/pages/BeetzInfo')),
  
  // Monetization pages
  SubscriptionPlans: lazy(() => import('@/pages/SubscriptionPlans')),
  
  // Profile pages
  UserProfile: lazy(() => import('@/pages/UserProfile')),
  Profile: lazy(() => import('@/pages/Profile')),
  
  // Other pages
  Leaderboard: lazy(() => import('@/pages/Leaderboard')),
  Store: lazy(() => import('@/pages/Store')),
  Settings: lazy(() => import('@/pages/Settings'))
};
